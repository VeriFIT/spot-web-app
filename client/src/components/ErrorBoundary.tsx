import React from "react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

/** Stands in for a panel that failed to render, in the same place and shape. */
const FallbackPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(2),
  width: 624,
  maxWidth: "100%",
}));

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  error: unknown;
}

/**
 * Keeps a render error inside the panel that raised it. Without a boundary, one
 * unexpected response — a renamed field, a `note` that is not an array, an SVG
 * the browser refuses — unmounts the whole page and leaves a blank screen.
 *
 * React has no hook form for this, so it stays a class component.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // The fallback is deliberately terse, so keep the details in the console.
    console.error("Rendering failed", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error === null) return this.props.children;

    return (
      <FallbackPaper>
        <Typography variant="h6" color="error" gutterBottom>
          This panel could not be displayed
        </Typography>
        <Typography variant="body1" gutterBottom>
          Something in it failed to render, most likely because the server answered in an
          unexpected shape. Reloading the page usually clears it; if it keeps happening,
          please report it to <a href="mailto:spot@lrde.epita.fr">spot@lrde.epita.fr</a>{" "}
          with the message below.
        </Typography>
        <pre style={{ overflow: "auto" }}>
          {error instanceof Error ? error.message : String(error)}
        </pre>
        <Button color="primary" onClick={() => window.location.reload()}>
          Reload the page
        </Button>
      </FallbackPaper>
    );
  }
}
