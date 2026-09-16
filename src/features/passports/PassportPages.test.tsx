import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PassportList } from "./PassportPages";
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
    path: "/product-passports?page=0&size=20&sortBy=serialNumber&sortDir=asc",  });
  render(
    <MemoryRouter>
      <PassportList />
    </MemoryRouter>,
  );
}

beforeEach(() => vi.resetAllMocks());

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