import { useState, useEffect } from "react";
import {
    Box,
    Button,
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
    IconButton,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup,
    Card
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import { useResource } from "../../shared/hooks/useResource";
import type { PageResponse } from "../../shared/types";
import { api } from "../../shared/api/client";
import { useAuth } from "../auth/AuthProvider";

interface WarrantyListProps {
    passportId: string;
    externalOpenNew?: boolean;
    onNewModalConsumed?: () => void;
}

interface Warranty {
    publicId: string;
    startDate: string;
    endDate: string;
}

export default function WarrantyList({ passportId, externalOpenNew, onNewModalConsumed }: WarrantyListProps) {
  const canManage = ["ADMIN", "MANUFACTURER"].includes(useAuth().user?.role ?? "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, loading, error, reload } = useResource<PageResponse<Warranty>>(
    "/warranties/product/" + passportId
  );

  // Üstteki mavi banner'dan gelen Yeni Ekle tetikleyicisini güvenli şekilde dinliyoruz
  useEffect(() => {
    if (externalOpenNew) {
      setEditingId(null);
      setStartDate("");
      setEndDate("");
      setIsDialogOpen(true);
      if (onNewModalConsumed) {
        onNewModalConsumed();
      }
    }
  }, [externalOpenNew, onNewModalConsumed]);

  const handleOpenNew = () => {
    setEditingId(null);
    setStartDate("");
    setEndDate("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (warranty: Warranty) => {
    setEditingId(warranty.publicId);
    setStartDate(warranty.startDate);
    setEndDate(warranty.endDate);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        productPassportPublicId: passportId,
        startDate,
        endDate
      };

      if (editingId) {
        await api("/warranties/edit/" + editingId, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await api("/warranties", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      setIsDialogOpen(false);
      reload();

    } catch (err) {
      console.error("Garanti kaydedilirken hata oluştu:", err);
    }
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try{
      await api("/warranties/remove/" + deletingId, {
        method: "DELETE"
      });

      setIsDeleteDialogOpen(false);
      reload();

    } catch (err: unknown){
      console.error("Silme hatası:", err);
      const status = typeof err === "object" && err !== null && "status" in err
        ? (err as { status?: number }).status
        : undefined;
      const message = err instanceof Error ? err.message : "";
      if(status === 403 || message.includes("403")){
        setErrorMessage("Bu kaydı silmek için yetkiniz yok.");
      }else {
        setErrorMessage("Silme işlemi sırasında bir hata oluştu.");
      }
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) return <Typography sx={{ mt: 3, color: "#64748B" }}>Garanti bilgileri yükleniyor...</Typography>;
  if (error) return <Typography sx={{ mt: 3 }} color="error">Garanti verisi çekilirken hata oluştu.</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      <Paper elevation={0} sx={{ overflow: "hidden", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
        
        {/* Üst Başlık ve Liste/Grid Görünüm Togglesı */}
        <Box sx={{ px: 3, py: 2.5, bgcolor: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
            Garanti Kayıtları
          </Typography>

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
        
        <Box sx={{ flex: 1, bgcolor: viewMode === "grid" ? "#F8FAFC" : "#FFFFFF" }}>
          {viewMode === "list" ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Garanti ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Başlangıç Tarihi</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>Bitiş Tarihi</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 2 }}>İşlemler</TableCell>            
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.content.map((warranty) => (
                    <TableRow key={warranty.publicId} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                      <TableCell sx={{ fontFamily: "monospace", color: "#64748B", fontWeight: 600 }}>
                        {warranty.publicId}
                      </TableCell>
                      <TableCell sx={{ color: "#0F172A", fontWeight: 500 }}>{warranty.startDate}</TableCell>
                      <TableCell sx={{ color: "#0F172A", fontWeight: 500 }}>{warranty.endDate}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                          {canManage && (
                            <>
                              <Tooltip title="Düzenle">
                                <IconButton size="small" onClick={() => handleOpenEdit(warranty)} sx={{ color: "#1D4ED8", bgcolor: "#F1F5F9", "&:hover": { bgcolor: "#E2E8F0" } }}>
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Sil">
                                <IconButton size="small" onClick={() => handleOpenDelete(warranty.publicId)} sx={{ color: "#DC2626", bgcolor: "#FEECEB", "&:hover": { bgcolor: "#FCD3D3" } }}>
                                  <DeleteOutlineOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {!data?.content.length && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", py: 6, color: "#64748B" }}>
                        Bu ürüne ait garanti kaydı bulunmamaktadır.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            /* KUTU (GRID) GÖRÜNÜMÜ */
            <Box sx={{ p: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
              {data?.content.map((warranty) => (
                <Card
                  key={warranty.publicId}
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
                    <Typography sx={{ fontFamily: "monospace", color: "#0F172A", bgcolor: "#F8FAFC", px: 1.5, py: 0.5, borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, border: "1px solid rgba(0,0,0,0.04)", width: "fit-content", mb: 2 }}>
                      {warranty.publicId}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748B", mb: 0.5 }}>
                      Başlangıç: <strong style={{ color: "#0F172A" }}>{warranty.startDate}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748B" }}>
                      Bitiş: <strong style={{ color: "#0F172A" }}>{warranty.endDate}</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid rgba(0,0,0,0.04)", display: "flex", justifyContent: "flex-end", gap: 1, bgcolor: "#F8FAFC" }}>
                    {canManage && (
                      <>
                        <Button size="small" onClick={() => handleOpenEdit(warranty)} sx={{ color: "#334155", fontWeight: 600, textTransform: "none" }}>
                          Düzenle
                        </Button>
                        <Button size="small" onClick={() => handleOpenDelete(warranty.publicId)} sx={{ color: "#DC2626", fontWeight: 600, textTransform: "none" }}>
                          Sil
                        </Button>
                      </>
                    )}
                  </Box>
                </Card>
              ))}
              {!data?.content.length && (
                <Box sx={{ gridColumn: "1 / -1", py: 6, textAlign: "center", color: "#64748B" }}>
                  <Typography variant="body1">Bu ürüne ait garanti kaydı bulunmamaktadır.</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Düzenleme / Ekleme Modalı */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
          {editingId ? "Garantiyi düzenle" : "Yeni garanti ekle"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Başlangıç Tarihi"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
            <TextField
              label="Bitiş Tarihi"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setIsDialogOpen(false)} sx={{ color: "#64748B", fontWeight: 600, textTransform: "none" }}>
            Vazgeç
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: "#0F172A", fontWeight: 600, borderRadius: "10px", px: 3, textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: "#1E293B" } }}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
{/* Silme Onay Modalı */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} maxWidth="xs" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0F172A", pb: 1 }}>
          Garanti silinsin mi?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#475569", fontSize: "0.95rem" }}>
            Seçili garanti kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)} 
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
      {/* Hata Mesajı Modalı */}
      <Dialog open={!!errorMessage} onClose={()=> setErrorMessage(null)} maxWidth="xs" fullWidth sx={{ "& .MuiDialog-paper": { borderRadius: "16px" } }}>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>İşlem Başarısız</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#475569" }}>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setErrorMessage(null)} variant="contained" sx={{ bgcolor: "#0F172A", textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: "#1E293B" } }}>Tamam</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}