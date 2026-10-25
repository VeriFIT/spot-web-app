import React from "react";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

import { getRewrite, rewriteUrl } from "../../api/client";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useDelayedFlag } from "../../hooks/useDelayedFlag";
import { LtlResult } from "../../components/LtlResult";
import { righthelp } from "../../components/optionHelp";
import { renderError } from "../../components/renderError";
import { SVGInline } from "../../components/SVGInline";

/** Entries of the output-syntax menu, in display order. */
const SYNTAX_OPTIONS = {
  o: "Output syntax: Spot",
  l: "Output syntax: LBT/LTL2DSTAR",
  i: "Output syntax: Spin",
  g: "Show Abstract Syntax Tree",
};

function LtlSyntaxChoice(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { classes } = props;

  const chooseSyntax = (key) => {
    props.changeSyntax(key);
    setAnchorEl(null);
  };

  return (
    <div className={classes.ltlsyntax}>
      <List component="nav">
        <ListItem
          button
          aria-haspopup="true"
          aria-controls="syntax-menu"
          aria-label="LTL syntax to output"
          aria-expanded={Boolean(anchorEl)}
          className={classes.choicelistitem}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <ListItemText primary={SYNTAX_OPTIONS[props.syntax]} />
          <ExpandMoreIcon className={classes.choiceicon} />
        </ListItem>
      </List>
      <Menu
        id="syntax-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {Object.entries(SYNTAX_OPTIONS).map(([key, option]) => (
          <MenuItem
            key={key}
            className={classes.choicemenuitem}
            selected={key === props.syntax}
            onClick={() => chooseSyntax(key)}
          >
            {option}
          </MenuItem>
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

function LtlSimplificationOptions(props) {
  const { classes } = props;

  return (
    <FormControl component="fieldset" className={classes.borderedgroupsecondary}>
      <FormLabel component="legend" classes={{ focused: classes.focused }}>
        Simplification options
      </FormLabel>
      {Object.entries(SIMPLIFICATION_OPTIONS).map(([key, value]) => (
        <FormControlLabel
          key={key}
          disabled={!props.simplify}
          control={
            <Checkbox
              checked={props.ltlsimp[key]}
              onChange={props.handleChangeLtlSimp(key)}
            />
          }
          label={value}
        />
      ))}
    </FormControl>
  );
}

/** Un-abbreviation options of the infix syntaxes, in display order. */
const UNABBREV_OPTIONS_1 = {
  F: ["F", "<>", "F"],
  G: ["G", "[]", "G"],
  R: ["R", "V", "V"],
  M: ["M", "M", "M"],
  W: ["W", "W", "W"],
};

/** Un-abbreviation options of the infix syntaxes, continuing `UNABBREV_OPTIONS_1`. */
const UNABBREV_OPTIONS_2 = {
  i: ["->", "->", "i"],
  e: ["<->", "<->", "e"],
  "^": ["xor", "xor", "^"],
};

function LtlUnabbrevOptions(props) {
  // Each option is labelled with its notation in the selected output syntax.
  const syntaxId = props.syntax === "i" ? 1 : props.syntax === "l" ? 2 : 0;
  const { classes } = props;

  const option = ([key, values]) => (
    <FormControlLabel
      key={key}
      control={
        <Checkbox
          checked={props.unabbrev[key]}
          disabled={syntaxId === 1 && "MW^".indexOf(key) >= 0}
          onChange={props.handleChangeLtlUnabbrev(key)}
          color="primary"
        />
      }
      classes={{
        root: classes.unabbrevboxroot,
        label: classes.unabbrevboxlabel,
      }}
      label={<code>{values[syntaxId]}</code>}
    />
  );

  return (
    <FormControl
      component="fieldset"
      className={`${classes.borderedgroupprimary} ${classes.unabbrev}`}
    >
      <FormLabel component="legend">
        {righthelp(
          "Unabbreviate",
          "Remove occurrences of selected operators by rewriting them using other operators."
        )}
      </FormLabel>
      <span>{Object.entries(UNABBREV_OPTIONS_1).map(option)}</span>
      <span>{Object.entries(UNABBREV_OPTIONS_2).map(option)}</span>
    </FormControl>
  );
}

export function LtlRewrite(props) {
  const { classes, formula, syntax, simplify, ltlsimp, unabbrev, delta2 } = props;

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
  const { handleAnyParseError } = props;
  React.useEffect(() => {
    if (data !== null) handleAnyParseError(data);
  }, [data, handleAnyParseError]);

  let result = null;
  if (error !== null) result = renderError(error);
  else if (showSpinner) result = <CircularProgress className={classes.progress} />;
  else if (data !== null) {
    if ("formula" in data) result = <Typography>{data.formula}</Typography>;
    else if ("svg" in data) result = <SVGInline svg={data.svg} />;
    else if ("error" in data) result = <Typography>{data.error}</Typography>;
  }

  return (
    <React.Fragment>
      {props.hideoptions || (
        <React.Fragment>
          <LtlSyntaxChoice
            syntax={syntax}
            classes={classes}
            changeSyntax={props.changeSyntax}
          />
          <FormControlLabel
            control={
              <Switch
                checked={simplify}
                onChange={props.handleChecked("simplify")}
                value="simplify"
                color="primary"
              />
            }
            label="Simplify"
          />
          <LtlUnabbrevOptions
            handleChangeLtlUnabbrev={props.handleChangeLtlUnabbrev}
            unabbrev={unabbrev}
            classes={classes}
            syntax={syntax}
          />
          {props.expert && (
            <LtlSimplificationOptions
              classes={classes}
              ltlsimp={ltlsimp}
              simplify={simplify}
              handleChangeLtlSimp={props.handleChangeLtlSimp}
            />
          )}
          <FormControlLabel
            control={
              <Switch
                checked={delta2}
                onChange={props.handleChecked("delta2")}
                value="delta2"
                color="primary"
              />
            }
            label="Rewrite as Δ₂"
          />
        </React.Fragment>
      )}
      {result && <LtlResult classes={classes} result={result} />}
    </React.Fragment>
  );
}
