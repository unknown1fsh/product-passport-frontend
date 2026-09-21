import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WarrantyList from "./WarrantyList";
import { api } from "../../shared/api/client";
import { useResource } from "../../shared/hooks/useResource";

vi.mock("../../shared/api/client", () => ({
  api: vi.fn(),
}));

vi.mock("../../shared/hooks/useResource", () => ({
  useResource: vi.fn(),
}));

describe("WarrantyList Bileşeni", () => {
  const mockPassportId = "test-passport-123";

  beforeEach(() => {
    vi.clearAllMocks();
    (useResource as any).mockReturnValue({
      data: { content: [] },
      loading: false,
      error: null,
      reload: vi.fn(),
    });
  });

  it("Boş alanlarda kaydet butonu pasif (disabled) olmalıdır", () => {
    render(<WarrantyList passportId={mockPassportId} />);
    
    fireEvent.click(screen.getByRole("button", { name: /Yeni Ekle/i }));

    const saveButton = screen.getByRole("button", { name: /Kaydet/i });
    expect(saveButton).toBeDisabled();
  });

  it("Başlangıç ve bitiş tarihi eşit olduğunda kaydet butonu aktif olmalıdır", () => {
    render(<WarrantyList passportId={mockPassportId} />);
    fireEvent.click(screen.getByRole("button", { name: /Yeni Ekle/i }));

    const startDateInput = screen.getByLabelText(/Başlangıç Tarihi/i);
    const endDateInput = screen.getByLabelText(/Bitiş Tarihi/i);

    fireEvent.change(startDateInput, { target: { value: "2026-09-17" } });
    fireEvent.change(endDateInput, { target: { value: "2026-09-17" } });

    const saveButton = screen.getByRole("button", { name: /Kaydet/i });
    expect(saveButton).not.toBeDisabled();
  });

  it("Bitiş tarihi başlangıçtan önce (ters tarih) ise kaydet butonu pasif olmalıdır", () => {
    render(<WarrantyList passportId={mockPassportId} />);
    fireEvent.click(screen.getByRole("button", { name: /Yeni Ekle/i }));

    const startDateInput = screen.getByLabelText(/Başlangıç Tarihi/i);
    const endDateInput = screen.getByLabelText(/Bitiş Tarihi/i);

    fireEvent.change(startDateInput, { target: { value: "2026-09-20" } });
    fireEvent.change(endDateInput, { target: { value: "2026-09-10" } });

    const saveButton = screen.getByRole("button", { name: /Kaydet/i });
    expect(saveButton).toBeDisabled();
  });

  it("Ürün pasaportu bulunamadığında (404) hata mesajı gösterilmelidir", () => {
    (useResource as any).mockReturnValue({
      data: null,
      loading: false,
      error: new Error("404 Not Found"),
      reload: vi.fn(),
    });

    render(<WarrantyList passportId={mockPassportId} />);
    
    expect(screen.getByText(/Garanti verisi çekilirken hata oluştu/i)).toBeInTheDocument();
  });

  it("Silme işleminde yetkisizlik (403) hatası alındığında uygun uyarı gösterilmelidir", async () => {
    (useResource as any).mockReturnValue({
      data: { content: [{ publicId: "garanti-1", startDate: "2026-01-01", endDate: "2027-01-01" }] },
      loading: false,
      error: null,
      reload: vi.fn(),
    });

    (api as any).mockRejectedValue({ status: 403 });

    render(<WarrantyList passportId={mockPassportId} />);

    fireEvent.click(screen.getByRole("button", { name: /Sil/i }));
    fireEvent.click(screen.getByRole("button", { name: /Silmeyi onayla/i }));

    await waitFor(() => {
      expect(screen.getByText(/Bu kaydı silmek için yetkiniz yok/i)).toBeInTheDocument();
    });
  });
});