import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WarrantyList from "./WarrantyList";
import { api } from "../../shared/api/client";
import { useResource } from "../../shared/hooks/useResource";
import { useAuth } from "../auth/AuthProvider";

vi.mock("../../shared/api/client", () => ({
  api: vi.fn(),
}));

vi.mock("../../shared/hooks/useResource", () => ({
  useResource: vi.fn(),
}));

vi.mock("../auth/AuthProvider", () => ({
  useAuth: vi.fn(),
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
    (useAuth as any).mockReturnValue({
      user: { role: "ADMIN" }
    });
  });

  it("Ürün pasaportu bulunamadığında (404) hata mesajı gösterilmelidir", () => {
    (useResource as any).mockReturnValue({
      data: null,
      loading: false,
      error: new Error("404 Not Found"),
      reload: vi.fn(),
    });

    render(<WarrantyList passportId={mockPassportId} canManage={true} />);
    
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

    render(<WarrantyList passportId={mockPassportId} canManage={true} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Sil/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /Silmeyi onayla/i }));

    await waitFor(() => {
      expect(screen.getByText(/Bu kaydı silmek için yetkiniz yok/i)).toBeInTheDocument();
    });
  });
});