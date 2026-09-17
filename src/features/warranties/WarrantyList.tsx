import { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useResource } from "../../shared/hooks/useResource";
import type { PageResponse } from "../../shared/types";
import { api } from "../../shared/api/client";

interface WarrantyListProps {
  passportId: string;
}

interface Warranty {
  publicId: string; 
  startDate: string;
  endDate: string;
}

export default function WarrantyList({ passportId }: WarrantyListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, loading, error, reload } = useResource<PageResponse<Warranty>>(
    "/warranties/product/" + passportId
  );

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

  if (loading) return <Typography sx={{ mt: 3 }}>Garanti bilgileri yükleniyor...</Typography>;
  if (error) return <Typography sx={{ mt: 3 }} color="error">Garanti verisi çekilirken hata oluştu.</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Garanti Kayıtları
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpenNew}
          sx={{ textTransform: 'none' }}
        >
          Yeni Ekle
        </Button>
      </Box>
      
      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Garanti ID</TableCell>
                <TableCell>Başlangıç Tarihi</TableCell>
                <TableCell>Bitiş Tarihi</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>              </TableRow>
            </TableHead>
            <TableBody>
              {data?.content.map((warranty) => (
                <TableRow key={warranty.publicId} hover>
                  <TableCell sx={{ fontFamily: "monospace" }}>
                    {warranty.publicId}
                  </TableCell>
                  <TableCell>{warranty.startDate}</TableCell>
                  <TableCell>{warranty.endDate}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
                      <Button size="small" onClick={() => handleOpenEdit(warranty)}>
                        Düzenle
                      </Button>
                      <Button size="small" color="error" onClick={() => handleOpenDelete(warranty.publicId)}>
                        Sil
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              
              {!data?.content.length && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                    Bu ürüne ait garanti kaydı bulunmamaktadır.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Garantiyi Düzenle" : "Yeni Garanti Ekle"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              label="Başlangıç Tarihi"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Bitiş Tarihi"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setIsDialogOpen(false)} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!startDate || !endDate || endDate < startDate}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>
          Garantiyi Sil
          </DialogTitle>
        <DialogContent>
          <Typography>Seçili garanti kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)} 
            color="primary" 
            sx={{ fontWeight: 'bold' }}
          >
            İptal
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ fontWeight: 'bold' }}>Sil</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!errorMessage} onClose={()=> setErrorMessage(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{color: 'error.main'}}>İşlem Başarısız</DialogTitle>
        <DialogContent>
          <Typography>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorMessage(null)} color="primary">Tamam</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
