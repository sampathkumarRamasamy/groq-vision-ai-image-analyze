"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7c5cfc" },
    secondary: { main: "#5b8af7" },
    background: {
      default: "#0d0e14",
      paper: "#1a1d2e",
    },
    error: { main: "#ef4444" },
    success: { main: "#22c55e" },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, fontSize: "15px" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#20243a",
          "& fieldset": { borderColor: "rgba(255,255,255,0.07)" },
          "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
          "&.Mui-focused fieldset": { borderColor: "#7c5cfc" },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
  },
});

export default function Providers({ children }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
