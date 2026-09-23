import { useState } from "react";
import { Box, Typography, Paper, Autocomplete, TextField, Stack, Chip, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useResource } from "../../shared/hooks/useResource";
import type { PageResponse, Passport } from "../../shared/types";
import { Loading } from "../../shared/ui/Feedback";
import WarrantyList from "./WarrantyList";

export function WarrantyPage() {
  const [selectedPassport, setSelectedPassport] = useState<Passport | null>(null);
  const [triggerNewModal, setTriggerNewModal] = useState(false);

  const { data, loading } = useResource<PageResponse<Passport>>("/product-passports?size=100");

  return (
    <Stack spacing={3}>
      {/* 1. HERO BANNER: Mavi geçiş ve tam işlevli "Yeni Ekle" butonu */}
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
            label="GARANTİ YÖNETİMİ"
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
            Garanti Kayıtları
          </Typography>
          <Typography sx={{ color: "#CBD5E1", mt: 0.5, fontSize: "1rem", fontWeight: 400 }}>
            Garanti kayıtlarını görüntülemek ve yönetmek için listeden bir ürün seçin.
          </Typography>
        </Box>

        {selectedPassport && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setTriggerNewModal(true)}
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
            Yeni Ekle
          </Button>
        )}
      </Box>

      {/* 2. ÜRÜN SEÇİM KUTUSU */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "16px",
          bgcolor: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, color: "#0F172A" }}>
          Ürün Seçimi
        </Typography>
        
        {loading ? (
          <Loading />
        ) : (
          <Box sx={{ maxWidth: 450 }}>
            <Autocomplete
              options={data?.content || []}
              getOptionLabel={(option) => `${option.serialNumber} - ${option.productModelName}`}
              value={selectedPassport}
              onChange={(_, newValue) => setSelectedPassport(newValue)}
              noOptionsText="Ürün bulunamadı"
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: "12px",
                    mt: 1,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    "& .MuiAutocomplete-option": {
                      fontSize: "0.95rem",
                      color: "#334155",
                      my: 0.5,
                      mx: 1,
                      borderRadius: "8px",
                      transition: "background-color 0.2s",
                      "&[aria-selected=\"true\"]": {
                        bgcolor: "rgba(15, 23, 42, 0.08) !important",
                        color: "#0F172A !important",
                        fontWeight: 700,
                      },
                      "&.Mui-focused, &[data-focus=\"true\"], &:hover": {
                        bgcolor: "#F1F5F9 !important",
                        color: "#0F172A !important",
                      },
                      "&.Mui-focused[aria-selected=\"true\"]": {
                        bgcolor: "rgba(15, 23, 42, 0.12) !important",
                      },
                    },
                  },
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seri numarası veya model arayın..."
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#F8FAFC",
                      "&:hover fieldset": { borderColor: "#1D4ED8" },
                      "&.Mui-focused fieldset": { borderColor: "#0F172A", borderWidth: "2px" },
                    },
                  }}
                />
              )}
            />
          </Box>
        )}
      </Paper>

      {selectedPassport && (
        <Box sx={{ mt: 1 }}>
          <WarrantyList 
            passportId={selectedPassport.publicId} 
            externalOpenNew={triggerNewModal} 
            onNewModalConsumed={() => setTriggerNewModal(false)} 
          />
        </Box>
      )}
    </Stack>
  );
}