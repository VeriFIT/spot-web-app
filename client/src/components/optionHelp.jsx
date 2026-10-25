import React from "react";
import Tooltip from "@mui/material/Tooltip";

export function righthelp(contents, help) {
  return (
    <Tooltip title={help} placement="right" enterDelay={750}>
      <div>{contents}</div>
    </Tooltip>
  );
}

export function classhelp(contents, help) {
  if (contents === "") contents = "a class above Δ₂";
  else contents = "class " + contents;
  return (
    <React.Fragment>
      <Tooltip title={help} placement="right" enterDelay={750}>
        <b>{contents}</b>
      </Tooltip>
    </React.Fragment>
  );
}
