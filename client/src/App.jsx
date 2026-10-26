import React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import HelpIcon from "@mui/icons-material/Help";
import { styled } from "@mui/material/styles";

import { CloseIcon, DupeIcon } from "./components/icons";
import { LtlInput } from "./components/LtlInput";
import { Versions } from "./components/Versions";
import { LtlCompare } from "./features/compare/LtlCompare";
import { Help } from "./features/help/Help";
import { LtlRewrite } from "./features/rewrite/LtlRewrite";
import { LtlStudy } from "./features/study/LtlStudy";
import { LtlTranslate } from "./features/translate/LtlTranslate";
import { INITIAL_OPTIONS, OptionsProvider, optionsReducer } from "./options";

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

function LtlApp(props) {
  const [options, dispatch] = React.useReducer(optionsReducer, INITIAL_OPTIONS);
  // The formula being analysed, and the parse information the server reported
  // for it. Neither is an option: they come from the input, not from a menu.
  const [formula, setFormula] = React.useState("");
  const [formula2, setFormula2] = React.useState("");
  const [formulaerr, setFormulaerr] = React.useState(null);
  const [formulalbt, setFormulalbt] = React.useState(false);

  // The tabs read the options from the context; only the controls rendered
  // here need the setter directly.
  const setOption = (name, value) => dispatch({ type: "set", name, value });
  const changeAction = (event, value) => setOption("action", value);
  const handleChecked = (name) => (event) => setOption(name, event.target.checked);

  // The tabs call this from an effect, so its identity must be stable; the
  // setters it uses are.
  const handleAnyParseError = React.useCallback((res) => {
    setFormulaerr("parse_error" in res ? res.parse_error : null);
    setFormulalbt(res.prefix_syntax === true);
  }, []);

  const { topright } = props;
  const { action, expert, hideoptions } = options;

  return (
    <OptionsProvider options={options} dispatch={dispatch}>
      <Panel>
        {topright}
        {expert && <Versions />}
        <FormControlLabel
          style={{ marginLeft: 0 }}
          control={
            <Switch checked={expert} onChange={handleChecked("expert")} value="expert" />
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
    </OptionsProvider>
  );
}
class LtlApps extends React.Component {
  state = {
    instances: 1,
    show_help: 0,
  };

  handleDup = () => {
    this.setState({ instances: 2 });
  };

  showHelp = () => {
    this.setState({ show_help: 1 });
  };

  unshowHelp = () => {
    this.setState({ show_help: 0 });
  };

  handleClose = () => {
    this.setState({ instances: 1 });
  };

  render() {
    return (
      <Toplevel>
        <LtlApp
          topright={
            <React.Fragment>
              <WindowButton
                disabled={this.state.show_help === 1}
                color="primary"
                onClick={this.showHelp}
                aria-label="help"
              >
                <HelpIcon />
              </WindowButton>
              <WindowButton
                disabled={this.state.instances === 2}
                color="primary"
                onClick={this.handleDup}
                aria-label="dup"
              >
                <DupeIcon />
              </WindowButton>
            </React.Fragment>
          }
        />
        {this.state.instances === 2 && (
          <LtlApp
            topright={
              <WindowButton color="primary" onClick={this.handleClose} aria-label="close">
                <CloseIcon />
              </WindowButton>
            }
          />
        )}
        {this.state.show_help === 1 && <Help onClose={this.unshowHelp} />}
      </Toplevel>
    );
  }
}

// Exported for the component tests, which render the app state directly.
export { LtlApp };
export default LtlApps;
