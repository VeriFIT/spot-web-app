import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

/** A definition list: the terms of a mode list, of the acceptance conditions. */
export function Terms({ children }: { children?: ReactNode }) {
  return <dl>{children}</dl>;
}

/**
 * One term and its explanation, as a `<dt>`/`<dd>` pair. The name is a node
 * rather than a string so that a term can be a link to what it names.
 */
export function Term({ name, children }: { name: ReactNode; children?: ReactNode }) {
  return (
    <>
      <dt>
        <Typography variant="body2">{name}</Typography>
      </dt>
      <dd>{children}</dd>
    </>
  );
}
