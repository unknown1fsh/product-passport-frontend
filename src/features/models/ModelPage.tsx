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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../auth/AuthProvider";
import { usePageQuery } from "../../shared/hooks/usePageQuery";
import { useResource } from "../../shared/hooks/useResource";
import type { PageResponse } from "../../shared/types";
import { PageControls } from "../../shared/ui/PageControls";
import { Loading, ErrorNotice } from "../../shared/ui/Feedback";
import { api } from "../../shared/api/client";
import { ApiError } from "../../shared/api/http";
import type { Model } from "./api";
import { ModelSelect } from "./ModelSelect";

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "";
}

function getErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }
  return undefined;
}

export function ModelPage() {
  const { user } = useAuth();
  
  const canWrite = user?.role === "ADMIN" || user?.role === "MANUFACTURER";
  const canDelete = user?.role === "ADMIN";

  const paging = usePageQuery("name", ["name", "code", "createdAt"]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [brandInput, setBrandInput] = useState(searchParams.get("brandPublicId") || "");

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

  const [testModelId, setTestModelId] = useState("");
  
  const [refreshKey, setRefreshKey] = useState(0);

  // ÇÖZÜM BURADA: Artık URL'deki tüm arama/filtreleme parametrelerini backend'e gönderiyoruz
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
        await api(`/product-models/${editModelId}`, {
          method: "PUT",
          body: JSON.stringify({
            code: formCode,
            name: formName,
            description: formDesc,
            brandPublicId: formBrandId,
            active: formActive,
          }),
        });
      } else {
        await api("/product-models", {
          method: "POST",
          body: JSON.stringify({
            code: formCode,
            name: formName,
            description: formDesc,
            brandPublicId: formBrandId,
          }),
        });
      }
      setOpenModal(false);
      reload(); 
      setRefreshKey(prev => prev + 1); 
    } catch (err: unknown) {
      setFormError(getErrorMessage(err) || "İşlem başarısız oldu.");
    }
  }

  async function handleConfirmDelete() {
    if (!modelToDelete) return;
    setDeleteError("");
    
    try {
      await api(`/product-models/${modelToDelete.publicId}`, {
        method: "DELETE",
      });
      setDeleteModalOpen(false);
      
      if (testModelId === modelToDelete.publicId) {
        setTestModelId("");
      }
      
      setModelToDelete(null);
      reload(); 
      setRefreshKey(prev => prev + 1); 
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      if ((err instanceof ApiError && err.status === 409) || getErrorStatus(err) === 409 || message.includes("409")) {
        setDeleteError("Bu modele bağlı pasaport bulunduğu için silinemez (409 Conflict). Önce ilgili pasaportları silmelisiniz.");
      } else {
        setDeleteError(message || "Silme işlemi sırasında bir hata oluştu.");
      }
    }
  }

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="overline" color="primary">KATALOG</Typography>
          <Typography component="h1" variant="h4">Modeller</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Ürün modellerinizi listeleyin ve markalara göre filtreleyin.</Typography>
        </Box>
        {canWrite && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Yeni Model
          </Button>
        )}
      </Box>

      <Paper component="form" onSubmit={handleFilterSubmit} variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          label="Model Adı/Kodu Ara"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ minWidth: 200, flex: 1 }}
        />
        <TextField
          size="small"
          label="Marka ID (brandPublicId)"
          value={brandInput}
          onChange={(e) => setBrandInput(e.target.value)}
          sx={{ minWidth: 200, flex: 1 }}
          helperText="Marka UUID'si girin"
        />
        <Button type="submit" variant="outlined" sx={{ height: 40 }}>Filtrele</Button>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, border: '2px dashed #1976d2', bgcolor: '#f8faff' }}>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
          ECR-04: ModelSelect Kullanım Örneği
        </Typography>
        <Box sx={{ maxWidth: 400 }}>
          <ModelSelect
            key={refreshKey} 
            value={testModelId}
            onChange={(uuid: string) => setTestModelId(uuid)}
          />
        </Box>
        <Typography variant="body2" sx={{ mt: 2, fontFamily: "monospace", color: "text.secondary" }}>
          Seçilen Model UUID'si: <strong>{testModelId || "Henüz seçim yapılmadı"}</strong>
        </Typography>
      </Paper>

      {loading ? <Loading /> : error ? <ErrorNotice error={error} retry={reload} /> : (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <TableContainer>
            <Table aria-label="Modeller">
              <TableHead>
                <TableRow>
                  <TableCell>Kod</TableCell>
                  <TableCell>Model Adı</TableCell>
                  <TableCell>Marka</TableCell>
                  <TableCell>Durum</TableCell>
                  {(canWrite || canDelete) && <TableCell align="right">İşlemler</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.content.map((model) => (
                  <TableRow key={model.publicId} hover>
                    <TableCell sx={{ fontFamily: "monospace" }}>{model.code}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{model.name}</TableCell>
                    <TableCell>{model.brandName || "Bilinmiyor"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={model.active ? "Aktif" : "Pasif"}
                        color={model.active ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    {(canWrite || canDelete) && (
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                          {canWrite && (
                            <Button size="small" onClick={() => handleOpenEdit(model)}>Düzenle</Button>
                          )}
                          {canDelete && (
                            <Button size="small" color="error" onClick={() => handleOpenDelete(model)}>Sil</Button>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {!data?.content.length && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 6, textAlign: "center" }}>
                      Bu kriterlere uygun model bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ px: 2 }}>
            <PageControls
              paging={paging}
              total={data?.totalElements || 0}
              sorts={[
                { value: "name", label: "Model adı" },
                { value: "code", label: "Kod" },
                { value: "createdAt", label: "Oluşturulma" },
              ]}
            />
          </Box>
        </Paper>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitModel}>
          <DialogTitle>{isEditMode ? "Modeli Düzenle" : "Yeni Model Ekle"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {formError && <Typography color="error" variant="body2">{formError}</Typography>}
              
              <TextField
                label="Model Kodu"
                required
                fullWidth
                size="small"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
              />
              <TextField
                label="Model Adı"
                required
                fullWidth
                size="small"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <TextField
                label="Açıklama"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
              <TextField
                label="Marka UUID (brandPublicId)"
                required
                fullWidth
                size="small"
                value={formBrandId}
                onChange={(e) => setFormBrandId(e.target.value)}
              />
              {isEditMode && (
                <FormControlLabel
                  control={<Switch checked={formActive} onChange={(e) => setFormActive(e.target.checked)} color="primary" />}
                  label="Aktif"
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)}>İptal</Button>
            <Button type="submit" variant="contained">
              {isEditMode ? "Güncelle" : "Kaydet"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Modeli Sil</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {deleteError && (
              <Box sx={{ p: 2, bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.light', borderRadius: 1 }}>
                <Typography color="error" variant="body2" sx={{ fontWeight: 500 }}>
                  {deleteError}
                </Typography>
              </Box>
            )}
            <DialogContentText>
              <strong>{modelToDelete?.name}</strong> kodlu modeli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogContentText>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteModalOpen(false)}>Vazgeç</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Silmeyi onayla
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
