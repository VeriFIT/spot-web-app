import React from "react";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

import { getTranslate, translateUrl } from "../../api/client";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useDelayedFlag } from "../../hooks/useDelayedFlag";
import { LtlResult } from "../../components/LtlResult";
import { NoteText } from "../../components/NoteText";
import { righthelp } from "../../components/optionHelp";
import { renderError } from "../../components/renderError";
import { SVGInline } from "../../components/SVGInline";
import {
  ChoiceListItem,
  ChoiceMenuItem,
  ExpertOptionGroup,
  OptionGroup,
} from "../../components/OptionWidgets";
import { useOptions } from "../../options";

/** The option groups of the translate panel, side by side. */
const OptionsRow = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
});

/** A label of an option group; these groups stack their labels. */
const VerticalLabel = styled(FormControlLabel)({ marginRight: 0 });

/** The HOA or NeverClaim source shown under the automaton. */
const SourceText = styled("pre")({
  overflow: "auto",
  whiteSpace: "pre-wrap",
  width: "100%",
  margin: 0,
});

/** The automaton drawing of the translate panel. */
const AutomatonSvg = styled(SVGInline)({
  overflow: "auto",
  marginLeft: -4,
  marginRight: -4,
  display: "block",
});

/** Entries of the acceptance-condition menu, in display order. */
const ACCEPTANCE_OPTIONS = {
  m: "Acceptance: monitor (all runs accepting)",
  c: "Acceptance: co-Büchi",
  b: "Acceptance: Büchi",
  g: "Acceptance: Generalized Büchi",
  p: "Acceptance: parity",
  e: "Acceptance: Emerson-Lei (generic acceptance)",
};

function AccChoice() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { options, setOption } = useOptions();

  const chooseAcc = (key) => {
    setOption("acc", key);
    setAnchorEl(null);
  };

  return (
    <div>
      <List component="nav">
        <ChoiceListItem
          aria-haspopup="true"
          aria-controls="acc-menu"
          aria-label="Acceptance to use"
          aria-expanded={Boolean(anchorEl)}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <ListItemText primary={ACCEPTANCE_OPTIONS[options.acc]} />
          <ExpandMoreIcon color="primary" />
        </ChoiceListItem>
      </List>
      <Menu
        id="acc-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {Object.entries(ACCEPTANCE_OPTIONS).map(([key, option]) => (
          <ChoiceMenuItem
            key={key}
            selected={key === options.acc}
            onClick={() => chooseAcc(key)}
          >
            {option}
          </ChoiceMenuItem>
        ))}
      </Menu>
    </div>
  );
}

/** Body of the translate tab; `showfile` picks the source shown, if any. */
function translateResult(res, showfile, showfilehoa, showfilespin) {
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
      {"automaton_svg" in res && <AutomatonSvg svg={res["automaton_svg"]} />}
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
      {showfile === 1 && <SourceText>{res["automaton_hoa"]}</SourceText>}
      {showfile === 2 && <SourceText>{res["automaton_spin"]}</SourceText>}
    </React.Fragment>
  );
}

