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
  Paper,
  Stack,
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

// ECR-04: Test için ModelSelect bileşenini import ediyoruz
import { ModelSelect } from "./ModelSelect";

export function ModelPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "ADMIN" || user?.role === "MANUFACTURER";

  const paging = usePageQuery("name", ["name", "code", "createdAt"]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [brandInput, setBrandInput] = useState(searchParams.get("brandPublicId") || "");

  const [openModal, setOpenModal] = useState(false);
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [formError, setFormError] = useState("");

  // ECR-04 Test State'i (Esat'ın kullanımını simüle ediyoruz)
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

  async function handleCreateModel(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    try {
      await api("/product-models", {
        method: "POST",
        body: JSON.stringify({
          code: formCode,
          name: formName,
          description: formDesc,
          brandPublicId: formBrandId,
        }),
      });

      setOpenModal(false);
      setFormCode("");
      setFormName("");
      setFormDesc("");
      setFormBrandId("");
      reload();
    } catch (err: any) {
      setFormError(err.message || "Model oluşturulamadı (403 veya yetki hatası olabilir).");
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
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
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

      {/* ECR-04 KULLANIM ÖRNEĞİ (TEST ALANI) */}
      <Paper variant="outlined" sx={{ p: 3, border: '2px dashed #1976d2', bgcolor: '#f8faff' }}>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
          ECR-04: ModelSelect Kullanım Örneği (Diğer formlar için test)
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
                         <Button size="small">Düzenle</Button>
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
        <form onSubmit={handleCreateModel}>
          <DialogTitle>Yeni Model Ekle</DialogTitle>
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
                helperText="Geçerli bir marka UUID'si girin"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)}>İptal</Button>
            <Button type="submit" variant="contained">Kaydet</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
}