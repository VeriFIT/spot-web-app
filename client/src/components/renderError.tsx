import type { ReactElement } from "react";
import Typography from "@mui/material/Typography";

/** The API's own errors carry a status code, so a timeout can be explained. */
type CodedError = Error & { status?: number };

export function renderError(error: CodedError): ReactElement {
  const msg = error.message;
  if (error.status !== 500) return <pre>{msg}</pre>;
  return (
    <>
      <pre>{msg}</pre>
      <Typography color="error">
        Our server automatically kills requests that take longer than 40 seconds, or that
        require too much memory.
        <br /> If you do <i>not</i> think that is the case here, please send a screenshot
        and any helpful detail to{" "}
        <a href="mailto:spot@lrde.epita.fr">
          <code>spot@lrde.epita.fr</code>
        </a>
        .<br />
        If you <i>do</i> think that is the case, please consider{" "}
        <a href="https://spot.lre.epita.fr/install.html">installing Spot</a> to run your
        experiments locally; this is a shared service.
      </Typography>
    </>
  );
}
