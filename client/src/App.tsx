import React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import HelpIcon from "@mui/icons-material/Help";
import { styled } from "@mui/material/styles";
import { Navigate, Route, Routes, useParams } from "react-router";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { CloseIcon, DupeIcon } from "./components/icons";
import { LtlInput } from "./components/LtlInput";
import { Versions } from "./components/Versions";
import { LtlCompare } from "./features/compare/LtlCompare";
import { Help } from "./features/help/Help";
import { LtlRewrite } from "./features/rewrite/LtlRewrite";
import { LtlStudy } from "./features/study/LtlStudy";
import { LtlTranslate } from "./features/translate/LtlTranslate";
import { useUrlState } from "./hooks/useUrlState";
import type { UrlState } from "./hooks/useUrlState";
import { INITIAL_OPTIONS, OptionsProvider, optionsReducer, setAction } from "./options";
import type { Options, OptionsChange } from "./options";
import type { ParseInfo } from "./api/types";
import { actionOfMode, DEFAULT_MODE } from "./urlState";

/** The page lays the panels out side by side, centered when there is room. */
const Toplevel = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  [theme.breakpoints.up("sm")]: {
    justifyContent: "center",
  },
}));

/** One analyser panel: its formula input, its tabs, and their results. */
const Panel = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1),
  width: 624,
  minWidth: 624,
  [theme.breakpoints.down("sm")]: {
    marginLeft: 0,
    marginRight: 0,
  },
}));

const AppTab = styled(Tab)(({ theme }) => ({
  maxWidth: 150,
  minWidth: 50,
  fontSize: theme.typography.pxToRem(14),
}));

/** The help, duplicate and close buttons in the header of a panel. */
const WindowButton = styled(IconButton)({ float: "right" });

/** One panel of the page: `state` is set for the primary panel only. */
interface LtlAppProps {
  state?: UrlState;
  /** The help, duplicate and close buttons drawn in the panel header. */
  topright?: React.ReactNode;
}

