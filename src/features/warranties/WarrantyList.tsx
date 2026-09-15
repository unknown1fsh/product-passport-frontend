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
} from "@mui/material";
import { useResource } from "../../shared/hooks/useResource";
import type { PageResponse } from "../../shared/types";

interface WarrantyListProps {
  passportId: string;
}

interface Warranty {
  publicId: string;
  startDate: string;
  endDate: string;
}

export default function WarrantyList({ passportId }: WarrantyListProps) {
  const { data, loading, error } = useResource<PageResponse<Warranty>>(
    "/warranties/product/" + passportId
  );

  if (loading) return <Typography sx={{ mt: 3 }}>Garanti bilgileri yükleniyor...</Typography>;
  if (error) return <Typography sx={{ mt: 3 }} color="error">Garanti verisi çekilirken hata oluştu.</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Garanti Kayıtları
      </Typography>
      
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
    </Box>
  );
}