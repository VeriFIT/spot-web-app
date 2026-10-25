import Paper from "@mui/material/Paper";

export function LtlResult(props) {
  return <Paper className={props.classes.results}>{props.result}</Paper>;
}
