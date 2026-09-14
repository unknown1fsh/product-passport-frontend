import { beforeEach, describe, it, expect, vi } from "vitest";
const mock = vi.hoisted(() => ({
  getToken: vi.fn(),
  refresh: vi.fn(),
  expire: vi.fn(),
}));
vi.mock("../../features/auth/session", () => ({ sessionStore: mock }));
import { api } from "./client";
import { readResponse, ApiError } from "./http";
beforeEach(() => {
  vi.resetAllMocks();
  mock.getToken.mockReturnValue("old");
  vi.stubGlobal("fetch", vi.fn());
});
describe("API sözleşmesi", () => {
  it("iş yanıtını açar", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, data: { publicId: "uuid" } }),
      ),
    );
    expect(await api("/categories/uuid")).toEqual({ publicId: "uuid" });
  });
  it("204 gövdesini ayrıştırmaz", async () => {
    expect(
      await readResponse(new Response(null, { status: 204 })),
    ).toBeUndefined();
  });
  it("400 details alanını korur", async () => {
    await expect(
      readResponse(
        new Response(
          JSON.stringify({ message: "Alan hatası", details: ["Ad zorunlu"] }),
          { status: 400 },
        ),
      ),
    ).rejects.toMatchObject({ status: 400, details: ["Ad zorunlu"] });
  });
  it("401 sonrası yalnızca bir kez yeniler", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] })));
    mock.refresh.mockResolvedValue("fresh");
    expect(await api("/categories")).toEqual([]);
    expect(mock.refresh).toHaveBeenCalledWith("old");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("ikinci 401 oturumu kapatır", async () => {
    vi.mocked(fetch).mockImplementation(
      async () => new Response(null, { status: 401 }),
    );
    mock.refresh.mockResolvedValue("fresh");
    await expect(api("/categories")).rejects.toBeInstanceOf(ApiError);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(mock.expire).toHaveBeenCalledOnce();
  });
  it.each([403, 404, 409, 429])("%i için refresh yapmaz", async (status) => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status }));
    await expect(api("/categories")).rejects.toMatchObject({ status });
    expect(mock.refresh).not.toHaveBeenCalled();
  });
  it("ağ hatasını otomatik tekrarlamaz", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(api("/categories")).rejects.toThrow();
    expect(fetch).toHaveBeenCalledOnce();
  });
});
