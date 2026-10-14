import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import WarrantyList from "./WarrantyList";
import { api } from "../../shared/api/client";
import { useResource } from "../../shared/hooks/useResource";
import { useAuth } from "../auth/AuthProvider";

const mockedApi = api as unknown as Mock;
const mockedUseResource = useResource as unknown as Mock;
const mockedUseAuth = useAuth as unknown as Mock;

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
  const reloadMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseResource.mockReturnValue({
      data: { content: [] },
      loading: false,
      error: null,
      reload: reloadMock,
    });

    mockedUseAuth.mockReturnValue({
      user: { role: "ADMIN" }
    });
  });

  it("Ürün pasaportu bulunamadığında (404) hata mesajı gösterilmelidir", () => {
    mockedUseResource.mockReturnValue({
      data: null,
      loading: false,
      error: new Error("404 Not Found"),
      reload: vi.fn(),
    });

    render(<WarrantyList passportId={mockPassportId} />);
    
    expect(screen.getByText(/Garanti verisi çekilirken hata oluştu/i)).toBeInTheDocument();
  });

  it("Silme işleminde yetkisizlik (403) hatası alındığında uygun uyarı gösterilmelidir", async () => {
    mockedUseResource.mockReturnValue({
      data: { content: [{ publicId: "garanti-1", startDate: "2026-01-01", endDate: "2027-01-01" }] },
      loading: false,
      error: null,
      reload: vi.fn(),
    });

    mockedApi.mockRejectedValue({ status: 403 });

    render(<WarrantyList passportId={mockPassportId} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Sil/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /Silmeyi onayla/i }));

    await waitFor(() => {
      expect(screen.getByText(/Bu kaydı silmek için yetkiniz yok/i)).toBeInTheDocument();
    });
  });

  it("Başlangıç ve bitiş tarihleri boşsa kayıt yapılmamalı ve hata gösterilmelidir", () => {
  render(<WarrantyList passportId={mockPassportId} />);

  fireEvent.click(
    screen.getByRole("button", { name: /Garanti kaydı ekle/i })
  );

  fireEvent.click(
    screen.getByRole("button", { name: /^Kaydet$/i })
  );

  expect(
    screen.getByText(/Başlangıç ve bitiş tarihleri zorunludur/i)
  ).toBeInTheDocument();

  expect(mockedApi).not.toHaveBeenCalled();
});

it("Bitiş tarihi başlangıç tarihinden önceyse kayıt yapılmamalı ve hata gösterilmelidir", () => {
  render(<WarrantyList passportId={mockPassportId} />);

  fireEvent.click(
    screen.getByRole("button", { name: /Garanti kaydı ekle/i })
  );

  fireEvent.change(screen.getByLabelText(/Başlangıç Tarihi/i), {
    target: { value: "2026-10-20" }
  });

  fireEvent.change(screen.getByLabelText(/Bitiş Tarihi/i), {
    target: { value: "2026-10-10" }
  });

  fireEvent.click(
    screen.getByRole("button", { name: /^Kaydet$/i })
  );

  expect(
    screen.getByText(/Bitiş tarihi başlangıç tarihinden önce olamaz/i)
  ).toBeInTheDocument();

  expect(mockedApi).not.toHaveBeenCalled();
});

it("Garanti ekleme sırasında API hatası oluşursa hata mesajı görünmelidir", async () => {
  mockedApi.mockRejectedValue(new Error("Sunucu hatası"));

  render(<WarrantyList passportId={mockPassportId} />);

  fireEvent.click(
    screen.getByRole("button", { name: /Garanti kaydı ekle/i })
  );

  fireEvent.change(screen.getByLabelText(/Başlangıç Tarihi/i), {
    target: { value: "2026-10-05" }
  });

  fireEvent.change(screen.getByLabelText(/Bitiş Tarihi/i), {
    target: { value: "2026-10-20" }
  });

  fireEvent.click(
    screen.getByRole("button", { name: /^Kaydet$/i })
  );

  await waitFor(() => {
    expect(screen.getByText(/Sunucu hatası/i)).toBeInTheDocument();
  });
});

it("Kaydet butonuna hızlıca iki kez basıldığında yalnızca bir API isteği gönderilmelidir", async () => {
  let resolveRequest: (() => void) | undefined;

  mockedApi.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        resolveRequest = resolve;
      })
  );

  render(<WarrantyList passportId={mockPassportId} />);

  fireEvent.click(
    screen.getByRole("button", { name: /Garanti kaydı ekle/i })
  );

  fireEvent.change(screen.getByLabelText(/Başlangıç Tarihi/i), {
    target: { value: "2026-10-05" }
  });

  fireEvent.change(screen.getByLabelText(/Bitiş Tarihi/i), {
    target: { value: "2026-10-20" }
  });

  const saveButton = screen.getByRole("button", { name: /^Kaydet$/i });

  fireEvent.click(saveButton);
  fireEvent.click(saveButton);

  expect(mockedApi).toHaveBeenCalledTimes(1);

  resolveRequest?.();

  await waitFor(() => {
    expect(
      screen.getByText(/Garanti kaydı başarıyla eklendi/i)
    ).toBeInTheDocument();
  });
});
it("Başarılı garanti kaydından sonra liste yenilenmelidir", async () => {
  mockedApi.mockResolvedValue({});

  render(<WarrantyList passportId={mockPassportId} />);

  fireEvent.click(
    screen.getByRole("button", { name: /Garanti kaydı ekle/i })
  );

  fireEvent.change(screen.getByLabelText(/Başlangıç Tarihi/i), {
    target: { value: "2026-10-05" }
  });

  fireEvent.change(screen.getByLabelText(/Bitiş Tarihi/i), {
    target: { value: "2026-10-20" }
  });

  fireEvent.click(
    screen.getByRole("button", { name: /^Kaydet$/i })
  );

  await waitFor(() => {
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  expect(
    screen.getByText(/Garanti kaydı başarıyla eklendi/i)
  ).toBeInTheDocument();
});
});
