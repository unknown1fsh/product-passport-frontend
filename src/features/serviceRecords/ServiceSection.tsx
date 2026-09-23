import { useState } from "react";

import {
  Box,
  Button,
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
  TablePagination,
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

import { useResource } from "../../shared/hooks/useResource";
import type { PageResponse } from "../../shared/types";
import { ErrorNotice, Loading } from "../../shared/ui/Feedback";
import { useAuth } from "../auth/AuthProvider";
import { serviceRecordApi } from "./api";
import { ServiceForm } from "./ServiceForm";
import type { ServiceRecord } from "./types";
import { ApiError } from "../../shared/api/http";

export function ServiceSection({ passportId }: { passportId: string }) {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord>();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [removingRecord, setRemovingRecord] = useState<ServiceRecord>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<unknown>();

  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy: "serviceDate",
    sortDir: "desc",
  }).toString();

  const { data, error, loading, reload } = useResource<
    PageResponse<ServiceRecord>
  >("/service-records/product/" + passportId + "?" + query);
  const accessDenied = error instanceof ApiError && error.status === 403;

  const canManage =
    user?.role === "ADMIN" ||
    (user?.role === "MANUFACTURER" && data !== undefined && !accessDenied);

  async function remove() {
    if (!removingRecord) return;

    setDeleteBusy(true);
    setDeleteError(undefined);

    try {
      await serviceRecordApi.remove(removingRecord.publicId);

      setRemovingRecord(undefined);
      reload();
    } catch (e) {
      setDeleteError(e);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <Stack spacing={2}>
     
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNotice error={error} retry={reload} />
      ) : (
        <Paper elevation={0} sx={{ overflow: "hidden", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
          
          {/* Üst Başlık, Toggle ve Ekle Butonu */}
          <Box sx={{ px: 3, py: 2.5, bgcolor: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
              Servis Kayıtları
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
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

              {canManage && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingRecord(undefined);
                    setFormOpen(true);
                  }}
                  sx={{
                    bgcolor: "#0F172A",
                    color: "#FFFFFF",
                    borderRadius: "10px",
                    px: 3,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#1E293B" }
                  }}
                >
                  Servis kaydı ekle
                </Button>
              )}
            </Box>
          </Box>

          {/* İçerik: Liste veya Kutu (Grid) Görünümü */}
          <Box sx={{ flex: 1, bgcolor: viewMode === "grid" ? "#F8FAFC" : "#FFFFFF" }}>
            {viewMode === "list" ? (
              <TableContainer>
                <Table aria-label="Servis geçmişi">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Servis tarihi</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Açıklama</TableCell>
                      {canManage && <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>İşlem</TableCell>}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {data?.content.map((record) => (
                      <TableRow key={record.publicId} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell sx={{ whiteSpace: "nowrap", color: "#0F172A", fontWeight: 600 }}>
                          {record.serviceDate}
                        </TableCell>

                        <TableCell sx={{ color: "#334155" }}>{record.description}</TableCell>

                        {canManage && (
                          <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                            <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                              <Tooltip title="Düzenle">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingRecord(record);
                                    setFormOpen(true);
                                  }}
                                  sx={{ color: "#1D4ED8", bgcolor: "#F1F5F9", "&:hover": { bgcolor: "#E2E8F0" } }}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Sil">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setRemovingRecord(record);
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
                        <TableCell
                          colSpan={canManage ? 3 : 2}
                          sx={{ py: 6, textAlign: "center", color: "#64748B" }}
                        >
                          Bu ürüne ait servis kaydı bulunamadı.
                          {page > 0 && (
                            <Button onClick={() => setPage(0)} sx={{ ml: 2, textTransform: "none", fontWeight: 600 }}>
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
                {data?.content.map((record) => (
                  <Card
                    key={record.publicId}
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
                      <Typography sx={{ color: "#1D4ED8", bgcolor: "#F8FAFC", px: 1.5, py: 0.5, borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, border: "1px solid rgba(0,0,0,0.04)", width: "fit-content", mb: 2 }}>
                        {record.serviceDate}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#334155" }}>
                        {record.description}
                      </Typography>
                    </Box>
                    <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid rgba(0,0,0,0.04)", display: "flex", justifyContent: "flex-end", gap: 1, bgcolor: "#F8FAFC" }}>
                      {canManage && (
                        <>
                          <Button size="small" onClick={() => { setEditingRecord(record); setFormOpen(true); }} sx={{ color: "#1D4ED8", fontWeight: 600, textTransform: "none" }}>
                            Düzenle
                          </Button>
                          <Button size="small" onClick={() => { setRemovingRecord(record); setDeleteError(undefined); }} sx={{ color: "#DC2626", fontWeight: 600, textTransform: "none" }}>
                            Sil
                          </Button>
                        </>
                      )}
                    </Box>
                  </Card>
                ))}
                {!data?.content.length && (
                  <Box sx={{ gridColumn: "1 / -1", py: 6, textAlign: "center", color: "#64748B" }}>
                    <Typography variant="body1">Bu ürüne ait servis kaydı bulunamadı.</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <TablePagination
            component="div"
            count={data?.totalElements || 0}
            page={page}
            rowsPerPage={size}
            rowsPerPageOptions={[10, 20, 50, 100]}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            labelRowsPerPage="Satır:"
            labelDisplayedRows={({ from, to, count }) =>
              from + "–" + to + " / " + count
            }
            sx={{ borderTop: "1px solid rgba(0,0,0,0.06)", color: "#475569", bgcolor: "#FFFFFF" }}
          />
        </Paper>
      )}

      {formOpen && (
        <ServiceForm
          productId={passportId}
          record={editingRecord}
          onClose={() => {
            setFormOpen(false);
            setEditingRecord(undefined);
          }}
          onSaved={() => {
            setFormOpen(false);
            setEditingRecord(undefined);
            reload();
          }}
        />
      )}

      {removingRecord && (
        <Dialog
          open
          onClose={() => {
            if (!deleteBusy) {
              setRemovingRecord(undefined);
              setDeleteError(undefined);
            }
          }}
          aria-labelledby="service-delete-title"
          maxWidth="xs"
          fullWidth
          sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}
        >
          <DialogTitle id="service-delete-title" sx={{ fontWeight: 700, color: "#0F172A", pb: 1 }}>
            Servis kaydı silinsin mi?
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2}>
              <DialogContentText sx={{ color: "#475569", fontSize: "0.95rem" }}>
                <strong>{removingRecord.serviceDate}</strong> tarihli servis kaydını silmek
                üzeresiniz. Bu işlem geri alınamaz.
              </DialogContentText>

              {deleteError !== undefined && <ErrorNotice error={deleteError} />}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
            <Button
              disabled={deleteBusy}
              onClick={() => {
                setRemovingRecord(undefined);
                setDeleteError(undefined);
              }}
              sx={{ color: "#0F172A", fontWeight: 600, textTransform: "none", "&:hover": { bgcolor: "rgba(15, 23, 42, 0.04)" } }}
            >
              Vazgeç
            </Button>

            <Button
              variant="contained"
              disabled={deleteBusy}
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
              {deleteBusy ? "Siliniyor…" : "Silmeyi onayla"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}