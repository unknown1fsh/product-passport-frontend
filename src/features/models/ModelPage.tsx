import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
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
import type { Model } from "./api";
import { ModelSelect } from "./ModelSelect";

export function ModelPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "ADMIN" || user?.role === "MANUFACTURER";

  const paging = usePageQuery("name", ["name", "code", "createdAt"]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [brandInput, setBrandInput] = useState(searchParams.get("brandPublicId") || "");

  // Modal ve Form State'leri
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editModelId, setEditModelId] = useState<string | null>(null);

  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [formActive, setFormActive] = useState(true); // ECR-05: Aktiflik durumu
  const [formError, setFormError] = useState("");

  const [testModelId, setTestModelId] = useState("");

  const { data, error, loading, reload } = useResource<PageResponse<Model>>(
    "/product-models?" + paging.query
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

  // Yeni Ekleme Modunu Aç
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

  // Düzenleme Modunu Aç (ECR-05)
  function handleOpenEdit(model: Model) {
    setIsEditMode(true);
    setEditModelId(model.publicId);
    setFormCode(model.code);
    setFormName(model.name);
    setFormDesc(model.description || "");
    setFormBrandId(model.brandPublicId || "");
    setFormActive(model.active !== false); // Varsayılan olarak aktif kabul et
    setFormError("");
    setOpenModal(true);
  }

  // Form Gönderimi (Hem POST hem PUT işlemlerini yönetir)
  async function handleSubmitModel(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    try {
      if (isEditMode && editModelId) {
        // ECR-05: Düzenleme işlemi (PUT)
        await api(`/product-models/${editModelId}`, {
          method: "PUT",
          body: JSON.stringify({
            code: formCode,
            name: formName,
            description: formDesc,
            brandPublicId: formBrandId,
            active: formActive, // Görevde istenen 'active' alanı gönderimi
          }),
        });
      } else {
        // ECR-03: Yeni ekleme işlemi (POST)
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
    } catch (err: any) {
      setFormError(err.message || "İşlem başarısız oldu (Yetki hatası veya geçersiz veri olabilir).");
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

      {/* FİLTRELEME ÇUBUĞU */}
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

      {/* ECR-04 TEST ALANI */}
      <Paper variant="outlined" sx={{ p: 3, border: '2px dashed #1976d2', bgcolor: '#f8faff' }}>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
          ECR-04: ModelSelect Kullanım Örneği
        </Typography>
        <Box sx={{ maxWidth: 400 }}>
          <ModelSelect
            value={testModelId}
            onChange={(uuid: string) => setTestModelId(uuid)}
          />
        </Box>
        <Typography variant="body2" sx={{ mt: 2, fontFamily: "monospace", color: "text.secondary" }}>
          Seçilen Model UUID'si: <strong>{testModelId || "Henüz seçim yapılmadı"}</strong>
        </Typography>
      </Paper>

      {/* LİSTE */}
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
                  {canWrite && <TableCell align="right">İşlemler</TableCell>}
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
                    {canWrite && (
                      <TableCell align="right">
                         {/* ECR-05: Düzenle butonuna tıklama olayı eklendi */}
                         <Button size="small" onClick={() => handleOpenEdit(model)}>Düzenle</Button>
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

      {/* MODEL FORMU MODALI (Ekleme ve Düzenleme için Ortak) */}
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

              {/* Sadece düzenleme modunda aktiflik durumunu göster */}
              {isEditMode && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      color="primary"
                    />
                  }
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
    </Stack>
  );
}