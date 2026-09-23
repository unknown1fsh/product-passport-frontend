import { useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  keyframes,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { sessionStore } from "./session";
import { ErrorNotice, Loading } from "../../shared/ui/Feedback";

const float1 = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const float2 = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const float3 = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
`;

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
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "#F4F7FB",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        position: "relative",
        overflow: { xs: "auto", md: "hidden" },
      }}
    >
      <Box
        sx={{
          position: "fixed",
          bottom: "-20%",
          left: "-10%",
          width: "60vw",
          height: "60vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(67, 97, 238, 0.25) 0%, rgba(244, 247, 251, 0) 70%)",
          zIndex: 0,
          display: { xs: "none", md: "block" },
        }}
      />
      <Box
        sx={{
          position: "fixed",
          top: "-10%",
          right: "30%",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0, 212, 255, 0.25) 0%, rgba(244, 247, 251, 0) 70%)",
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          flex: { xs: "none", md: 1.2 },
          p: { xs: 4, sm: 6, md: 8, lg: 12 },
          pt: { xs: 6, md: 8, lg: 12 },
          display: "flex",
          flexDirection: "column",
          justifyContent: { xs: "flex-start", md: "space-between" },
          alignItems: { xs: "center", md: "flex-start" },
          textAlign: { xs: "center", md: "left" },
          zIndex: 1,
          position: "relative",
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#1650C8",
            fontSize: "0.85rem",
          }}
        >
          TEIN / ÜRÜN PASAPORTU
        </Typography>

        <Box
          sx={{
            mt: { xs: 3, md: "auto" },
            mb: { xs: 4, md: "auto" },
            maxWidth: 550,
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", md: "flex-start" },
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "2.2rem",
                sm: "2.8rem",
                md: "3.5rem",
                lg: "4.2rem",
              },
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#1A365D",
            }}
          >
            Her ürünün bir{" "}
            <Box component="br" sx={{ display: { xs: "none", md: "block" } }} />
            hikâyesi var.
          </Typography>
          <Typography
            sx={{
              mt: 3,
              color: "#2D3748",
              lineHeight: 1.6,
              fontSize: { xs: "1.05rem", md: "1.2rem" },
              fontWeight: 500,
              maxWidth: 450,
            }}
          >
            Ürün bilgilerini, kategorileri ve pasaportları tek bir çalışma
            alanından takip edin.
          </Typography>

          <Box
            sx={{
              display: { xs: "none", md: "block" },
              position: "relative",
              width: "100%",
              minHeight: 340,
              mt: 4,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                position: "absolute",
                top: 10,
                left: 160,
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                pr: 4,
                borderRadius: "16px",
                bgcolor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
                border: "1px solid rgba(255,255,255,0.6)",
                animation: `${float1} 4.5s ease-in-out infinite`,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  bgcolor: "#E8F0FE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1967D2",
                }}
              >
                <Inventory2RoundedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    color: "#1A365D",
                    textAlign: "left",
                  }}
                >
                  Dijital Pasaport
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#718096",
                    fontWeight: 500,
                    textAlign: "left",
                  }}
                >
                  Tüm yaşam döngüsü
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                position: "absolute",
                top: 110,
                left: 10,
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                pr: 4,
                borderRadius: "16px",
                bgcolor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
                border: "1px solid rgba(255,255,255,0.6)",
                animation: `${float2} 5s ease-in-out infinite`,
                animationDelay: "0.5s",
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  bgcolor: "#E6F4EA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#137333",
                }}
              >
                <VerifiedUserRoundedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    color: "#1A365D",
                    textAlign: "left",
                  }}
                >
                  Aktif Garanti
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#718096",
                    fontWeight: 500,
                    textAlign: "left",
                  }}
                >
                  Doğrulanmış kayıtlar
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                position: "absolute",
                top: 210,
                left: 170,
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                pr: 4,
                borderRadius: "16px",
                bgcolor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
                border: "1px solid rgba(255,255,255,0.6)",
                animation: `${float3} 5.5s ease-in-out infinite`,
                animationDelay: "1s",
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  bgcolor: "#F4EBFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6B46C1",
                }}
              >
                <ConstructionRoundedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    color: "#1A365D",
                    textAlign: "left",
                  }}
                >
                  Servis Geçmişi
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#718096",
                    fontWeight: 500,
                    textAlign: "left",
                  }}
                >
                  Yetkili işlem takibi
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "#2D3748",
            fontWeight: 500,
            fontStyle: "italic",
            display: { xs: "none", md: "block" },
          }}
        >
          Kayıttan bakıma, bilgi her adımda yanınızda.
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "center",
          p: { xs: 2, sm: 4, md: 6 },
          pb: { xs: 8, md: 6 },
          zIndex: 1,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 440,
            p: { xs: 3, sm: 4, md: 5 },
            bgcolor: "#FFFFFF",
            borderRadius: "24px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.04)",
          }}
        >
          <Stack spacing={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="overline"
                sx={{
                  color: "#1650C8",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  fontSize: "0.75rem",
                }}
              >
                ÇALIŞMA ALANINIZ
              </Typography>
              <Typography
                component="h2"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mt: 1,
                  mb: 1,
                  color: "#1A202C",
                  letterSpacing: "-0.02em",
                  fontSize: { xs: "1.75rem", md: "2.125rem" },
                }}
              >
                Tekrar hoş geldiniz
              </Typography>
              <Typography sx={{ color: "#718096", fontSize: "0.95rem" }}>
                Devam etmek için hesabınıza giriş yapın.
              </Typography>
            </Box>

            {auth.notice && (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: "12px",
                  bgcolor: "#FFF8F1",
                  color: "#C05621",
                  "& .MuiAlert-icon": { color: "#DD6B20" },
                }}
              >
                {auth.notice}
              </Alert>
            )}
            {error !== undefined && <ErrorNotice error={error} />}

            <Box component="form" onSubmit={submit}>
              <Stack spacing={3}>
                <TextField
                  label="E-posta veya kullanıcı adı"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  slotProps={{
                    htmlInput: { maxLength: 50 },
                    inputLabel: {
                      sx: {
                        color: "#718096",
                        "&.Mui-focused": { color: "#1650C8" },
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F7FAFC",
                      borderRadius: "12px",
                      "& fieldset": { borderColor: "transparent" },
                      "&:hover fieldset": {
                        borderColor: "rgba(22, 80, 200, 0.2)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": {
                          borderColor: "#1650C8",
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />

                <TextField
                  label="Parola"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  slotProps={{
                    htmlInput: { maxLength: 72 },
                    inputLabel: {
                      sx: {
                        color: "#718096",
                        "&.Mui-focused": { color: "#1650C8" },
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#F7FAFC",
                      borderRadius: "12px",
                      "& fieldset": { borderColor: "transparent" },
                      "&:hover fieldset": {
                        borderColor: "rgba(22, 80, 200, 0.2)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#FFFFFF",
                        "& fieldset": {
                          borderColor: "#1650C8",
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  size="large"
                  variant="contained"
                  disabled={busy}
                  endIcon={<ArrowForwardIcon />}
                  disableElevation
                  sx={{
                    backgroundColor: "#1650C8",
                    color: "#FFFFFF",
                    py: 1.6,
                    borderRadius: "50px",
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                    mt: 1,
                    transition: "all 0.2s ease",
                    "&:hover": { backgroundColor: "#113A90" },
                  }}
                >
                  {busy ? "Giriş yapılıyor…" : "Giriş yap"}
                </Button>
              </Stack>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: "#A0AEC0",
                textAlign: "center",
                mt: 2,
                fontSize: "0.85rem",
              }}
            >
              Hesap erişimi için ekip yöneticinizle iletişime geçin.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}