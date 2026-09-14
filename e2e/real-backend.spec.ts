import { test, expect, request } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";
const base = process.env.E2E_API_URL;
test.describe("Gerçek PostgreSQL backend", () => {
  test.skip(
    process.env.E2E_REAL !== "1",
    "E2E_REAL=1 ve izole test API adresi gerekir.",
  );
  test("giriş, gerçek CRUD, pasaport, USER yasağı ve iki sekme", async ({
    page,
    context,
  }) => {
    if (!base || !base.startsWith("http://localhost:18081/"))
      throw new Error("Yalnızca izole test API portu 18081 kabul edilir.");
    const admin = await request.newContext({ baseURL: base });
    const user = await request.newContext({ baseURL: base });
    const password = "Frontend123!";
    const unique = Date.now().toString();
    let bearer = "";
    async function auth(
      client: APIRequestContext,
      path: string,
      data?: unknown,
    ) {
      const csrf = await (await client.get(base + "/auth/csrf")).json();
      return client.post(base + "/auth/" + path, {
        headers: { [csrf.headerName]: csrf.token },
        data,
      });
    }
    async function call(path: string, data?: unknown) {
      const result = await admin.post(base + path, {
        headers: { Authorization: "Bearer " + bearer },
        data,
      });
      expect(result.status()).toBe(201);
      return (await result.json()).data;
    }
    try {
      const logged = await auth(admin, "login", {
        email: "admin@frontend.test",
        password,
      });
      expect(logged.status()).toBe(200);
      bearer = (await logged.json()).accessToken;
      const category = await call("/categories", {
        code: "E2E-" + unique,
        name: "Test Kategori " + unique,
      });
      const brand = await call("/product-brands", {
        name: "Test Marka " + unique,
      });
      const model = await call("/product-models", {
        code: "MODEL-" + unique,
        name: "Test Model",
        brandPublicId: brand.publicId,
      });
      const passport = await call("/product-passports", {
        serialNumber: "SERIAL-" + unique,
        productModelId: model.publicId,
        categoryId: category.publicId,
        purchaseDate: "2026-01-10",
        invoiceNumber: "REAL-INVOICE",
      });
      const registered = await auth(user, "register", {
        firstName: "Test",
        lastName: "User",
        email: unique + "@frontend.test",
        password,
      });
      expect(registered.status()).toBe(201);
      const userLogin = await auth(user, "login", {
        email: unique + "@frontend.test",
        password,
      });
      const userToken = (await userLogin.json()).accessToken;
      expect(
        (
          await user.post(base + "/categories", {
            headers: { Authorization: "Bearer " + userToken },
            data: { code: "NO", name: "Yasak" },
          })
        ).status(),
      ).toBe(403);
      await page.goto("/giris");
      await page.getByLabel("E-posta").fill("admin@frontend.test");
      await page.getByLabel(/^Parola/).fill(password);
      await page
        .getByRole("button", { name: "Giriş yap", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "Merhaba, Test." }),
      ).toBeVisible();
      await page.goto("/kategoriler");
      await page
        .getByRole("button", { name: "Yeni kategori", exact: true })
        .click();
      await page.getByLabel(/^Kod/).fill("UI-" + unique);
      await page.getByLabel(/^Kategori adı/).fill("UI Kategori " + unique);
      await page.getByRole("button", { name: "Kaydet", exact: true }).click();
      await expect(
        page.getByText("UI Kategori " + unique, { exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "UI Kategori " + unique + " düzenle" })
        .click();
      await page.getByLabel(/^Kategori adı/).fill("UI Yeni " + unique);
      await page.getByRole("button", { name: "Kaydet", exact: true }).click();
      await expect(
        page.getByText("UI Yeni " + unique, { exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "UI Yeni " + unique + " sil" })
        .click();
      await page.getByRole("button", { name: "Silmeyi onayla" }).click();
      await expect(
        page.getByText("UI Yeni " + unique, { exact: true }),
      ).toHaveCount(0);
      await page.getByRole("button", { name: category.name + " sil" }).click();
      await page.getByRole("button", { name: "Silmeyi onayla" }).click();
      await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
      await page.getByRole("button", { name: "Vazgeç" }).click();
      await page.goto("/pasaportlar");
      await page
        .getByRole("link", { name: passport.serialNumber + " detay" })
        .click();
      await expect(page.getByText("REAL-INVOICE")).toBeVisible();
      const second = await context.newPage();
      await second.goto("/");
      await expect(
        second.getByRole("heading", { name: "Merhaba, Test." }),
      ).toBeVisible();
      await Promise.all([page.reload(), second.reload()]);
      await expect(page.getByText("REAL-INVOICE")).toBeVisible();
      await expect(
        second.getByRole("heading", { name: "Merhaba, Test." }),
      ).toBeVisible();
      // İlk iki iş yanıtını 401 yap; yenileme gerçek backend'in tek kullanımlık cookie'siyle yapılır.
      let rejected = 0;
      await page.route("**/api/v1/categories", async (route) => {
        if (rejected++ < 2)
          await route.fulfill({
            status: 401,
            body: "{}",
            contentType: "application/json",
          });
        else await route.continue();
      });
      await page.evaluate(async () => {
        const { api } = await import("/src/shared/api/client.ts");
        await Promise.all([api("/categories"), api("/categories")]);
      });
      await page.unroute("**/api/v1/categories");
      await second.getByRole("button", { name: "Çıkış", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "Tekrar hoş geldiniz" }),
      ).toBeVisible();
    } finally {
      await admin.dispose();
      await user.dispose();
    }
  });
});
