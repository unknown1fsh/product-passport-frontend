import { render, screen } from "@testing-library/react";
import { MemoryRouter , Route , Routes} from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PassportList , PassportDetail } from "./PassportPages";
import { useAuth } from "../auth/AuthProvider";
import { useResource } from "../../shared/hooks/useResource";
import type { Role } from "../../shared/types";

vi.mock("../auth/AuthProvider", () => ({ useAuth: vi.fn() }));
vi.mock("../../shared/hooks/useResource", () => ({ useResource: vi.fn() }));
vi.mock("./PassportForm", () => ({ PassportForm: () => null }));

const pasaport = {
  publicId: "p1",
  serialNumber: "SN-00001-TEST",
  productModelId: "m1",
  productModelName: "Model 1",
  categoryId: "k1",
  categoryName: "Beyaz eşya",
  purchaseDate: "2026-09-01",
  invoiceNumber: null,
  description: null,
  active: true,
};
const ID = "5e0e0a05-4049-4a62-b3b1-3d0a1fdabf87";

const garanti = {
  publicId: "g1",
  startDate: "2023-07-08",
  endDate: "2026-07-08",
};

const servis = {
  publicId: "s1",
  productId: ID,
  serviceDate: "2026-06-30",
  description: "Kapı contası değiştirildi",
};

function sayfa(kayit: unknown) {
  return { content: [kayit], page: 0, size: 20, totalElements: 1, totalPages: 1 };
}

function detayiCiz(role: Role) {
  vi.mocked(useAuth).mockReturnValue({
    status: "authenticated",
    user: {
      publicId: "u1",
      firstName: "Test",
      lastName: "Kullanici",
      email: "test@example.test",
      active: true,
      role,
    },
    notice: null,
  });
  vi.mocked(useResource).mockImplementation(((path: string) => ({
    data: path.startsWith("/warranties/product/")
        ? sayfa(garanti)
        : path.startsWith("/service-records/product/")
            ? sayfa(servis)
            : { ...pasaport, publicId: ID },
    error: undefined,
    loading: false,
    reload: vi.fn(),
    path,
  })) as typeof useResource);
  render(
      <MemoryRouter initialEntries={["/pasaportlar/" + ID]}>
        <Routes>
          <Route path="/pasaportlar/:id" element={<PassportDetail />} />
        </Routes>
      </MemoryRouter>,
  );
}
function ekraniCiz(role: Role) {
  vi.mocked(useAuth).mockReturnValue({
    status: "authenticated",
    user: {
      publicId: "u1",
      firstName: "Test",
      lastName: "Kullanici",
      email: "test@example.test",
      active: true,
      role,
    },
    notice: null,
  });
  vi.mocked(useResource).mockReturnValue({
    data: {
      content: [pasaport],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    },
    error: undefined,
    loading: false,
    reload: vi.fn(),
    path: "/product-passports?page=0&size=20&sortBy=serialNumber&sortDir=asc",
  });
  render(
    <MemoryRouter>
      <PassportList />
    </MemoryRouter>,
  );
}

beforeEach(() => vi.resetAllMocks());

describe("Pasaport detayı — garanti ve servis yetkileri", () => {
  it("USER bölümleri görür ama hiçbir aksiyon düğmesi görmez", () => {
    detayiCiz("USER");
    expect(screen.getAllByText("SN-00001-TEST").length).toBeGreaterThan(0);
    expect(screen.getByText("Kapı contası değiştirildi")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Yeni Ekle" })).not.toBeInTheDocument();
    expect(
        screen.queryByRole("button", { name: "Servis kaydı ekle" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /düzenle/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sil/i })).not.toBeInTheDocument();
  });

  it("MANUFACTURER garanti ve servis aksiyonlarını görür", () => {
    detayiCiz("MANUFACTURER");
    expect(screen.getByRole("button", { name: "Yeni Ekle" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Servis kaydı ekle" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /düzenle/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /sil/i }).length).toBeGreaterThan(0);
  });
});

describe("Pasaport listesi yetkileri", () => {

  it("USER hiçbir işlem düğmesi görmez", () => {
    ekraniCiz("USER");
    expect(
      screen.queryByRole("button", { name: "Yeni pasaport" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /düzenle/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sil/i })).not.toBeInTheDocument();
  });

  it("MANUFACTURER düzenler ama silemez", () => {
    ekraniCiz("MANUFACTURER");
    expect(
      screen.getByRole("button", { name: "Yeni pasaport" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /düzenle/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sil/i })).not.toBeInTheDocument();
  });

  it("ADMIN üç işlemi de görür", () => {
    ekraniCiz("ADMIN");
    expect(
      screen.getByRole("button", { name: "Yeni pasaport" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /düzenle/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sil/i })).toBeInTheDocument();
  });
});
