import React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import HelpIcon from "@mui/icons-material/Help";
import { withStyles } from "tss-react/mui";

import { CloseIcon, DupeIcon } from "./components/icons";
import { LtlInput } from "./components/LtlInput";
import { Versions } from "./components/Versions";
import { LtlCompare } from "./features/compare/LtlCompare";
import { Help } from "./features/help/Help";
import { LtlRewrite } from "./features/rewrite/LtlRewrite";
import { LtlStudy } from "./features/study/LtlStudy";
import { LtlTranslate } from "./features/translate/LtlTranslate";
import { INITIAL_OPTIONS, OptionsProvider, optionsReducer } from "./options";

const styles = (theme) => ({
  toplevel: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    [theme.breakpoints.up("sm")]: {
      justifyContent: "center",
    },
  },
  nottopmargin: { marginTop: 0 },
  help: {
    margin: theme.spacing(1),
    paddingTop: theme.spacing(1),
    width: 640 - 16,
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      marginRight: 0,
    },
    "& h2": { color: theme.palette.primary.main },
  },
  helptop: {
    padding: 4,
  },
  helpexpanded: {
    margin: 0,
    "&:before": {
      opacity: 1,
    },
  },
  optable: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "space-around",
  },
  oppair: {
    display: "block",
    padding: 2,
    margin: 2,
    backgroundColor: "#EEEEEE",
  },
  opdesc: {
    float: "left",
  },
  opsyn: {
    float: "right",
  },
  root: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    width: 624,
    minWidth: 624,
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      marginRight: 0,
    },
  },
  progress: {
    display: "block",
    margin: "auto",
  },
  optionstrans: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  tab: {
    maxWidth: 150,
    minWidth: 50,
  },
  tablabel: {
    fontSize: theme.typography.pxToRem(14),
  },
  fclvertical: {
    marginRight: 0,
  },
  pre: {
    overflow: "auto",
    whiteSpace: "pre-wrap",
    width: "100%",
    margin: 0,
  },
  ltlInput: {
    width: "100%",
  },
  ltlsyntax: {},
  helperText: {
    marginTop: 0,
  },
  borderedgroupprimary: {
    padding: 8,
    margin: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 4,
    borderColor: theme.palette.primary.main,
    "& legend": {
      paddingLeft: 8,
      paddingRight: 8,
      backgroundColor: "white",
      color: theme.palette.primary.light,
    },
  },
  borderedgroupsecondary: {
    padding: 8,
    margin: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 4,
    borderColor: theme.palette.secondary.main,
    "& legend": {
      paddingLeft: 8,
      paddingRight: 8,
      backgroundColor: "white",
      color: theme.palette.secondary.light,
    },
    "& legend$focused": {
      color: theme.palette.secondary.main,
    },
  },
  flexhoriz: {
    flexDirection: "row",
  },
  focused: {},

  choicemenuitem: {
    "&:focus": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
  },
  choicelistitem: {
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 4,
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.paper,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focusVisible": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  },
  choiceicon: {
    color: theme.palette.primary.main,
  },
  unabbrev: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  unabbrevboxroot: {
    marginRight: "16px",
    marginBottom: "-8px",
    marginTop: "-8px",
  },
  unabbrevboxlabel: {
    marginLeft: "-8px",
  },
  parseerror: {
    color: theme.palette.error.main,
  },
  textField: {},
  textField1: {
    backgroundColor: "#b2ffff",
  },
  textField2: {
    backgroundColor: "#ffccff",
  },
  update: {
    width: "100px",
    float: "right",
  },
  winicons: {
    float: "right",
  },
  helpiconsdiv: {
    overflow: "auto",
    marginRight: theme.spacing(1),
  },
  helpicons: {
    float: "right",
  },
  menu: {},
  versions: {
    float: "right",
    marginTop: "8px",
  },
  vendiag: {
    float: "right",
  },
  versiontable: {},
  results: {
    width: "100%",
    padding: theme.spacing(1),
    overflow: "auto",
  },
  hierarchy_svg: {
    float: "right",
  },
  hierarchydiv: {
    paddingBottom: 10,
  },
  satisfiabilitydiv: {
    paddingBottom: 10,
  },
  stutterdiv: {},
  indexdiv: {
    paddingBottom: 10,
  },
  livenessdiv: {
    paddingBottom: 10,
  },
  wordtable: {
    width: "auto",
  },
  wordtablerow: {
    height: "auto",
  },
  wordtablecell: {
    borderBottom: "none",
  },
  wordtablecellw: {
    borderBottom: "none",
    fontWeight: "bold",
  },
  automaton_svg: {
    overflow: "auto",
    marginLeft: -4,
    marginRight: -4,
    display: "block",
  },
});

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

  const { classes, topright } = props;
  const { action, expert, hideoptions } = options;

  return (
    <OptionsProvider options={options} dispatch={dispatch}>
      <Paper className={classes.root}>
        {topright}
        {expert && <Versions classes={classes} />}
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
          <Tab
            value={0}
            classes={{ root: classes.tab, label: classes.tablabel }}
            label="Rewrite"
          />
          <Tab
            value={1}
            classes={{ root: classes.tab, label: classes.tablabel }}
            label="Study"
          />
          <Tab
            value={2}
            classes={{ root: classes.tab, label: classes.tablabel }}
            label="Compare"
          />
          <Tab
            value={3}
            classes={{ root: classes.tab, label: classes.tablabel }}
            label="Translate"
          />
        </Tabs>
        <LtlInput
          classes={classes}
          className={action === 2 ? classes.textField1 : classes.textField}
          label={action === 2 ? "First formula" : "Input formula"}
          expert={expert}
          autoFocus
          setFormula={setFormula}
          formulalbt={formulalbt}
          formulaerr={formulaerr}
        />
        {action === 0 && (
          <LtlRewrite
            classes={classes}
            formula={formula}
            handleAnyParseError={handleAnyParseError}
          />
        )}
        {action === 1 && (
          <LtlStudy
            classes={classes}
            formula={formula}
            handleAnyParseError={handleAnyParseError}
          />
        )}
        {action === 2 && (
          <LtlCompare
            classes={classes}
            formula={formula}
            formula2={formula2}
            handleChangeFormula2={setFormula2}
            handleAnyParseError={handleAnyParseError}
          />
        )}
        {action === 3 && (
          <LtlTranslate
            classes={classes}
            formula={formula}
            handleAnyParseError={handleAnyParseError}
          />
        )}
      </Paper>
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
      <div className={this.props.classes.toplevel}>
        <LtlApp
          classes={this.props.classes}
          topright={
            <React.Fragment>
              <IconButton
                disabled={this.state.show_help === 1}
                color="primary"
                onClick={this.showHelp}
                className={this.props.classes.winicons}
                aria-label="help"
              >
                <HelpIcon />
              </IconButton>
              <IconButton
                disabled={this.state.instances === 2}
                color="primary"
                onClick={this.handleDup}
                className={this.props.classes.winicons}
                aria-label="dup"
              >
                <DupeIcon />
              </IconButton>
            </React.Fragment>
          }
        />
        {this.state.instances === 2 && (
          <LtlApp
            classes={this.props.classes}
            topright={
              <IconButton
                className={this.props.classes.winicons}
                color="primary"
                onClick={this.handleClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            }
          />
        )}
        {this.state.show_help === 1 && (
          <Help classes={this.props.classes} onClose={this.unshowHelp} />
        )}
      </div>
    );
  }
}

// Exported for the component tests, which render the app state directly.
export { LtlApp };
export default withStyles(LtlApps, styles);
