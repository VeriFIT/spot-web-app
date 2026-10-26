import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

// The word tables of the study and compare panels. The surrounding result
// panel already draws the borders, so the rows keep their natural height and
// the cells drop Material's bottom rule; only the labels are bold.

export const WordTable = styled(Table)({
  width: "auto",
});

export const WordTableRow = styled(TableRow)({
  height: "auto",
});

export const WordTableCell = styled(TableCell)({
  borderBottom: "none",
});

export const WordTableCellBold = styled(TableCell)({
  borderBottom: "none",
  fontWeight: "bold",
});
