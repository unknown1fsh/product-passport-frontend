import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { ApiError } from "../api/http";
export function Loading() {
  return (
    <Box role="status" sx={{ p: 5, textAlign: "center" }}>
      <CircularProgress size={28} />
      <Typography sx={{ mt: 2 }}>Yükleniyor…</Typography>
    </Box>
  );
}
export function ErrorNotice({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const title =
    error instanceof ApiError
      ? {
          400: "Bilgileri kontrol edin",
          401: "Giriş gerekli",
          403: "Bu işlem için yetkiniz yok",
          404: "Kayıt bulunamadı",
          409: "İşlem tamamlanamadı",
          429: "Çok fazla istek",
        }[error.status] || "Bir sorun oluştu"
      : "Bağlantı kurulamadı";
  return (
    <Alert
      severity="error"
      role="alert"
      action={
        retry && (
          <Button color="inherit" onClick={retry}>
            Tekrar dene
          </Button>
        )
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {error instanceof Error ? error.message : "Lütfen tekrar deneyin."}
      {error instanceof ApiError && error.details.length > 0 && (
        <ul>
          {error.details.map((detail, i) => (
            <li key={i}>{detail}</li>
          ))}
        </ul>
      )}
    </Alert>
  );
}
