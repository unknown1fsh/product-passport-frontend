import { Box, MenuItem, TablePagination, TextField } from "@mui/material";
import type { usePageQuery } from "../hooks/usePageQuery";
export function PageControls({
  paging,
  total,
  sorts,
}: {
  paging: ReturnType<typeof usePageQuery>;
  total: number;
  sorts: { value: string; label: string }[];
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
        py: 2,
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          select
          size="small"
          label="Sıralama"
          value={paging.sortBy}
          onChange={(e) => paging.update({ sortBy: e.target.value, page: 0 })}
          sx={{ minWidth: 145 }}
        >
          {sorts.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Yön"
          value={paging.sortDir}
          onChange={(e) => paging.update({ sortDir: e.target.value, page: 0 })}
        >
          <MenuItem value="asc">Artan</MenuItem>
          <MenuItem value="desc">Azalan</MenuItem>
        </TextField>
      </Box>
      <TablePagination
        component="div"
        count={total}
        page={paging.page}
        rowsPerPage={paging.size}
        rowsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={(_, page) => paging.update({ page })}
        onRowsPerPageChange={(e) =>
          paging.update({ size: Number(e.target.value), page: 0 })
        }
        labelRowsPerPage="Satır:"
        labelDisplayedRows={({ from, to, count }) =>
          from + "–" + to + " / " + count
        }
        getItemAriaLabel={(type) =>
          type === "next" ? "Sonraki sayfa" : "Önceki sayfa"
        }
        sx={{ ".MuiTablePagination-toolbar": { px: 0, flexWrap: "wrap" } }}
      />
    </Box>
  );
}
