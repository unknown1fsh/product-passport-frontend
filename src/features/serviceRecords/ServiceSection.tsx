import { useState } from "react";

import {
  Box,
  Button,
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
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";

import { useResource } from "../../shared/hooks/useResource";
import type { PageResponse } from "../../shared/types";
import { ErrorNotice, Loading } from "../../shared/ui/Feedback";
import { useAuth } from "../auth/AuthProvider";
import { serviceRecordApi } from "./api";
import { ServiceForm } from "./ServiceForm";
import type { ServiceRecord } from "./types";
import { ApiError } from "../../shared/api/http";

export function ServiceSection({ passportId }: { passportId: string }) {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord>();

  const [removingRecord, setRemovingRecord] = useState<ServiceRecord>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<unknown>();

  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy: "serviceDate",
    sortDir: "desc",
  }).toString();

  const { data, error, loading, reload } = useResource<
    PageResponse<ServiceRecord>
  >("/service-records/product/" + passportId + "?" + query);
  const accessDenied = error instanceof ApiError && error.status === 403;

  const canManage =
    user?.role === "ADMIN" ||
    (user?.role === "MANUFACTURER" && data !== undefined && !accessDenied);

  async function remove() {
    if (!removingRecord) return;

    setDeleteBusy(true);
    setDeleteError(undefined);

    try {
      await serviceRecordApi.remove(removingRecord.publicId);

      setRemovingRecord(undefined);
      reload();
    } catch (e) {
      setDeleteError(e);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="overline" color="primary">
          SERVİS
        </Typography>

        <Typography component="h2" variant="h5">
          Servis geçmişi
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Ürüne ait bakım ve servis kayıtlarını inceleyin.
        </Typography>

        {canManage && (
          <Button
            variant="contained"
            onClick={() => {
              setEditingRecord(undefined);
              setFormOpen(true);
            }}
            sx={{ mt: 2 }}
          >
            Servis kaydı ekle
          </Button>
        )}
      </Box>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNotice error={error} retry={reload} />
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table aria-label="Servis geçmişi">
              <TableHead>
                <TableRow>
                  <TableCell>Servis tarihi</TableCell>
                  <TableCell>Açıklama</TableCell>
                  {canManage && <TableCell>İşlem</TableCell>}
                </TableRow>
              </TableHead>

              <TableBody>
                {data?.content.map((record) => (
                  <TableRow key={record.publicId} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {record.serviceDate}
                    </TableCell>

                    <TableCell>{record.description}</TableCell>

                    {canManage && (
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditingRecord(record);
                            setFormOpen(true);
                          }}
                        >
                          Düzenle
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            setRemovingRecord(record);
                            setDeleteError(undefined);
                          }}
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
                      colSpan={canManage ? 3 : 2}
                      sx={{ py: 6, textAlign: "center" }}
                    >
                      Bu ürüne ait servis kaydı bulunamadı.
                      {page > 0 && (
                        <Button onClick={() => setPage(0)}>
                          İlk sayfaya dön
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={data?.totalElements || 0}
            page={page}
            rowsPerPage={size}
            rowsPerPageOptions={[10, 20, 50, 100]}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            labelRowsPerPage="Satır:"
            labelDisplayedRows={({ from, to, count }) =>
              from + "–" + to + " / " + count
            }
          />
        </Paper>
      )}

      {formOpen && (
        <ServiceForm
          productId={passportId}
          record={editingRecord}
          onClose={() => {
            setFormOpen(false);
            setEditingRecord(undefined);
          }}
          onSaved={() => {
            setFormOpen(false);
            setEditingRecord(undefined);
            reload();
          }}
        />
      )}

      {removingRecord && (
        <Dialog
          open
          onClose={() => {
            if (!deleteBusy) {
              setRemovingRecord(undefined);
              setDeleteError(undefined);
            }
          }}
          aria-labelledby="service-delete-title"
        >
          <DialogTitle id="service-delete-title">
            Servis kaydı silinsin mi?
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2}>
              <DialogContentText>
                {removingRecord.serviceDate} tarihli servis kaydını silmek
                üzeresiniz. Bu işlem geri alınamaz.
              </DialogContentText>

              {deleteError !== undefined && <ErrorNotice error={deleteError} />}
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button
              disabled={deleteBusy}
              onClick={() => {
                setRemovingRecord(undefined);
                setDeleteError(undefined);
              }}
            >
              Vazgeç
            </Button>

            <Button
              variant="contained"
              color="error"
              disabled={deleteBusy}
              onClick={() => void remove()}
            >
              {deleteBusy ? "Siliniyor…" : "Silmeyi onayla"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
