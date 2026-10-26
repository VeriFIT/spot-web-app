import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

import { NoteIcon } from "./icons";

/** A note, with its icon in front. A flex row, not a table: it is one line of text. */
const NoteRow = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1),
}));

export function NoteText(props) {
  return (
    <NoteRow component="div">
      <NoteIcon />
      <span>{props.text}</span>
    </NoteRow>
  );
}
