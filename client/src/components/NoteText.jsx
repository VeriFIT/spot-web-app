import Typography from "@mui/material/Typography";

import { NoteIcon } from "./icons";

export function NoteText(props) {
  return (
    <Typography component="div">
      <table>
        <tbody>
          <tr>
            <td>
              <NoteIcon {...props} />
            </td>
            <td>{props.text}</td>
          </tr>
        </tbody>
      </table>
    </Typography>
  );
}
