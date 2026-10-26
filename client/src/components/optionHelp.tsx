import type { ReactNode } from "react";
import Tooltip from "@mui/material/Tooltip";

export function righthelp(contents: ReactNode, help: ReactNode) {
  return (
    <Tooltip title={help} placement="right" enterDelay={750}>
      <div>{contents}</div>
    </Tooltip>
  );
}

export function classhelp(contents: string | undefined, help?: string) {
  if (contents === "") contents = "a class above Δ₂";
  else contents = "class " + contents;
  return (
    <>
      <Tooltip title={help} placement="right" enterDelay={750}>
        <b>{contents}</b>
      </Tooltip>
    </>
  );
}
