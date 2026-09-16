import { useState } from "react";
import type { FormEvent } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

import { ErrorNotice } from "../../shared/ui/Feedback";
import { serviceRecordApi } from "./api";
import type { ServiceRecord } from "./types";

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ServiceForm({
  productId,
  record,
  onClose,
  onSaved,
}: {
  productId: string;
  record?: ServiceRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [serviceDate, setServiceDate] = useState(record?.serviceDate || "");
  const [description, setDescription] = useState(record?.description || "");
  const [dateError, setDateError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();

  const today = getToday();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedDescription = description.trim();

    let valid = true;

    setDateError("");
    setDescriptionError("");

    if (!serviceDate) {
      setDateError("Servis tarihi zorunludur.");
      valid = false;
    } else if (serviceDate > today) {
      setDateError("Servis tarihi gelecekte olamaz.");
      valid = false;
    }

    if (!trimmedDescription) {
      setDescriptionError("Açıklama zorunludur.");
      valid = false;
    } else if (trimmedDescription.length > 1000) {
      setDescriptionError("Açıklama en fazla 1000 karakter olabilir.");
      valid = false;
    }

    if (!valid) return;

    setBusy(true);
    setError(undefined);

    try {
      if (record) {
        await serviceRecordApi.update(record.publicId, {
          serviceDate,
          description: trimmedDescription,
        });
      } else {
        await serviceRecordApi.create({
          serviceDate,
          description: trimmedDescription,
          productId,
        });
      }

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
      aria-labelledby="service-form-title"
    >
      <form onSubmit={submit}>
        <DialogTitle id="service-form-title">
          {record ? "Servis kaydını düzenle" : "Yeni servis kaydı"}
        </DialogTitle>

        <DialogContent>
          {error !== undefined && <ErrorNotice error={error} />}

          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Servis tarihi"
              type="date"
              required
              value={serviceDate}
              onChange={(e) => {
                setServiceDate(e.target.value);
                setDateError("");
              }}
              error={!!dateError}
              helperText={dateError}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { max: today },
              }}
            />

            <TextField
              label="Açıklama"
              required
              multiline
              minRows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionError("");
              }}
              error={!!descriptionError}
              helperText={descriptionError || `${description.length}/1000`}
              slotProps={{
                htmlInput: { maxLength: 1000 },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={busy}>
            Vazgeç
          </Button>

          <Button variant="contained" type="submit" disabled={busy}>
            {busy ? "Kaydediliyor…" : record ? "Güncelle" : "Kaydet"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
