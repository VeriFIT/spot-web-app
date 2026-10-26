import type { ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";

import { LtlResult } from "./LtlResult";
import { renderError } from "./renderError";

interface TabResultProps<Data> {
  /** Why the request failed, if it did. */
  error: Error | null;
  /** The request has been pending long enough to be worth showing. */
  showSpinner: boolean;
  /** The last answer, or null before the first one. */
  data: Data | null;
  /** The body of the tab for an answer. */
  render: (data: Data) => ReactNode;
}

/**
 * What a tab shows below its options: the error of its request, a spinner while
 * it waits, or the body its answer renders to. All four tabs ask the server the
 * same way, so they answer in the same way too.
 */
export function TabResult<Data>({
  error,
  showSpinner,
  data,
  render,
}: TabResultProps<Data>) {
  let result: ReactNode = null;
  if (error !== null) result = renderError(error);
  else if (showSpinner) {
    result = <CircularProgress sx={{ display: "block", margin: "auto" }} />;
  } else if (data !== null) result = render(data);

  return result === null ? null : <LtlResult result={result} />;
}
