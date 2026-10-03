import { TextField, Autocomplete } from "@mui/material";
import { useResource } from "../../shared/hooks/useResource";
import type { PageResponse } from "../../shared/types";
import type { Model } from "./api";
import { ApiError } from "../../shared/api/http";
import { useState, useEffect } from "react";

interface ModelSelectProps {
  value: string;
  onChange: (uuid: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  initialName?: string;
}

export function ModelSelect({
  value,
  onChange,
  label = "Ürün Modeli Seçiniz",
  error = false,
  helperText = "",
  disabled = false,
  initialName,
}: ModelSelectProps) {
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
      const handler = setTimeout(() => {
          setSearch(inputValue);
      }, 500);
      return () => clearTimeout(handler);
  }, [inputValue]);

  const { data, loading, error: apiError } = useResource<PageResponse<Model>>(
    `/product-models?page=0&size=100${search ? `&search=${encodeURIComponent(search)}` : ''}`
  );

  const models = data?.content || [];
  
  const hasError = error || !!apiError;
  const errorMessage = apiError instanceof ApiError ? apiError.message : "";
  const displayHelperText = errorMessage || helperText || (loading ? "Modeller yükleniyor..." : "");

  const isSelectedMissing = value && initialName && !models.some(m => m.publicId === value);
  const displayModels = isSelectedMissing
    ? [{ publicId: value, name: initialName, code: "Kayıtlı" } as Model, ...models]
    : models;

  const selected = displayModels.find(m => m.publicId === value) ?? null;

  return (
    <Autocomplete
      options={displayModels}
      value={selected}
      onChange={(_, option) => onChange(option ? option.publicId : "")}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      getOptionLabel={(o) => `${o.name} (${o.code})`}
      isOptionEqualToValue={(a, b) => a.publicId === b.publicId}
      disabled={disabled}
      loading={loading}
      filterOptions={(x) => x}
      noOptionsText={loading ? "Aranıyor..." : "Sistemde kayıtlı model bulunamadı."}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          size="small"
          label={label}
          error={hasError}
          helperText={displayHelperText}
        />
      )}
    />
  );
}
