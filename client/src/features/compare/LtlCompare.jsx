import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { compareUrl, getCompare } from "../../api/client";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useDelayedFlag } from "../../hooks/useDelayedFlag";
import { LtlInput } from "../../components/LtlInput";
import { LtlResult } from "../../components/LtlResult";
import { classhelp } from "../../components/optionHelp";
import { renderError } from "../../components/renderError";
import { SVGInline } from "../../components/SVGInline";
import { useOptions } from "../../options";

/** Body of the compare tab, as a function of the answer so it stays pure. */
function compareResult(res, classes) {
  if (!("txt" in res && "svg" in res)) return null;
  return (
    <React.Fragment>
      {"txt" in res && <Typography>{res["txt"]}</Typography>}
      {"svg" in res && <SVGInline svg={res["svg"]} className={classes.vendiag} />}
      <Table className={classes.wordtable}>
        <TableBody>
          {"w1" in res && (
            <TableRow className={classes.wordtablerow}>
              <TableCell component="th" scope="row" className={classes.wordtablecell}>
                w₁:
              </TableCell>
              <TableCell className={classes.wordtablecellw}>{res["w1"]}</TableCell>
            </TableRow>
          )}
          {"w2" in res && (
            <TableRow className={classes.wordtablerow}>
              <TableCell component="th" scope="row" className={classes.wordtablecell}>
                w₂:
              </TableCell>
              <TableCell className={classes.wordtablecellw}>{res["w2"]}</TableCell>
            </TableRow>
          )}
          {"w3" in res && (
            <TableRow className={classes.wordtablerow}>
              <TableCell component="th" scope="row" className={classes.wordtablecell}>
                w₃:
              </TableCell>
              <TableCell className={classes.wordtablecellw}>{res["w3"]}</TableCell>
            </TableRow>
          )}
          {"w4" in res && (
            <TableRow className={classes.wordtablerow}>
              <TableCell component="th" scope="row" className={classes.wordtablecell}>
                w₄:
              </TableCell>
              <TableCell className={classes.wordtablecellw}>{res["w4"]}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {"sfh1" in res && (
        <Typography>
          Although they are equivalent,
          <ul className={classes.nottopmargin}>
            <li>First formula belongs to {classhelp(res["sfh1"], res["sfh1_text"])},</li>
            <li>Second formula belongs to {classhelp(res["sfh2"], res["sfh2_text"])}.</li>
          </ul>
        </Typography>
      )}
    </React.Fragment>
  );
}

export function LtlCompare(props) {
  const { classes, formula, formula2 } = props;
  const { options } = useOptions();

  const requestUrl = React.useMemo(
    () => (formula === "" || formula2 === "" ? null : compareUrl(formula, formula2)),
    [formula, formula2]
  );
  const { data, error, loading } = useApiQuery(requestUrl, getCompare);
  const showSpinner = useDelayedFlag(loading, 800);

  // The answer describes both formulas: the first one is reported to the
  // parent, which owns that input, the second one belongs to the input here.
  const [formula2err, setFormula2err] = React.useState(null);
  const [formula2lbt, setFormula2lbt] = React.useState(false);
  const { handleAnyParseError } = props;
  React.useEffect(() => {
    if (data === null) return;
    handleAnyParseError(data);
    setFormula2err("parse_error2" in data ? data.parse_error2 : null);
    setFormula2lbt(data.prefix_syntax2 === true);
  }, [data, handleAnyParseError]);

  let result = null;
  if (error !== null) result = renderError(error);
  else if (showSpinner) result = <CircularProgress className={classes.progress} />;
  else if (data !== null) result = compareResult(data, classes);

  return (
    <React.Fragment>
      <LtlInput
        classes={classes}
        className={classes.textField2}
        label="Second formula"
        expert={options.expert}
        defaultValue={formula2}
        setFormula={props.handleChangeFormula2}
        formulalbt={formula2lbt}
        formulaerr={formula2err}
      />
      {result && <LtlResult classes={classes} result={result} />}
    </React.Fragment>
  );
}
