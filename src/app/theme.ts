import { createTheme } from "@mui/material/styles";
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#176351", dark: "#113c33" },
    secondary: { main: "#b46b32" },
    background: { default: "#f5f6f3", paper: "#ffffff" },
    text: { primary: "#20382f", secondary: "#62736c" },
    divider: "#e0e7e2",
  },
  typography: {
    fontFamily: '"Segoe UI", Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-.04em" },
    h5: { fontWeight: 700, letterSpacing: "-.025em" },
    h6: { fontWeight: 650 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiTableCell: {
      styleOverrides: {
        head: { backgroundColor: "#f6f8f5", fontWeight: 650, color: "#52685d" },
      },
    },
    MuiTextField: { defaultProps: { fullWidth: true } },
    MuiCard: { styleOverrides: { root: { border: "1px solid #e0e7e2" } } },
  },
});
