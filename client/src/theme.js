import { createTheme } from "@mui/material/styles";

/**
 * The application theme: smaller type than Material's default, and tighter
 * cells for the word and index tables of the result panels.
 */
export const theme = createTheme({
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
