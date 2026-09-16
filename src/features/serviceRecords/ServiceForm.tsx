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

type ServiceFormValues = {
  serviceDate: string;
  description: string;
};

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ServiceForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (values: ServiceFormValues) => void;
}) {
  const [serviceDate, setServiceDate] = useState("");
  const [description, setDescription] = useState("");
  const [dateError, setDateError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const today = getToday();

  function submit(e: FormEvent<HTMLFormElement>) {
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

    onSubmit({
      serviceDate,
      description: trimmedDescription,
    });
  }

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="service-form-title"
    >
      <form onSubmit={submit}>
        <DialogTitle id="service-form-title">Yeni servis kaydı</DialogTitle>

        <DialogContent>
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
          <Button onClick={onClose}>Vazgeç</Button>

          <Button variant="contained" type="submit">
            Kaydet
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
