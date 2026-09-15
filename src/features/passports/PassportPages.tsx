import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { passportApi } from "./api";
import ArrowBack from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import {useAuth} from "../auth/AuthProvider";
import {PassportForm} from "./PassportForm";
import type {PageResponse, Passport} from "../../shared/types";
import {usePageQuery} from "../../shared/hooks/usePageQuery";
import {useResource} from "../../shared/hooks/useResource";
import {PageControls} from "../../shared/ui/PageControls";
import {ErrorNotice, Loading} from "../../shared/ui/Feedback";
import {MessagePage} from "../../app/Layout";
import {useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";

export function PassportList() {
    const paging = usePageQuery("serialNumber", [
        "serialNumber",
        "purchaseDate",
        "createdAt",
    ]);
    const {data, error, loading, reload} = useResource<PageResponse<Passport>>(
        "/product-passports?" + paging.query,
    );
    const canManage = ["ADMIN", "MANUFACTURER"].includes(useAuth().user?.role ?? "");
    const [editor, setEditor] = useState<Passport | null | undefined>();
    const [notice, setNotice] = useState("");
    const admin = useAuth().user?.role === "ADMIN";
    const [removing, setRemoving] = useState<Passport>();
    const [busy, setBusy] = useState(false);
    const [deleteError, setDeleteError] = useState<unknown>();
    async function remove() {
        if (!removing) return;
        setBusy(true);
        setDeleteError(undefined);
        try {
            await passportApi.remove(removing.publicId);
            setRemoving(undefined);
            setNotice("Pasaport silindi.");
            if (data?.content.length === 1 && paging.page > 0)
                paging.update({ page: paging.page - 1 });
            else reload();
        } catch (e) {
            setDeleteError(e);
        } finally {
            setBusy(false);
        }
    }
    return (
        <Stack spacing={3}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <Box>
                    <Typography variant="overline" color="primary">
                        ÜRÜN KAYITLARI
                    </Typography>
                    <Typography component="h1" variant="h4">
                        Ürün pasaportları
                    </Typography>
                    <Typography color="text.secondary" sx={{mt: 1}}>
                        Ürün bilgilerini ve satın alma kayıtlarını inceleyin.
                    </Typography>
                </Box>
                {canManage && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={() => setEditor(null)}
                    >
                        Yeni pasaport
                    </Button>
                )}
            </Box>
            {notice && (
                <Alert onClose={() => setNotice("")} severity="success">
                    {notice}
                </Alert>
            )}
            {loading ? (
                <Loading/>
            ) : error ? (
                <ErrorNotice error={error} retry={reload}/>
            ) : (
                <Paper variant="outlined">
                    <TableContainer>
                        <Table aria-label="Ürün pasaportları">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Seri numarası</TableCell>
                                    <TableCell>Model</TableCell>
                                    <TableCell>Kategori</TableCell>
                                    <TableCell>Satın alma</TableCell>
                                    <TableCell>Durum</TableCell>
                                    <TableCell>İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.content.map((p) => (
                                    <TableRow key={p.publicId} hover>
                                        <TableCell
                                            sx={{fontFamily: "monospace", fontWeight: 600}}
                                        >
                                            {p.serialNumber}
                                        </TableCell>
                                        <TableCell>{p.productModelName}</TableCell>
                                        <TableCell>{p.categoryName}</TableCell>
                                        <TableCell sx={{whiteSpace: "nowrap"}}>
                                            {p.purchaseDate}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                color={p.active ? "success" : "default"}
                                                label={p.active ? "Aktif" : "Pasif"}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    component={Link}
                                                    to={"/pasaportlar/" + p.publicId}
                                                    aria-label={p.serialNumber + " detay"}
                                                >
                                                    İncele
                                                </Button>
                                                {canManage && (
                                                    <Button
                                                        onClick={() => setEditor(p)}
                                                        aria-label={p.serialNumber + " düzenle"}
                                                    >
                                                        Düzenle
                                                    </Button>
                                                )}

                                            {admin && (
                                                <Button
                                                    color="error"
                                                    onClick={() => setRemoving(p)}
                                                    aria-label={p.serialNumber + " sil"}
                                                >
                                                    Sil
                                                </Button>
                                            )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!data?.content.length && (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{textAlign: "center", py: 6}}>
                                            Bu sayfada pasaport bulunamadı.
                                            {paging.page > 0 && (
                                                <Button onClick={() => paging.update({page: 0})}>
                                                    İlk sayfaya dön
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{px: 2}}>
                        <PageControls
                            paging={paging}
                            total={data?.totalElements || 0}
                            sorts={[
                                {value: "serialNumber", label: "Seri numarası"},
                                {value: "purchaseDate", label: "Satın alma"},
                                {value: "createdAt", label: "Oluşturulma"},
                            ]}
                        />
                    </Box>
                </Paper>
            )}
            {editor !== undefined && (
                <PassportForm
                    passport={editor || undefined}
                    onClose={() => setEditor(undefined)}
                    onSaved={() => {
                        setEditor(undefined);
                        setNotice("Pasaport kaydedildi.");
                        reload();
                    }}
                />
            )}
            <Dialog
                open={removing !== undefined}
                onClose={() => {
                    if (!busy) setRemoving(undefined);
                }}
                aria-labelledby="passport-list-delete-title"
            >
                <DialogTitle id="passport-list-delete-title">Pasaportu sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {removing?.serialNumber} numaralı pasaport silinecek. Bu işlem geri
                        alınamaz.
                    </DialogContentText>
                    {deleteError !== undefined && (
                        <Box sx={{ mt: 2 }}>
                            <ErrorNotice error={deleteError} />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setRemoving(undefined)} disabled={busy}>
                        Vazgeç
                    </Button>
                    <Button onClick={remove} color="error" variant="contained" disabled={busy}>
                        {busy ? "Siliniyor…" : "Sil"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}

export function PassportDetail() {
    const {id} = useParams();
    if (
        !id ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    )
        return (
            <MessagePage
                title="Geçersiz pasaport adresi"
                description="Listeden bir ürün pasaportu seçin."
            />
        );
    return <Detail id={id}/>;
}

function Detail({id}: { id: string }) {
    const {data, error, loading, reload} = useResource<Passport>(
        "/product-passports/" + id,
    );
    const admin = useAuth().user?.role === "ADMIN";
    const canManage = ["ADMIN", "MANUFACTURER"].includes(useAuth().user?.role ?? "");
    const [editor, setEditor] = useState<Passport | null | undefined>();
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [deleteError, setDeleteError] = useState<unknown>();
    const navigate = useNavigate();
    async function remove() {
        setBusy(true);
        setDeleteError(undefined);
        try {
            await passportApi.remove(id);
            navigate("/pasaportlar");
        } catch (e) {
            setDeleteError(e);
            setBusy(false);
        }
    }
    return (
        <Stack spacing={3}>
            <Button
                component={Link}
                to="/pasaportlar"
                startIcon={<ArrowBack/>}
                sx={{alignSelf: "flex-start"}}
            >
                Pasaportlara dön
            </Button>
            {loading ? (
                <Loading/>
            ) : error ? (
                <ErrorNotice error={error} retry={reload}/>
            ) : (
                data && (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 2,
                                flexWrap: "wrap",
                            }}
                        >
                            <Box>
                                <Typography variant="overline" color="primary">
                                    ÜRÜN PASAPORTU
                                </Typography>
                                <Typography component="h1" variant="h4">
                                    {data.serialNumber}
                                </Typography>
                                <Typography color="text.secondary" sx={{ mt: 1 }}>
                                    {data.productModelName} · {data.categoryName}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                                {canManage && (
                                    <Button variant="outlined" onClick={() => setEditor(data)}>
                                        Düzenle
                                    </Button>
                                )}
                                {admin && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => setConfirming(true)}
                                    >
                                        Sil
                                    </Button>
                                )}
                            </Stack>
                        </Box>
                        <Paper variant="outlined" sx={{p: {xs: 3, md: 4}}}>
                            <Typography variant="h6" sx={{mb: 3}}>
                                Ürün bilgileri
                            </Typography>
                            <Box
                                component="dl"
                                sx={{
                                    m: 0,
                                    display: "grid",
                                    gridTemplateColumns: {xs: "1fr", sm: "1fr 1fr"},
                                    gap: 3,
                                }}
                            >
                                {[
                                    ["Seri numarası", data.serialNumber],
                                    ["Model", data.productModelName],
                                    ["Kategori", data.categoryName],
                                    ["Satın alma tarihi", data.purchaseDate],
                                    ["Fatura numarası", data.invoiceNumber || "Belirtilmedi"],
                                    ["Durum", data.active ? "Aktif" : "Pasif"],
                                    ["Açıklama", data.description || "Açıklama eklenmemiş"],
                                ].map(([label, value]) => (
                                    <Box key={label}>
                                        <Typography
                                            component="dt"
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {label}
                                        </Typography>
                                        <Typography
                                            component="dd"
                                            sx={{
                                                m: 0,
                                                mt: 0.7,
                                                fontWeight: 550,
                                                overflowWrap: "anywhere",
                                            }}
                                        >
                                            {value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                        <Dialog
                            open={confirming}
                            onClose={() => {
                                if (!busy) setConfirming(false);
                            }}
                            aria-labelledby="passport-delete-title"
                        >
                            <DialogTitle id="passport-delete-title">Pasaportu sil</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    {data.serialNumber} numaralı pasaport silinecek. Bu işlem geri
                                    alınamaz.
                                </DialogContentText>
                                {deleteError !== undefined && (
                                    <Box sx={{ mt: 2 }}>
                                        <ErrorNotice error={deleteError} />
                                    </Box>
                                )}
                            </DialogContent>
                            <DialogActions sx={{ p: 3 }}>
                                <Button onClick={() => setConfirming(false)} disabled={busy}>
                                    Vazgeç
                                </Button>
                                <Button
                                    onClick={remove}
                                    color="error"
                                    variant="contained"
                                    disabled={busy}
                                >
                                    {busy ? "Siliniyor…" : "Sil"}
                                </Button>
                            </DialogActions>
                        </Dialog>
                        {editor !== undefined && (
                            <PassportForm
                                passport={editor || undefined}
                                onClose={() => setEditor(undefined)}
                                onSaved={() => {
                                    setEditor(undefined);
                                    reload();
                                }}
                            />
                        )}
                    </>
                )
            )}
        </Stack>
    );
}
