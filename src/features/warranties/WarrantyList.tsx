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
  TextField
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
  const { data, loading, error, reload } = useResource<PageResponse<Warranty>>(
    "/warranties/product/" + passportId
  );

  const handleSave = async () => {
    try {
      const payload = {
        productPassportPublicId: passportId,
        startDate,
        endDate
      };

      await api("/warranties", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setIsDialogOpen(false);
      setStartDate("");
      setEndDate("");
      reload();

    } catch (err) {
      console.error("Garanti kaydedilirken hata oluştu:", err);
      alert("Kayıt sırasında bir hata oluştu, lütfen tekrar deneyin.");
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
          onClick={() => setIsDialogOpen(true)}
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
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.content.map((warranty) => (
                <TableRow key={warranty.publicId} hover>
                  <TableCell sx={{ fontFamily: "monospace" }}>
                    {warranty.publicId}
                  </TableCell>
                  <TableCell>{warranty.startDate}</TableCell>
                  <TableCell>{warranty.endDate}</TableCell>
                </TableRow>
              ))}
              
              {!data?.content.length && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: "center", py: 4 }}>
                    Bu ürüne ait garanti kaydı bulunmamaktadır.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Garanti Ekle</DialogTitle>
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
            disabled={!startDate || !endDate || endDate < startDate}>
              Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}