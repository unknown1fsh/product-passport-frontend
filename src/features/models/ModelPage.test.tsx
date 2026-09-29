import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ModelPage } from "./ModelPage";
import { ModelSelect } from "./ModelSelect";
import { api } from "../../shared/api/client";
import { useResource } from "../../shared/hooks/useResource";
import { useAuth } from "../auth/AuthProvider";
import { ApiError } from "../../shared/api/http";

vi.mock("../../shared/api/client", () => ({
  api: vi.fn(),
}));

vi.mock("../../shared/hooks/useResource", () => ({
  useResource: vi.fn(),
}));

vi.mock("../auth/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("ECR-07: Model Modülü Testleri", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({ user: { role: "ADMIN" } });
    (useResource as any).mockReturnValue({
      data: {
        content: [
          { publicId: "uuid-1", code: "M-01", name: "Test Model", active: true, brandName: "Test Marka" },
        ],
        totalElements: 1,
      },
      loading: false,
      error: null,
      reload: vi.fn(),
    });
  });

  it("ModelSelect bileşeni doğru UUID değerini onChange ile iletir (Sayfa dışı seçim testi)", async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    
    render(<ModelSelect value="" onChange={mockOnChange} />);
    
    const select = screen.getByRole("combobox", { name: /Ürün Modeli Seçiniz/i });
    await user.click(select);
    
    const option = await screen.findByRole("option", { name: /Test Model/i });
    await user.click(option);
    
    expect(mockOnChange).toHaveBeenCalledWith("uuid-1");
  });

  it("Model silinirken pasaport bağlıysa 409 Conflict hatasını yakalar ve gösterir", async () => {
    (api as any).mockRejectedValueOnce(new ApiError(409, "Bu modele bağlı pasaport bulunduğu için silinemez"));
    const user = userEvent.setup();

    renderWithRouter(<ModelPage />);

    const deleteBtn = screen.getAllByRole("button", { name: /Sil/i })[0];
    await user.click(deleteBtn);

    const dialog = screen.getByRole("dialog");
    // "Evet, Sil" yerine DOM'daki gerçek adı olan "Silmeyi onayla" kullanıyoruz
    const confirmBtn = within(dialog).getByRole("button", { name: /Silmeyi onayla/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Bu modele bağlı pasaport bulunduğu için silinemez/i)).toBeInTheDocument();
    });
  });

  it("Model oluşturulurken 403 Yetkisiz Erişim (Forbidden) hatasını yakalar ve gösterir", async () => {
    (api as any).mockRejectedValueOnce(new ApiError(403, "Yetkisiz işlem gerçekleştirilemez"));
    const user = userEvent.setup();

    renderWithRouter(<ModelPage />);

    const addBtn = screen.getByRole("button", { name: /Yeni/i });
    await user.click(addBtn);

    const dialog = await screen.findByRole("dialog");

    await user.type(within(dialog).getByLabelText(/Model Kodu/i), "TEST-CODE");
    await user.type(within(dialog).getByLabelText(/Model Adı/i), "TEST-NAME");
    await user.type(within(dialog).getByLabelText(/Marka UUID/i), "test-brand-uuid");

    // "Kaydet" yerine DOM'daki gerçek adı olan "Oluştur" butonunu kullanıyoruz
    const saveBtn = within(dialog).getByRole("button", { name: /Oluştur/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(within(dialog).getByText(/Yetkisiz işlem gerçekleştirilemez/i)).toBeInTheDocument();
    });
  });
});