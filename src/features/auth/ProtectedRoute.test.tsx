import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { it, expect, vi } from "vitest";
import { ProtectedRoute } from "../../app/Router";
import { useAuth } from "./AuthProvider";
vi.mock("./AuthProvider", () => ({ useAuth: vi.fn() }));
it("anonim kullanıcıyı girişe yönlendirir", () => {
  vi.mocked(useAuth).mockReturnValue({
    status: "anonymous",
    user: null,
    notice: null,
  });
  render(
    <MemoryRouter initialEntries={["/private"]}>
      <Routes>
        <Route path="/giris" element={<p>Giriş ekranı</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/private" element={<p>Gizli içerik</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByText("Giriş ekranı")).toBeInTheDocument();
  expect(screen.queryByText("Gizli içerik")).not.toBeInTheDocument();
});
