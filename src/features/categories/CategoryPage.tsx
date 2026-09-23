import { useState } from "react";
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
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Card,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";

import { useAuth } from "../auth/AuthProvider";
import { usePageQuery } from "../../shared/hooks/usePageQuery";
import { useResource } from "../../shared/hooks/useResource";
import type { Category, PageResponse } from "../../shared/types";
import { PageControls } from "../../shared/ui/PageControls";
import { Loading, ErrorNotice } from "../../shared/ui/Feedback";
import { CategoryForm } from "./CategoryForm";
import { categoryApi } from "./api";

export function CategoryPage() {
  const admin = useAuth().user?.role === "ADMIN";
  const paging = usePageQuery("name", ["name", "code", "createdAt"]);
  const { data, error, loading, reload } = useResource<PageResponse<Category>>(
    "/categories?" + paging.query,
  );
  const [editor, setEditor] = useState<Category | null | undefined>();
  const [removing, setRemoving] = useState<Category>();
  const [deleteError, setDeleteError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  async function remove() {
    if (!removing) return;
    setBusy(true);
    setDeleteError(undefined);
    try {
      await categoryApi.remove(removing.publicId);
      setRemoving(undefined);
      setNotice("Kategori silindi.");
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
      {/* 1. HERO BANNER */}
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
            label="KATALOG"
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
            Kategoriler
          </Typography>
          <Typography sx={{ color: "#CBD5E1", mt: 0.5, fontSize: "1rem", fontWeight: 400 }}>
            Ürünlerinizi anlamlı gruplar altında düzenleyin.
          </Typography>
        </Box>

        {admin && (
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
            Yeni kategori
          </Button>
        )}
      </Box>

      {notice && (
        <Alert onClose={() => setNotice("")} severity="success" sx={{ borderRadius: "12px" }}>
          {notice}
        </Alert>
      )}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNotice error={error} retry={reload} />
      ) : (
        <Paper elevation={0} sx={{ overflow: "hidden", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
          
          {/* ÜST KISIM: Başlık, Sıralama Filtreleri (PageControls) ve Liste/Grid Toggle */}
          <Box sx={{ px: 3, py: 2.5, bgcolor: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
              Kayıtlı Kategoriler
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              {/* Sıralama ve Yön Filtreleri Üste Taşındı */}
              <PageControls
                paging={paging}
                total={data?.totalElements || 0}
                sorts={[
                  { value: "name", label: "Kategori adı" },
                  { value: "code", label: "Kod" },
                  { value: "createdAt", label: "Oluşturulma" },
                ]}
              />

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

          <Box sx={{ flex: 1, bgcolor: viewMode === "grid" ? "#F8FAFC" : "#FFFFFF" }}>
            {viewMode === "list" ? (
              <TableContainer>
                <Table aria-label="Kategoriler">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Kod</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Kategori adı</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Durum</TableCell>
                      {admin && <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>İşlemler</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.content.map((category) => (
                      <TableRow key={category.publicId} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace", color: "#64748B", fontWeight: 600 }}
                          >
                            {category.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>
                            {category.name}
                          </Typography>
                          {category.description && (
                            <Typography variant="body2" color="text.secondary">
                              {category.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={category.active ? "Aktif" : "Pasif"}
                            sx={{
                              bgcolor: category.active ? "#DCFCE7" : "#FEECEB",
                              color: category.active ? "#15803D" : "#DC2626",
                              fontWeight: 600,
                              borderRadius: "6px",
                            }}
                          />
                        </TableCell>
                        {admin && (
                          <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                            <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                              <Tooltip title="Düzenle">
                                <IconButton
                                  size="small"
                                  onClick={() => setEditor(category)}
                                  aria-label={category.name + " düzenle"}
                                  sx={{ color: "#1D4ED8", bgcolor: "#F1F5F9", "&:hover": { bgcolor: "#E2E8F0" } }}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Sil">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setRemoving(category);
                                    setDeleteError(undefined);
                                  }}
                                  aria-label={category.name + " sil"}
                                  sx={{ color: "#DC2626", bgcolor: "#FEECEB", "&:hover": { bgcolor: "#FCD3D3" } }}
                                >
                                  <DeleteOutlineOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {!data?.content.length && (
                      <TableRow>
                        <TableCell
                          colSpan={admin ? 4 : 3}
                          sx={{ py: 6, textAlign: "center", color: "#64748B" }}
                        >
                          Bu sayfada kategori bulunamadı.
                          {paging.page > 0 && (
                            <Button onClick={() => paging.update({ page: 0 })} sx={{ ml: 2, textTransform: "none", fontWeight: 600 }}>
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
              /* KUTU (GRID) GÖRÜNÜMÜ */
              <Box sx={{ p: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
                {data?.content.map((category) => (
                  <Card
                    key={category.publicId}
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
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography sx={{ fontFamily: "monospace", color: "#0F172A", bgcolor: "#F8FAFC", px: 1.5, py: 0.5, borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, border: "1px solid rgba(0,0,0,0.04)" }}>
                          {category.code}
                        </Typography>
                        <Chip
                          size="small"
                          label={category.active ? "Aktif" : "Pasif"}
                          sx={{
                            bgcolor: category.active ? "#DCFCE7" : "#FEECEB",
                            color: category.active ? "#15803D" : "#DC2626",
                            fontWeight: 600,
                            borderRadius: "6px",
                          }}
                        />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A", mb: 0.5 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748B" }}>
                        {category.description || "Açıklama yok"}
                      </Typography>
                    </Box>
                    <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid rgba(0,0,0,0.04)", display: "flex", justifyContent: "flex-end", gap: 1, bgcolor: "#F8FAFC" }}>
                      {admin && (
                        <>
                          <Button size="small" onClick={() => setEditor(category)} sx={{ color: "#1D4ED8", fontWeight: 600, textTransform: "none" }}>
                            Düzenle
                          </Button>
                          <Button size="small" onClick={() => { setRemoving(category); setDeleteError(undefined); }} sx={{ color: "#DC2626", fontWeight: 600, textTransform: "none" }}>
                            Sil
                          </Button>
                        </>
                      )}
                    </Box>
                  </Card>
                ))}
                {!data?.content.length && (
                  <Box sx={{ gridColumn: "1 / -1", py: 6, textAlign: "center", color: "#64748B" }}>
                    <Typography variant="body1">Bu sayfada kategori bulunamadı.</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {admin && editor !== undefined && (
        <CategoryForm
          category={editor || undefined}
          onClose={() => setEditor(undefined)}
          onSaved={() => {
            setEditor(undefined);
            setNotice("Kategori kaydedildi.");
            reload();
          }}
        />
      )}

      {admin && removing && (
        <Dialog
          open
          onClose={() => {
            if (!busy) setRemoving(undefined);
          }}
          aria-labelledby="delete-title"
          maxWidth="xs"
          fullWidth
          sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}
        >
          <DialogTitle id="delete-title" sx={{ fontWeight: 700, color: "#0F172A", pb: 1 }}>
            Kategori silinsin mi?
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <DialogContentText sx={{ color: "#475569", fontSize: "0.95rem" }}>
                <strong>{removing.name}</strong> kategorisini silmek üzeresiniz. Bağlı pasaport
                varsa silme işlemi reddedilir. Bu işlem geri alınamaz.
              </DialogContentText>
              {deleteError !== undefined && <ErrorNotice error={deleteError} />}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
            <Button
              disabled={busy}
              onClick={() => setRemoving(undefined)}
              sx={{ color: "#0F172A", fontWeight: 600, textTransform: "none", "&:hover": { bgcolor: "rgba(15, 23, 42, 0.04)" } }}
            >
              Vazgeç
            </Button>
            <Button
              variant="contained"
              disabled={busy}
              onClick={() => void remove()}
              sx={{
                bgcolor: "#DC2626",
                fontWeight: 600,
                borderRadius: "10px",
                px: 3,
                py: 1,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { bgcolor: "#B91C1C" },
              }}
            >
              {busy ? "Siliniyor…" : "Silmeyi onayla"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}