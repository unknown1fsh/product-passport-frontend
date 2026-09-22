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
        // YENİ: Yumuşak Mor -> Beyaz -> Sarı geçişi
        background: "linear-gradient(160deg, #F5EBFF 0%, #FFFFFF 40%, #FFF4D1 100%)",
        borderRadius: "24px",
        // YENİ: Arka planda boğulmaması için beyaz çerçeve ve belirgin gölge
        border: "2px solid #FFFFFF",
        boxShadow: "4px 10px 40px rgba(205, 139, 255, 0.15)",
        overflowX: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
            sx={{ bgcolor: "#FFFFFF", color: "#1650C8", borderRadius: "12px", width: 44, height: 44, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", "&:hover": { bgcolor: "#FFEEC9" } }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: "#1650C8", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Typography sx={{ color: "white", fontWeight: 900, fontSize: "14px" }}>T</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", color: "#1A202C", whiteSpace: "nowrap" }}>
                TEIN<span style={{ color: "#CD8BFF" }}>.</span>
              </Typography>
            </Box>
            <IconButton 
              onClick={() => { setIsMini(true); setMobileOpen(false); }} 
              sx={{ color: "#1650C8", "&:hover": { bgcolor: "rgba(255,255,255,0.8)" } }}
            >
              <MenuIcon />
            </IconButton>
          </>
        )}
      </Box>
      
      <List sx={{ px: isMini ? 0 : 1, flex: 1 }}>
        {links.map((link) => (
          <ListItemButton
            key={link.to}
            component={NavLink}
            to={link.to}
            end={link.to === "/"}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: "14px",
              mb: 0.5,
              py: 1.2,
              justifyContent: isMini ? "center" : "flex-start",
              color: "#64748B",
              transition: "all 0.2s ease",
              "&.active": { 
                bgcolor: "#FFB922", 
                color: "#1650C8",
                "& .MuiListItemIcon-root": { color: "#1650C8" },
                boxShadow: "0 4px 14px rgba(255, 185, 34, 0.4)"
              },
              "&:hover": { bgcolor: "rgba(255,255,255,0.6)", color: "#1A202C" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: isMini ? 0 : 40, justifyContent: "center" }}>
              {link.icon}
            </ListItemIcon>
            {!isMini && (
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 700, fontSize: "0.95rem", whiteSpace: "nowrap" }}>{link.label}</Typography>} 
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
            bgcolor: "rgba(255,255,255,0.7)",
            borderRadius: "16px",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#1650C8" }}>
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
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "#FFEEC9" }}>
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
          sx={{ display: { md: "none" }, "& .MuiDrawer-paper": { width: 280, p: 2, bgcolor: "#FFEEC9", border: "none" } }}
        >
          {navigation}
        </Drawer>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", p: { xs: 2, md: 2.5 }, pl: { md: 0 } }}>
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
              sx={{ display: { md: "none" }, bgcolor: "#FFFFFF", border: "1px solid #F2F1EE", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}
            >
              <MenuIcon sx={{ color: "#1650C8" }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1A202C" }}>
              {title}
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* ARAMA ÇUBUĞU KALDIRILDI - SADECE PROFİL KALDI */}
            <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#FFFFFF", border: "1px solid rgba(205,139,255,0.2)", px: 1.5, py: 1, borderRadius: "50px", boxShadow: "0 4px 15px rgba(205,139,255,0.1)" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#CD8BFF", color: "#FFFFFF", fontSize: 14, fontWeight: 800, mr: 1.5 }}>
                {user?.firstName.charAt(0)}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" }, mr: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#1A202C", lineHeight: 1.2 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
                  {user && roles[user.role]}
                </Typography>
              </Box>
              <Box sx={{ width: "1px", height: "24px", bgcolor: "rgba(0,0,0,0.06)", mx: 1 }} />
              <IconButton 
                size="small" 
                onClick={async () => {
                  setBusy(true);
                  try { await sessionStore.logout(); } finally { setBusy(false); }
                }}
                disabled={busy}
                sx={{ bgcolor: "#FFF4D1", color: "#1650C8", "&:hover": { bgcolor: "#FFB922", color: "#FFFFFF" } }}
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
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "24px",
          background: "linear-gradient(135deg, #E6CFFF 0%, #FFEEC9 100%)", 
          boxShadow: "0 12px 32px rgba(205, 139, 255, 0.15)", 
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 3
        }}
      >
        <Box>
          <Chip label="Sistem Aktif" size="small" sx={{ bgcolor: "#FFFFFF", color: "#CD8BFF", fontWeight: 800, mb: 2, borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1A202C" }}>
            Merhaba, {user?.firstName}
          </Typography>
          <Typography sx={{ color: "#1A202C", mt: 1, fontSize: "1.05rem", fontWeight: 500, opacity: 0.8 }}>
            Bugün ürün kayıtlarınızla ilgili işlemleri hızlıca halledebilirsiniz.
          </Typography>
        </Box>
        
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <Box sx={{ textAlign: "center", p: 2, bgcolor: "#FFFFFF", borderRadius: "16px", minWidth: 100, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#1650C8" }}>24</Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 650 }}>Pasaport</Typography>
          </Box>
          <Box sx={{ textAlign: "center", p: 2, bgcolor: "#FFFFFF", borderRadius: "16px", minWidth: 100, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#CD8BFF" }}>12</Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 650 }}>Model</Typography>
          </Box>
        </Box>
      </Box>

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
            sx={{ 
              borderRadius: "24px", 
              bgcolor: "#FFFFFF", // YENİ: Boğulmayı engellemek için bembeyaz arka plan
              boxShadow: "0 6px 20px rgba(0,0,0,0.03)", 
              border: "1px solid #F0F0F0", 
              borderBottom: "3px solid #E6CFFF", // YENİ: Eksikliği dolduran alt vurgu çizgisi (soft mor)
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "0 16px 40px rgba(22, 80, 200, 0.08)",
                borderColor: "#1650C8", // Hover'da mavi vurgu
              }
            }}
          >
            <CardActionArea component={Link} to={link.to} sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <Box 
                sx={{ 
                  color: "#1650C8", 
                  mb: 3,
                  width: 56,
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#F8F0FF", // YENİ: İkon kutusu soft mor
                  borderRadius: "16px",
                  transition: "all 0.3s ease",
                  ".MuiCardActionArea-root:hover &": {
                    bgcolor: "#1650C8",
                    color: "#FFFFFF"
                  }
                }}
              >
                {link.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#1A202C", fontSize: "1.1rem" }}>{link.label}</Typography>
              <Typography sx={{ color: "#64748B", mt: 1, mb: 3, flex: 1, fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.6 }}>
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
                  borderTop: "1px solid #F2F1EE", // Daha temiz ve sade bir ayrım
                  color: "#1650C8",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                  İncele
                </Typography>
                <ArrowForward fontSize="small" sx={{ transition: "transform 0.3s", ".MuiCardActionArea-root:hover &": { transform: "translateX(4px)" } }} />
              </Stack>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}

export function MessagePage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Stack spacing={2} sx={{ alignItems: "center", justifyContent: "center", py: 10, textAlign: "center", minHeight: "60vh" }}>
      <Box sx={{ width: 80, height: 80, borderRadius: "24px", bgcolor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", mb: 2, borderBottom: "3px solid #E6CFFF" }}>
        <Inventory2Outlined sx={{ fontSize: 32, color: "#1650C8" }} />
      </Box>
      <Typography component="h1" variant="h4" sx={{ color: "#1A202C", fontWeight: 800 }}>
        {title}
      </Typography>
      <Typography sx={{ color: "#64748B", fontWeight: 500 }}>{description}</Typography>
      <Button component={Link} to="/" variant="contained" sx={{ mt: 3, bgcolor: "#1650C8", color: "#FFFDF9", borderRadius: "12px", px: 4, fontWeight: 700 }}>
        Anasayfaya dön
      </Button>
    </Stack>
  );
}