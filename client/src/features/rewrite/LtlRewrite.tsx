import React from "react";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

import { getRewrite, rewriteUrl } from "../../api/client";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useDelayedFlag } from "../../hooks/useDelayedFlag";
import { LtlResult } from "../../components/LtlResult";
import { righthelp } from "../../components/optionHelp";
import {
  ChoiceListItem,
  ChoiceMenuItem,
  ExpertOptionGroup,
  OptionGroup,
} from "../../components/OptionWidgets";
import { renderError } from "../../components/renderError";
import { SVGInline } from "../../components/SVGInline";
import { useOptions } from "../../options";
import type { SimplificationOptions, UnabbrevOptions } from "../../options";
import type { ParseInfo } from "../../api/types";

/** What the rewrite tab needs from the panel that owns the formula input. */
export interface LtlRewriteProps {
  formula: string;
  handleAnyParseError: (res: ParseInfo) => void;
}

/** Entries of the output-syntax menu, in display order. */
const SYNTAX_OPTIONS: Record<string, string> = {
  o: "Output syntax: Spot",
  l: "Output syntax: LBT/LTL2DSTAR",
  i: "Output syntax: Spin",
  g: "Show Abstract Syntax Tree",
};

function LtlSyntaxChoice() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const { options, setOption } = useOptions();

  const chooseSyntax = (key: string) => {
    setOption("syntax", key);
    setAnchorEl(null);
  };

  return (
    <div>
      <List component="nav">
        <ChoiceListItem
          aria-haspopup="true"
          aria-controls="syntax-menu"
          aria-label="LTL syntax to output"
          aria-expanded={Boolean(anchorEl)}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <ListItemText primary={SYNTAX_OPTIONS[options.syntax]} />
          <ExpandMoreIcon color="primary" />
        </ChoiceListItem>
      </List>
      <Menu
        id="syntax-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {Object.entries(SYNTAX_OPTIONS).map(([key, option]) => (
          <ChoiceMenuItem
            key={key}
            selected={key === options.syntax}
            onClick={() => chooseSyntax(key)}
          >
            {option}
          </ChoiceMenuItem>
        ))}
      </Menu>
    </div>
  );
}

/** Entries of the simplification options, in display order. */
const SIMPLIFICATION_OPTIONS = {
  br: "basic rewritings",
  lf: "allow simplified formulas to be larger",
  si: "reductions based on syntactic implications",
  eu: "reductions based on pure eventualities and purely universal formulas",
  lc: "reduction based on automata-based containments",
  fs: "enable rules that favor suspendable formulas at the top level",
  pn: "NNF rewriting should stop on Boolean subformulas",
  bi: "rewrite Boolean subformulas to irredundant-sum-of-products",
};

function LtlSimplificationOptions() {
  const { options, toggleOption } = useOptions();

  return (
    <ExpertOptionGroup component="fieldset">
      <FormLabel component="legend">Simplification options</FormLabel>
      {Object.entries(SIMPLIFICATION_OPTIONS).map(([key, value]) => (
        <FormControlLabel
          key={key}
          disabled={!options.simplify}
          control={
            <Checkbox
              checked={options.ltlsimp[key as keyof SimplificationOptions]}
              onChange={() => toggleOption("ltlsimp", key)}
            />
          }
          label={value}
        />
      ))}
    </ExpertOptionGroup>
  );
}

/** Un-abbreviation options of the infix syntaxes, in display order. */
const UNABBREV_OPTIONS_1: Record<string, [string, string, string]> = {
  F: ["F", "<>", "F"],
  G: ["G", "[]", "G"],
  R: ["R", "V", "V"],
  M: ["M", "M", "M"],
  W: ["W", "W", "W"],
};

/** Un-abbreviation options of the infix syntaxes, continuing `UNABBREV_OPTIONS_1`. */
const UNABBREV_OPTIONS_2: Record<string, [string, string, string]> = {
  i: ["->", "->", "i"],
  e: ["<->", "<->", "e"],
  "^": ["xor", "xor", "^"],
};

