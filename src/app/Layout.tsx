import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
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
import { useAuth } from "../features/auth/AuthProvider";
import { sessionStore } from "../features/auth/session";

const links = [
  { to: "/", label: "Genel bakış", icon: <HomeOutlined /> },
  { to: "/kategoriler", label: "Kategoriler", icon: <CategoryOutlined /> },
  { to: "/modeller", label: "Modeller", icon: <ViewListOutlined /> },
  {
    to: "/pasaportlar",
    label: "Ürün pasaportları",
    icon: <Inventory2Outlined />,
  },
];

const roles = { ADMIN: "Yönetici", MANUFACTURER: "Üretici", USER: "Kullanıcı" };

export function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const title =
    links.find((link) =>
      link.to === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(link.to),
    )?.label || "Çalışma alanı";

  const navigation = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2.5,
        bgcolor: "primary.dark",
        color: "white",
      }}
    >
      <Box sx={{ px: 1, pt: 2, pb: 4 }}>
        <Typography sx={{ fontWeight: 800, letterSpacing: 3 }}>
          TEIN<span style={{ color: "#8dc7ac" }}> /</span>
        </Typography>
        <Typography variant="body2" sx={{ color: "#bed5c9", mt: 1 }}>
          Ürün Pasaportu
        </Typography>
      </Box>
      <Typography variant="overline" sx={{ color: "#8eafa0", px: 2, mb: 1 }}>
        ÇALIŞMA ALANI
      </Typography>
      <List>
        {links.map((link) => (
          <ListItemButton
            key={link.to}
            component={NavLink}
            to={link.to}
            end={link.to === "/"}
            onClick={() => setOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 1,
              color: "#ccded5",
              "&.active": { bgcolor: "#ffffff14", color: "white" },
              "&:hover": { bgcolor: "#ffffff0b" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>
              {link.icon}
            </ListItemIcon>
            <ListItemText primary={link.label} />
          </ListItemButton>
        ))}
      </List>
      <Box
        sx={{
          mt: "auto",
          p: 2,
          border: "1px solid #ffffff20",
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Bilgiler bir arada.
        </Typography>
        <Typography variant="caption" sx={{ color: "#bdd2c7" }}>
          Ürününüzün kayıtlarına güvenle erişin.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
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
        sx={{ width: { md: 250 }, flexShrink: 0 }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: 250, border: 0 },
          }}
        >
          {navigation}
        </Drawer>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          sx={{ display: { md: "none" }, "& .MuiDrawer-paper": { width: 250 } }}
        >
          {navigation}
        </Drawer>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <IconButton
              aria-label="Menüyü aç"
              onClick={() => setOpen(true)}
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {title}
            </Typography>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#e4eee7",
                color: "primary.main",
                fontSize: 14,
              }}
            >
              {user?.firstName.charAt(0)}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 650 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user && roles[user.role]}
              </Typography>
            </Box>
            <Button
              color="inherit"
              size="small"
              startIcon={<Logout />}
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await sessionStore.logout();
                } finally {
                  setBusy(false);
                }
              }}
            >
              Çıkış
            </Button>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          id="main"
          sx={{ p: { xs: 2.5, md: 5 }, maxWidth: 1440, mx: "auto" }}
        >
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
      <Box>
        <Typography variant="overline" color="primary">
          ÜRÜN YÖNETİMİ
        </Typography>
        <Typography variant="h4" component="h1">
          Merhaba, {user?.firstName}.
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Ürün kayıtlarınıza ve katalog bilgilerinize buradan ulaşabilirsiniz.
        </Typography>
      </Box>
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          bgcolor: "#e5eee6",
          border: "1px solid #d7e3d9",
          display: "flex",
          gap: 3,
          alignItems: "center",
        }}
      >
        <Inventory2Outlined
          sx={{
            fontSize: 48,
            color: "primary.main",
            display: { xs: "none", sm: "block" },
          }}
        />
        <Box>
          <Chip
            label="Çalışma alanınız hazır"
            size="small"
            sx={{ bgcolor: "white", mb: 2 }}
          />
          <Typography variant="h5">
            Her kayıtta daha fazla görünürlük
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Kategorileri düzenleyin, ürün pasaportlarını inceleyin ve doğru
            bilgiye ulaşın.
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
        }}
      >
        {links.slice(1).map((link) => (
          <Card key={link.to}>
            <CardActionArea component={Link} to={link.to} sx={{ p: 3 }}>
              <Box sx={{ color: "primary.main", mb: 3 }}>{link.icon}</Box>
              <Typography variant="h6">{link.label}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                {link.to === "/kategoriler"
                  ? "Ürünleri ortak kategorilerle düzenleyin."
                  : link.to === "/modeller"
                  ? "Modellerinizi inceleyin ve yönetin."
                  : "Model, satın alma ve fatura bilgilerini inceleyin."}
              </Typography>
              <Divider />
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  mt: 2,
                  color: "primary.main",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Kayıtları görüntüle
                </Typography>
                <ArrowForward fontSize="small" />
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
    <Stack spacing={2} sx={{ alignItems: "flex-start", py: 6 }}>
      <Typography component="h1" variant="h4">
        {title}
      </Typography>
      <Typography color="text.secondary">{description}</Typography>
      <Button component={Link} to="/" variant="contained">
        Ana sayfaya dön
      </Button>
    </Stack>
  );
}