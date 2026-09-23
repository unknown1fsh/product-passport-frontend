import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { ErrorNotice } from "../../shared/ui/Feedback";
import { supplierApi, type Supplier } from "./api";

interface SupplierFormProps {
  supplier?: Supplier;
  onClose: () => void;
  onSaved: () => void;
}

export function SupplierForm({ supplier, onClose, onSaved }: SupplierFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    if (supplier) {
      setCode(supplier.code || "");
      setName(supplier.name || "");
      setEmail(supplier.email || "");
      setPhone(supplier.phone || "");
      setDescription(supplier.description || "");
      setActive(supplier.active ?? true);
    }
  }, [supplier]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(undefined);

    try {
      const payload = {
        code: code.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        description: description.trim(),
        active,
      };

      if (supplier) {
        // Güncelleme işleminde kod gönderilmez veya backend kısıtına göre güncellenir
        await supplierApi.update(supplier.publicId, payload);
      } else {
        await supplierApi.create(payload);
      }

      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open
      onClose={() => { if (!busy) onClose(); }}
      maxWidth="sm"
      fullWidth
      aria-labelledby="supplier-form-title"
      sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}
    >
      <DialogTitle id="supplier-form-title" sx={{ fontWeight: 700, color: "#0F172A" }}>
        {supplier ? "Tedarikçiyi Düzenle" : "Yeni Tedarikçi Ekle"}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error !== undefined && <ErrorNotice error={error} />}

            <TextField
              label="Tedarikçi Kodu *"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={Boolean(supplier)} // Düzenleme modunda kod değiştirilemez
              fullWidth
              size="small"
              placeholder="Örn: SUP-001"
              helperText={supplier ? "Tedarikçi kodu değiştirilemez." : ""}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            <TextField
              label="Tedarikçi Adı *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              size="small"
              placeholder="Şirket veya tedarikçi adı"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            <TextField
              label="E-posta"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
              placeholder="ornek@tedarikci.com"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            <TextField
              label="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              size="small"
              placeholder="+90 (5xx) xxx xx xx"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            <TextField
              label="Açıklama"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Ek açıklamalar..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Aktif"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button
            disabled={busy}
            onClick={onClose}
            sx={{
              color: "#0F172A",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(15, 23, 42, 0.04)" },
            }}
          >
            Vazgeç
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={busy}
            sx={{
              bgcolor: "#0F172A",
              fontWeight: 600,
              borderRadius: "10px",
              px: 3,
              py: 1,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#1E293B" },
            }}
          >
            {busy ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}