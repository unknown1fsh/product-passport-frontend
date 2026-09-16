import { useState } from "react";

import {
  Box,
  Button,
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
import { ServiceForm } from "./ServiceForm";

import type { ServiceRecord } from "./types";

export function ServiceSection({ passportId }: { passportId: string }) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [formOpen, setFormOpen] = useState(false);

  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy: "serviceDate",
    sortDir: "desc",
  }).toString();

  const { data, error, loading, reload } = useResource<
    PageResponse<ServiceRecord>
  >("/service-records/product/" + passportId + "?" + query);

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
        <Button
          variant="contained"
          onClick={() => setFormOpen(true)}
          sx={{ mt: 2 }}
        >
          Servis kaydı ekle
        </Button>
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
                </TableRow>
              </TableHead>

              <TableBody>
                {data?.content.map((record) => (
                  <TableRow key={record.publicId} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {record.serviceDate}
                    </TableCell>

                    <TableCell>{record.description}</TableCell>
                  </TableRow>
                ))}

                {!data?.content.length && (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ py: 6, textAlign: "center" }}>
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
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            reload();
          }}
        />
      )}
    </Stack>
  );
}
