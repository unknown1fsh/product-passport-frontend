import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "../auth/AuthProvider";
import { useResource } from "../../shared/hooks/useResource";
import { ApiError } from "../../shared/api/http";
import { serviceRecordApi } from "./api";
import { ServiceSection } from "./ServiceSection";

vi.mock("../auth/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../shared/hooks/useResource", () => ({
  useResource: vi.fn(),
}));

vi.mock("./api", () => ({
  serviceRecordApi: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("./ServiceForm", () => ({
  ServiceForm: () => <div>Servis formu</div>,
}));

const record = {
  publicId: "service-1",
  productId: "passport-1",
  serviceDate: "2026-09-10",
  description: "Periyodik bakım",
};

const reload = vi.fn();

function renderSection(
  role: "USER" | "MANUFACTURER" | "ADMIN" = "MANUFACTURER",
) {
  vi.mocked(useAuth).mockReturnValue({
    status: "authenticated",
    user: {
      publicId: "user-1",
      firstName: "Test",
      lastName: "Kullanıcı",
      email: "test@example.test",
      active: true,
      role,
    },
    notice: null,
  });

  vi.mocked(useResource).mockReturnValue({
    data: {
      content: [record],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    },
    error: undefined,
    loading: false,
    reload,
    path:
      "/service-records/product/passport-1" +
      "?page=0&size=20&sortBy=serviceDate&sortDir=desc",
  });

  render(<ServiceSection passportId="passport-1" />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ServiceSection", () => {
  it("servis kayıtlarını listeler", () => {
    renderSection();

    expect(screen.getByText("2026-09-10")).toBeInTheDocument();
    expect(screen.getByText("Periyodik bakım")).toBeInTheDocument();
  });

  it("USER rolünde servis aksiyonlarını göstermez", () => {
    renderSection("USER");

    expect(
      screen.queryByRole("button", { name: "Servis kaydı ekle" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Düzenle" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Sil" }),
    ).not.toBeInTheDocument();

    expect(screen.getByText("Periyodik bakım")).toBeInTheDocument();
  });

  it("MANUFACTURER rolünde servis aksiyonlarını gösterir", () => {
    renderSection("MANUFACTURER");

    expect(
      screen.getByRole("button", { name: "Servis kaydı ekle" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Düzenle" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Sil" })).toBeInTheDocument();
  });

  it("silmeden önce kullanıcıdan onay ister ve başarılı silmede listeyi yeniler", async () => {
    vi.mocked(serviceRecordApi.remove).mockResolvedValue(undefined);

    renderSection();

    fireEvent.click(screen.getByRole("button", { name: "Sil" }));

    expect(
      screen.getByRole("heading", { name: "Servis kaydı silinsin mi?" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/2026-09-10 tarihli servis kaydını silmek üzeresiniz/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Silmeyi onayla" }));

    await waitFor(() => {
      expect(serviceRecordApi.remove).toHaveBeenCalledWith("service-1");
    });

    expect(reload).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", {
          name: "Servis kaydı silinsin mi?",
        }),
      ).not.toBeInTheDocument();
    });
  });

  it("403 sahiplik hatasını kullanıcıya gösterir", async () => {
    vi.mocked(serviceRecordApi.remove).mockRejectedValue(
      new ApiError(403, "Access denied"),
    );

    renderSection();

    fireEvent.click(screen.getByRole("button", { name: "Sil" }));

    fireEvent.click(screen.getByRole("button", { name: "Silmeyi onayla" }));

    expect(
      await screen.findByText(/bu işlem için yetkiniz yok/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/access denied/i)).toBeInTheDocument();

    expect(serviceRecordApi.remove).toHaveBeenCalledWith("service-1");
    expect(reload).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: "Servis kaydı silinsin mi?" }),
    ).toBeInTheDocument();
  });

  it("404 üst kayıt bulunamadı hatasını kullanıcıya gösterir", async () => {
    vi.mocked(serviceRecordApi.remove).mockRejectedValue(
      new ApiError(404, "Product passport not found."),
    );

    renderSection();

    fireEvent.click(screen.getByRole("button", { name: "Sil" }));

    fireEvent.click(screen.getByRole("button", { name: "Silmeyi onayla" }));

    expect(await screen.findByText(/kayıt bulunamadı/i)).toBeInTheDocument();

    expect(screen.getByText(/product passport not found/i)).toBeInTheDocument();

    expect(serviceRecordApi.remove).toHaveBeenCalledWith("service-1");
    expect(reload).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: "Servis kaydı silinsin mi?" }),
    ).toBeInTheDocument();
  });
});
