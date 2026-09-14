import { useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { sessionStore } from "./session";
import { ErrorNotice, Loading } from "../../shared/ui/Feedback";
export function LoginPage() {
  const auth = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  if (auth.status === "loading") return <Loading />;
  const from = location.state?.from;
  if (auth.status === "authenticated")
    return (
      <Navigate
        to={
          typeof from === "string" &&
          from.startsWith("/") &&
          !from.startsWith("//") &&
          !from.startsWith("/giris")
            ? from
            : "/"
        }
        replace
      />
    );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await sessionStore.login(email.trim(), password);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
      }}
    >
      <Box
        sx={{
          bgcolor: "primary.dark",
          color: "white",
          p: { xs: 4, md: 8 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: { md: "100dvh" },
          boxSizing: "border-box",
        }}
      >
        <Typography sx={{ fontWeight: 700, letterSpacing: 2 }}>
          TEIN / ÜRÜN PASAPORTU
        </Typography>
        <Box sx={{ my: { xs: 4, md: 10 }, maxWidth: 500 }}>
          <Chip
            label="ÜRÜN YAŞAM DÖNGÜSÜ"
            sx={{ color: "#cef0db", bgcolor: "#ffffff14", mb: 3 }}
          />
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 36, md: 56 },
              fontWeight: 650,
              lineHeight: 1.13,
              letterSpacing: "-.045em",
            }}
          >
            Her ürünün
            <br />
            bir hikâyesi var.
          </Typography>
          <Typography sx={{ mt: 3, color: "#c2d9cf", lineHeight: 1.8 }}>
            Ürün bilgilerini, kategorileri ve pasaportları tek bir çalışma
            alanından takip edin.
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#b0c9be" }}>
          Kayıttan bakıma, bilgi her adımda yanınızda.
        </Typography>
      </Box>
      <Box sx={{ display: "grid", placeItems: "center", p: { xs: 3, md: 7 } }}>
        <Paper
          sx={{
            width: "100%",
            maxWidth: 410,
            p: { xs: 2, md: 4 },
            bgcolor: "transparent",
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="overline" color="primary">
                ÇALIŞMA ALANINIZ
              </Typography>
              <Typography component="h2" variant="h4">
                Tekrar hoş geldiniz
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Devam etmek için hesabınıza giriş yapın.
              </Typography>
            </Box>
            {auth.notice && <Alert severity="warning">{auth.notice}</Alert>}
            {error !== undefined && <ErrorNotice error={error} />}
            <Box component="form" onSubmit={submit}>
              <Stack spacing={2.5}>
                <TextField
                  label="E-posta veya kullanıcı adı"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 50 } }}
                />
                <TextField
                  label="Parola"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 72 } }}
                />
                <Button
                  type="submit"
                  size="large"
                  variant="contained"
                  disabled={busy}
                  endIcon={<ArrowForwardIcon />}
                >
                  {busy ? "Giriş yapılıyor…" : "Giriş yap"}
                </Button>
              </Stack>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Hesap erişimi için ekip yöneticinizle iletişime geçin.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
