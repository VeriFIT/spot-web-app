import type { ReactNode } from "react";

/** A formula, set as code so the operators stand out from the prose. */
export function Ltl({ f }: { f: ReactNode }) {
  return (
    <code>
      <b>{f}</b>
    </code>
  );
}
