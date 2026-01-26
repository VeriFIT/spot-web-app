import React from "react";
import { createRoot } from "react-dom/client";
import LtlApps from "./LtlApp";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme, StyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider as StylesThemeProvider } from "@mui/styles";

const theme = createTheme({
  typography: {
    fontSize: 14,
    body1: {
      fontSize: "0.875rem",
    },
    body2: {
      fontSize: "0.875rem",
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "4px 8px",
        },
      },
    },
  },
});

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <StylesThemeProvider theme={theme}>
        <CssBaseline />
        <LtlApps />
      </StylesThemeProvider>
    </ThemeProvider>
  </StyledEngineProvider>
);
