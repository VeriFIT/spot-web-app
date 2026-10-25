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

class LtlApp extends React.Component {
  state = {
    action: 3,
    acc: "g",
    autpref: "s",
    optlevel: "h",
    syntax: "o",
    expert: false,
    hideoptions: false,
    simplify: true,
    delta2: false,
    formula: "",
    formula2: "",
    formulaerr: null,
    formulalbt: false,
    minmax: "any",
    oddeven: "any",
    transopts: {
      // translation constraints
      unambiguous: false,
      complete: false,
      statebased: false,
      // display options
      showscc: false,
      showndet: false,
      forcetacc: false,
      // parity options
      colored: false,
    },
    ltlunabbrev: {
      M: false,
      W: false,
      R: false,
      G: false,
      F: false,
      e: false,
      i: false,
      "^": false,
    },
    ltlsimp: {
      br: true,
      lf: true,
      si: true,
      eu: true,
      lc: true,
      fs: false,
      pn: false,
      bi: false,
    },
  };
  handleChangeLtlSimp = (key) => () => {
    let newltlsimp = Object.assign({}, this.state.ltlsimp);
    newltlsimp[key] = !newltlsimp[key];
    this.setState({ ltlsimp: newltlsimp });
  };
  handleChangeTransOpts = (key) => () => {
    let newtransopts = Object.assign({}, this.state.transopts);
    newtransopts[key] = !newtransopts[key];
    this.setState({ transopts: newtransopts });
  };

  handleChangeLtlUnabbrev = (key) => () => {
    let newltlunabbrev = Object.assign({}, this.state.ltlunabbrev);
    newltlunabbrev[key] = !newltlunabbrev[key];
    this.setState({ ltlunabbrev: newltlunabbrev });
  };

  changeAutpref = (event) => {
    this.setState({ autpref: event.target.value });
  };
  changeOptLevel = (event) => {
    this.setState({ optlevel: event.target.value });
  };
  changeOddEven = (event) => {
    this.setState({ oddeven: event.target.value });
  };
  changeMinMax = (event) => {
    this.setState({ minmax: event.target.value });
  };

  setFormulaError = (val) => {
    this.setState({ formulaerr: val });
  };
  setPrefixSyntax = (val) => {
    this.setState({ formulalbt: val });
  };

  handleAnyParseError = (res) => {
    if ("parse_error" in res) this.setFormulaError(res["parse_error"]);
    else this.setFormulaError(null);
    this.setPrefixSyntax(res["prefix_syntax"] === true);
  };

  changeAction = (event, value) => {
    this.setState({ action: value });
  };
  changeSyntax = (key) => {
    this.setState({ syntax: key });
  };
  changeAcc = (key) => {
    this.setState({ acc: key });
  };
  handleChecked = (name) => (event) => {
    this.setState({ [name]: event.target.checked });
  };
  handleChangeFormula = (str) => {
    this.setState({ formula: str });
  };
  handleChangeFormula2 = (str) => {
    this.setState({ formula2: str });
  };

  render() {
    return (
      <Paper className={this.props.classes.root}>
        {this.props.topright}
        {this.state.expert && <Versions classes={this.props.classes} />}
        <FormControlLabel
          style={{ marginLeft: 0 }}
          control={
            <Switch
              checked={this.state.expert}
              onChange={this.handleChecked("expert")}
              value="expert"
            />
          }
          label="Expert mode"
        />
        {(this.state.expert || this.state.hideoptions) && (
          <FormControlLabel
            control={
              <Switch
                checked={this.state.hideoptions}
                disabled={this.state.action === 1 || this.state.action === 2}
                onChange={this.handleChecked("hideoptions")}
                color="secondary"
                value="hideoptions"
              />
            }
            label="Hide all options"
          />
        )}
        <Tabs
          value={this.state.action}
          onChange={this.changeAction}
          centered
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            value={0}
            classes={{
              root: this.props.classes.tab,
              label: this.props.classes.tablabel,
            }}
            label="Rewrite"
          />
          <Tab
            value={1}
            classes={{
              root: this.props.classes.tab,
              label: this.props.classes.tablabel,
            }}
            label="Study"
          />
          <Tab
            value={2}
            classes={{
              root: this.props.classes.tab,
              label: this.props.classes.tablabel,
            }}
            label="Compare"
          />
          <Tab
            value={3}
            classes={{
              root: this.props.classes.tab,
              label: this.props.classes.tablabel,
            }}
            label="Translate"
          />
        </Tabs>
        <LtlInput
          classes={this.props.classes}
          className={
            this.state.action === 2
              ? this.props.classes.textField1
              : this.props.classes.textField
          }
          label={this.state.action === 2 ? "First formula" : "Input formula"}
          expert={this.state.expert}
          autoFocus
          setFormula={this.handleChangeFormula}
          formulalbt={this.state.formulalbt}
          formulaerr={this.state.formulaerr}
        />
        {this.state.action === 0 && (
          <LtlRewrite
            syntax={this.state.syntax}
            hideoptions={this.state.hideoptions}
            classes={this.props.classes}
            changeSyntax={this.changeSyntax}
            ltlsimp={this.state.ltlsimp}
            expert={this.state.expert}
            formula={this.state.formula}
            handleChecked={this.handleChecked}
            simplify={this.state.simplify}
            unabbrev={this.state.ltlunabbrev}
            delta2={this.state.delta2}
            handleChangeLtlSimp={this.handleChangeLtlSimp}
            handleChangeLtlUnabbrev={this.handleChangeLtlUnabbrev}
            handleAnyParseError={this.handleAnyParseError}
          />
        )}
        {this.state.action === 1 && (
          <LtlStudy
            classes={this.props.classes}
            hideoptions={this.state.hideoptions}
            expert={this.state.expert}
            formula={this.state.formula}
            handleAnyParseError={this.handleAnyParseError}
          />
        )}
        {this.state.action === 2 && (
          <LtlCompare
            classes={this.props.classes}
            hideoptions={this.state.hideoptions}
            formula={this.state.formula}
            formula2={this.state.formula2}
            handleChangeFormula2={this.handleChangeFormula2}
            handleAnyParseError={this.handleAnyParseError}
            expert={this.state.expert}
          />
        )}
        {this.state.action === 3 && (
          <LtlTranslate
            classes={this.props.classes}
            hideoptions={this.state.hideoptions}
            acc={this.state.acc}
            expert={this.state.expert}
            formula={this.state.formula}
            changeAcc={this.changeAcc}
            changeAutpref={this.changeAutpref}
            changeOptLevel={this.changeOptLevel}
            autpref={this.state.autpref}
            optlevel={this.state.optlevel}
            transopts={this.state.transopts}
            handleChangeTransOpts={this.handleChangeTransOpts}
            handleAnyParseError={this.handleAnyParseError}
            minmax={this.state.minmax}
            oddeven={this.state.oddeven}
            changeMinMax={this.changeMinMax}
            changeOddEven={this.changeOddEven}
          />
        )}
        {
          //<div> {JSON.stringify(...)} </div>
        }
      </Paper>
    );
  }
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
