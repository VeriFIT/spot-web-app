// Lato, the face the diagrams are drawn with: the four faces the theme asks for
// are declared here (see lato.css) rather than read from the site's spot.css,
// so the app owns the font it paints with.
import "./lato.css";

import { createRoot } from "react-dom/client";
import App from "./App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router";

import { theme } from "./theme";

const container = document.getElementById("root");
if (container === null) throw new Error("index.html is missing its #root element");
const root = createRoot(container);
root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* The mode is the first path segment, under the /app/ base Vite bakes in. */}
      <BrowserRouter basename="/app">
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StyledEngineProvider>
);
