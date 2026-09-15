import {
  Alert,
  Box,
  Button,
  Chip,
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
import ArrowBack from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../auth/AuthProvider";
import { PassportForm } from "./PassportForm";
import { Link, useParams } from "react-router-dom";
import type { Passport,PageResponse } from "../../shared/types";
import { usePageQuery } from "../../shared/hooks/usePageQuery";
import { useResource } from "../../shared/hooks/useResource";
import { PageControls } from "../../shared/ui/PageControls";
import { ErrorNotice, Loading } from "../../shared/ui/Feedback";
import { MessagePage } from "../../app/Layout";
import { useState } from "react";
export function PassportList() {
  const paging = usePageQuery("serialNumber", [
    "serialNumber",
    "purchaseDate",
    "createdAt",
  ]);
  const { data, error, loading, reload } = useResource<PageResponse<Passport>>(
    "/product-passports?" + paging.query,
  );
  const canCreate = ["ADMIN", "MANUFACTURER"].includes(useAuth().user?.role ?? "");
  const [editor, setEditor] = useState<Passport | null | undefined>();
  const [notice, setNotice] = useState("");
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
            ÜRÜN KAYITLARI
          </Typography>
          <Typography component="h1" variant="h4">
            Ürün pasaportları
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Ürün bilgilerini ve satın alma kayıtlarını inceleyin.
          </Typography>
        </Box>
        {canCreate && (
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setEditor(null)}
            >
              Yeni pasaport
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
        <Paper variant="outlined">
          <TableContainer>
            <Table aria-label="Ürün pasaportları">
              <TableHead>
                <TableRow>
                  <TableCell>Seri numarası</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Satın alma</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Detay</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.content.map((p) => (
                  <TableRow key={p.publicId} hover>
                    <TableCell
                      sx={{ fontFamily: "monospace", fontWeight: 600 }}
                    >
                      {p.serialNumber}
                    </TableCell>
                    <TableCell>{p.productModelName}</TableCell>
                    <TableCell>{p.categoryName}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {p.purchaseDate}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={p.active ? "success" : "default"}
                        label={p.active ? "Aktif" : "Pasif"}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={"/pasaportlar/" + p.publicId}
                        aria-label={p.serialNumber + " detay"}
                      >
                        İncele
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.content.length && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 6 }}>
                      Bu sayfada pasaport bulunamadı.
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
                { value: "serialNumber", label: "Seri numarası" },
                { value: "purchaseDate", label: "Satın alma" },
                { value: "createdAt", label: "Oluşturulma" },
              ]}
            />
          </Box>
        </Paper>
      )}
      {editor !== undefined && (
          <PassportForm
              passport={editor || undefined}
              onClose={() => setEditor(undefined)}
              onSaved={() => {
                setEditor(undefined);
                setNotice("Pasaport kaydedildi.");
                reload();
              }}
          />
      )}
    </Stack>
  );
}
export function PassportDetail() {
  const { id } = useParams();
  if (
    !id ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    return (
      <MessagePage
        title="Geçersiz pasaport adresi"
        description="Listeden bir ürün pasaportu seçin."
      />
    );
  return <Detail id={id} />;
}
function Detail({ id }: { id: string }) {
  const { data, error, loading, reload } = useResource<Passport>(
    "/product-passports/" + id,
  );
  return (
    <Stack spacing={3}>
      <Button
        component={Link}
        to="/pasaportlar"
        startIcon={<ArrowBack />}
        sx={{ alignSelf: "flex-start" }}
      >
        Pasaportlara dön
      </Button>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNotice error={error} retry={reload} />
      ) : (
        data && (
          <>
            <Box>
              <Typography variant="overline" color="primary">
                ÜRÜN PASAPORTU
              </Typography>
              <Typography component="h1" variant="h4">
                {data.serialNumber}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {data.productModelName} · {data.categoryName}
              </Typography>
            </Box>
            <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Ürün bilgileri
              </Typography>
              <Box
                component="dl"
                sx={{
                  m: 0,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                }}
              >
                {[
                  ["Seri numarası", data.serialNumber],
                  ["Model", data.productModelName],
                  ["Kategori", data.categoryName],
                  ["Satın alma tarihi", data.purchaseDate],
                  ["Fatura numarası", data.invoiceNumber || "Belirtilmedi"],
                  ["Durum", data.active ? "Aktif" : "Pasif"],
                  ["Açıklama", data.description || "Açıklama eklenmemiş"],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <Typography
                      component="dt"
                      variant="body2"
                      color="text.secondary"
                    >
                      {label}
                    </Typography>
                    <Typography
                      component="dd"
                      sx={{
                        m: 0,
                        mt: 0.7,
                        fontWeight: 550,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </>
        )
      )}
    </Stack>
  );
}
