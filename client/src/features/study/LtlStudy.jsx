import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

import { getStudy, studyUrl } from "../../api/client";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useDelayedFlag } from "../../hooks/useDelayedFlag";
import { Ltl } from "../../components/Ltl";
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

/** One classification of the formula, separated from the next one. */
const Section = styled("div")({ paddingBottom: 10 });

/** The Manna-Pnueli hierarchy is drawn to the right of its text. */
const HierarchySvg = styled(SVGInline)({ float: "right" });

/** Body of the study tab, as a function of the answer so it stays pure. */
function studyResult(res) {
  if (!("mp_class_text" in res)) return null;
  return (
    <React.Fragment>
      <Section>
        <HierarchySvg svg={res["mp_hierarchy_svg"]} />
        <Typography variant="body2" color="primary">
          Hierarchy of Manna and Pnueli
        </Typography>
        <Typography>
          This formula describes <b>{res["mp_class_text"]}</b>.
        </Typography>
        {"pathological" in res && res["pathological"] === true && (
          <Typography>
            Note that this is a <b>pathological formula</b> that would not be classified
            as precisely using only syntactic means. This usually means that a simpler
            equivalent formula exists.
          </Typography>
        )}
        <Typography variant="body2" color="primary">
          Syntactic-Future Hierarchy
        </Typography>
        <Typography>
          This formula belongs to {classhelp(res["sfh_class"], res["sfh_class_text"])}.
        </Typography>
        {"pathological" in res && res["pathological"] === "sfh" && (
          <Typography>
            Note this syntactic class is above the corresponding class from the Manna and
            Pnueli hierarchy, this means that an equivalent formula exists in a lower
            syntactic class.
          </Typography>
        )}
      </Section>
      <Section>
        <Typography variant="body2" color="primary">
          Safety-Liveness classification
        </Typography>
        {res["safety_liveness"] === "safety" && (
          <Typography>
            This formula represents <b>a safety property</b>.
          </Typography>
        )}
        {res["safety_liveness"] === "liveness" && (
          <Typography>
            This formula represents <b>a liveness property</b>.
          </Typography>
        )}
        {res["safety_liveness"] === "both" && (
          <Typography>
            This formula represents both <b>a safety and a liveness property</b>.
          </Typography>
        )}
        {res["safety_liveness"] === "none" && (
          <Typography>
            This formula is neither a safety nor a liveness property. However it
            necessarily is the <b>intersection</b> of a liveness and a safety property.
          </Typography>
        )}
      </Section>
      <Section>
        <Typography variant="body2" color="primary">
          Indices
        </Typography>
        {(res["Rabin_index"] !== null || res["Streett_index"] !== null) && (
          <WordTable>
            <TableBody>
              <WordTableRow>
                <WordTableCell component="th" scope="row">
                  Rabin index:
                </WordTableCell>
                <WordTableCellBold>{res["Rabin_index"]}</WordTableCellBold>
              </WordTableRow>
              <WordTableRow>
                <WordTableCell component="th" scope="row">
                  Streett index:
                </WordTableCell>
                <WordTableCellBold>{res["Streett_index"]}</WordTableCellBold>
              </WordTableRow>
            </TableBody>
          </WordTable>
        )}
      </Section>
      <Section>
        <Typography variant="body2" color="primary">
          Satisfiability
        </Typography>
        {res["rej_word"] === null && (
          <Typography>
            This formula is a <b>tautology</b>: it accepts all words.
          </Typography>
        )}
        {res["acc_word"] === null && (
          <Typography>
            This formula is <b>unsatisfiable</b>.
          </Typography>
        )}
        {res["acc_word"] !== null && res["rej_word"] !== null && (
          <WordTable>
            <TableBody>
              <WordTableRow>
                <WordTableCell component="th" scope="row">
                  Accepted word:
                </WordTableCell>
                <WordTableCellBold>{res["acc_word"]}</WordTableCellBold>
              </WordTableRow>
              <WordTableRow>
                <WordTableCell component="th" scope="row">
                  Rejected word:
                </WordTableCell>
                <WordTableCellBold>{res["rej_word"]}</WordTableCellBold>
              </WordTableRow>
            </TableBody>
          </WordTable>
        )}
      </Section>
      <div>
        <Typography variant="body2" color="primary">
          Stutter invariance
        </Typography>
        {res["stutter_invariant"] === "no X" && (
          <Typography>
            This formula is (syntactically) <b>stutter-invariant</b>.
          </Typography>
        )}
        {res["stutter_invariant"] === true && (
          <Typography>
            This formula is <b>stutter-invariant</b> even if it might not look so
            syntactically.
            {"stutter_invariant_eq" in res && (
              <>
                <br />
                Furthermore, it can be simplified to the following{" "}
                <i>syntactically stutter-invariant</i> formula:
                <br />
                <Ltl f={res["stutter_invariant_eq"]} />
              </>
            )}
          </Typography>
        )}
        {res["stutter_invariant"] === false && (
          <Typography>
            This formula is <b>stutter-sensitive</b>.<br />
            The accepted and rejected words given above are a proof of that, as they
            differ only by some stuttering.
          </Typography>
        )}
      </div>
    </React.Fragment>
  );
}

export function LtlStudy(props) {
  const { formula } = props;

  // The request URL identifies the query: it only changes when the formula
  // does, which is exactly when a new request is needed.
  const requestUrl = React.useMemo(
    () => (formula === "" ? null : studyUrl(formula)),
    [formula]
  );
  const { data, error, loading } = useApiQuery(requestUrl, getStudy);
  const showSpinner = useDelayedFlag(loading, 800);

  // Report the parse information to the formula input, and clear a previous
  // error when the formula is emptied.
  const { handleAnyParseError } = props;
  React.useEffect(() => {
    if (data !== null) handleAnyParseError(data);
    else if (requestUrl === null) handleAnyParseError({});
  }, [data, requestUrl, handleAnyParseError]);

  let result = null;
  if (error !== null) result = renderError(error);
  else if (showSpinner)
    result = <CircularProgress sx={{ display: "block", margin: "auto" }} />;
  else if (data !== null) result = studyResult(data);

  return <div>{result && <LtlResult result={result} />}</div>;
}
