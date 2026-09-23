import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import { useAuth } from "../auth/AuthProvider";
import { usePageQuery } from "../../shared/hooks/usePageQuery";
import { useResource } from "../../shared/hooks/useResource";
import type { PageResponse } from "../../shared/types";
import { PageControls } from "../../shared/ui/PageControls";
import { Loading, ErrorNotice } from "../../shared/ui/Feedback";
import { api } from "../../shared/api/client";
import { ApiError } from "../../shared/api/http";
import type { Model } from "./api";

// --- YARDIMCI FONKSİYONLAR ---
function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "";
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error && typeof error.status === "number") {
    return error.status;
  }
  return undefined;
}

// --- MODEL SEÇİM BİLEŞENİ ---
interface ModelSelectProps {
  value: string;
  onChange: (uuid: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  initialName?: string; 
}

export function ModelSelect({
  value,
  onChange,
  label = "Ürün Modeli Seçiniz",
  error = false,
  helperText = "",
  disabled = false,
  initialName, 
}: ModelSelectProps) {
  const { data, loading, error: apiError } = useResource<PageResponse<Model>>(
    "/product-models?page=0&size=100"
  );

  const models = data?.content || [];
  const hasError = error || !!apiError;
  const errorMessage = (apiError as any)?.message || "";
  const displayHelperText = errorMessage || helperText || (loading ? "Modeller yükleniyor..." : "");

  const isSelectedMissing = value && initialName && !models.some(m => m.publicId === value);
  const displayModels = isSelectedMissing
    ? [{ publicId: value, name: initialName, code: "Kayıtlı" } as Model, ...models]
    : models;

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading}
      error={hasError}
      helperText={displayHelperText}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
          bgcolor: "#FFFFFF",
          "&:hover fieldset": { borderColor: "#1D4ED8" },
          "&.Mui-focused fieldset": { borderColor: "#0F172A", borderWidth: "2px" },
        }
      }}
      slotProps={{
        select: {
          IconComponent: loading ? () => <CircularProgress size={20} sx={{ mr: 1.5, color: 'text.secondary' }} /> : undefined,
        }
      }}
    >
      <MenuItem value="">
        <em>Hiçbiri (Boş bırak)</em>
      </MenuItem>
      {displayModels.map((model) => (
        <MenuItem key={model.publicId} value={model.publicId} sx={{ borderRadius: "8px", mx: 1, my: 0.5 }}>
          {model.name} <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>({model.code})</Typography>
        </MenuItem>
      ))}
      {!loading && displayModels.length === 0 && (
        <MenuItem disabled value="">
          Sistemde kayıtlı model bulunamadı.
        </MenuItem>
      )}
    </TextField>
  );
}

