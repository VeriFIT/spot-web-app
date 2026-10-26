import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

/** The panel holding whatever the active tab's request produced. */
const ResultPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1),
  overflow: "auto",
}));

export function LtlResult({ result }: { result: ReactNode }) {
  return <ResultPaper>{result}</ResultPaper>;
}
