import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PassportForm } from "./PassportForm";
import { passportApi } from "./api";

vi.mock("./api", () => ({
    passportApi: { create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

vi.mock("../categories/CategorySelect", () => ({
    CategorySelect: ({ onChange }: { onChange: (v: string | null) => void }) => (
        <button type="button" onClick={() => onChange("kategori-1")}>
            kategori seç
        </button>
    ),
}));

vi.mock("../models/ModelSelect", () => ({
    ModelSelect: ({ onChange }: { onChange: (v: string) => void }) => (
        <button type="button" onClick={() => onChange("model-1")}>
            model seç
        </button>
    ),
}));

beforeEach(() => vi.resetAllMocks());

describe("Pasaport formu", () => {
    it("zorunlu alanlar boşken istek atmaz", async () => {
        const saved = vi.fn();
        render(<PassportForm onClose={() => {}} onSaved={saved} />);

        await userEvent.click(screen.getByRole("button", { name: "Kaydet" }));

        expect(await screen.findByText(/boş bırakılamaz/)).toBeInTheDocument();
        expect(passportApi.create).not.toHaveBeenCalled();
        expect(saved).not.toHaveBeenCalled();
    });
    it("satın alma tarihini 2000 ile bugün arasına sınırlar", () => {
        render(<PassportForm onClose={() => {}} onSaved={() => {}} />);

        const tarih = screen.getByLabelText(/^Satın alma tarihi/);
        expect(tarih).toHaveAttribute("min", "2000-01-01");
        expect(tarih).toHaveAttribute("max", new Date().toLocaleDateString("sv-SE"));
    });

    it("dolu formda sözleşmedeki gövdeyi gönderir", async () => {
        const user = userEvent.setup();
        const saved = vi.fn();
        render(<PassportForm onClose={() => {}} onSaved={saved} />);


        await user.type(screen.getByLabelText(/^Seri numarası/), "SN-00001-TEST");
        await user.click(screen.getByRole("button", { name: "kategori seç" }));
        await user.click(screen.getByRole("button", { name: "model seç" }));
        fireEvent.change(screen.getByLabelText(/^Satın alma tarihi/), {
            target: { value: "2026-09-01" },
        });

        await user.click(screen.getByRole("button", { name: "Kaydet" }));

        await waitFor(() => expect(saved).toHaveBeenCalled());
        expect(passportApi.create).toHaveBeenCalledWith({
            serialNumber: "SN-00001-TEST",
            productModelId: "model-1",
            categoryId: "kategori-1",
            purchaseDate: "2026-09-01",
            invoiceNumber: "",
            description: "",
        });
    });
});