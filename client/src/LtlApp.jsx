/* -*- coding: utf-8 -*-
 ** Copyright (C) 2018-2021, 2026 Laboratoire de Recherche et Développement de
 ** l'Epita.
 **
 ** This application is free software; you can redistribute it and/or
 ** modify it under the terms of the GNU General Public License as
 ** published by the Free Software Foundation; either version 3 of the
 ** License, or (at your option) any later version.
 **
 ** This application is distributed in the hope that it will be useful,
 ** but WITHOUT ANY WARRANTY; without even the implied warranty of
 ** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 ** General Public License for more details.
 **
 ** You should have received a copy of the GNU General Public License
 ** along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React from "react";
import "@fontsource/roboto";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import HelpIcon from "@mui/icons-material/Help";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import SvgIcon from "@mui/material/SvgIcon";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { withStyles } from "tss-react/mui";
import {
  compareUrl,
  getCompare,
  getRandomFormula,
  getRewrite,
  getStudy,
  getTranslate,
  getVersions,
  randomUrl,
  rewriteUrl,
  studyUrl,
  translateUrl,
  versionsUrl,
} from "./api/client";
import { useApiQuery } from "./hooks/useApiQuery";
import { useDelayedFlag } from "./hooks/useDelayedFlag";

// Helper component to render SVG strings
function SVGInline({ svg, className }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}

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

function DiceIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M7,5A2,2 0 0,0 5,7A2,2 0 0,0 7,9A2,2 0 0,0 9,7A2,2 0 0,0 7,5M17,15A2,2 0 0,0 15,17A2,2 0 0,0 17,19A2,2 0 0,0 19,17A2,2 0 0,0 17,15M17,5A2,2 0 0,0 15,7A2,2 0 0,0 17,9A2,2 0 0,0 19,7A2,2 0 0,0 17,5M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M7,15A2,2 0 0,0 5,17A2,2 0 0,0 7,19A2,2 0 0,0 9,17A2,2 0 0,0 7,15Z" />
    </SvgIcon>
  );
}

function NoteIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M4.47,21h15.06c1.54,0,2.5-1.67,1.73-3L13.73,4.99c-0.77-1.33-2.69-1.33-3.46,0L2.74,18C1.97,19.33,2.93,21,4.47,21z M12,14L12,14c-0.55,0-1-0.45-1-1v-2c0-0.55,0.45-1,1-1h0c0.55,0,1,0.45,1,1v2C13,13.55,12.55,14,12,14z M13,18h-2v-2h2V18z" />
    </SvgIcon>
  );
}
function DupeIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M14.59,2.59C14.21,2.21,13.7,2,13.17,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.89,2,1.99,2H18c1.1,0,2-0.9,2-2V8.83 c0-0.53-0.21-1.04-0.59-1.41L14.59,2.59z M15,16h-2v2c0,0.55-0.45,1-1,1h0c-0.55,0-1-0.45-1-1v-2H9c-0.55,0-1-0.45-1-1v0 c0-0.55,0.45-1,1-1h2v-2c0-0.55,0.45-1,1-1h0c0.55,0,1,0.45,1,1v2h2c0.55,0,1,0.45,1,1v0C16,15.55,15.55,16,15,16z M13,8V3.5 L18.5,9H14C13.45,9,13,8.55,13,8z" />
    </SvgIcon>
  );
}
function CloseIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M18.3,5.71L18.3,5.71c-0.39-0.39-1.02-0.39-1.41,0L12,10.59L7.11,5.7c-0.39-0.39-1.02-0.39-1.41,0l0,0 c-0.39,0.39-0.39,1.02,0,1.41L10.59,12L5.7,16.89c-0.39,0.39-0.39,1.02,0,1.41h0c0.39,0.39,1.02,0.39,1.41,0L12,13.41l4.89,4.89 c0.39,0.39,1.02,0.39,1.41,0l0,0c0.39-0.39,0.39-1.02,0-1.41L13.41,12l4.89-4.89C18.68,6.73,18.68,6.09,18.3,5.71z" />
    </SvgIcon>
  );
}

function NoteText(props) {
  return (
    <Typography component="div">
      <table>
        <tbody>
          <tr>
            <td>
              <NoteIcon {...props} />
            </td>
            <td>{props.text}</td>
          </tr>
        </tbody>
      </table>
    </Typography>
  );
}

function renderError(error) {
  const msg = error.message;
  if (error.status !== 500) return <pre>{msg}</pre>;
  return (
    <React.Fragment>
      <pre>{msg}</pre>
      <Typography color="error">
        Our server automatically kills requests that take longer than 40 seconds, or that
        require too much memory.
        <br /> If you do <i>not</i> think that is the case here, please send a screenshot
        and any helpful detail to{" "}
        <a href="mailto:spot@lrde.epita.fr">
          <code>spot@lrde.epita.fr</code>
        </a>
        .<br />
        If you <i>do</i> think that is the case, please consider{" "}
        <a href="https://spot.lre.epita.fr/install.html">installing Spot</a> to run your
        experiments locally; this is a shared service.
      </Typography>
    </React.Fragment>
  );
}

function righthelp(contents, help) {
  return (
    <Tooltip title={help} placement="right" enterDelay={750}>
      <div>{contents}</div>
    </Tooltip>
  );
}
function classhelp(contents, help) {
  if (contents === "") contents = "a class above Δ₂";
  else contents = "class " + contents;
  return (
    <React.Fragment>
      <Tooltip title={help} placement="right" enterDelay={750}>
        <b>{contents}</b>
      </Tooltip>
    </React.Fragment>
  );
}

function LtlInput(props) {
  // The text being typed, and the formula the app actually queries. They
  // differ while the user has not confirmed the edit with Enter or Tab.
  const [tmpformula, setTmpformula] = React.useState(props.defaultValue || "");
  const [formula, setFormula] = React.useState(props.defaultValue || "");

  const handleChange = (event) => setTmpformula(event.target.value);

  const updateFormula = () => {
    setFormula(tmpformula);
    props.setFormula(tmpformula);
  };

  const handleKey = (event) => {
    if (event.key === "Enter") updateFormula();
  };

  const randomizeFormula = () => {
    getRandomFormula(randomUrl(props.expert)).then((fmt) => {
      setTmpformula(fmt);
      setFormula(fmt);
      props.setFormula(fmt);
    });
  };

  return (
    <div className={props.classes.ltlInput}>
      <TextField
        error={Boolean(props.formulaerr)}
        className={props.className}
        fullWidth
        value={tmpformula}
        label={props.label}
        autoFocus={props.autoFocus}
        onChange={handleChange}
        onKeyDown={handleKey}
        onBlur={updateFormula}
        InputProps={{
          endAdornment: (
            <Tooltip
              disableFocusListener={true}
              title="Overwrite input with a random formula."
              placement="right"
              enterDelay={750}
            >
              <InputAdornment position="end">
                <IconButton onClick={randomizeFormula}>
                  <DiceIcon color="primary" />
                </IconButton>
              </InputAdornment>
            </Tooltip>
          ),
        }}
      />
      <FormHelperText className={props.classes.helperText}>
        {tmpformula !== formula && (
          <span>
            Hit <i>Enter</i> or <i>Tab</i> to update the results.
          </span>
        )}
      </FormHelperText>
      {props.formulalbt && (
        <NoteText
          text={
            "Assuming a prefix syntax in the style of " +
            "LBT/LTL2DSTAR, as the standard parser for " +
            "infix syntaxes failed."
          }
        />
      )}
      {props.formulaerr && (
        <pre className={props.classes.parseerror}>{props.formulaerr}</pre>
      )}
    </div>
  );
}

function Versions(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [versions, setVersions] = React.useState([]);

  // The list is fetched once; abort it if the menu goes away before it lands.
  React.useEffect(() => {
    const controller = new AbortController();
    getVersions(versionsUrl(), controller.signal)
      .then((vers) => {
        if (controller.signal.aborted) return;
        setVersions([...vers, ["React", React.version, "https://reactjs.org/"]]);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setVersions([[error.message, null, null]]);
      });
    return () => controller.abort();
  }, []);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const { classes } = props;
  return (
    <div>
      <Button className={classes.versions} color="secondary" onClick={handleOpen}>
        Versions
      </Button>
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Table className={classes.versiontable}>
          <TableBody>
            {versions.map(([tool, version, url]) => {
              return (
                <TableRow key={tool}>
                  <TableCell component="th" scope="row">
                    <a href={url}>{tool}</a>
                  </TableCell>
                  <TableCell>{version}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Menu>
    </div>
  );
}

class LtlSyntaxChoice extends React.Component {
  button = null;

  options = {
    o: "Output syntax: Spot",
    l: "Output syntax: LBT/LTL2DSTAR",
    i: "Output syntax: Spin",
    g: "Show Abstract Syntax Tree",
  };

  state = {
    anchorEl: null,
  };

  handleClickListItem = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuItemClick = (event, key) => {
    this.props.changeSyntax(key);
    this.setState({ anchorEl: null });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;

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
            onClick={this.handleClickListItem}
          >
            <ListItemText primary={this.options[this.props.syntax]} />
            <ExpandMoreIcon className={classes.choiceicon} />
          </ListItem>
        </List>
        <Menu
          id="syntax-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {Object.entries(this.options).map(([key, option]) => (
            <MenuItem
              key={key}
              className={classes.choicemenuitem}
              selected={key === this.props.syntax}
              onClick={(event) => this.handleMenuItemClick(event, key)}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  }
}

class LtlSimplificationOptions extends React.Component {
  options = {
    br: "basic rewritings",
    lf: "allow simplified formulas to be larger",
    si: "reductions based on syntactic implications",
    eu: "reductions based on pure eventualities and purely universal formulas",
    lc: "reduction based on automata-based containments",
    fs: "enable rules that favor suspendable formulas at the top level",
    pn: "NNF rewriting should stop on Boolean subformulas",
    bi: "rewrite Boolean subformulas to irredundant-sum-of-products",
  };
  form = ([key, value]) => {
    return (
      <FormControlLabel
        key={key}
        disabled={!this.props.simplify}
        control={
          <Checkbox
            checked={this.props.ltlsimp[key]}
            onChange={this.props.handleChangeLtlSimp(key)}
          />
        }
        label={value}
      />
    );
  };
  render() {
    return (
      <FormControl
        component="fieldset"
        className={this.props.classes.borderedgroupsecondary}
      >
        <FormLabel component="legend" classes={{ focused: this.props.classes.focused }}>
          Simplification options
        </FormLabel>
        {Object.entries(this.options).map(this.form)}
      </FormControl>
    );
  }
}

class LtlUnabbrevOptions extends React.Component {
  options1 = {
    F: ["F", "<>", "F"],
    G: ["G", "[]", "G"],
    R: ["R", "V", "V"],
    M: ["M", "M", "M"],
    W: ["W", "W", "W"],
  };
  options2 = {
    i: ["->", "->", "i"],
    e: ["<->", "<->", "e"],
    "^": ["xor", "xor", "^"],
  };
  form = (values) => {
    let syntaxId = this.props.syntax === "i" ? 1 : this.props.syntax === "l" ? 2 : 0;
    let key = values[0];
    return (
      <FormControlLabel
        key={key}
        control={
          <Checkbox
            checked={this.props.unabbrev[key]}
            disabled={syntaxId === 1 && "MW^".indexOf(key) >= 0}
            onChange={this.props.handleChangeLtlUnabbrev(key)}
            color="primary"
          />
        }
        classes={{
          root: this.props.classes.unabbrevboxroot,
          label: this.props.classes.unabbrevboxlabel,
        }}
        label={<code>{values[1][syntaxId]}</code>}
      />
    );
  };
  render() {
    return (
      <FormControl
        component="fieldset"
        className={`${this.props.classes.borderedgroupprimary} ${this.props.classes.unabbrev}`}
      >
        <FormLabel component="legend">
          {righthelp(
            "Unabbreviate",
            "Remove occurrences of selected operators by rewriting them using other operators."
          )}
        </FormLabel>
        <span>{Object.entries(this.options1).map(this.form)}</span>
        <span>{Object.entries(this.options2).map(this.form)}</span>
      </FormControl>
    );
  }
}

class AccChoice extends React.Component {
  button = null;

  options = {
    m: "Acceptance: monitor (all runs accepting)",
    c: "Acceptance: co-Büchi",
    b: "Acceptance: Büchi",
    g: "Acceptance: Generalized Büchi",
    p: "Acceptance: parity",
    e: "Acceptance: Emerson-Lei (generic acceptance)",
  };

  state = {
    anchorEl: null,
  };

  handleClickListItem = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuItemClick = (event, key) => {
    this.props.changeAcc(key);
    this.setState({ anchorEl: null });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;

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
            onClick={this.handleClickListItem}
          >
            <ListItemText primary={this.options[this.props.acc]} />
            <ExpandMoreIcon className={classes.choiceicon} />
          </ListItem>
        </List>
        <Menu
          id="acc-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {Object.entries(this.options).map(([key, option]) => (
            <MenuItem
              key={key}
              className={classes.choicemenuitem}
              selected={key === this.props.acc}
              onClick={(event) => this.handleMenuItemClick(event, key)}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  }
}

class LtlResult extends React.Component {
  render() {
    return <Paper className={this.props.classes.results}>{this.props.result}</Paper>;
  }
}

function LtlRewrite(props) {
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

/** Body of the study tab, as a function of the answer so it stays pure. */
function studyResult(res, classes) {
  if (!("mp_class_text" in res)) return null;
  return (
    <React.Fragment>
      <div className={classes.hierarchydiv}>
        <SVGInline className={classes.hierarchy_svg} svg={res["mp_hierarchy_svg"]} />
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
      </div>
      <div className={classes.livenessdiv}>
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
      </div>
      <div className={classes.indexdiv}>
        <Typography variant="body2" color="primary">
          Indices
        </Typography>
        {(res["Rabin_index"] !== null || res["Streett_index"] !== null) && (
          <Table className={classes.wordtable}>
            <TableBody>
              <TableRow className={classes.wordtablerow}>
                <TableCell component="th" scope="row" className={classes.wordtablecell}>
                  Rabin index:
                </TableCell>
                <TableCell className={classes.wordtablecellw}>
                  {res["Rabin_index"]}
                </TableCell>
              </TableRow>
              <TableRow className={classes.wordtablerow}>
                <TableCell component="th" scope="row" className={classes.wordtablecell}>
                  Streett index:
                </TableCell>
                <TableCell className={classes.wordtablecellw}>
                  {res["Streett_index"]}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
      <div className={classes.satisfiabilitydiv}>
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
          <Table className={classes.wordtable}>
            <TableBody>
              <TableRow className={classes.wordtablerow}>
                <TableCell component="th" scope="row" className={classes.wordtablecell}>
                  Accepted word:
                </TableCell>
                <TableCell className={classes.wordtablecellw}>
                  {res["acc_word"]}
                </TableCell>
              </TableRow>
              <TableRow className={classes.wordtablerow}>
                <TableCell component="th" scope="row" className={classes.wordtablecell}>
                  Rejected word:
                </TableCell>
                <TableCell className={classes.wordtablecellw}>
                  {res["rej_word"]}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
      <div className={classes.stutterdiv}>
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

function LtlStudy(props) {
  const { classes, formula } = props;

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
  else if (showSpinner) result = <CircularProgress className={classes.progress} />;
  else if (data !== null) result = studyResult(data, classes);

  return <div>{result && <LtlResult classes={classes} result={result} />}</div>;
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

function LtlTranslate(props) {
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

/** Body of the compare tab, as a function of the answer so it stays pure. */
function compareResult(res, classes) {
  if (!("txt" in res && "svg" in res)) return null;
  return (
    <React.Fragment>
      {"txt" in res && <Typography>{res["txt"]}</Typography>}
      {"svg" in res && <SVGInline svg={res["svg"]} className={classes.vendiag} />}
      <Table className={classes.wordtable}>
        <TableBody>
          {"w1" in res && (
            <TableRow className={classes.wordtablerow}>
              <TableCell component="th" scope="row" className={classes.wordtablecell}>
                w₁:
              </TableCell>
              <TableCell className={classes.wordtablecellw}>{res["w1"]}</TableCell>
            </TableRow>
          )}
          {"w2" in res && (
            <TableRow className={classes.wordtablerow}>
              <TableCell component="th" scope="row" className={classes.wordtablecell}>
                w₂:
              </TableCell>
              <TableCell className={classes.wordtablecellw}>{res["w2"]}</TableCell>
            </TableRow>
          )}
          {"w3" in res && (
            <TableRow className={classes.wordtablerow}>
              <TableCell component="th" scope="row" className={classes.wordtablecell}>
                w₃:
              </TableCell>
              <TableCell className={classes.wordtablecellw}>{res["w3"]}</TableCell>
            </TableRow>
          )}
          {"w4" in res && (
            <TableRow className={classes.wordtablerow}>
              <TableCell component="th" scope="row" className={classes.wordtablecell}>
                w₄:
              </TableCell>
              <TableCell className={classes.wordtablecellw}>{res["w4"]}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {"sfh1" in res && (
        <Typography>
          Although they are equivalent,
          <ul className={classes.nottopmargin}>
            <li>First formula belongs to {classhelp(res["sfh1"], res["sfh1_text"])},</li>
            <li>Second formula belongs to {classhelp(res["sfh2"], res["sfh2_text"])}.</li>
          </ul>
        </Typography>
      )}
    </React.Fragment>
  );
}

function LtlCompare(props) {
  const { classes, formula, formula2 } = props;

  const requestUrl = React.useMemo(
    () => (formula === "" || formula2 === "" ? null : compareUrl(formula, formula2)),
    [formula, formula2]
  );
  const { data, error, loading } = useApiQuery(requestUrl, getCompare);
  const showSpinner = useDelayedFlag(loading, 800);

  // The answer describes both formulas: the first one is reported to the
  // parent, which owns that input, the second one belongs to the input here.
  const [formula2err, setFormula2err] = React.useState(null);
  const [formula2lbt, setFormula2lbt] = React.useState(false);
  const { handleAnyParseError } = props;
  React.useEffect(() => {
    if (data === null) return;
    handleAnyParseError(data);
    setFormula2err("parse_error2" in data ? data.parse_error2 : null);
    setFormula2lbt(data.prefix_syntax2 === true);
  }, [data, handleAnyParseError]);

  let result = null;
  if (error !== null) result = renderError(error);
  else if (showSpinner) result = <CircularProgress className={classes.progress} />;
  else if (data !== null) result = compareResult(data, classes);

  return (
    <React.Fragment>
      <LtlInput
        classes={classes}
        className={classes.textField2}
        label="Second formula"
        expert={props.expert}
        defaultValue={formula2}
        setFormula={props.handleChangeFormula2}
        formulalbt={formula2lbt}
        formulaerr={formula2err}
      />
      {result && <LtlResult classes={classes} result={result} />}
    </React.Fragment>
  );
}

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

function OpTable(array, width, classes) {
  return (
    <div className={classes.optable}>
      {array.map((value) => {
        return (
          <div key={value[0]} className={classes.oppair} style={{ width: width }}>
            <div className={classes.opdesc}>{value[0]}:</div>
            <div className={classes.opsyn}>{value[1]}</div>
          </div>
        );
      })}
    </div>
  );
}

function Ltl(props) {
  return (
    <code>
      <b>{props.f}</b>
    </code>
  );
}

class Help extends React.Component {
  render() {
    return (
      <Paper className={this.props.classes.help}>
        <div className={this.props.classes.helpiconsdiv}>
          <IconButton
            className={this.props.classes.helpicons}
            color="primary"
            onClick={this.props.onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="headline"
            color="primary"
            align="center"
            className={this.props.classes.helptop}
            gutterBottom
          >
            Help
          </Typography>
        </div>

        <Accordion classes={{ expanded: this.props.classes.helpexpanded }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">About</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <Typography variant="body1" gutterBottom>
                This web application is built using the services of{" "}
                <a href="https://spot.lre.epita.fr/">Spot</a> running on a shared
                computer. For serious uses, you can answer similar questions using the{" "}
                <a href="https://spot.lre.epita.fr/tools.html">command-line tools</a>, or
                by{" "}
                <a href="https://spot.lre.epita.fr/tut.html">
                  writing some C++ or Python code
                </a>
                .
              </Typography>
              <Typography variant="body1" gutterBottom>
                The source code for this application can be found{" "}
                <a href="https://gitlab.lre.epita.fr/spot/spot-web-app/">on our gitlab</a>
                , and is distributed under the{" "}
                <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GNU GPL v3</a>{" "}
                license.
              </Typography>
              <Typography variant="body1" gutterBottom>
                For any question not answered in this small help text, or for reporting
                any bug, please send an email to{" "}
                <a href="mailto:spot@lrde.epita.fr">the Spot mailing list</a>.
              </Typography>
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion classes={{ expanded: this.props.classes.helpexpanded }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Operation modes</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              The application has four modes of operation that you can select at its top:
              <dl>
                <dt>
                  <Typography variant="body2">Rewrite</Typography>
                </dt>
                <dd>
                  for rewriting a formula (changing syntaxes, simplifying, removing some
                  operators)
                </dd>
                <dt>
                  <Typography variant="body2">Study</Typography>
                </dt>
                <dd>for computing various properties of a formula</dd>
                <dt>
                  <Typography variant="body2">Compare</Typography>
                </dt>
                <dd>for comparing two LTL formulas</dd>
                <dt>
                  <Typography variant="body2">Translate</Typography>
                </dt>
                <dd>for constructing an automaton equivalent to a given formula</dd>
              </dl>
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion classes={{ expanded: this.props.classes.helpexpanded }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">LTL Infix Syntax</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <Typography variant="body1" gutterBottom>
                To accommodate the syntaxes of different tools, Spot supports alternative
                representations for many operators. For the semantics of all operators see{" "}
                <a href="https://spot.lre.epita.fr/tl.pdf">this document</a>.
              </Typography>
              <Typography variant="body2" color="primary">
                Atomic propositions
              </Typography>
              <Typography variant="body1" gutterBottom>
                Use alphanumeric identifiers or double-quoted strings for atomic
                propositions, and parentheses for grouping. Identifiers cannot start with
                the letter of a prefix operator (<Ltl f="F" />, <Ltl f="G" />, or{" "}
                <Ltl f="X" />
                ): for instance <Ltl f="GFa" /> means <Ltl f="G(F(a))" />. Use{" "}
                <Ltl f='"GFa"' />, with double quotes, if you really want to refer to{" "}
                <Ltl f="GFa" /> as a proposition. Conversely, infix letter operators are
                not assumed to be operators if they are part of an identifier:{" "}
                <Ltl f="aUb" /> is an atomic proposition, unlike{" "}
                <Ltl f="a&nbsp;U&nbsp;b" /> and <Ltl f="(a)U(b)" />.
              </Typography>
              <Typography variant="body2" color="primary">
                Boolean constants
              </Typography>
              <Typography variant="body1" gutterBottom>
                Use <Ltl f="1" /> or <Ltl f="0" />, or also <Ltl f="true" /> or{" "}
                <Ltl f="false" /> (case insensitive).
              </Typography>
              <Typography variant="body2" color="primary">
                Boolean operators
              </Typography>
              <Typography variant="body1" gutterBottom>
                The following Boolean operators are supported:
                {OpTable(
                  [
                    [
                      "and",
                      <>
                        <Ltl f="&amp;" />, <Ltl f="&amp;&amp;" />, <Ltl f="/\" /*"*/ />
                      </>,
                    ],
                    [
                      "or",
                      <>
                        <Ltl f="|" />, <Ltl f="||" />, <Ltl f="\/" />, <Ltl f="+" />
                      </>,
                    ],
                    [
                      "implies",
                      <>
                        <Ltl f="->" />, <Ltl f="-->" />, <Ltl f="=>" />
                      </>,
                    ],
                    [
                      "equivalent",
                      <>
                        <Ltl f="<->" />, <Ltl f="<-->" />, <Ltl f="<=>" />
                      </>,
                    ],
                    [
                      "not",
                      <>
                        <Ltl f="!" /> (prefix), <Ltl f="~" /> (prefix)
                      </>,
                    ],
                    [
                      "exclusive or",
                      <>
                        <Ltl f="^" />, <Ltl f="xor" />
                      </>,
                    ],
                  ],
                  "180px",
                  this.props.classes
                )}
                For compatibility with{" "}
                <a href="http://www.ist.tugraz.at/staff/bloem/wring.html">Wring</a>
                , atomic propositions can be followed by <Ltl f="=1" /> or <Ltl f="=0" />{" "}
                to specify their polarity. For instance <Ltl f="a=0 U b=1" /> is
                equivalent to <Ltl f="!a U b" />.
              </Typography>
              <Typography variant="body2" color="primary">
                Temporal Operators
              </Typography>
              <Typography variant="body1" gutterBottom>
                The following binary operators are supported:
                {OpTable(
                  [
                    ["strong until", <Ltl key="U" f="U" />],
                    ["weak until", <Ltl key="W" f="W" />],
                    ["strong release", <Ltl key="M" f="M" />],
                    [
                      "weak release",
                      <>
                        <Ltl f="R" />, <Ltl f="V" />
                      </>,
                    ],
                  ],
                  "120px",
                  this.props.classes
                )}
                The following unary (prefix) operators are supported:
                {OpTable(
                  [
                    [
                      "next",
                      <>
                        <Ltl f="X" />, <Ltl f="()" />
                      </>,
                    ],
                    [
                      "eventually",
                      <>
                        <Ltl f="F" />, <Ltl f="<>" />
                      </>,
                    ],
                    [
                      "globally",
                      <>
                        <Ltl f="G" />, <Ltl f="[]" />
                      </>,
                    ],
                  ],
                  "120px",
                  this.props.classes
                )}
                Additionally, <Ltl f="X[n]" />, <Ltl f="F[n..m]" />, and{" "}
                <Ltl f="G[n..m]" /> are syntactic sugar for differents types of repetition
                of the <Ltl f="X" /> operator. For instance <Ltl f="F[3..5]p" /> is short
                for <Ltl f="XXX(p|X(p|Xp))" />.
              </Typography>
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion classes={{ expanded: this.props.classes.helpexpanded }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">LTL Prefix Syntax</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <Typography variant="body1" gutterBottom>
                If (and only if!) parsing the input formula using the infix syntax failed,
                the application will attempt to parse the formula using a prefix syntax
                (Polish notation) that should be a superset of what tools like{" "}
                <a href="http://www.tcs.hut.fi/Software/maria/tools/lbt/">LBT</a>,{" "}
                <a href="http://www.tcs.hut.fi/Software/lbtt/">LBTT</a>,{" "}
                <a href="http://tcs.legacy.ics.tkk.fi/users/tlatvala/scheck/">scheck</a>{" "}
                or <a href="http://www.ltl2dstar.de/">ltl2dstar</a> can read.
              </Typography>
              <Typography variant="body1">
                The following prefix operators are supported:
                {OpTable(
                  [
                    ["true", <Ltl key="t" f="t" />],
                    ["false", <Ltl key="f" f="f" />],
                    ["not", <Ltl key="!" f="!" />],
                    ["and", <Ltl key="&" f="&" />],
                    ["or", <Ltl key="|" f="|" />],
                    ["implication", <Ltl key="i" f="i" />],
                    ["equivalence", <Ltl key="e" f="e" />],
                    ["xor", <Ltl key="^" f="^" />],
                    ["next", <Ltl key="X" f="X" />],
                    ["eventually", <Ltl key="F" f="F" />],
                    ["globally", <Ltl key="G" f="G" />],
                    ["strong until", <Ltl key="U" f="U" />],
                    ["weak release", <Ltl key="V" f="V" />],
                    ["strong release", <Ltl key="M" f="M" />],
                    ["weak until", <Ltl key="W" f="W" />],
                  ],
                  "120px",
                  this.props.classes
                )}
                Double-quoted strings, as well as identifiers that do not look like
                operators, are assumed to be atomic propositions.
              </Typography>
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion classes={{ expanded: this.props.classes.helpexpanded }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">PSL Infix Syntax</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <Typography variant="body1" gutterBottom>
                A subset of PSL can be used to express linear properties that are more
                expressive than LTL. For the semantics of all operators see{" "}
                <a href="https://spot.lre.epita.fr/tl.pdf">this document</a>.
              </Typography>
              <Typography variant="body1" gutterBottom>
                If you put the application in "expert mode", clicking on the dice will
                generate a random PSL formula instead of generating a random LTL formula.
              </Typography>
              <Typography variant="body2" color="primary">
                Semi-Extended Regular Expression (SERE)
              </Typography>
              <Typography variant="body1" gutterBottom>
                Those semi-extended regular expressions match finite prefixes, and are
                constructed above Boolean expressions built using the standard Boolean
                operators. A new constant, <Ltl f="[*0]" /> represents the empty word.
              </Typography>
              <Typography variant="body2">
                The following binary operators are supported:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {OpTable(
                  [
                    [
                      "concatenation",
                      <>
                        <Ltl f=";" />, <Ltl f="##1" />
                      </>,
                    ],
                    [
                      "fusion",
                      <>
                        <Ltl f=":" />, <Ltl f="##0" />
                      </>,
                    ],
                    [
                      "union",
                      <>
                        <Ltl f="|" />, <Ltl f="||" />, <Ltl f="\/" />, <Ltl f="+" />
                      </>,
                    ],
                    ["intersection", <Ltl key="&amp;&amp;" f="&amp;&amp;" />],
                    ["NLM-intersection", <Ltl key="&amp;" f="&amp;" />],
                  ],
                  "140px",
                  this.props.classes
                )}
                The "Non-length-matching intersection" accepts words that match one
                operand and that have a prefix matching the other operand.
              </Typography>
              <Typography variant="body2">
                The following postfix unary operators are supported:
                {OpTable(
                  [
                    [
                      "Kleene star",
                      <>
                        <Ltl f="*" />, <Ltl f="[*]" />, <Ltl f="[*i..j]" />
                      </>,
                    ],
                    ["Kleene plus", <Ltl key="[+]" f="[+]" />],
                    [
                      "fusion star",
                      <>
                        <Ltl f="[:*]" />, <Ltl f="[:*i..j]" />
                      </>,
                    ],
                    ["fusion plus", <Ltl key="[:+]" f="[:+]" />],
                    ["goto", <Ltl key="[->i..j]" f="[->i..j]" />],
                    ["nonconseq. rep.", <Ltl key="[=i..j]" f="[=i..j]" />],
                  ],
                  "200px",
                  this.props.classes
                )}
              </Typography>
              <Typography variant="body2">
                The following prefix unary operator is used as a function:
                {OpTable(
                  [
                    [
                      "first match",
                      <>
                        <Ltl f="first_match(…)" />
                      </>,
                    ],
                  ],
                  "200px",
                  this.props.classes
                )}
              </Typography>
              <Typography variant="body2" color="primary">
                SERE-LTL Bindings Operators
              </Typography>
              <Typography variant="body1" gutterBottom>
                In the following, <Ltl f="r" /> denotes a SERE, and <Ltl f="f" /> denotes
                any PSL or LTL formula.
                {OpTable(
                  [
                    [
                      "universal suffix implication (a.k.a. trigger)",
                      <>
                        <Ltl f="{r}[]->f" />, <Ltl f="{r}|->f" />, <Ltl f="{r}(f)" />
                      </>,
                    ],
                    [
                      "existential suffix implication (a.k.a. seq)",
                      <Ltl key="{r}<>->f" f="{r}<>->f" />,
                    ],
                    [
                      "non-overlapping universal suffix implication",
                      <>
                        <Ltl f="{r}[]=>f" />, <Ltl f="{r}|=>f" />
                      </>,
                    ],
                    [
                      "non-overlapping existential suffix implication",
                      <Ltl key="{r}<>=>f" f="{r}<>=>f" />,
                    ],
                    ["weak closure", <Ltl key="{r}" f="{r}" />],
                    ["strong closure", <Ltl key="{r}!" f="{r}!" />],
                  ],
                  "300px",
                  this.props.classes
                )}
              </Typography>
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion classes={{ expanded: this.props.classes.helpexpanded }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Acceptance conditions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <Typography variant="body1" gutterBottom>
                Formulas can be translated into ω-automata with various types of
                acceptance conditions (Generalized Büchi acceptance is selected by
                default).
                <dl>
                  <dt>
                    <Typography variant="body2">monitor</Typography>
                  </dt>
                  <dd>
                    In a monitor, the only words that are rejected are those that cannot
                    be read by the automaton. Such automata will accept any finite prefix
                    that can be extended into an infinite word accepted by the formula.
                    Only safety properties can be recognized precisely. If a non-safety
                    formula is translated into a monitor, the resulting automaton will
                    accept a superset of the specified language.
                  </dd>
                  <dt>
                    <Typography variant="body2">Büchi acceptance</Typography>
                  </dt>
                  <dd>
                    Büchi automata have a set of accepting states represented with double
                    circles. An infinite word is accepted if it visits some accepting
                    state infinitely often. (For historical reason, only state-based Büchi
                    acceptance is supported.)
                  </dd>
                  <dt>
                    <Typography variant="body2">co-Büchi acceptance</Typography>
                  </dt>
                  <dd>
                    Co-Büchi automata have a set of <i>rejecting states</i> represented
                    with double circles (when state-based acceptance is used) or{" "}
                    <i>rejecting transitions</i> annotated with a "⓿". An infinite word is
                    accepted if it visits elements of the rejecting set a finite number of
                    times.
                  </dd>
                  <dt>
                    <Typography variant="body2">generalized Büchi acceptance</Typography>
                  </dt>
                  <dd>
                    In generalized Büchi automata, multiple sets of states or transitions
                    are used. States or transitions are annotated by circled numbers (like
                    ⓿) denoting the sets they belong to. A run is accepted if it visits a
                    state or transitions of each set infinitely often.
                  </dd>
                  <dt>
                    <Typography variant="body2">parity acceptance</Typography>
                  </dt>
                  <dd>
                    In automata with parity acceptance, multiple sets of states or
                    transitions are used. States or transitions are annotated by circled
                    numbers (like ⓿) denoting the sets they belong to. A run is accepted
                    if the maximum or minimum set number visited infinitely often is odd
                    or even. The choice between min or max, and odd or even, is indicated
                    at the top of the automaton and can be forced with some options. The{" "}
                    <b>colored</b> option forces each transitions (or state) to belong to
                    exactly one acceptance set; this is usually what people working with
                    parity automata are expecting.
                  </dd>
                  <dt>
                    <Typography variant="body2">Emerson-Lei acceptance</Typography>
                  </dt>
                  <dd>
                    When using Emerson-Lei acceptance, the acceptance condition produced
                    can be any positive boolean formula over terms like <b>Fin(⓿)</b>{" "}
                    (meaning that elements of set ⓿ should be seen <i>finitely</i> often)
                    or <b>Inf(⓿)</b> (<i>infinitely</i> often). Multiple acceptance sets
                    are used.
                  </dd>
                </dl>
                By default, automata with transition-based acceptance are produced, except
                for monitors (where it makes no sense) and Büchi automata (for historical
                reasons). The translation constraint "force state-based acc." can be used
                to force the produced automata to use state-based acceptance, possibly
                increasing the number of states. However, even when automata are displayed
                as state-based, they are stored using transition-based acceptance
                internally: this can be seen using the "force transition-based acc."{" "}
                <i>display</i> option. This explains why these two options are not
                mutually exclusive.
              </Typography>
            </Typography>
          </AccordionDetails>
        </Accordion>
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

// Exported for the component tests, which render the tabs on their own.
export { LtlApp, LtlCompare, LtlInput, LtlRewrite, LtlStudy, LtlTranslate, Versions };
export default withStyles(LtlApps, styles);
