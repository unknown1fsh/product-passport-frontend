import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ServiceForm } from "./ServiceForm";
import { serviceRecordApi } from "./api";

vi.mock("./api", () => ({
  serviceRecordApi: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function renderCreateForm() {
  const onClose = vi.fn();
  const onSaved = vi.fn();

  render(
    <ServiceForm productId="passport-1" onClose={onClose} onSaved={onSaved} />,
  );

  return { onClose, onSaved };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ServiceForm", () => {
  it("gelecek tarihli servis kaydını reddeder", async () => {
    renderCreateForm();

    fireEvent.change(screen.getByLabelText(/servis tarihi/i), {
      target: { value: tomorrow() },
    });

    fireEvent.change(screen.getByLabelText(/açıklama/i), {
      target: { value: "Bakım yapıldı" },
    });

    const submitButton = screen.getByRole("button", { name: "Kaydet" });
    const form = submitButton.closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(
      await screen.findByText("Servis tarihi gelecekte olamaz."),
    ).toBeInTheDocument();

    expect(serviceRecordApi.create).not.toHaveBeenCalled();
  });

  it("sadece boşluk içeren açıklamayı reddeder", async () => {
    renderCreateForm();

    fireEvent.change(screen.getByLabelText(/servis tarihi/i), {
      target: { value: "2026-09-10" },
    });

    fireEvent.change(screen.getByLabelText(/açıklama/i), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    expect(await screen.findByText("Açıklama zorunludur.")).toBeInTheDocument();

    expect(serviceRecordApi.create).not.toHaveBeenCalled();
  });

  it("1001 karakterlik açıklamayı reddeder", async () => {
    renderCreateForm();

    fireEvent.change(screen.getByLabelText(/servis tarihi/i), {
      target: { value: "2026-09-10" },
    });

    fireEvent.change(screen.getByLabelText(/açıklama/i), {
      target: { value: "a".repeat(1001) },
    });

    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    expect(
      await screen.findByText("Açıklama en fazla 1000 karakter olabilir."),
    ).toBeInTheDocument();

    expect(serviceRecordApi.create).not.toHaveBeenCalled();
  });

  it("1000 karakterlik açıklamayı kabul eder", async () => {
    vi.mocked(serviceRecordApi.create).mockResolvedValue({
      publicId: "service-1",
      productId: "passport-1",
      serviceDate: "2026-09-10",
      description: "a".repeat(1000),
    });

    const { onSaved } = renderCreateForm();

    fireEvent.change(screen.getByLabelText(/servis tarihi/i), {
      target: { value: "2026-09-10" },
    });

    fireEvent.change(screen.getByLabelText(/açıklama/i), {
      target: { value: "a".repeat(1000) },
    });

    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    await waitFor(() => {
      expect(serviceRecordApi.create).toHaveBeenCalledWith({
        serviceDate: "2026-09-10",
        description: "a".repeat(1000),
        productId: "passport-1",
      });
    });

    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("yeni kayıtta productId ile create isteği hazırlar", async () => {
    vi.mocked(serviceRecordApi.create).mockResolvedValue({
      publicId: "service-1",
      productId: "passport-1",
      serviceDate: "2026-09-10",
      description: "Periyodik bakım",
    });

    renderCreateForm();

    fireEvent.change(screen.getByLabelText(/servis tarihi/i), {
      target: { value: "2026-09-10" },
    });

    fireEvent.change(screen.getByLabelText(/açıklama/i), {
      target: { value: "Periyodik bakım" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    await waitFor(() => {
      expect(serviceRecordApi.create).toHaveBeenCalledWith({
        serviceDate: "2026-09-10",
        description: "Periyodik bakım",
        productId: "passport-1",
      });
    });
  });

  it("düzenlemede mevcut değerleri gösterir ve productId göndermeden update yapar", async () => {
    vi.mocked(serviceRecordApi.update).mockResolvedValue({
      publicId: "service-1",
      productId: "passport-1",
      serviceDate: "2026-09-11",
      description: "Güncellenmiş bakım",
    });

    const onSaved = vi.fn();

    render(
      <ServiceForm
        productId="passport-1"
        record={{
          publicId: "service-1",
          productId: "passport-1",
          serviceDate: "2026-09-10",
          description: "Eski bakım",
        }}
        onClose={vi.fn()}
        onSaved={onSaved}
      />,
    );

    expect(screen.getByLabelText(/servis tarihi/i)).toHaveValue("2026-09-10");
    expect(screen.getByLabelText(/açıklama/i)).toHaveValue("Eski bakım");

    fireEvent.change(screen.getByLabelText(/servis tarihi/i), {
      target: { value: "2026-09-11" },
    });

    fireEvent.change(screen.getByLabelText(/açıklama/i), {
      target: { value: "Güncellenmiş bakım" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Güncelle" }));

    await waitFor(() => {
      expect(serviceRecordApi.update).toHaveBeenCalledWith("service-1", {
        serviceDate: "2026-09-11",
        description: "Güncellenmiş bakım",
      });
    });

    expect(serviceRecordApi.create).not.toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledTimes(1);
  });
});
