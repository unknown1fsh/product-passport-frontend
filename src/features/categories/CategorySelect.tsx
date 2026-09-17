import {Autocomplete, TextField} from "@mui/material";
import {useResource} from "../../shared/hooks/useResource";
import type {Category, PageResponse} from "../../shared/types";

export function CategorySelect({value, onChange, disabled,initialName}: {
    value: string | null;
    onChange: (value: string | null) => void;
    disabled?: boolean;
    initialName?: string;
}) {
    const {
        data,
        error,
        loading
    } = useResource<PageResponse<Category>>("/categories?page=0&size=100&sortBy=name&sortDir=asc");
    const options = (data?.content ?? []).map((c) => ({publicId: c.publicId, name: c.name}));
    const seeded = value && initialName && !options.some((o) => o.publicId === value)
        ? [{publicId: value, name: initialName}, ...options]
        : options;
    const selected = seeded.find(o => o.publicId === value) ?? null;
    return (
        <Autocomplete
            options={seeded}
            value={selected}
            onChange={(_, option) => onChange(option ? option.publicId : null)}
            getOptionLabel={(o) => o.name}
            isOptionEqualToValue={(a, b) => a.publicId === b.publicId}
            disabled={disabled}
            loading={loading}
            renderInput={(params) => <TextField {...params}
                label = "Kategori"
                required
                error={Boolean(error)}
                helperText = {"Kategori adını yazın."}
                />
            }
        />
    );
}
