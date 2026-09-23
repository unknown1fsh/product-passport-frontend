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
    Card,
    IconButton,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { passportApi } from "./api";
import ArrowBack from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import { useAuth } from "../auth/AuthProvider";
import { PassportForm } from "./PassportForm";
import WarrantyList from "../warranties/WarrantyList";
import type { PageResponse, Passport } from "../../shared/types";
import { usePageQuery } from "../../shared/hooks/usePageQuery";
import { useResource } from "../../shared/hooks/useResource";
import { PageControls } from "../../shared/ui/PageControls";
import { ErrorNotice, Loading } from "../../shared/ui/Feedback";
import { MessagePage } from "../../app/Layout";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ServiceSection } from "../serviceRecords/ServiceSection";

export function PassportList() {
    const paging = usePageQuery("serialNumber", [
        "serialNumber",
        "purchaseDate",
        "createdAt",
    ]);
    const { data, error, loading, reload } = useResource<PageResponse<Passport>>(
        "/product-passports?" + paging.query,
    );
    const canManage = ["ADMIN", "MANUFACTURER"].includes(useAuth().user?.role ?? "");
    const [editor, setEditor] = useState<Passport | null | undefined>();
    const [notice, setNotice] = useState("");
    const admin = useAuth().user?.role === "ADMIN";
    const [removing, setRemoving] = useState<Passport>();
    const [busy, setBusy] = useState(false);
    const [deleteError, setDeleteError] = useState<unknown>();

    // Modeller sayfasındaki gibi Liste / Kutu görünüm modu state'i
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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
            {/* 1. HERO BANNER: Asil Mavi Geçiş */}
            <Box
                sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #0F172A 0%, #1D4ED8 50%, #475569 100%)",
                    boxShadow: "0 14px 36px rgba(15, 23, 42, 0.25)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 3,
                    color: "#FFFFFF",
                }}
            >
                <Box>
                    <Chip
                        label="Ürün Kayıtları"
                        size="small"
                        sx={{
                            bgcolor: "rgba(255,255,255,0.15)",
                            color: "#93C5FD",
                            fontWeight: 700,
                            mb: 1.5,
                            borderRadius: "6px",
                        }}
                    />
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
                        Ürün pasaportları
                    </Typography>
                    <Typography sx={{ color: "#CBD5E1", mt: 0.5, fontSize: "1rem", fontWeight: 400 }}>
                        Ürün bilgilerini ve satın alma kayıtlarını inceleyin.
                    </Typography>
                </Box>
                {canManage && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setEditor(null)}
                        sx={{
                            bgcolor: "#FFFFFF",
                            color: "#0F172A",
                            borderRadius: "10px",
                            px: 3,
                            py: 1.2,
                            textTransform: "none",
                            fontWeight: 700,
                            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                            "&:hover": { bgcolor: "#F1F5F9", transform: "translateY(-2px)" },
                            transition: "all 0.2s",
                        }}
                    >
                        Yeni pasaport
                    </Button>
                )}
            </Box>

            {notice && (
                <Alert onClose={() => setNotice("")} severity="success" sx={{ borderRadius: "12px" }}>
                    {notice}
                </Alert>
            )}

            {/* 2. ANA İÇERİK PANELİ */}
            <Paper
                elevation={0}
                sx={{
                    overflow: "hidden",
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* PANEL ÜST KONTROLLERİ (Model Yönetimi ile birebir aynı simetrik üst şerit) */}
                <Box sx={{ px: 3, py: 2.5, bgcolor: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>Kayıtlı Pasaportlar</Typography>
                    
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                        <Box>
                            <PageControls
                                paging={paging}
                                total={data?.totalElements || 0}
                                sorts={[
                                    { value: "serialNumber", label: "Seri numarası" },
                                    { value: "purchaseDate", label: "Satın alma" },
                                    { value: "createdAt", label: "Oluşturulma" },
                                ]}
                            />
                        </Box>

                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(_, newMode) => { if (newMode) setViewMode(newMode); }}
                            size="small"
                            sx={{
                                bgcolor: "#F8FAFC",
                                p: 0.5,
                                borderRadius: "10px",
                                border: "1px solid rgba(0,0,0,0.08)",
                                "& .MuiToggleButton-root": { border: "none", borderRadius: "8px !important", color: "#64748B", p: 0.8 },
                                "& .Mui-selected": { bgcolor: "#0F172A !important", color: "#FFFFFF !important" }
                            }}
                        >
                            <ToggleButton value="list"><TableRowsOutlinedIcon fontSize="small" /></ToggleButton>
                            <ToggleButton value="grid"><GridViewOutlinedIcon fontSize="small" /></ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>

                {/* PANEL İÇERİĞİ (Liste veya Grid Görünümü) */}
                <Box sx={{ flex: 1, bgcolor: viewMode === "grid" ? "#F8FAFC" : "#FFFFFF" }}>
                    {loading ? (
                        <Box sx={{ p: 4 }}><Loading /></Box>
                    ) : error ? (
                        <Box sx={{ p: 4 }}><ErrorNotice error={error} retry={reload} /></Box>
                    ) : viewMode === "list" ? (
                        /* TABLO GÖRÜNÜMÜ */
                        <TableContainer sx={{ bgcolor: "#FFFFFF" }}>
                            <Table aria-label="Ürün pasaportları">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Seri numarası</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2, display: { xs: "none", sm: "table-cell" } }}>Model</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2, display: { xs: "none", lg: "table-cell" } }}>Kategori</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2, display: { xs: "none", sm: "table-cell" } }}>Satın alma</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2, display: { xs: "none", lg: "table-cell" } }}>Durum</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }} align="right">İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data?.content.map((p) => (
                                        <TableRow key={p.publicId} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                                            <TableCell sx={{ fontFamily: "monospace", fontWeight: 700, color: "#0F172A" }}>
                                                {p.serialNumber}
                                            </TableCell>
                                            <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, color: "#334155", fontWeight: 500 }}>{p.productModelName}</TableCell>
                                            <TableCell sx={{ display: { xs: "none", lg: "table-cell" }, color: "#64748B" }}>{p.categoryName}</TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap", display: { xs: "none", sm: "table-cell" }, color: "#64748B" }}>
                                                {p.purchaseDate}
                                            </TableCell>
                                            <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                                                <Chip
                                                    size="small"
                                                    label={p.active ? "Aktif" : "Pasif"}
                                                    sx={{
                                                        bgcolor: p.active ? "#E6F4EA" : "#FEECEB",
                                                        color: p.active ? "#1E8E3E" : "#D93025",
                                                        fontWeight: 700,
                                                        borderRadius: "6px",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                                                    <Button
                                                        component={Link}
                                                        to={"/pasaportlar/" + p.publicId}
                                                        size="small"
                                                        sx={{ color: "#1D4ED8", fontWeight: 600, textTransform: "none", bgcolor: "#F1F5F9", "&:hover": { bgcolor: "#E2E8F0" } }}
                                                    >
                                                        İncele
                                                    </Button>
                                                    {canManage && (
                                                        <Tooltip title="Düzenle">
                                                            <IconButton size="small" onClick={() => setEditor(p)} sx={{ color: "#1D4ED8", bgcolor: "#F1F5F9", "&:hover": { bgcolor: "#E2E8F0" } }}>
                                                                <EditOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {admin && (
                                                        <Tooltip title="Sil">
                                                            <IconButton size="small" onClick={() => setRemoving(p)} sx={{ color: "#DC2626", bgcolor: "#FEECEB", "&:hover": { bgcolor: "#FCD3D3" } }}>
                                                                <DeleteOutlineOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!data?.content.length && (
                                        <TableRow>
                                            <TableCell colSpan={6} sx={{ textAlign: "center", py: 8, color: "#64748B" }}>
                                                Bu sayfada pasaport bulunamadı.
                                                {paging.page > 0 && (
                                                    <Button onClick={() => paging.update({ page: 0 })} sx={{ ml: 2, textTransform: "none" }}>
                                                        İlk sayfaya dön
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        /* KUTU (GRID) GÖRÜNÜMÜ: Modeller ile birebir uyumlu şık kartlar */
                        <Box sx={{ p: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
                            {data?.content.map((p) => (
                                <Card
                                    key={p.publicId}
                                    elevation={0}
                                    sx={{
                                        border: "1px solid rgba(0,0,0,0.06)",
                                        borderRadius: "16px",
                                        display: "flex",
                                        flexDirection: "column",
                                        bgcolor: "#FFFFFF",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                        transition: "all 0.2s ease",
                                        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(15,23,42,0.06)", borderColor: "#0F172A" },
                                    }}
                                >
                                    <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
                                            <Typography sx={{ fontFamily: "monospace", color: "#0F172A", bgcolor: "#F8FAFC", px: 1.5, py: 0.5, borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, border: "1px solid rgba(0,0,0,0.04)" }}>
                                                {p.serialNumber}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                label={p.active ? "Aktif" : "Pasif"}
                                                sx={{
                                                    bgcolor: p.active ? "#E6F4EA" : "#FEECEB",
                                                    color: p.active ? "#1E8E3E" : "#D93025",
                                                    fontWeight: 700,
                                                    borderRadius: "6px",
                                                    height: "24px",
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", mb: 0.5, fontSize: "1.1rem" }}>
                                            {p.productModelName}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>
                                            {p.categoryName} · {p.purchaseDate}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#F8FAFC" }}>
                                        <Button
                                            component={Link}
                                            to={"/pasaportlar/" + p.publicId}
                                            size="small"
                                            sx={{ color: "#1D4ED8", fontWeight: 600, textTransform: "none" }}
                                        >
                                            İncele
                                        </Button>
                                        <Stack direction="row" spacing={1}>
                                            {canManage && (
                                                <Button size="small" onClick={() => setEditor(p)} sx={{ color: "#334155", fontWeight: 600, textTransform: "none" }}>
                                                    Düzenle
                                                </Button>
                                            )}
                                            {admin && (
                                                <Button size="small" onClick={() => setRemoving(p)} sx={{ color: "#DC2626", fontWeight: 600, textTransform: "none" }}>
                                                    Sil
                                                </Button>
                                            )}
                                        </Stack>
                                    </Box>
                                </Card>
                            ))}
                            {!data?.content.length && (
                                <Box sx={{ gridColumn: "1 / -1", py: 8, textAlign: "center", color: "#64748B" }}>
                                    <Typography variant="h6" sx={{ color: "#0F172A" }}>Pasaport Bulunamadı</Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Paper>

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
                sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>Pasaportu sil</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "#475569" }}>
                        <strong>{removing?.serialNumber}</strong> numaralı pasaport silinecek. Bu işlem geri alınamaz.
                    </DialogContentText>
                    {deleteError !== undefined && (
                        <Box sx={{ mt: 2 }}>
                            <ErrorNotice error={deleteError} />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setRemoving(undefined)} disabled={busy} sx={{ color: "#64748B", textTransform: "none" }}>
                        Vazgeç
                    </Button>
                    <Button onClick={remove} variant="contained" disabled={busy} sx={{ bgcolor: "#DC2626", textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: "#B91C1C" } }}>
                        {busy ? "Siliniyor…" : "Sil"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}

export function PassportDetail() {
    const { id } = useParams();
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
    return <Detail id={id} />;
}

function Detail({ id }: { id: string }) {
    const { data, error, loading, reload } = useResource<Passport>(
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
                startIcon={<ArrowBack />}
                sx={{ alignSelf: "flex-start", color: "#475569", fontWeight: 600, textTransform: "none" }}
            >
                Pasaportlara dön
            </Button>

            {loading ? (
                <Loading />
            ) : error ? (
                (error as any)?.status === 404 ? (
                    <MessagePage
                        title="Pasaport bulunamadı"
                        description="Aradığınız ürün pasaportu silinmiş veya hiç var olmamış olabilir."
                    />
                ) : (
                    <ErrorNotice error={error} retry={reload} />
                )
            ) : (
                data && (
                    <>
                        {/* 1. HERO BANNER: Detay Sayfası İçin */}
                        <Box
                            sx={{
                                p: { xs: 3, md: 4 },
                                borderRadius: "16px",
                                background: "linear-gradient(135deg, #0F172A 0%, #1D4ED8 50%, #475569 100%)",
                                boxShadow: "0 14px 36px rgba(15, 23, 42, 0.25)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 3,
                                color: "#FFFFFF",
                            }}
                        >
                            <Box>
                                <Chip
                                    label="ÜRÜN PASAPORTU"
                                    size="small"
                                    sx={{
                                        bgcolor: "rgba(255,255,255,0.15)",
                                        color: "#93C5FD",
                                        fontWeight: 700,
                                        mb: 1.5,
                                        borderRadius: "6px",
                                    }}
                                />
                                <Typography variant="h4" sx={{ fontWeight: 800, color: "#FFFFFF", overflowWrap: "anywhere" }}>
                                    {data.serialNumber}
                                </Typography>
                                <Typography sx={{ color: "#CBD5E1", mt: 0.5, fontSize: "1rem", fontWeight: 400 }}>
                                    {data.productModelName} · {data.categoryName}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1.5}>
                                {canManage && (
                                    <Button
                                        variant="contained"
                                        onClick={() => setEditor(data)}
                                        sx={{
                                            bgcolor: "#FFFFFF",
                                            color: "#0F172A",
                                            borderRadius: "10px",
                                            px: 3,
                                            py: 1,
                                            textTransform: "none",
                                            fontWeight: 700,
                                            boxShadow: "none",
                                            "&:hover": { bgcolor: "#F1F5F9" },
                                        }}
                                    >
                                        Düzenle
                                    </Button>
                                )}
                                {admin && (
                                    <Button
                                        variant="contained"
                                        onClick={() => setConfirming(true)}
                                        sx={{
                                            bgcolor: "rgba(239, 68, 68, 0.2)",
                                            color: "#F87171",
                                            borderRadius: "10px",
                                            px: 3,
                                            py: 1,
                                            textTransform: "none",
                                            fontWeight: 700,
                                            boxShadow: "none",
                                            "&:hover": { bgcolor: "rgba(239, 68, 68, 0.3)" },
                                        }}
                                    >
                                        Sil
                                    </Button>
                                )}
                            </Stack>
                        </Box>

                        {/* Detay Bilgi Kartı */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, md: 4 },
                                borderRadius: "16px",
                                bgcolor: "#FFFFFF",
                                border: "1px solid rgba(0,0,0,0.06)",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#0F172A" }}>
                                Ürün bilgileri
                            </Typography>
                            <Box
                                component="dl"
                                sx={{
                                    m: 0,
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
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
                                        <Typography component="dt" variant="body2" color="text.secondary">
                                            {label}
                                        </Typography>
                                        <Typography
                                            component="dd"
                                            sx={{
                                                m: 0,
                                                mt: 0.5,
                                                fontWeight: 600,
                                                color: "#0F172A",
                                                overflowWrap: "anywhere",
                                            }}
                                        >
                                            {value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>

                        <Box sx={{ mt: 3, mb: 3 }}>
                            <WarrantyList passportId={id} />
                        </Box>

                        <ServiceSection passportId={id} />

                        <Dialog
                            open={confirming}
                            onClose={() => {
                                if (!busy) setConfirming(false);
                            }}
                            sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}
                        >
                            <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>Pasaportu sil</DialogTitle>
                            <DialogContent>
                                <DialogContentText sx={{ color: "#475569" }}>
                                    <strong>{data.serialNumber}</strong> numaralı pasaport silinecek. Bu işlem geri alınamaz.
                                </DialogContentText>
                                {deleteError !== undefined && (
                                    <Box sx={{ mt: 2 }}>
                                        <ErrorNotice error={deleteError} />
                                    </Box>
                                )}
                            </DialogContent>
                            <DialogActions sx={{ p: 3 }}>
                                <Button onClick={() => setConfirming(false)} disabled={busy} sx={{ color: "#0F172A", textTransform: "none", bgcolor: "rgba(15, 23, 42, 0.04)" }}>
                                    Vazgeç
                                </Button>
                                <Button
                                    onClick={remove}
                                    variant="contained"
                                    disabled={busy}
                                    sx={{ bgcolor: "#DC2626", textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: "#B91C1C" } }}
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