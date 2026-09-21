import { useState } from "react";
import { Box, Typography, Paper, Autocomplete, TextField, Stack } from "@mui/material";
import { useResource } from "../../shared/hooks/useResource";
import type { PageResponse, Passport } from "../../shared/types";
import { Loading } from "../../shared/ui/Feedback";
import WarrantyList from "./WarrantyList";

export function WarrantyPage() {
  const [selectedPassport, setSelectedPassport] = useState<Passport | null>(null);

  const { data, loading } = useResource<PageResponse<Passport>>("/product-passports?size=100");

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" color="primary">
          GARANTİ YÖNETİMİ
        </Typography>
        <Typography variant="h4" component="h1">
          Garanti Kayıtları
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Garanti kayıtlarını görüntülemek ve yönetmek için listeden bir ürün seçin.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Ürün Seçimi
        </Typography>
        
        {loading ? (
          <Loading />
        ) : (
        <Box sx={{maxWidth: 400, mt: 2}}>
          <Autocomplete
            options={data?.content || []}
            getOptionLabel={(option) => `${option.serialNumber} - ${option.productModelName}`}
            value={selectedPassport}
            onChange={(_, newValue) => setSelectedPassport(newValue)}
            noOptionsText="Ürün bulunamadı"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Seri numarası veya model arayın..."
                variant="outlined"
              />
            )}
          />
        </Box>
        )}
      </Paper>

      {selectedPassport && (
        <Box sx={{ mt: 2 }}>
          <WarrantyList passportId={selectedPassport.publicId} />
        </Box>
      )}
    </Stack>
  );
}
