import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

import { compareUrl, getCompare } from "../../api/client";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useDelayedFlag } from "../../hooks/useDelayedFlag";
import { LtlInput } from "../../components/LtlInput";
import { LtlResult } from "../../components/LtlResult";
import { classhelp } from "../../components/optionHelp";
import { renderError } from "../../components/renderError";
import { SVGInline } from "../../components/SVGInline";
import {
  WordTable,
  WordTableCell,
  WordTableCellBold,
  WordTableRow,
} from "../../components/WordTable";
import { useOptions } from "../../options";

/** The Venn diagram of the two languages, to the right of the text. */
const VennDiagram = styled(SVGInline)({ float: "right" });

/** The two syntactic classes listed under the Venn diagram. */
const ToplessList = styled("ul")({ marginTop: 0 });

/** Body of the compare tab, as a function of the answer so it stays pure. */
function compareResult(res) {
  if (!("txt" in res && "svg" in res)) return null;
  return (
    <React.Fragment>
      {"txt" in res && <Typography>{res["txt"]}</Typography>}
      {"svg" in res && <VennDiagram svg={res["svg"]} />}
      <WordTable>
        <TableBody>
          {"w1" in res && (
            <WordTableRow>
              <WordTableCell component="th" scope="row">
                w₁:
              </WordTableCell>
              <WordTableCellBold>{res["w1"]}</WordTableCellBold>
            </WordTableRow>
          )}
          {"w2" in res && (
            <WordTableRow>
              <WordTableCell component="th" scope="row">
                w₂:
              </WordTableCell>
              <WordTableCellBold>{res["w2"]}</WordTableCellBold>
            </WordTableRow>
          )}
          {"w3" in res && (
            <WordTableRow>
              <WordTableCell component="th" scope="row">
                w₃:
              </WordTableCell>
              <WordTableCellBold>{res["w3"]}</WordTableCellBold>
            </WordTableRow>
          )}
          {"w4" in res && (
            <WordTableRow>
              <WordTableCell component="th" scope="row">
                w₄:
              </WordTableCell>
              <WordTableCellBold>{res["w4"]}</WordTableCellBold>
            </WordTableRow>
          )}
        </TableBody>
      </WordTable>
      {"sfh1" in res && (
        <Typography>
          Although they are equivalent,
          <ToplessList>
            <li>First formula belongs to {classhelp(res["sfh1"], res["sfh1_text"])},</li>
            <li>Second formula belongs to {classhelp(res["sfh2"], res["sfh2_text"])}.</li>
          </ToplessList>
        </Typography>
      )}
    </React.Fragment>
  );
}

export function LtlCompare(props) {
  const { formula, formula2 } = props;
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
  else if (showSpinner)
    result = <CircularProgress sx={{ display: "block", margin: "auto" }} />;
  else if (data !== null) result = compareResult(data);

  return (
    <React.Fragment>
      <LtlInput
        highlight="second"
        label="Second formula"
        expert={options.expert}
        defaultValue={formula2}
        setFormula={props.handleChangeFormula2}
        formulalbt={formula2lbt}
        formulaerr={formula2err}
      />
      {result && <LtlResult result={result} />}
    </React.Fragment>
  );
}
