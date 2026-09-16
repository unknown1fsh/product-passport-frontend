import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import { Loading } from "../shared/ui/Feedback";
import { LoginPage } from "../features/auth/LoginPage";
import { Layout, HomePage, MessagePage } from "./Layout";
import { CategoryPage } from "../features/categories/CategoryPage";
import {
  PassportList,
  PassportDetail,
} from "../features/passports/PassportPages";
import { WarrantyPage } from "../features/warranties/WarrantyPage";
export function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.status === "loading") return <Loading />;
  if (auth.status !== "authenticated")
    return (
      <Navigate
        to="/giris"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  return <Outlet key={auth.user?.publicId} />;
}
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/giris" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/kategoriler" element={<CategoryPage />} />
            <Route path="/pasaportlar" element={<PassportList />} />
            <Route path="/pasaportlar/:id" element={<PassportDetail />} />
            <Route path="/garantiler" element={<WarrantyPage />} />
            <Route
              path="/yetkisiz"
              element={
                <MessagePage
                  title="Bu sayfaya erişiminiz yok"
                  description="Bu işlem için uygun bir hesapla giriş yapın."
                />
              }
            />
            <Route
              path="*"
              element={
                <MessagePage
                  title="Sayfa bulunamadı"
                  description="Adres değişmiş olabilir. Ana sayfadan devam edebilirsiniz."
                />
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