/** A checkbox of the "Unabbreviate" group: the rows are packed tighter. */
const UnabbrevLabel = styled(FormControlLabel)({
  marginRight: 16,
  marginBottom: -8,
  marginTop: -8,
  "& .MuiFormControlLabel-label": { marginLeft: -8 },
});

function LtlUnabbrevOptions() {
  // Each option is labelled with its notation in the selected output syntax.
  const { options, toggleOption } = useOptions();
  const syntaxId = options.syntax === "i" ? 1 : options.syntax === "l" ? 2 : 0;

  const option = ([key, values]: [string, [string, string, string]]) => (
    <UnabbrevLabel
      key={key}
      control={
        <Checkbox
          checked={options.unabbrev[key as keyof UnabbrevOptions]}
          disabled={syntaxId === 1 && "MW^".indexOf(key) >= 0}
          onChange={() => toggleOption("unabbrev", key)}
          color="primary"
        />
      }
      label={<code>{values[syntaxId]}</code>}
    />
  );

  return (
    <OptionGroup component="fieldset" sx={{ flexDirection: "row", flexWrap: "wrap" }}>
      <FormLabel component="legend">
        {righthelp(
          "Unabbreviate",
          "Remove occurrences of selected operators by rewriting them using other operators."
        )}
      </FormLabel>
      <span>{Object.entries(UNABBREV_OPTIONS_1).map(option)}</span>
      <span>{Object.entries(UNABBREV_OPTIONS_2).map(option)}</span>
    </OptionGroup>
  );
}

export function LtlRewrite(props: LtlRewriteProps) {
  const { formula, handleAnyParseError } = props;
  const { options, setOption } = useOptions();
  const { syntax, simplify, ltlsimp, unabbrev, delta2, hideoptions, expert } = options;

  // The request URL identifies the query: it only changes when the formula or
  // one of the options does, which is exactly when a new request is needed.
  const requestUrl = React.useMemo(
    () =>
      formula === ""
        ? null
        : rewriteUrl(formula, { syntax, simplify, ltlsimp, unabbrev, delta2 }),
    [formula, syntax, simplify, ltlsimp, unabbrev, delta2]
  );
  const { data, error, loading } = useApiQuery(requestUrl, getRewrite);
  const showSpinner = useDelayedFlag(loading, 800);

  // Report a parse failure (and any prefix-syntax fallback) to the formula
  // input, which is owned by the parent.
  React.useEffect(() => {
    if (data !== null) handleAnyParseError(data);
  }, [data, handleAnyParseError]);

  let result: React.ReactNode = null;
  if (error !== null) result = renderError(error);
  else if (showSpinner)
    result = <CircularProgress sx={{ display: "block", margin: "auto" }} />;
  else if (data !== null) {
    if ("formula" in data) result = <Typography>{data.formula}</Typography>;
    else if ("svg" in data) result = <SVGInline svg={data.svg} />;
    else if ("error" in data) result = <Typography>{data.error}</Typography>;
  }

  return (
    <React.Fragment>
      {hideoptions || (
        <React.Fragment>
          <LtlSyntaxChoice />
          <FormControlLabel
            control={
              <Switch
                checked={simplify}
                onChange={(event) => setOption("simplify", event.target.checked)}
                value="simplify"
                color="primary"
              />
            }
            label="Simplify"
          />
          <LtlUnabbrevOptions />
          {expert && <LtlSimplificationOptions />}
          <FormControlLabel
            control={
              <Switch
                checked={delta2}
                onChange={(event) => setOption("delta2", event.target.checked)}
                value="delta2"
                color="primary"
              />
            }
            label="Rewrite as Δ₂"
          />
        </React.Fragment>
      )}
      {result && <LtlResult result={result} />}
    </React.Fragment>
  );
}
