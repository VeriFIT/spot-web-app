// Roboto, self-hosted: the regular, medium and bold the panels ask for, plus
// the italic of the help prose. The theme names Roboto first, so the app paints
// with it, and the faces are served from the bundle, not from a font CDN.
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/400-italic.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

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
