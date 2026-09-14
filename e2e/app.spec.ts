import { test, expect } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";
const id = "11111111-1111-4111-8111-111111111111";
const category = {
  publicId: id,
  code: "EV",
  name: "Ev Ürünleri",
  description: "Ev kategorisi",
  active: true,
};
const passport = {
  publicId: id,
  serialNumber: "TEST-001",
  productModelId: id,
  productModelName: "Örnek Model",
  categoryId: id,
  categoryName: "Ev Ürünleri",
  purchaseDate: "2026-01-10",
  invoiceNumber: "FAT-001",
  description: "Örnek kayıt",
  active: true,
};
async function mock(context: BrowserContext, role = "ADMIN") {
  const state = {
    logged: false,
    refreshes: 0,
    reject: false,
    failRefresh: false,
    deleteConflict: false,
    categories: [{ ...category }],
  };
  await context.route("**/api/v1/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace("/api/v1", "");
    const method = req.method();
    const reply = (data: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: status === 204 ? undefined : JSON.stringify(data),
      });
    const error = (status: number, message: string) =>
      reply({ success: false, status, message, details: [] }, status);
    const session = () => ({
      accessToken: "token-" + state.refreshes,
      expiresIn: 900,
      tokenType: "Bearer",
      user: {
        publicId: id,
        firstName: "Ada",
        lastName: "Test",
        email: "ada@test.dev",
        role,
        active: true,
      },
    });
    if (path === "/auth/csrf")
      return reply({ headerName: "X-XSRF-TOKEN", token: "csrf" });
    if (path === "/auth/login") {
      state.logged = true;
      return reply(session());
    }
    if (path === "/auth/logout") {
      state.logged = false;
      return reply(null, 204);
    }
    if (path === "/auth/refresh") {
      state.refreshes++;
      if (!state.logged || state.failRefresh) return error(401, "Oturum yok");
      await new Promise((r) => setTimeout(r, 100));
      return reply(session());
    }
    if (state.reject && req.headers()["authorization"] === "Bearer token-1")
      return error(401, "Süre doldu");
    if (path === "/categories" && method === "POST") {
      const body = req.postDataJSON();
      state.categories.push({
        ...category,
        ...body,
        publicId: "22222222-2222-4222-8222-222222222222",
      });
      return reply({ success: true, data: state.categories.at(-1) }, 201);
    }
    if (path.startsWith("/categories/") && method === "PUT") {
      const body = req.postDataJSON();
      const target = state.categories.find(
        (c) => c.publicId === path.split("/").at(-1),
      );
      if (target) Object.assign(target, body);
      return reply({ data: target });
    }
    if (path.startsWith("/categories/") && method === "DELETE") {
      if (state.deleteConflict) return error(409, "Bağlı pasaport var");
      state.categories = state.categories.filter(
        (c) => c.publicId !== path.split("/").at(-1),
      );
      return reply(null, 204);
    }
    if (path === "/categories")
      return reply({
        data: {
          content: state.categories,
          page: 0,
          size: 20,
          totalElements: state.categories.length,
          totalPages: 1,
        },
      });
    if (path === "/product-passports")
      return reply({
        data: {
          content: [passport],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
        },
      });
    if (path === "/product-passports/" + id) return reply({ data: passport });
    return error(404, "Kayıt bulunamadı");
  });
  return state;
}
async function login(page: Page) {
  await page.goto("/giris");
  await page.getByLabel("E-posta").fill("ada@test.dev");
  await page.getByLabel(/^Parola/).fill("Password123!");
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Merhaba, Ada." }),
  ).toBeVisible();
}
test("kategori CRUD, 409, pasaport detay ve çıkış", async ({
  page,
  context,
}) => {
  const state = await mock(context);
  await login(page);
  await page.goto("/kategoriler");
  await expect(
    page.getByRole("heading", { name: "Kategoriler", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Yeni kategori", exact: true })
    .click();
  await page.getByLabel(/^Kod/).fill("YENI");
  await page.getByLabel(/^Kategori adı/).fill("Yeni Kategori");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(page.getByText("Yeni Kategori", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Yeni Kategori düzenle" }).click();
  await page.getByLabel(/^Kategori adı/).fill("Düzenlenen");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(page.getByText("Düzenlenen", { exact: true })).toBeVisible();
  state.deleteConflict = true;
  await page.getByRole("button", { name: "Düzenlenen sil" }).click();
  await page.getByRole("button", { name: "Silmeyi onayla" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Bağlı pasaport var" }),
  ).toBeVisible();
  state.deleteConflict = false;
  await page.getByRole("button", { name: "Silmeyi onayla" }).click();
  await expect(page.getByText("Düzenlenen", { exact: true })).toHaveCount(0);
  await page.goto("/pasaportlar");
  await page.getByRole("link", { name: "TEST-001 detay" }).click();
  await expect(page.getByText("FAT-001", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Çıkış", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Tekrar hoş geldiniz" }),
  ).toBeVisible();
});
test("USER yazma düğmeleri görmez, mobil menü çalışır", async ({
  page,
  context,
}) => {
  await mock(context, "USER");
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await page.getByRole("link", { name: "Kategoriler", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Kategoriler", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Yeni kategori", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: /düzenle/ })).toHaveCount(0);
  await page.screenshot({
    path: ".verification/mobile-categories.png",
    fullPage: true,
  });
});
test("eşzamanlı 401 tek refresh kullanır; 403 tekrar edilmez", async ({
  page,
  context,
}) => {
  const state = await mock(context);
  await login(page);
  state.reject = true;
  const before = state.refreshes;
  await page.evaluate(async () => {
    const { api } = await import("/src/shared/api/client.ts");
    await Promise.all([api("/categories"), api("/product-passports")]);
  });
  expect(state.refreshes - before).toBe(1);
  await context.route("**/api/v1/forbidden", (route) =>
    route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({ message: "Yetkisiz" }),
    }),
  );
  const after = state.refreshes;
  await page.evaluate(async () => {
    const { api } = await import("/src/shared/api/client.ts");
    try {
      await api("/forbidden");
    } catch {
      /* beklenen */
    }
  });
  expect(state.refreshes).toBe(after);
});
test("yenileme hatası girişe döner, döngüye girmez", async ({
  page,
  context,
}) => {
  const state = await mock(context);
  await login(page);
  state.reject = true;
  state.failRefresh = true;
  await page
    .getByRole("link", { name: /Kategoriler.*Kayıtları görüntüle/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Tekrar hoş geldiniz" }),
  ).toBeVisible();
  expect(state.refreshes).toBe(2);
});
test("iki sekme ve sayfa yenileme; çıkış tüm sekmeleri temizler", async ({
  page,
  context,
}) => {
  await mock(context);
  await login(page);
  const second = await context.newPage();
  await second.goto("/");
  await expect(
    second.getByRole("heading", { name: "Merhaba, Ada." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Merhaba, Ada." }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
  await second.getByRole("button", { name: "Çıkış", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Tekrar hoş geldiniz" }),
  ).toBeVisible();
});
test("pasaport 404 ve geçersiz adres", async ({ page, context }) => {
  await mock(context);
  await login(page);
  await page.goto("/pasaportlar/99999999-9999-4999-8999-999999999999");
  await expect(page.getByText("Kayıt bulunamadı").first()).toBeVisible();
  await page.goto("/pasaportlar/gecersiz");
  await expect(
    page.getByRole("heading", { name: "Geçersiz pasaport adresi" }),
  ).toBeVisible();
});
test("ekran görüntüleri", async ({ page, context }) => {
  await mock(context);
  await page.goto("/giris");
  await expect(
    page.getByRole("button", { name: "Giriş yap", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: ".verification/login.png", fullPage: true });
  await login(page);
  await page.screenshot({ path: ".verification/home.png", fullPage: true });
});
