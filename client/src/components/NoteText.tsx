import type { ReactNode } from "react";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

import { NoteIcon } from "./icons";

/**
 * A note, with its icon in front. A flex row, not a table: it is one line of
 * text.
 *
 * Asserted back to `Typography` because Material's `styled` drops the
 * polymorphic `component` prop, and the row has to be a div: a note holds an
 * icon, which is not phrasing content.
 */
const NoteRow = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1),
})) as typeof Typography;

export function NoteText({ text }: { text: ReactNode }) {
  return (
    <NoteRow component="div">
      <NoteIcon />
      <span>{text}</span>
    </NoteRow>
  );
}
