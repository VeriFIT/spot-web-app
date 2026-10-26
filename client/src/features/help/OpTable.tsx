import { styled } from "@mui/material/styles";
import type { ReactNode } from "react";

/**
 * The row of notations accepted for one category of operators. The cells line
 * up because every `Op` of a table takes the width given to the table.
 */
const OpTableBox = styled("div")({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  width: "100%",
  justifyContent: "space-around",
});

const OpPair = styled("div")({
  display: "block",
  padding: 2,
  margin: 2,
  backgroundColor: "#EEEEEE",
});

const OpDesc = styled("div")({ float: "left" });
const OpSyn = styled("div")({ float: "right" });

/** Wraps the `Op` rows of one category, which all share the same width. */
export function OpTable({ width, children }: { width: string; children?: ReactNode }) {
  return <OpTableBox sx={{ "& > div": { width } }}>{children}</OpTableBox>;
}

/** One row of an `OpTable`: the name of an operator and its notations. */
export function Op({ name, children }: { name: string; children?: ReactNode }) {
  return (
    <OpPair>
      <OpDesc>{name}:</OpDesc>
      <OpSyn>{children}</OpSyn>
    </OpPair>
  );
}
