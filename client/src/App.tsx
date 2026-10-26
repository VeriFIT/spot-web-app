import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
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
import { LtlRewrite } from "./features/rewrite/LtlRewrite";
import { LtlStudy } from "./features/study/LtlStudy";
import { LtlTranslate } from "./features/translate/LtlTranslate";
import { useUrlState } from "./hooks/useUrlState";
import type { UrlState } from "./hooks/useUrlState";
import { INITIAL_OPTIONS, OptionsProvider, optionsReducer, setAction } from "./options";
import type { Options } from "./options";
import type { ParseInfo } from "./api/types";
import { actionOfMode, DEFAULT_MODE } from "./urlState";

// The help panel is read once in a while, so its prose is not worth loading
// with the panels: it arrives in its own chunk when the button is pressed.
const Help = React.lazy(() =>
  import("./features/help/Help").then((module) => ({ default: module.Help }))
);

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
  // asked of the server, but they are preferences of the panel all the same, so
  // they travel with its other options.
  const options = urlState === undefined ? localOptions : urlState.options;

  const dispatch = urlState === undefined ? localDispatch : urlState.dispatch;

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
            focusOnMount
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
  // The help panel can be opened over the panels. It is transient, so a flag
  // says it all; the duplicate panel, on the other hand, is part of the view,
  // so its state is in the URL with the primary panel's.
  const [showingHelp, setShowingHelp] = React.useState(false);
  const { primary, secondary, openSecondary, closeSecondary } = useUrlState(action);

  return (
    <Toplevel>
      <LtlApp
        state={primary}
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
              disabled={secondary !== null}
              color="primary"
              onClick={openSecondary}
              aria-label="dup"
            >
              <DupeIcon />
            </WindowButton>
          </React.Fragment>
        }
      />
      {secondary !== null && (
        <LtlApp
          state={secondary}
          topright={
            <WindowButton color="primary" onClick={closeSecondary} aria-label="close">
              <CloseIcon />
            </WindowButton>
          }
        />
      )}
      {showingHelp && (
        // The help panel arrives in its own chunk. A stale chunk after a
        // redeploy, or a network failure, must cost the panel and not the two
        // formula panels beside it, so it gets a boundary of its own.
        <ErrorBoundary>
          <React.Suspense
            fallback={
              // The panel is as wide as a formula panel, so the placeholder holds
              // its place instead of letting the layout jump when it arrives.
              <Panel>
                <CircularProgress aria-label="loading help" />
              </Panel>
            }
          >
            <Help onClose={() => setShowingHelp(false)} />
          </React.Suspense>
        </ErrorBoundary>
      )}
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
