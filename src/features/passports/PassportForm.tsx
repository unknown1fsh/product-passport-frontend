import {useState} from "react";
import type {FormEvent} from "react";
import {passportApi} from "./api";
import type {Passport} from "../../shared/types";
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
import {ModelSelect} from "../models/ModelSelect";
export function PassportForm({
                                 passport,
                                 onClose,
                                 onSaved,
                             }:{
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
            setError(new Error("Seri numarası, kategori ve satın alma tarihi boş bırakılamaz."));
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
        >
            <form onSubmit={submit}>
                <DialogTitle id="passport-form-title">
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
                        />
                        <CategorySelect
                            value={categoryId || null}
                            onChange={(id)=> setCategoryId(id ?? "")}
                            initialName={passport?.categoryName}
                        />
                        <ModelSelect value={productModelId} onChange={setProductModelId}/>
                        <TextField
                            label="Satın alma tarihi"
                            type="date"
                            required
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { min: "2000-01-01", max: today },
                            }}                        />
                        <TextField
                            label="Fatura numarası"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            slotProps={{ htmlInput: { maxLength: 100 } }}
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