/** Option widgets of the translate tab. */
function TranslateOptions() {
  const { options, setOption, toggleOption } = useOptions();
  const { acc, autpref, optlevel, minmax, oddeven, transopts, hideoptions, expert } =
    options;

  return (
    <React.Fragment>
      {hideoptions || (
        <React.Fragment>
          <AccChoice />
          <OptionsRow>
            <OptionGroup component="fieldset">
              <FormLabel component="legend">Translation pref.</FormLabel>
              <RadioGroup
                aria-label="Translation preferences"
                name="autpref"
                value={autpref}
                onChange={(event) => setOption("autpref", event.target.value)}
              >
                <VerticalLabel
                  value="s"
                  control={<Radio color="primary" />}
                  label="small"
                />
                <VerticalLabel
                  value="d"
                  control={<Radio color="primary" />}
                  label="deterministic"
                />
                {(expert || autpref === "a") && (
                  <VerticalLabel value="a" control={<Radio />} label="any" />
                )}
              </RadioGroup>
            </OptionGroup>
            <OptionGroup component="fieldset">
              <FormLabel component="legend">Translation constraints</FormLabel>
              <VerticalLabel
                control={
                  <Checkbox
                    checked={transopts["complete"]}
                    color="primary"
                    onChange={() => toggleOption("transopts", "complete")}
                  />
                }
                label={righthelp(
                  "complete",
                  "Make sure we can always move forward in the automaton, regardless of where we are and what letter we read."
                )}
              />
              <VerticalLabel
                control={
                  <Checkbox
                    checked={transopts["unambiguous"]}
                    color="primary"
                    onChange={() => toggleOption("transopts", "unambiguous")}
                  />
                }
                label={righthelp(
                  "unambiguous",
                  "Accepted words should have only one accepting run.  Rejecting words may be rejected by many runs."
                )}
              />
              <VerticalLabel
                control={
                  <Checkbox
                    checked={transopts["statebased"]}
                    color="primary"
                    disabled={acc === "m"}
                    onChange={() => toggleOption("transopts", "statebased")}
                  />
                }
                label={righthelp(
                  "force state-based acc.",
                  "Automata with state-based acceptance are sometimes larger than those with transition-based acceptance, and never smaller.  By defaut we use state-based acceptance only when it is clear that transition-based acceptance has no benefit."
                )}
              />
            </OptionGroup>
            <OptionGroup component="fieldset">
              <FormLabel component="legend">Display options</FormLabel>
              <VerticalLabel
                control={
                  <Checkbox
                    checked={transopts["showscc"]}
                    color="primary"
                    onChange={() => toggleOption("transopts", "showscc")}
                  />
                }
                label={righthelp(
                  "show SCCs",
                  "Strongly Connected Components will be highlighted in green (accepting), red (rejecting), black (transient), and gray (rejecting and useless)."
                )}
              />
              <VerticalLabel
                control={
                  <Checkbox
                    checked={transopts["showndet"]}
                    color="primary"
                    onChange={() => toggleOption("transopts", "showndet")}
                  />
                }
                label={"show non-determinism"}
              />
              <VerticalLabel
                control={
                  <Checkbox
                    checked={transopts["forcetacc"]}
                    color="primary"
                    onChange={() => toggleOption("transopts", "forcetacc")}
                    disabled={acc === "m"}
                  />
                }
                label={righthelp(
                  "force transition-based acc.",
                  "If an automaton with state-based acceptance has been built, move the acceptance marks of each state to its outgoing transitions.  (This is actually how automata are stored in Spot.)"
                )}
              />
            </OptionGroup>
            {acc === "p" && (
              <OptionGroup component="fieldset">
                <FormLabel component="legend">Parity style</FormLabel>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={transopts["colored"]}
                      color="primary"
                      onChange={() => toggleOption("transopts", "colored")}
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
                  value={minmax}
                  onChange={(event) => setOption("minmax", event.target.value)}
                  sx={{ flexDirection: "row" }}
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
                  value={oddeven}
                  onChange={(event) => setOption("oddeven", event.target.value)}
                  sx={{ flexDirection: "row" }}
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
              </OptionGroup>
            )}
            {expert && (
              <ExpertOptionGroup component="fieldset">
                <FormLabel component="legend">Optimization level</FormLabel>
                <RadioGroup
                  aria-label="Optimization level"
                  name="optlevel"
                  value={optlevel}
                  sx={{ flexDirection: "row" }}
                  onChange={(event) => setOption("optlevel", event.target.value)}
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
              </ExpertOptionGroup>
            )}
          </OptionsRow>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export function LtlTranslate(props) {
  const { formula, handleAnyParseError } = props;
  const { options } = useOptions();
  const { acc, autpref, optlevel, minmax, oddeven, transopts } = options;

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
  React.useEffect(() => {
    if (data !== null) handleAnyParseError(data);
  }, [data, handleAnyParseError]);

  let result = null;
  if (error !== null) result = renderError(error);
  else if (showSpinner)
    result = <CircularProgress sx={{ display: "block", margin: "auto" }} />;
  else if (data !== null)
    result = translateResult(data, showfile, showfilehoa, showfilespin);

  return (
    <React.Fragment>
      <TranslateOptions />
      {result && <LtlResult result={result} />}
    </React.Fragment>
  );
}
