import React from "react";
import Button from "@mui/material/Button";
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
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";

import { getTranslate, translateUrl } from "../../api/client";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useDelayedFlag } from "../../hooks/useDelayedFlag";
import { LtlResult } from "../../components/LtlResult";
import { NoteText } from "../../components/NoteText";
import { righthelp } from "../../components/optionHelp";
import { renderError } from "../../components/renderError";
import { SVGInline } from "../../components/SVGInline";

/** Entries of the acceptance-condition menu, in display order. */
const ACCEPTANCE_OPTIONS = {
  m: "Acceptance: monitor (all runs accepting)",
  c: "Acceptance: co-Büchi",
  b: "Acceptance: Büchi",
  g: "Acceptance: Generalized Büchi",
  p: "Acceptance: parity",
  e: "Acceptance: Emerson-Lei (generic acceptance)",
};

function AccChoice(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { classes } = props;

  const chooseAcc = (key) => {
    props.changeAcc(key);
    setAnchorEl(null);
  };

  return (
    <div className={classes.ltlsyntax}>
      <List component="nav">
        <ListItem
          button
          aria-haspopup="true"
          aria-controls="acc-menu"
          aria-label="Acceptance to use"
          aria-expanded={Boolean(anchorEl)}
          className={classes.choicelistitem}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <ListItemText primary={ACCEPTANCE_OPTIONS[props.acc]} />
          <ExpandMoreIcon className={classes.choiceicon} />
        </ListItem>
      </List>
      <Menu
        id="acc-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {Object.entries(ACCEPTANCE_OPTIONS).map(([key, option]) => (
          <MenuItem
            key={key}
            className={classes.choicemenuitem}
            selected={key === props.acc}
            onClick={() => chooseAcc(key)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

/** Body of the translate tab; `showfile` picks the source shown, if any. */
function translateResult(res, classes, showfile, showfilehoa, showfilespin) {
  return (
    <React.Fragment>
      {"states" in res && (
        <Typography>
          {res["det"] ? "D" : "Non-d"}
          eterministic automaton with {res["states"]} state
          {res["states"] > 1 ? "s" : ""} and {res["edges"]} edge
          {res["edges"] > 1 ? "s" : ""}.
        </Typography>
      )}
      {"note" in res && res["note"].map((note) => <NoteText key={note} text={note} />)}
      {"automaton_svg" in res && (
        <SVGInline
          className={classes.automaton_svg}
          component="div"
          svg={res["automaton_svg"]}
        />
      )}
      {"automaton_hoa" in res && (
        <Button color="primary" onClick={showfilehoa}>
          HOA
        </Button>
      )}
      {"automaton_spin" in res && (
        <Button color="primary" onClick={showfilespin}>
          NeverClaim
        </Button>
      )}
      {showfile === 1 && <pre className={classes.pre}>{res["automaton_hoa"]}</pre>}
      {showfile === 2 && <pre className={classes.pre}>{res["automaton_spin"]}</pre>}
    </React.Fragment>
  );
}

/** Option widgets of the translate tab. */
function translateOptions(props) {
  return (
    <React.Fragment>
      {props.hideoptions || (
        <React.Fragment>
          <AccChoice
            acc={props.acc}
            classes={props.classes}
            changeAcc={props.changeAcc}
          />
          <div className={props.classes.optionstrans}>
            <FormControl
              component="fieldset"
              className={props.classes.borderedgroupprimary}
            >
              <FormLabel component="legend">Translation pref.</FormLabel>
              <RadioGroup
                aria-label="Translation preferences"
                name="autpref"
                value={props.autpref}
                onChange={props.changeAutpref}
              >
                <FormControlLabel
                  classes={{ root: props.classes.fclvertical }}
                  value="s"
                  control={<Radio color="primary" />}
                  label="small"
                />
                <FormControlLabel
                  classes={{ root: props.classes.fclvertical }}
                  value="d"
                  control={<Radio color="primary" />}
                  label="deterministic"
                />
                {(props.expert || props.autpref === "a") && (
                  <FormControlLabel
                    classes={{ root: props.classes.fclvertical }}
                    value="a"
                    control={<Radio />}
                    label="any"
                  />
                )}
              </RadioGroup>
            </FormControl>
            <FormControl
              component="fieldset"
              className={props.classes.borderedgroupprimary}
            >
              <FormLabel component="legend">Translation constraints</FormLabel>
              <FormControlLabel
                classes={{ root: props.classes.fclvertical }}
                control={
                  <Checkbox
                    checked={props.transopts["complete"]}
                    color="primary"
                    onChange={props.handleChangeTransOpts("complete")}
                  />
                }
                label={righthelp(
                  "complete",
                  "Make sure we can always move forward in the automaton, regardless of where we are and what letter we read."
                )}
              />
              <FormControlLabel
                classes={{ root: props.classes.fclvertical }}
                control={
                  <Checkbox
                    checked={props.transopts["unambiguous"]}
                    color="primary"
                    onChange={props.handleChangeTransOpts("unambiguous")}
                  />
                }
                label={righthelp(
                  "unambiguous",
                  "Accepted words should have only one accepting run.  Rejecting words may be rejected by many runs."
                )}
              />
              <FormControlLabel
                classes={{ root: props.classes.fclvertical }}
                control={
                  <Checkbox
                    checked={props.transopts["statebased"]}
                    color="primary"
                    disabled={props.acc === "m"}
                    onChange={props.handleChangeTransOpts("statebased")}
                  />
                }
                label={righthelp(
                  "force state-based acc.",
                  "Automata with state-based acceptance are sometimes larger than those with transition-based acceptance, and never smaller.  By defaut we use state-based acceptance only when it is clear that transition-based acceptance has no benefit."
                )}
              />
            </FormControl>
            <FormControl
              component="fieldset"
              className={props.classes.borderedgroupprimary}
            >
              <FormLabel component="legend">Display options</FormLabel>
              <FormControlLabel
                classes={{ root: props.classes.fclvertical }}
                control={
                  <Checkbox
                    checked={props.transopts["showscc"]}
                    color="primary"
                    onChange={props.handleChangeTransOpts("showscc")}
                  />
                }
                label={righthelp(
                  "show SCCs",
                  "Strongly Connected Components will be highlighted in green (accepting), red (rejecting), black (transient), and gray (rejecting and useless)."
                )}
              />
              <FormControlLabel
                classes={{ root: props.classes.fclvertical }}
                control={
                  <Checkbox
                    checked={props.transopts["showndet"]}
                    color="primary"
                    onChange={props.handleChangeTransOpts("showndet")}
                  />
                }
                label={"show non-determinism"}
              />
              <FormControlLabel
                classes={{ root: props.classes.fclvertical }}
                control={
                  <Checkbox
                    checked={props.transopts["forcetacc"]}
                    color="primary"
                    onChange={props.handleChangeTransOpts("forcetacc")}
                    disabled={props.acc === "m"}
                  />
                }
                label={righthelp(
                  "force transition-based acc.",
                  "If an automaton with state-based acceptance has been built, move the acceptance marks of each state to its outgoing transitions.  (This is actually how automata are stored in Spot.)"
                )}
              />
            </FormControl>
            {props.acc === "p" && (
              <FormControl
                component="fieldset"
                className={props.classes.borderedgroupprimary}
              >
                <FormLabel component="legend">Parity style</FormLabel>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={props.transopts["colored"]}
                      color="primary"
                      onChange={props.handleChangeTransOpts("colored")}
                    />
                  }
                  label={righthelp(
                    "colored",
                    "Force each transition (or state if state-based acceptance is used) to belong to exactly one acceptance set.  Without this option some transitions may not belong to any set."
                  )}
                />
                <RadioGroup
                  aria-label="min or max"
                  name="minmax"
                  value={props.minmax}
                  onChange={props.changeMinMax}
                  className={props.classes.flexhoriz}
                >
                  <FormControlLabel
                    value="any"
                    control={<Radio color="primary" />}
                    label="any"
                  />
                  <FormControlLabel
                    value="min"
                    control={<Radio color="primary" />}
                    label="min"
                  />
                  <FormControlLabel
                    value="max"
                    control={<Radio color="primary" />}
                    label="max"
                  />
                </RadioGroup>
                <RadioGroup
                  aria-label="odd or even"
                  name="oddeven"
                  value={props.oddeven}
                  onChange={props.changeOddEven}
                  className={props.classes.flexhoriz}
                >
                  <FormControlLabel
                    value="any"
                    control={<Radio color="primary" />}
                    label="any"
                  />
                  <FormControlLabel
                    value="odd"
                    control={<Radio color="primary" />}
                    label="odd"
                  />
                  <FormControlLabel
                    value="even"
                    control={<Radio color="primary" />}
                    label="even"
                  />
                </RadioGroup>
              </FormControl>
            )}
            {props.expert && (
              <FormControl
                component="fieldset"
                className={props.classes.borderedgroupsecondary}
              >
                <FormLabel
                  component="legend"
                  classes={{ focused: props.classes.focused }}
                >
                  Optimization level
                </FormLabel>
                <RadioGroup
                  aria-label="Optimization level"
                  name="optlevel"
                  value={props.optlevel}
                  className={props.classes.flexhoriz}
                  onChange={props.changeOptLevel}
                >
                  <FormControlLabel
                    value="h"
                    control={<Radio color="secondary" />}
                    label="high"
                  />
                  <FormControlLabel
                    value="m"
                    control={<Radio color="secondary" />}
                    label="medium"
                  />
                  <FormControlLabel
                    value="l"
                    control={<Radio color="secondary" />}
                    label="low"
                  />
                </RadioGroup>
              </FormControl>
            )}
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export function LtlTranslate(props) {
  const { classes, formula, acc, autpref, optlevel, minmax, oddeven, transopts } = props;

  const requestUrl = React.useMemo(
    () =>
      formula === ""
        ? null
        : translateUrl(formula, { acc, autpref, optlevel, minmax, oddeven, transopts }),
    [formula, acc, autpref, optlevel, minmax, oddeven, transopts]
  );
  const { data, error, loading } = useApiQuery(requestUrl, getTranslate);
  const showSpinner = useDelayedFlag(loading, 800);

  // Which source, if any, is expanded under the automaton.
  const [showfile, setShowfile] = React.useState(0);
  const showfilehoa = () => setShowfile(showfile === 1 ? 0 : 1);
  const showfilespin = () => setShowfile(showfile === 2 ? 0 : 2);

  // Report the parse information to the formula input.
  const { handleAnyParseError } = props;
  React.useEffect(() => {
    if (data !== null) handleAnyParseError(data);
  }, [data, handleAnyParseError]);

  let result = null;
  if (error !== null) result = renderError(error);
  else if (showSpinner) result = <CircularProgress className={classes.progress} />;
  else if (data !== null)
    result = translateResult(data, classes, showfile, showfilehoa, showfilespin);

  return (
    <React.Fragment>
      {translateOptions(props)}
      {result && <LtlResult classes={classes} result={result} />}
    </React.Fragment>
  );
}
