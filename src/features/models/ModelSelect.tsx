import { TextField, MenuItem, CircularProgress } from "@mui/material";
import { useResource } from "../../shared/hooks/useResource";
import type { PageResponse } from "../../shared/types";
import type { Model } from "./api";

interface ModelSelectProps {
  value: string;
  onChange: (uuid: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  initialName?: string; // 1. ÇÖZÜM: TypeScript hatasını çözen prop tanımı eklendi
}

export function ModelSelect({
  value,
  onChange,
  label = "Ürün Modeli Seçiniz",
  error = false,
  helperText = "",
  disabled = false,
  initialName, // 2. ÇÖZÜM: Prop içeriye alındı
}: ModelSelectProps) {
  const { data, loading, error: apiError } = useResource<PageResponse<Model>>(
    "/product-models?page=0&size=100"
  );

  const models = data?.content || [];
  
  const hasError = error || !!apiError;
  const errorMessage = (apiError as any)?.message || "";
  const displayHelperText = errorMessage || helperText || (loading ? "Modeller yükleniyor..." : "");

  // 3. ÇÖZÜM: Seçili UUID var, initialName var ama model listede yoksa geçici olarak menüye ekle
  const isSelectedMissing = value && initialName && !models.some(m => m.publicId === value);
  const displayModels = isSelectedMissing
    ? [{ publicId: value, name: initialName, code: "Kayıtlı" } as Model, ...models]
    : models;

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading}
      error={hasError}
      helperText={displayHelperText}
      slotProps={{
        select: {
          IconComponent: loading ? () => <CircularProgress size={20} sx={{ mr: 1.5, color: 'text.secondary' }} /> : undefined,
        }
      }}
    >
      <MenuItem value="">
        <em>Hiçbiri (Boş bırak)</em>
      </MenuItem>
      
      {displayModels.map((model) => (
        <MenuItem key={model.publicId} value={model.publicId}>
          {model.name} ({model.code})
        </MenuItem>
      ))}
      
      {!loading && displayModels.length === 0 && (
        <MenuItem disabled value="">
          Sistemde kayıtlı model bulunamadı.
        </MenuItem>
      )}
    </TextField>
  );
}