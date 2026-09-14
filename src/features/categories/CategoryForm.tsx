import { useState } from "react";
import type { FormEvent } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import type { Category } from "../../shared/types";
import { categoryApi } from "./api";
import { ErrorNotice } from "../../shared/ui/Feedback";
export function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category?: Category;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [code, setCode] = useState(category?.code || "");
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [active, setActive] = useState(category?.active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError(new Error("Kod ve ad boş bırakılamaz."));
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      // Güncelleme DTO'sunda code yoktur; değişmez alanı sunucuya göndermeyin.
      if (category)
        await categoryApi.update(category.publicId, {
          name: name.trim(),
          description: description.trim(),
          active,
        });
      else
        await categoryApi.create({
          code: code.trim(),
          name: name.trim(),
          description: description.trim(),
        });
      onSaved();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onClose={() => {
        if (!busy) onClose();
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="category-form-title"
    >
      <form onSubmit={submit}>
        <DialogTitle id="category-form-title">
          {category ? "Kategoriyi düzenle" : "Yeni kategori"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {error !== undefined && <ErrorNotice error={error} />}
            <TextField
              label="Kod"
              required
              disabled={!!category}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 100 } }}
              helperText={
                category ? "Kod sonradan değiştirilemez." : "Örnek: BEYAZ-ESYA"
              }
            />
            <TextField
              label="Kategori adı"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 150 } }}
            />
            <TextField
              label="Açıklama"
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              helperText={description.length + "/500"}
            />
            {category && (
              <FormControlLabel
                control={
                  <Switch
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                }
                label="Aktif"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={busy}>
            Vazgeç
          </Button>
          <Button variant="contained" type="submit" disabled={busy}>
            {busy ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
