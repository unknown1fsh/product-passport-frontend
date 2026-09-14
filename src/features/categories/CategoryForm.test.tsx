import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CategoryForm } from "./CategoryForm";
import { categoryApi } from "./api";
import { ApiError } from "../../shared/api/http";
vi.mock("./api", () => ({ categoryApi: { create: vi.fn(), update: vi.fn() } }));
beforeEach(() => vi.resetAllMocks());
describe("Kategori formu", () => {
  it("boşlukları temizleyerek kayıt oluşturur", async () => {
    const saved = vi.fn();
    render(<CategoryForm onClose={() => {}} onSaved={saved} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/^Kod/), " EV ");
    await user.type(screen.getByLabelText(/^Kategori adı/), " Ev Ürünleri ");
    await user.click(screen.getByRole("button", { name: "Kaydet" }));
    await waitFor(() => expect(saved).toHaveBeenCalled());
    expect(categoryApi.create).toHaveBeenCalledWith({
      code: "EV",
      name: "Ev Ürünleri",
      description: "",
    });
  });
  it("düzenlemede kodu göndermez, aktifliği korur", async () => {
    render(
      <CategoryForm
        category={{
          publicId: "id",
          code: "EV",
          name: "Ev",
          description: null,
          active: false,
        }}
        onClose={() => {}}
        onSaved={() => {}}
      />,
    );
    expect(screen.getByLabelText(/^Kod/)).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Kaydet" }));
    await waitFor(() =>
      expect(categoryApi.update).toHaveBeenCalledWith("id", {
        name: "Ev",
        description: "",
        active: false,
      }),
    );
  });
  it("409 mesajını gösterir ve formu kapatmaz", async () => {
    vi.mocked(categoryApi.create).mockRejectedValue(
      new ApiError(409, "Kod zaten kullanılıyor"),
    );
    const saved = vi.fn();
    render(<CategoryForm onClose={() => {}} onSaved={saved} />);
    await userEvent.type(screen.getByLabelText(/^Kod/), "EV");
    await userEvent.type(screen.getByLabelText(/^Kategori adı/), "Ev");
    await userEvent.click(screen.getByRole("button", { name: "Kaydet" }));
    expect(
      await screen.findByText("Kod zaten kullanılıyor"),
    ).toBeInTheDocument();
    expect(saved).not.toHaveBeenCalled();
  });
});
