import { useState } from "react";
import type { FormEvent } from "react";
import { passportApi } from "./api";
import type { Passport } from "../../shared/types";
import { CategorySelect } from "../categories/CategorySelect";
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
import { ModelSelect } from "../models/ModelSelect";

export function PassportForm({
    passport,
    onClose,
    onSaved,
}: {
    passport?: Passport;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [serialNumber, setSerialNumber] = useState(passport?.serialNumber || "");
    const [productModelId, setProductModelId] = useState(passport?.productModelId || "");
    const [categoryId, setCategoryId] = useState(passport?.categoryId || "");
    const [purchaseDate, setPurchaseDate] = useState(passport?.purchaseDate || "");
    const [invoiceNumber, setInvoiceNumber] = useState(passport?.invoiceNumber || "");
    const [description, setDescription] = useState(passport?.description || "");
    
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<unknown>();
    
    const today = new Date().toLocaleDateString("sv-SE");

    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (!serialNumber.trim() || !categoryId.trim() || !purchaseDate.trim() || !productModelId.trim()) {
            setError(new Error("Seri numarası, kategori, model ve satın alma tarihi boş bırakılamaz."));
            return;
        }
        
        setBusy(true);
        setError(undefined);
        
        try {
            if (passport)
                await passportApi.update(passport.publicId, {
                    serialNumber: serialNumber.trim(),
                    productModelId,
                    categoryId,
                    purchaseDate,
                    invoiceNumber: invoiceNumber.trim(),
                    description: description.trim(),
                });
            else
                await passportApi.create({
                    serialNumber: serialNumber.trim(),
                    productModelId,
                    categoryId,
                    purchaseDate,
                    invoiceNumber: invoiceNumber.trim(),
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
            aria-labelledby="passport-form-title"
            sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}
        >
            <form onSubmit={submit} noValidate>
                <DialogTitle id="passport-form-title" sx={{ fontWeight: 700, color: "#0F172A" }}>
                    {passport ? "Pasaportu düzenle" : "Yeni pasaport"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        {error !== undefined && <ErrorNotice error={error} />}
                        
                        <TextField
                            label="Seri numarası"
                            required
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value.replace(/[^A-Za-z0-9-]/g, ""))}
                            slotProps={{ htmlInput: { maxLength: 100 } }}
                            helperText="Yalnızca harf, rakam ve tire. En fazla 100 karakter."
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                        />
                        
                        <CategorySelect
                            value={categoryId || null}
                            onChange={(id) => setCategoryId(id ?? "")}
                            initialName={passport?.categoryName}
                        />
                        
                        <ModelSelect 
                            value={productModelId} 
                            onChange={setProductModelId}
                            initialName={passport?.productModelName}
                        />
                        
                        <TextField
                            label="Satın alma tarihi"
                            type="date"
                            required
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            size="small"
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { min: "2000-01-01", max: today },
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                        />
                        
                        <TextField
                            label="Fatura numarası"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            size="small"
                            slotProps={{ htmlInput: { maxLength: 100 } }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                        />
                        
                        <TextField
                            label="Açıklama"
                            multiline
                            minRows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            size="small"
                            slotProps={{ htmlInput: { maxLength: 500 } }}
                            helperText={description.length + "/500"}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
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
                        {busy ? "Kaydediliyor…" : "Kaydet"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}