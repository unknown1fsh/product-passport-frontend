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
import { brandApi, type Brand } from "./api";

interface BrandFormProps {
  brand?: Brand;
  onClose: () => void;
  onSaved: () => void;
}

export function BrandForm({ brand, onClose, onSaved }: BrandFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    if (brand) {
      setName(brand.name || "");
      setDescription(brand.description || "");
      setActive(brand.active ?? true);
    }
  }, [brand]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(undefined);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        active,
      };

      if (brand) {
        await brandApi.update(brand.publicId, payload);
      } else {
        await brandApi.create(payload);
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
      sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
        {brand ? "Markayı Düzenle" : "Yeni Marka Ekle"}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error !== undefined && <ErrorNotice error={error} />}

            <TextField
              label="Marka Adı *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              size="small"
              placeholder="Marka adını girin"
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
              placeholder="Marka açıklaması (isteğe bağlı)"
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