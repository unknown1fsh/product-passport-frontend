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
import type { PageResponse } from "../../shared/types";
import { PageControls } from "../../shared/ui/PageControls";
import { Loading, ErrorNotice } from "../../shared/ui/Feedback";
import { supplierApi, type Supplier } from "./api";
import { SupplierForm } from "./SupplierForm";

export function SupplierPage() {
  const user = useAuth().user;
  const isAdmin = user?.role === "ADMIN";

  const paging = usePageQuery("name", ["name", "code", "createdAt"]);
  const { data, error, loading, reload } = useResource<PageResponse<Supplier>>(
    "/product-suppliers?" + paging.query,
  );

  const [editor, setEditor] = useState<Supplier | null | undefined>(undefined);
  const [removing, setRemoving] = useState<Supplier>();
  const [deleteError, setDeleteError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  async function remove() {
    if (!removing) return;
    setBusy(true);
    setDeleteError(undefined);
    try {
      await supplierApi.remove(removing.publicId);
      setRemoving(undefined);
      setNotice("Tedarikçi silindi.");
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
            label="TEDARİKÇİ YÖNETİMİ"
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
            Tedarikçiler
          </Typography>
          <Typography sx={{ color: "#CBD5E1", mt: 0.5, fontSize: "1rem", fontWeight: 400 }}>
            Sistem tedarikçilerini görüntüleyin ve yönetin.
          </Typography>
        </Box>

        {isAdmin && (
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
            Yeni tedarikçi
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
          
          <Box sx={{ px: 3, py: 2.5, bgcolor: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
              Kayıtlı Tedarikçiler
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <PageControls
                paging={paging}
                total={data?.totalElements || 0}
                sorts={[
                  { value: "name", label: "Tedarikçi adı" },
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
                <Table aria-label="Tedarikçiler">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Kod</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Tedarikçi adı</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>İletişim (E-posta / Tel)</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Durum</TableCell>
                      {isAdmin && <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", py: 2 }}>İşlemler</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.content.map((supplier) => (
                      <TableRow key={supplier.publicId} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#64748B", fontWeight: 600 }}>
                            {supplier.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>
                            {supplier.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {supplier.email || "-"} / {supplier.phone || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={supplier.active ? "Aktif" : "Pasif"}
                            sx={{
                              bgcolor: supplier.active ? "#DCFCE7" : "#FEECEB",
                              color: supplier.active ? "#15803D" : "#DC2626",
                              fontWeight: 600,
                              borderRadius: "6px",
                            }}
                          />
                        </TableCell>
                        {isAdmin && (
                          <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                            <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                              <Tooltip title="Düzenle">
                                <IconButton
                                  size="small"
                                  onClick={() => setEditor(supplier)}
                                  sx={{ color: "#1D4ED8", bgcolor: "#F1F5F9", "&:hover": { bgcolor: "#E2E8F0" } }}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Sil">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setRemoving(supplier);
                                    setDeleteError(undefined);
                                  }}
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
                        <TableCell colSpan={isAdmin ? 5 : 4} sx={{ py: 6, textAlign: "center", color: "#64748B" }}>
                          Kayıtlı tedarikçi bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
                {data?.content.map((supplier) => (
                  <Card
                    key={supplier.publicId}
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
                          {supplier.code}
                        </Typography>
                        <Chip
                          size="small"
                          label={supplier.active ? "Aktif" : "Pasif"}
                          sx={{
                            bgcolor: supplier.active ? "#DCFCE7" : "#FEECEB",
                            color: supplier.active ? "#15803D" : "#DC2626",
                            fontWeight: 600,
                            borderRadius: "6px",
                          }}
                        />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A", mb: 0.5 }}>
                        {supplier.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {supplier.email || "-"}
                      </Typography>
                    </Box>
                    <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid rgba(0,0,0,0.04)", display: "flex", justifyContent: "flex-end", gap: 1, bgcolor: "#F8FAFC" }}>
                      {isAdmin && (
                        <>
                          <Button size="small" onClick={() => setEditor(supplier)} sx={{ color: "#1D4ED8", fontWeight: 600, textTransform: "none" }}>
                            Düzenle
                          </Button>
                          <Button size="small" onClick={() => { setRemoving(supplier); setDeleteError(undefined); }} sx={{ color: "#DC2626", fontWeight: 600, textTransform: "none" }}>
                            Sil
                          </Button>
                        </>
                      )}
                    </Box>
                  </Card>
                ))}
                {!data?.content.length && (
                  <Box sx={{ gridColumn: "1 / -1", py: 6, textAlign: "center", color: "#64748B" }}>
                    <Typography variant="body1">Kayıtlı tedarikçi bulunamadı.</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {isAdmin && editor !== undefined && (
        <SupplierForm
          supplier={editor || undefined}
          onClose={() => setEditor(undefined)}
          onSaved={() => {
            setEditor(undefined);
            setNotice("Tedarikçi kaydedildi.");
            reload();
          }}
        />
      )}

      {removing && (
        <Dialog
          open
          onClose={() => { if (!busy) setRemoving(undefined); }}
          maxWidth="xs"
          fullWidth
          sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: "#0F172A", pb: 1 }}>
            Tedarikçi silinsin mi?
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <DialogContentText sx={{ color: "#475569", fontSize: "0.95rem" }}>
                <strong>{removing.name}</strong> tedarikçisini silmek üzeresiniz. Bağlı model varsa silme işlemi 409 hatası ile reddedilir. Bu işlem geri alınamaz.
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