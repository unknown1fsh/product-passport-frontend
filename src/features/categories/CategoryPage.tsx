import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../auth/AuthProvider";
import { usePageQuery } from "../../shared/hooks/usePageQuery";
import { useResource } from "../../shared/hooks/useResource";
import type { Category, PageResponse } from "../../shared/types";
import { PageControls } from "../../shared/ui/PageControls";
import { Loading, ErrorNotice } from "../../shared/ui/Feedback";
import { CategoryForm } from "./CategoryForm";
import { categoryApi } from "./api";
export function CategoryPage() {
  const admin = useAuth().user?.role === "ADMIN";
  const paging = usePageQuery("name", ["name", "code", "createdAt"]);
  const { data, error, loading, reload } = useResource<PageResponse<Category>>(
    "/categories?" + paging.query,
  );
  const [editor, setEditor] = useState<Category | null | undefined>();
  const [removing, setRemoving] = useState<Category>();
  const [deleteError, setDeleteError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function remove() {
    if (!removing) return;
    setBusy(true);
    setDeleteError(undefined);
    try {
      await categoryApi.remove(removing.publicId);
      setRemoving(undefined);
      setNotice("Kategori silindi.");
      if (data?.content.length === 1 && paging.page > 0)
        paging.update({ page: paging.page - 1 });
      else reload();
    } catch (e) {
      setDeleteError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="overline" color="primary">
            KATALOG
          </Typography>
          <Typography component="h1" variant="h4">
            Kategoriler
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Ürünlerinizi anlamlı gruplar altında düzenleyin.
          </Typography>
        </Box>
        {admin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setEditor(null)}
          >
            Yeni kategori
          </Button>
        )}
      </Box>
      {notice && (
        <Alert onClose={() => setNotice("")} severity="success">
          {notice}
        </Alert>
      )}
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNotice error={error} retry={reload} />
      ) : (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <TableContainer>
            <Table aria-label="Kategoriler">
              <TableHead>
                <TableRow>
                  <TableCell>Kod</TableCell>
                  <TableCell>Kategori adı</TableCell>
                  <TableCell>Durum</TableCell>
                  {admin && <TableCell align="right">İşlemler</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.content.map((category) => (
                  <TableRow key={category.publicId} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {category.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                      {category.description && (
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={category.active ? "Aktif" : "Pasif"}
                        color={category.active ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    {admin && (
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Button
                          size="small"
                          onClick={() => setEditor(category)}
                          aria-label={category.name + " düzenle"}
                        >
                          Düzenle
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            setRemoving(category);
                            setDeleteError(undefined);
                          }}
                          aria-label={category.name + " sil"}
                        >
                          Sil
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {!data?.content.length && (
                  <TableRow>
                    <TableCell
                      colSpan={admin ? 4 : 3}
                      sx={{ py: 6, textAlign: "center" }}
                    >
                      Bu sayfada kategori bulunamadı.
                      {paging.page > 0 && (
                        <Button onClick={() => paging.update({ page: 0 })}>
                          İlk sayfaya dön
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ px: 2 }}>
            <PageControls
              paging={paging}
              total={data?.totalElements || 0}
              sorts={[
                { value: "name", label: "Kategori adı" },
                { value: "code", label: "Kod" },
                { value: "createdAt", label: "Oluşturulma" },
              ]}
            />
          </Box>
        </Paper>
      )}
      {admin && editor !== undefined && (
        <CategoryForm
          category={editor || undefined}
          onClose={() => setEditor(undefined)}
          onSaved={() => {
            setEditor(undefined);
            setNotice("Kategori kaydedildi.");
            reload();
          }}
        />
      )}
      {admin && removing && (
        <Dialog
          open
          onClose={() => {
            if (!busy) setRemoving(undefined);
          }}
          aria-labelledby="delete-title"
        >
          <DialogTitle id="delete-title">Kategori silinsin mi?</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <DialogContentText>
                {removing.name} kategorisini silmek üzeresiniz. Bağlı pasaport
                varsa silme işlemi reddedilir.
              </DialogContentText>
              {deleteError !== undefined && <ErrorNotice error={deleteError} />}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button disabled={busy} onClick={() => setRemoving(undefined)}>
              Vazgeç
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={busy}
              onClick={() => void remove()}
            >
              {busy ? "Siliniyor…" : "Silmeyi onayla"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
