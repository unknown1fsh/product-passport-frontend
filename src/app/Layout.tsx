import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import ViewListOutlined from "@mui/icons-material/ViewListOutlined";
import Logout from "@mui/icons-material/Logout";
import ArrowForward from "@mui/icons-material/ArrowForward";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import { useAuth } from "../features/auth/AuthProvider";
import { sessionStore } from "../features/auth/session";

const links = [
  { to: "/", label: "Anasayfa", icon: <HomeOutlined /> },
  { to: "/kategoriler", label: "Kategoriler", icon: <CategoryOutlined /> },
  { to: "/modeller", label: "Modeller", icon: <ViewListOutlined /> },
  {
    to: "/pasaportlar",
    label: "Ürün pasaportları",
    icon: <Inventory2Outlined />,
  },
  {
    to: "/garantiler",
    label: "Garanti kayıtları",
    icon: <VerifiedOutlined />,
  },
];

const roles = { ADMIN: "Yönetici", MANUFACTURER: "Üretici", USER: "Kullanıcı" };

export function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [busy, setBusy] = useState(false);

  const title =
    links.find((link) =>
      link.to === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(link.to),
    )?.label || "Çalışma alanı";

  const drawerWidth = isMini ? 104 : 280;

  const navigation = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: isMini ? 2 : 2.5,
        bgcolor: "#FFFFFF",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
        overflowX: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid rgba(0,0,0,0.04)"
      }}
    >
      <Box sx={{ 
        px: isMini ? 0 : 1, 
        pt: 2, 
        pb: 3, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: isMini ? "center" : "space-between", 
        gap: 1 
      }}>
        {isMini ? (
          <IconButton 
            onClick={() => setIsMini(false)} 
            sx={{ bgcolor: "#F1F5F9", color: "#1650C8", borderRadius: "12px", width: 44, height: 44, "&:hover": { bgcolor: "#E2E8F0" } }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Mavi-Gri Geçişli Logo Kutusu */}
              <Box sx={{ width: 36, height: 36, background: "linear-gradient(135deg, #1650C8 0%, #334155 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Typography sx={{ color: "white", fontWeight: 900, fontSize: "16px" }}>T</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: "#0F172A", letterSpacing: "-0.5px" }}>
                TEIN<span style={{ color: "#1650C8" }}>.</span>
              </Typography>
            </Box>
            <IconButton 
              onClick={() => { setIsMini(true); setMobileOpen(false); }} 
              sx={{ color: "#64748B", "&:hover": { color: "#0F172A", bgcolor: "#F1F5F9" } }}
            >
              <MenuIcon />
            </IconButton>
          </>
        )}
      </Box>
      
      <List sx={{ px: isMini ? 0 : 1, flex: 1, pt: 2 }}>
        {links.map((link) => (
          <ListItemButton
            key={link.to}
            component={NavLink}
            to={link.to}
            end={link.to === "/"}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: "12px",
              mb: 1,
              py: 1.2,
              justifyContent: isMini ? "center" : "flex-start",
              color: "#64748B",
              transition: "all 0.2s ease",
              // Aktif menü öğesi kurumsal mavi tonu
              "&.active": { 
                bgcolor: "#EFF6FF", 
                color: "#1650C8",
                "& .MuiListItemIcon-root": { color: "#1650C8" },
              },
              "&:hover": { bgcolor: "#F8FAFC", color: "#0F172A" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: isMini ? 0 : 40, justifyContent: "center" }}>
              {link.icon}
            </ListItemIcon>
            {!isMini && (
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>{link.label}</Typography>} 
              />
            )}
          </ListItemButton>
        ))}
      </List>

      {!isMini && (
        <Box
          sx={{
            mt: "auto",
            p: 2,
            bgcolor: "#F8FAFC",
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.04)"
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
            TEIN Destek
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748B", display: "block", mt: 0.5 }}>
            Yardıma mı ihtiyacınız var?
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "#F4F6F9" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: -1000,
          "&:focus": {
            left: 16,
            top: 12,
            zIndex: 2000,
            bgcolor: "white",
            p: 1,
          },
        }}
      >
        İçeriğe atla
      </Box>
      <Box
        component="nav"
        aria-label="Ana menü"
        sx={{ 
          width: { md: drawerWidth }, 
          flexShrink: 0, 
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" 
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { 
              width: drawerWidth, 
              border: 0, 
              bgcolor: "transparent", 
              p: 2.5,
              overflowX: "hidden",
              transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            },
          }}
        >
          {navigation}
        </Drawer>
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { md: "none" }, "& .MuiDrawer-paper": { width: 280, p: 2, bgcolor: "#FFFFFF", border: "none" } }}
        >
          {navigation}
        </Drawer>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", p: { xs: 2, md: 3 }, pl: { md: 1 } }}>
        <Box
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            mb: 4,
            gap: 2
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton 
              onClick={() => setMobileOpen(true)} 
              sx={{ display: { md: "none" }, bgcolor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <MenuIcon sx={{ color: "#0F172A" }} />
            </IconButton>
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)", px: 1.5, py: 1, borderRadius: "50px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <Avatar sx={{ width: 32, height: 32, background: "linear-gradient(135deg, #1650C8 0%, #334155 100%)", color: "#FFFFFF", fontSize: 14, fontWeight: 700, mr: 1.5 }}>
                {user?.firstName.charAt(0)}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" }, mr: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
                  {user && roles[user.role]}
                </Typography>
              </Box>
              <Box sx={{ width: "1px", height: "24px", bgcolor: "rgba(0,0,0,0.08)", mx: 1 }} />
              <IconButton 
                size="small" 
                onClick={async () => {
                  setBusy(true);
                  try { await sessionStore.logout(); } finally { setBusy(false); }
                }}
                disabled={busy}
                sx={{ color: "#64748B", "&:hover": { bgcolor: "#FEECEB", color: "#D93025" } }}
              >
                <Logout fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Box component="main" id="main" sx={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export function HomePage() {
  const { user } = useAuth();
  return (
    <Stack spacing={4}>
      {/* ÜST KISIM (HERO BANNER): Solu Koyu Mavi (#0F172A), Sağa doğru Metalik Griye (#475569) Açılan Muhteşem Geçiş */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "16px",
          background: "linear-gradient(135deg, #0F172A 0%, #1D4ED8 50%, #475569 100%)", 
          boxShadow: "0 14px 36px rgba(15, 23, 42, 0.25)", 
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 3,
          color: "#FFFFFF"
        }}
      >
        <Box>
          <Chip label="Sistem Aktif" size="small" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#93C5FD", fontWeight: 700, mb: 2, borderRadius: "6px" }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
            Merhaba, {user?.firstName}
          </Typography>
          <Typography sx={{ color: "#CBD5E1", mt: 1, fontSize: "1.05rem", fontWeight: 400 }}>
            Bugün ürün kayıtlarınızla ilgili işlemleri hızlıca halledebilirsiniz.
          </Typography>
        </Box>
        
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <Box sx={{ textAlign: "center", p: 2, px: 3, bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#FFFFFF" }}>24</Typography>
            <Typography variant="caption" sx={{ color: "#E2E8F0", fontWeight: 600 }}>Pasaport</Typography>
          </Box>
          <Box sx={{ textAlign: "center", p: 2, px: 3, bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#FFFFFF" }}>12</Typography>
            <Typography variant="caption" sx={{ color: "#E2E8F0", fontWeight: 600 }}>Model</Typography>
          </Box>
        </Box>
      </Box>

      {/* ALT KARTLAR (Mavi Vurgulu) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {links.slice(1).map((link) => (
          <Card 
            key={link.to} 
            elevation={0}
            sx={{ 
              borderRadius: "16px", 
              bgcolor: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.06)", 
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                borderColor: "rgba(22, 80, 200, 0.4)", 
              }
            }}
          >
            <CardActionArea component={Link} to={link.to} sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <Box 
                sx={{ 
                  color: "#1650C8", 
                  mb: 3,
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#EFF6FF", 
                  borderRadius: "12px",
                  transition: "all 0.2s ease",
                  ".MuiCardActionArea-root:hover &": { background: "linear-gradient(135deg, #1650C8 0%, #334155 100%)", color: "#FFFFFF" }
                }}
              >
                {link.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>{link.label}</Typography>
              <Typography sx={{ color: "#64748B", mt: 1, mb: 3, flex: 1, fontSize: "0.95rem", lineHeight: 1.5 }}>
                {link.to === "/kategoriler"
                  ? "Sistem kategorilerini düzenleyin ve hiyerarşiyi yönetin."
                  : link.to === "/modeller"
                  ? "Tüm ürün modellerini detaylı şekilde inceleyin."
                  : link.to === "/pasaportlar"
                  ? "Pasaport ve donanım bilgilerine anında erişin."
                  : "Garanti süreçlerini ve servis kayıtlarını takip edin."}
              </Typography>
              <Stack
                direction="row"
                sx={{
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: "auto",
                  pt: 2.5,
                  borderTop: "1px solid rgba(0,0,0,0.06)", 
                  color: "#1650C8",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  İncele
                </Typography>
                <ArrowForward fontSize="small" sx={{ transition: "transform 0.2s", ".MuiCardActionArea-root:hover &": { transform: "translateX(4px)" } }} />
              </Stack>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}

export function MessagePage({ title, description }: { title: string; description: string; }) {
  return (
    <Stack spacing={2} sx={{ alignItems: "center", justifyContent: "center", py: 10, textAlign: "center", minHeight: "60vh" }}>
      <Box sx={{ width: 80, height: 80, borderRadius: "20px", bgcolor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
        <Inventory2Outlined sx={{ fontSize: 32, color: "#1650C8" }} />
      </Box>
      <Typography component="h1" variant="h4" sx={{ color: "#0F172A", fontWeight: 800 }}>
        {title}
      </Typography>
      <Typography sx={{ color: "#64748B", fontWeight: 500 }}>{description}</Typography>
      <Button component={Link} to="/" variant="contained" sx={{ mt: 3, background: "linear-gradient(135deg, #1650C8 0%, #334155 100%)", color: "#FFFFFF", borderRadius: "8px", px: 4, fontWeight: 600, textTransform: "none", boxShadow: "none", "&:hover": { background: "linear-gradient(135deg, #0f3a9e 0%, #1E293B 100%)" } }}>
        Anasayfaya dön
      </Button>
    </Stack>
  );
}