function LtlApp(props: LtlAppProps) {
  // The primary panel keeps its options and formulas in the URL; the duplicate
  // one, opened next to it, is just local state.
  const urlState = props.state;

  const [localOptions, localDispatch] = React.useReducer(optionsReducer, INITIAL_OPTIONS);
  // The formula being analysed, and the parse information the server reported
  // for it. Neither is an option: they come from the input, not from a menu.
  const [localFormula, setLocalFormula] = React.useState("");
  const [localFormula2, setLocalFormula2] = React.useState("");
  const [formulaerr, setFormulaerr] = React.useState<string | null>(null);
  const [formulalbt, setFormulalbt] = React.useState(false);

  // Expert mode and "hide all options" change what is shown rather than what is
  // asked of the server, so they stay out of the URL even for the primary panel.
  const [uiOptions, setUiOptions] = React.useState({
    expert: INITIAL_OPTIONS.expert,
    hideoptions: INITIAL_OPTIONS.hideoptions,
  });

  const baseOptions = urlState === undefined ? localOptions : urlState.options;
  const options = React.useMemo(
    () => ({ ...baseOptions, ...uiOptions }),
    [baseOptions, uiOptions]
  );

  const dispatch = React.useCallback(
    (change: OptionsChange) => {
      if (
        change.type === "set" &&
        (change.name === "expert" || change.name === "hideoptions")
      ) {
        setUiOptions((previous) => ({ ...previous, [change.name]: change.value }));
        return;
      }
      if (urlState === undefined) localDispatch(change);
      else urlState.dispatch(change);
    },
    [urlState, localDispatch]
  );

  const formula = urlState === undefined ? localFormula : urlState.formula;
  const formula2 = urlState === undefined ? localFormula2 : urlState.formula2;
  const setFormula = urlState === undefined ? setLocalFormula : urlState.setFormula;
  const setFormula2 = urlState === undefined ? setLocalFormula2 : urlState.setFormula2;

  // The tabs read the options from the context; only the controls rendered
  // here need the setter directly.
  const setOption = <K extends keyof Options>(name: K, value: Options[K]) =>
    dispatch(setAction(name, value));
  const changeAction = (_event: React.SyntheticEvent, value: number) =>
    setOption("action", value);
  const handleChecked =
    (name: "expert" | "hideoptions") => (event: React.ChangeEvent<HTMLInputElement>) =>
      setOption(name, event.target.checked);

  // The tabs call this from an effect, so its identity must be stable; the
  // setters it uses are.
  const handleAnyParseError = React.useCallback((res: ParseInfo) => {
    setFormulaerr("parse_error" in res ? (res.parse_error ?? null) : null);
    setFormulalbt(res.prefix_syntax === true);
  }, []);

  const { topright } = props;
  const { action, expert, hideoptions } = options;

  return (
    <OptionsProvider options={options} dispatch={dispatch}>
      <ErrorBoundary>
        <Panel>
          {topright}
          {expert && <Versions />}
          <FormControlLabel
            style={{ marginLeft: 0 }}
            control={
              <Switch
                checked={expert}
                onChange={handleChecked("expert")}
                value="expert"
              />
            }
            label="Expert mode"
          />
          {(expert || hideoptions) && (
            <FormControlLabel
              control={
                <Switch
                  checked={hideoptions}
                  disabled={action === 1 || action === 2}
                  onChange={handleChecked("hideoptions")}
                  color="secondary"
                  value="hideoptions"
                />
              }
              label="Hide all options"
            />
          )}
          <Tabs
            value={action}
            onChange={changeAction}
            centered
            indicatorColor="primary"
            textColor="primary"
          >
            <AppTab value={0} label="Rewrite" />
            <AppTab value={1} label="Study" />
            <AppTab value={2} label="Compare" />
            <AppTab value={3} label="Translate" />
          </Tabs>
          <LtlInput
            highlight={action === 2 ? "first" : undefined}
            label={action === 2 ? "First formula" : "Input formula"}
            expert={expert}
            autoFocus
            defaultValue={formula}
            setFormula={setFormula}
            formulalbt={formulalbt}
            formulaerr={formulaerr}
          />
          {action === 0 && (
            <LtlRewrite formula={formula} handleAnyParseError={handleAnyParseError} />
          )}
          {action === 1 && (
            <LtlStudy formula={formula} handleAnyParseError={handleAnyParseError} />
          )}
          {action === 2 && (
            <LtlCompare
              formula={formula}
              formula2={formula2}
              handleChangeFormula2={setFormula2}
              handleAnyParseError={handleAnyParseError}
            />
          )}
          {action === 3 && (
            <LtlTranslate formula={formula} handleAnyParseError={handleAnyParseError} />
          )}
        </Panel>
      </ErrorBoundary>
    </OptionsProvider>
  );
}
function LtlApps({ action }: { action: number }) {
  // A second panel can be opened next to the first one, and the help panel can
  // be opened over them. Both are all-or-nothing, so a flag says it all.
  const [duplicated, setDuplicated] = React.useState(false);
  const [showingHelp, setShowingHelp] = React.useState(false);
  const urlState = useUrlState(action);

  return (
    <Toplevel>
      <LtlApp
        state={urlState}
        topright={
          <React.Fragment>
            <WindowButton
              disabled={showingHelp}
              color="primary"
              onClick={() => setShowingHelp(true)}
              aria-label="help"
            >
              <HelpIcon />
            </WindowButton>
            <WindowButton
              disabled={duplicated}
              color="primary"
              onClick={() => setDuplicated(true)}
              aria-label="dup"
            >
              <DupeIcon />
            </WindowButton>
          </React.Fragment>
        }
      />
      {duplicated && (
        <LtlApp
          topright={
            <WindowButton
              color="primary"
              onClick={() => setDuplicated(false)}
              aria-label="close"
            >
              <CloseIcon />
            </WindowButton>
          }
        />
      )}
      {showingHelp && <Help onClose={() => setShowingHelp(false)} />}
    </Toplevel>
  );
}

/** Checks the mode in the path, then renders the app for it. */
function ModePage() {
  const { mode } = useParams();
  const action = actionOfMode(mode);
  if (action === null) return <Navigate to={"/" + DEFAULT_MODE} replace />;
  return <LtlApps action={action} />;
}

// Exported for the component tests, which render the app state directly.
export { LtlApp };

/**
 * The mode lives in the path (`/app/translate?...`), so every view has a URL;
 * `<BrowserRouter>` in `index.jsx` supplies the history and the `/app/` base.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={"/" + DEFAULT_MODE} replace />} />
      <Route path="/:mode" element={<ModePage />} />
      <Route path="*" element={<Navigate to={"/" + DEFAULT_MODE} replace />} />
    </Routes>
  );
}