// --- ANA BİLEŞEN ---
export function ModelPage() {
  const { user } = useAuth();
  
  const canWrite = user?.role === "ADMIN" || user?.role === "MANUFACTURER";
  const canDelete = user?.role === "ADMIN";

  const paging = usePageQuery("name", ["name", "code", "createdAt"]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [brandInput, setBrandInput] = useState(searchParams.get("brandPublicId") || "");

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editModelId, setEditModelId] = useState<string | null>(null);

  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const { data, error, loading, reload } = useResource<PageResponse<Model>>(
    "/product-models?" + searchParams.toString()
  );

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", "0");
    if (searchInput.trim()) nextParams.set("search", searchInput.trim());
    else nextParams.delete("search");
    if (brandInput.trim()) nextParams.set("brandPublicId", brandInput.trim());
    else nextParams.delete("brandPublicId");
    setSearchParams(nextParams);
  }

  function handleOpenCreate() {
    setIsEditMode(false);
    setEditModelId(null);
    setFormCode("");
    setFormName("");
    setFormDesc("");
    setFormBrandId("");
    setFormActive(true);
    setFormError("");
    setOpenModal(true);
  }

  function handleOpenEdit(model: Model) {
    setIsEditMode(true);
    setEditModelId(model.publicId);
    setFormCode(model.code);
    setFormName(model.name);
    setFormDesc(model.description || "");
    setFormBrandId(model.brandPublicId || "");
    setFormActive(model.active !== false);
    setFormError("");
    setOpenModal(true);
  }

  function handleOpenDelete(model: Model) {
    setModelToDelete(model);
    setDeleteError("");
    setDeleteModalOpen(true);
  }

  async function handleSubmitModel(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    try {
      if (isEditMode && editModelId) {
        await api(`/product-models/${editModelId}`, { method: "PUT", body: JSON.stringify({ code: formCode, name: formName, description: formDesc, brandPublicId: formBrandId, active: formActive }) });
      } else {
        await api("/product-models", { method: "POST", body: JSON.stringify({ code: formCode, name: formName, description: formDesc, brandPublicId: formBrandId }) });
      }
      setOpenModal(false);
      reload(); 
    } catch (err: unknown) {
      setFormError(getErrorMessage(err) || "İşlem başarısız oldu.");
    }
  }

  async function handleConfirmDelete() {
    if (!modelToDelete) return;
    setDeleteError("");
    try {
      await api(`/product-models/${modelToDelete.publicId}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setModelToDelete(null);
      reload(); 
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      if ((err instanceof ApiError && err.status === 409) || getErrorStatus(err) === 409 || message.includes("409")) {
        setDeleteError("Bu modele bağlı pasaport bulunduğu için silinemez. Önce ilgili pasaportları silmelisiniz.");
      } else {
        setDeleteError(message || "Silme işlemi sırasında bir hata oluştu.");
      }
    }
  }

  return (
    <Stack spacing={3}>
      {/* 1. HERO BANNER: Anasayfa ile Birebir Aynı Asil Mavi-Gri Geçiş */}
      <Box sx={{ p: { xs: 3, md: 4 }, borderRadius: "16px", background: "linear-gradient(135deg, #0F172A 0%, #1D4ED8 50%, #475569 100%)", boxShadow: "0 14px 36px rgba(15, 23, 42, 0.25)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 3, color: "#FFFFFF" }}>
        <Box>
          <Chip label="Katalog" size="small" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#93C5FD", fontWeight: 700, mb: 1.5, borderRadius: "6px" }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px" }}>Model Yönetimi</Typography>
          <Typography sx={{ color: "#CBD5E1", mt: 0.5, fontSize: "1rem", fontWeight: 400 }}>Sistemdeki tüm ürün modellerini buradan ekleyip düzenleyebilirsiniz.</Typography>
        </Box>
        {canWrite && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ bgcolor: "#FFFFFF", color: "#0F172A", borderRadius: "10px", px: 3, py: 1.2, textTransform: "none", fontWeight: 700, boxShadow: "0 4px 14px rgba(0,0,0,0.1)", "&:hover": { bgcolor: "#F1F5F9", transform: "translateY(-2px)" }, transition: "all 0.2s" }}>
            Yeni Model
          </Button>
        )}
      </Box>

      {/* 2. FİLTRELEME ALANI: Kurumsal ve Sade */}
      <Paper component="form" onSubmit={handleFilterSubmit} elevation={0} sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', borderRadius: "16px", bgcolor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
        <TextField size="small" placeholder="Model Adı veya Kodu" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} sx={{ width: { xs: "100%", md: "280px" }, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#F8FAFC" } }} slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} /> } }} />
        <TextField size="small" placeholder="Marka ID (brandPublicId)" value={brandInput} onChange={(e) => setBrandInput(e.target.value)} sx={{ width: { xs: "100%", md: "280px" }, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#F8FAFC" } }} />
        <Button type="submit" variant="contained" startIcon={<FilterListIcon />} sx={{ height: 40, borderRadius: "10px", bgcolor: "#0F172A", color: "#FFFFFF", boxShadow: "none", fontWeight: 600, px: 3, textTransform: "none", "&:hover": { bgcolor: "#1E293B" } }}>Filtrele</Button>
      </Paper>

      {/* 3. ANA İÇERİK PANELİ */}
      <Paper elevation={0} sx={{ overflow: "hidden", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", bgcolor: "#FFFFFF", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}>
        
        {/* PANEL ÜST KONTROLLERİ */}
        <Box sx={{ px: 3, py: 2, background: "linear-gradient(90deg, #F1F5F9 0%, #FFFFFF 100%)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>Kayıtlı Modeller</Typography>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Box>
              <PageControls paging={paging} total={data?.totalElements || 0} sorts={[ { value: "name", label: "Model adı" }, { value: "code", label: "Kod" }, { value: "createdAt", label: "Oluşturulma" } ]} />
            </Box>

            <ToggleButtonGroup value={viewMode} exclusive onChange={(_, newMode) => { if (newMode) setViewMode(newMode); }} size="small" sx={{ bgcolor: "#FFFFFF", p: 0.5, borderRadius: "10px", border: "1px solid rgba(0,0,0,0.08)", "& .MuiToggleButton-root": { border: "none", borderRadius: "8px !important", color: "#64748B", p: 0.8 }, "& .Mui-selected": { bgcolor: "#0F172A !important", color: "#FFFFFF !important", boxShadow: "0 2px 8px rgba(15,23,42,0.2)" } }}>
              <ToggleButton value="list"><TableRowsOutlinedIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="grid"><GridViewOutlinedIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* PANEL İÇERİĞİ */}
        <Box sx={{ flex: 1, bgcolor: viewMode === "grid" ? "#F8FAFC" : "#FFFFFF" }}>
          {loading ? <Box sx={{ p: 4 }}><Loading /></Box> : error ? <Box sx={{ p: 4 }}><ErrorNotice error={error} retry={reload} /></Box> : viewMode === "list" ? (
            /* TABLO GÖRÜNÜMÜ */
            <TableContainer sx={{ bgcolor: "#FFFFFF" }}>
              <Table aria-label="Modeller" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Kod</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Model Adı</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Marka</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Durum</TableCell>
                    {(canWrite || canDelete) && <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>İşlemler</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.content.map((model) => (
                    <TableRow key={model.publicId} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                      <TableCell sx={{ fontFamily: "monospace", color: "#64748B" }}>{model.code}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>{model.name}</TableCell>
                      <TableCell sx={{ color: "#64748B", fontWeight: 500 }}>{model.brandName || "Bilinmiyor"}</TableCell>
                      <TableCell><Chip size="small" label={model.active ? "Aktif" : "Pasif"} sx={{ bgcolor: model.active ? "#E6F4EA" : "#FEECEB", color: model.active ? "#1E8E3E" : "#D93025", fontWeight: 700, borderRadius: "6px" }} /></TableCell>
                      {(canWrite || canDelete) && (
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                            {canWrite && <Tooltip title="Düzenle"><IconButton size="small" onClick={() => handleOpenEdit(model)} sx={{ color: "#1D4ED8", bgcolor: "#F1F5F9", "&:hover": { bgcolor: "#E2E8F0" } }}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>}
                            {canDelete && <Tooltip title="Sil"><IconButton size="small" onClick={() => handleOpenDelete(model)} sx={{ color: "#DC2626", bgcolor: "#FEECEB", "&:hover": { bgcolor: "#FCD3D3" } }}><DeleteOutlineOutlinedIcon fontSize="small" /></IconButton></Tooltip>}
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {!data?.content.length && (
                    <TableRow><TableCell colSpan={5} sx={{ py: 8, textAlign: "center", color: "#64748B" }}><SearchIcon sx={{ fontSize: 48, color: "#CBD5E1", mb: 2 }} /><Typography variant="h6" sx={{ color: "#0F172A" }}>Sonuç Bulunamadı</Typography></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            /* KUTU (GRID) GÖRÜNÜMÜ */
            <Box sx={{ p: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
              {data?.content.map((model) => (
                <Card key={model.publicId} elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.06)", borderRadius: "16px", display: "flex", flexDirection: "column", bgcolor: "#FFFFFF", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", transition: "all 0.2s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 30px rgba(15,23,42,0.08)", borderColor: "#0F172A" } }}>
                  <Box sx={{ p: 3, flex: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
                      <Typography sx={{ fontFamily: "monospace", color: "#0F172A", bgcolor: "#F8FAFC", px: 1.5, py: 0.5, borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, border: "1px solid rgba(0,0,0,0.04)" }}>{model.code}</Typography>
                      <Chip size="small" label={model.active ? "Aktif" : "Pasif"} sx={{ bgcolor: model.active ? "#E6F4EA" : "#FEECEB", color: model.active ? "#1E8E3E" : "#D93025", fontWeight: 700, borderRadius: "6px", height: "24px" }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", mb: 1, fontSize: "1.1rem", lineHeight: 1.3 }}>{model.name}</Typography>
                    <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>{model.brandName || "Bilinmeyen Marka"}</Typography>
                  </Box>
                  <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid rgba(0,0,0,0.04)", display: "flex", justifyContent: "flex-end", gap: 1, bgcolor: "#F8FAFC" }}>
                    {canWrite && <Button size="small" onClick={() => handleOpenEdit(model)} sx={{ color: "#1D4ED8", fontWeight: 600, textTransform: "none" }}>Düzenle</Button>}
                    {canDelete && <Button size="small" onClick={() => handleOpenDelete(model)} sx={{ color: "#DC2626", fontWeight: 600, textTransform: "none" }}>Sil</Button>}
                  </Box>
                </Card>
              ))}
              {!data?.content.length && (
                <Box sx={{ gridColumn: "1 / -1", py: 8, textAlign: "center", color: "#64748B" }}>
                  <SearchIcon sx={{ fontSize: 48, color: "#CBD5E1", mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "#0F172A" }}>Sonuç Bulunamadı</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* DÜZENLEME MODALI */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "20px" } }}>
        <form onSubmit={handleSubmitModel}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1, color: "#0F172A" }}>{isEditMode ? "Modeli Düzenle" : "Yeni Model Ekle"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {formError && <Box sx={{ p: 2, bgcolor: '#FEECEB', borderRadius: 2 }}><Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>{formError}</Typography></Box>}
              <TextField label="Model Kodu" required fullWidth size="small" value={formCode} onChange={(e) => setFormCode(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
              <TextField label="Model Adı" required fullWidth size="small" value={formName} onChange={(e) => setFormName(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
              <TextField label="Açıklama" fullWidth multiline rows={3} size="small" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
              <TextField label="Marka UUID (brandPublicId)" required fullWidth size="small" value={formBrandId} onChange={(e) => setFormBrandId(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
              {isEditMode && <FormControlLabel control={<Switch checked={formActive} onChange={(e) => setFormActive(e.target.checked)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#0F172A" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#0F172A" } }} />} label={<Typography sx={{ fontWeight: 600 }}>Model Aktif</Typography>} sx={{ ml: 0 }} />}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ color: "#64748B", fontWeight: 600, textTransform: "none" }}>İptal</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: "#0F172A", fontWeight: 600, borderRadius: "10px", px: 4, textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: "#1E293B" } }}>
              {isEditMode ? "Kaydet" : "Oluştur"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
<Dialog 
        open={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        maxWidth="xs" 
        fullWidth 
        sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}
      >
        <DialogTitle sx={{ color: '#0F172A', fontWeight: 700, pb: 1 }}>
          Modeli Sil
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {deleteError && (
              <Box sx={{ p: 2, bgcolor: '#FEECEB', borderRadius: 2 }}>
                <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>{deleteError}</Typography>
              </Box>
            )}
            <DialogContentText sx={{ color: "#475569", fontSize: "0.95rem" }}>
              <strong>{modelToDelete?.name}</strong> kodlu modeli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogContentText>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button 
            onClick={() => setDeleteModalOpen(false)} 
            sx={{ color: "#0F172A", fontWeight: 600, textTransform: "none", "&:hover": { bgcolor: "rgba(15, 23, 42, 0.04)" } }}
          >
            Vazgeç
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            sx={{ 
              bgcolor: "#DC2626", 
              fontWeight: 600, 
              borderRadius: "10px", 
              px: 3, 
              py: 1,
              textTransform: "none", 
              boxShadow: "none", 
              "&:hover": { bgcolor: "#B91C1C" } 
            }}
          >
            Silmeyi onayla
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}