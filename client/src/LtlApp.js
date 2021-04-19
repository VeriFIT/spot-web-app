/* -*- coding: utf-8 -*-
 ** Copyright (C) 2018-2021 Laboratoire de Recherche et Développement de
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
import "typeface-roboto";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import CircularProgress from "@material-ui/core/CircularProgress";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import HelpIcon from "@material-ui/icons/Help";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import SvgIcon from "@material-ui/core/SvgIcon";
import SVGInline from "react-svg-inline";
import Switch from "@material-ui/core/Switch";
import Tab from "@material-ui/core/Tab";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import Tabs from "@material-ui/core/Tabs";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  toplevel: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    [theme.breakpoints.up("sm")]: {
      justifyContent: "center",
    },
  },
  help: {
    margin: theme.spacing.unit,
    paddingTop: theme.spacing.unit,
    width: 640 - 2 * theme.spacing.unit,
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
    margin: theme.spacing.unit,
    padding: theme.spacing.unit,
    width: 640 - 2 * theme.spacing.unit,
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
  },
  ltlInput: {
    width: "100%",
    overflow: "hidden",
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
  textField: {
    overflow: "hidden",
  },
  textField1: {
    overflow: "hidden",
    backgroundColor: "#b2ffff",
  },
  textField2: {
    overflow: "hidden",
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
    marginRight: theme.spacing.unit,
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
    padding: theme.spacing.unit,
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
    <Typography>
      <table>
        <tr>
          <td>
            <NoteIcon {...props} />
          </td>
          <td>{props.text}</td>
        </tr>
      </table>
    </Typography>
  );
}

function api_endpoint() {
  /* REACT_APP_API_ENDPOINT and REACT_APP_API_PORT are defined in
   * files client/.env.{production,development}
   *
   * When developing, the API and web pages are running on different
   * ports, but in production we assume they are served from the
   * same server.
   */
  return (
    window.location.protocol +
    "//" +
    (process.env.REACT_APP_API_PORT
      ? window.location.hostname + process.env.REACT_APP_API_PORT
      : window.location.host) +
    process.env.REACT_APP_API_ENDPOINT
  );
}

function renderError(msg) {
  if (!msg.startsWith("500 ")) return <pre>{msg}</pre>;
  return (
    <React.Fragment>
      <pre>{msg}</pre>
      <Typography color="error">
        Our server automatically kills requests that take longer than 40
        seconds, or that require too much memory.
        <br /> If you do <i>not</i> think that is the case here, please send a
        screenshot and any helpful detail to{" "}
        <a href="mailto:spot@lrde.epita.fr">
          <code>spot@lrde.epita.fr</code>
        </a>
        .<br />
        If you <i>do</i> think that is the case, please consider{" "}
        <a href="https://spot.lrde.epita.fr/install.html">installing Spot</a> to
        run your experiments locally; this is a shared service.
      </Typography>
    </React.Fragment>
  );
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.status + " " + response.statusText);
  }
  return response.json();
}
function handleErrorsAndClearTimer(timer) {
  return (response) => {
    clearTimeout(timer);
    if (!response.ok) {
      throw Error(response.status + " " + response.statusText);
    }
    return response.json();
  };
}

function righthelp(contents, help) {
  return (
    <Tooltip title={help} placement="right" enterDelay={750}>
      <div>{contents}</div>
    </Tooltip>
  );
}

class LtlInput extends React.Component {
  state = {
    tmpformula: this.props.defaultValue || "",
    formula: this.props.defaultValue || "",
  };

  handleChange = (e) => {
    this.setState({ tmpformula: e.target.value });
  };

  updateFormula = () => {
    let fmt = this.state.tmpformula;
    this.setState({ formula: fmt });
    this.props.setFormula(fmt);
  };

  handleKey = (e) => {
    if (e.key === "Enter") this.updateFormula();
  };

  randomizeFormula = () => {
    let url = new URL(api_endpoint() + "random");
    if (this.props.expert)
      // turn on PSL generation
      url.searchParams.append("p", 1);
    fetch(url)
      .then(handleErrors)
      .then((fmt) => {
        this.setState({ tmpformula: fmt, formula: fmt });
        this.props.setFormula(fmt);
      });
  };

  render() {
    return (
      <div className={this.props.classes.ltlInput}>
        <TextField
          error={Boolean(this.props.formulaerr)}
          className={this.props.className}
          fullWidth
          value={this.state.tmpformula}
          label={this.props.label}
          autoFocus={this.props.autoFocus}
          onChange={this.handleChange}
          onKeyPress={this.handleKey}
          onBlur={this.updateFormula}
          InputProps={{
            endAdornment: (
              <Tooltip
                disableFocusListener={true}
                title="Overwrite input with a random formula."
                placement="right"
                enterDelay={750}
              >
                <InputAdornment position="end">
                  <IconButton onClick={this.randomizeFormula}>
                    <DiceIcon color="primary" />
                  </IconButton>
                </InputAdornment>
              </Tooltip>
            ),
          }}
        />
        <FormHelperText className={this.props.classes.helperText}>
          {this.state.tmpformula !== this.state.formula && (
            <span>
              Hit <i>Enter</i> or <i>Tab</i> to update the results.
            </span>
          )}
        </FormHelperText>
        {this.props.formulalbt && (
          <NoteText
            text={
              "Assuming a prefix syntax in the style of " +
              "LBT/LTL2DSTAR, as the standard parser for " +
              "infix syntaxes failed."
            }
          />
        )}
        {this.props.formulaerr && (
          <pre className={this.props.classes.parseerror}>
            {this.props.formulaerr}
          </pre>
        )}
      </div>
    );
  }
}

class Versions extends React.Component {
  state = {
    anchorEl: null,
    versions: [],
  };

  handleOpen = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  componentDidMount() {
    fetch(api_endpoint() + "versions")
      .then(handleErrors)
      .then((vers) => {
        vers.push(["React", React.version, "https://reactjs.org/"]);
        this.setState({ versions: vers });
      })
      .catch((error) =>
        this.setState({ versions: [[error.message, null, null]] })
      );
  }

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    return (
      <div>
        <Button
          className={this.props.classes.versions}
          color="secondary"
          onClick={this.handleOpen}
        >
          Versions
        </Button>
        <Menu
          id="lock-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <Table className={classes.versiontable}>
            <TableBody>
              {this.state.versions.map(([tool, version, url]) => {
                return (
                  <TableRow>
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
            aria-controls="lock-menu"
            aria-label="LTL syntax to output"
            onClick={this.handleClickListItem}
          >
            <ListItemText primary={this.options[this.props.syntax]} />
          </ListItem>
        </List>
        <Menu
          id="lock-menu"
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
    lc: "reduction based on automata-based containements",
    fs: "enable rules that favor suspendable formules at the top level",
    pn: "NNF rewriting should stop on Boolean subformulas",
    bi: "rewrite Boolean subformulas to irredundant-sum-of-products",
  };
  form = ([key, value]) => {
    return (
      <FormControlLabel
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
        <FormLabel
          component="legend"
          classes={{ focused: this.props.classes.focused }}
        >
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
    let syntaxId =
      this.props.syntax === "i" ? 1 : this.props.syntax === "l" ? 2 : 0;
    let key = values[0];
    return (
      <FormControlLabel
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
        className={[
          this.props.classes.borderedgroupprimary,
          this.props.classes.unabbrev,
        ]}
      >
        <FormLabel component="legend">
          {righthelp(
            "Unabbreviate",
            "Remove occurrances of selected operators by rewriting them using other operators."
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
    b: "Acceptance: (state-based) Büchi",
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
            aria-controls="lock-menu"
            aria-label="Acceptance to use"
            onClick={this.handleClickListItem}
          >
            <ListItemText primary={this.options[this.props.acc]} />
          </ListItem>
        </List>
        <Menu
          id="lock-menu"
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
    return (
      <Paper className={this.props.classes.results}>{this.props.result}</Paper>
    );
  }
}

class LtlRewrite extends React.Component {
  timer = null;

  state = {
    result: null,
  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  updateResult() {
    if (this.props.formula === "") {
      this.setState({ result: "" });
      return;
    }
    let url = new URL(
      api_endpoint() + "rewrite/" + encodeURIComponent(this.props.formula)
    );
    if (this.props.simplify)
      Object.entries(this.props.ltlsimp).forEach(([key, value]) => {
        if (value) url.searchParams.append("r", key);
      });
    url.searchParams.append("ff", this.props.syntax);

    let unabbrev = "";
    Object.entries(this.props.unabbrev).forEach(([key, value]) => {
      if (value) unabbrev = unabbrev.concat(key);
    });
    if (unabbrev !== "") url.searchParams.append("u", unabbrev);

    this.timer = setTimeout(() => {
      this.setState({
        result: <CircularProgress className={this.props.classes.progress} />,
      });
    }, 800);
    fetch(url)
      .then(handleErrorsAndClearTimer(this.timer))
      .then((res) => {
        this.props.handleAnyParseError(res);
        if ("formula" in res)
          this.setState({ result: <Typography>{res["formula"]}</Typography> });
        else if ("svg" in res)
          this.setState({ result: <SVGInline svg={res["svg"]} /> });
        else if ("error" in res)
          this.setState({ result: <Typography>{res["error"]}</Typography> });
        else this.setState({ result: null });
      })
      .catch((error) => {
        clearTimeout(this.timer);
        this.setState({ result: renderError(error.message) });
      });
  }

  componentDidMount() {
    this.updateResult();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.syntax !== this.props.syntax ||
      prevProps.ltlsimp !== this.props.ltlsimp ||
      prevProps.simplify !== this.props.simplify ||
      prevProps.unabbrev !== this.props.unabbrev ||
      prevProps.formula !== this.props.formula
    ) {
      this.updateResult();
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.props.hideoptions || (
          <React.Fragment>
            <LtlSyntaxChoice
              syntax={this.props.syntax}
              classes={this.props.classes}
              changeSyntax={this.props.changeSyntax}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.simplify}
                  onChange={this.props.handleChecked("simplify")}
                  value="simplify"
                  color="primary"
                />
              }
              label="Simplify"
            />
            <LtlUnabbrevOptions
              handleChangeLtlUnabbrev={this.props.handleChangeLtlUnabbrev}
              unabbrev={this.props.unabbrev}
              classes={this.props.classes}
              syntax={this.props.syntax}
            />
            {this.props.expert && (
              <LtlSimplificationOptions
                classes={this.props.classes}
                ltlsimp={this.props.ltlsimp}
                simplify={this.props.simplify}
                handleChangeLtlSimp={this.props.handleChangeLtlSimp}
              />
            )}
          </React.Fragment>
        )}
        {this.state.result && (
          <LtlResult classes={this.props.classes} result={this.state.result} />
        )}
      </React.Fragment>
    );
  }
}

class LtlStudy extends React.Component {
  timer = null;

  state = {
    result: null,
  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  buildResult(res) {
    if (!("mp_class_text" in res)) return;
    return (
      <React.Fragment>
        <div className={this.props.classes.hierarchydiv}>
          <SVGInline
            className={this.props.classes.hierarchy_svg}
            svg={res["mp_hierarchy_svg"]}
          />
          <Typography variant="body2" color="primary">
            Hierarchy of Mana and Pnueli
          </Typography>
          <Typography>
            This formula describes <b>{res["mp_class_text"]}</b>.
          </Typography>
          {"pathological" in res && (
            <Typography>
              Note that this is a <b>pathological formula</b> that would not be
              classified as precisely using only syntactic means. This usually
              means that a simpler equivalent formula exists.
            </Typography>
          )}
        </div>
        <div className={this.props.classes.livenessdiv}>
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
              This formula represents both{" "}
              <b>a safety and a liveness property</b>.
            </Typography>
          )}
          {res["safety_liveness"] === "none" && (
            <Typography>
              This formula is neither a safety nor a liveness property. However
              it necessarily is the <b>intersection</b> of a liveness and a
              safety property.
            </Typography>
          )}
        </div>
        <div className={this.props.classes.indexdiv}>
          <Typography variant="body2" color="primary">
            Indices
          </Typography>
          {(res["Rabin_index"] !== null || res["Streett_index"] !== null) && (
            <Table className={this.props.classes.wordtable}>
              <TableBody>
                <TableRow className={this.props.classes.wordtablerow}>
                  <TableCell
                    component="th"
                    scope="row"
                    className={this.props.classes.wordtablecell}
                  >
                    Rabin index:
                  </TableCell>
                  <TableCell className={this.props.classes.wordtablecellw}>
                    {res["Rabin_index"]}
                  </TableCell>
                </TableRow>
                <TableRow className={this.props.classes.wordtablerow}>
                  <TableCell
                    component="th"
                    scope="row"
                    className={this.props.classes.wordtablecell}
                  >
                    Streett index:
                  </TableCell>
                  <TableCell className={this.props.classes.wordtablecellw}>
                    {res["Streett_index"]}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>
        <div className={this.props.classes.satisfiabilitydiv}>
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
            <Table className={this.props.classes.wordtable}>
              <TableBody>
                <TableRow className={this.props.classes.wordtablerow}>
                  <TableCell
                    component="th"
                    scope="row"
                    className={this.props.classes.wordtablecell}
                  >
                    Accepted word:
                  </TableCell>
                  <TableCell className={this.props.classes.wordtablecellw}>
                    {res["acc_word"]}
                  </TableCell>
                </TableRow>
                <TableRow className={this.props.classes.wordtablerow}>
                  <TableCell
                    component="th"
                    scope="row"
                    className={this.props.classes.wordtablecell}
                  >
                    Rejected word:
                  </TableCell>
                  <TableCell className={this.props.classes.wordtablecellw}>
                    {res["rej_word"]}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>
        <div className={this.props.classes.stutterdiv}>
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
              This formula is <b>stutter-invariant</b> even if it might not look
              so syntactically.
              {"stutter_invariant_eq" in res && (
                <>
                  <br />
                  Furthermore, it can be simplified to the following{" "}
                  <i>syntactically sutter-invariant</i> formula:
                  <br />
                  <Ltl f={res["stutter_invariant_eq"]} />
                </>
              )}
            </Typography>
          )}
          {res["stutter_invariant"] === false && (
            <Typography>
              This formula is <b>stutter-sensitive</b>.<br />
              The accepted and rejected words given above are a proof of that,
              as they differ only by some stuttering.
            </Typography>
          )}
        </div>
      </React.Fragment>
    );
  }

  updateResult() {
    if (this.props.formula === "") {
      this.props.handleAnyParseError({});
      this.setState({ result: "" });
      return;
    }
    let url = new URL(
      api_endpoint() + "study/" + encodeURIComponent(this.props.formula)
    );

    this.timer = setTimeout(() => {
      this.setState({
        result: <CircularProgress className={this.props.classes.progress} />,
      });
    }, 800);
    fetch(url)
      .then(handleErrorsAndClearTimer(this.timer))
      .then((res) => {
        this.props.handleAnyParseError(res);
        this.setState({ result: this.buildResult(res) });
      })
      .catch((error) => {
        clearTimeout(this.timer);
        this.setState({ result: renderError(error.message) });
      });
  }

  componentDidMount() {
    this.updateResult();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.formula !== this.props.formula) {
      this.updateResult();
    }
  }

  render() {
    return (
      <div>
        {this.state.result && (
          <LtlResult classes={this.props.classes} result={this.state.result} />
        )}
      </div>
    );
  }
}

class LtlTranslate extends React.Component {
  timer = null;

  state = {
    result: null,
    showfile: 0,
  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  showfilehoa = () => {
    let newval = this.state.showfile === 1 ? 0 : 1;
    this.setState({ showfile: newval });
  };
  showfilespin = () => {
    this.setState({ showfile: this.state.showfile === 2 ? 0 : 2 });
  };

  buildResult(res) {
    // Return a lambda so we capture res, and can easily re-render
    // the results on events (such as clicking on HOA or
    // NeverClaim).
    return () => {
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
          {"note" in res && res["note"].map((note) => <NoteText text={note} />)}
          {"automaton_svg" in res && (
            <SVGInline
              className={this.props.classes.automaton_svg}
              component="div"
              svg={res["automaton_svg"]}
            />
          )}
          {"automaton_hoa" in res && (
            <Button color="primary" onClick={this.showfilehoa}>
              HOA
            </Button>
          )}
          {"automaton_spin" in res && (
            <Button color="primary" onClick={this.showfilespin}>
              NeverClaim
            </Button>
          )}
          {this.state.showfile === 1 && (
            <pre className={this.props.classes.pre}>{res["automaton_hoa"]}</pre>
          )}
          {this.state.showfile === 2 && (
            <pre className={this.props.classes.pre}>
              {res["automaton_spin"]}
            </pre>
          )}
        </React.Fragment>
      );
    };
  }

  updateResult() {
    if (this.props.formula === "") {
      this.setState({ result: "" });
      return;
    }
    let url = new URL(
      api_endpoint() + "translate/" + encodeURIComponent(this.props.formula)
    );

    url.searchParams.append("a", this.props.acc);
    url.searchParams.append("p", this.props.autpref);
    url.searchParams.append("l", this.props.optlevel);
    if (this.props.acc === "p") {
      url.searchParams.append("m", this.props.minmax);
      url.searchParams.append("e", this.props.oddeven);
    }
    Object.entries(this.props.transopts).forEach(([key, value]) => {
      if (value) url.searchParams.append("o", key);
    });

    this.timer = setTimeout(() => {
      this.setState({
        result: () => (
          <CircularProgress className={this.props.classes.progress} />
        ),
      });
    }, 800);
    fetch(url)
      .then(handleErrorsAndClearTimer(this.timer))
      .then((res) => {
        this.props.handleAnyParseError(res);
        this.setState({ result: this.buildResult(res) });
      })
      .catch((error) => {
        clearTimeout(this.timer);
        this.setState({ result: () => renderError(error.message) });
      });
  }

  componentDidMount() {
    this.updateResult();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.formula !== this.props.formula ||
      prevProps.acc !== this.props.acc ||
      prevProps.autpref !== this.props.autpref ||
      prevProps.transopts !== this.props.transopts ||
      prevProps.minmax !== this.props.minmax ||
      prevProps.oddeven !== this.props.oddeven ||
      prevProps.optlevel !== this.props.optlevel
    ) {
      this.updateResult();
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.props.hideoptions || (
          <React.Fragment>
            <AccChoice
              acc={this.props.acc}
              classes={this.props.classes}
              changeAcc={this.props.changeAcc}
            />
            <div className={this.props.classes.optionstrans}>
              <FormControl
                component="fieldset"
                className={this.props.classes.borderedgroupprimary}
              >
                <FormLabel component="legend">Translation pref.</FormLabel>
                <RadioGroup
                  aria-label="Translation preferences"
                  name="autpref"
                  value={this.props.autpref}
                  onChange={this.props.changeAutpref}
                >
                  <FormControlLabel
                    classes={{ root: this.props.classes.fclvertical }}
                    value="s"
                    control={<Radio color="primary" />}
                    label="small"
                  />
                  <FormControlLabel
                    classes={{ root: this.props.classes.fclvertical }}
                    value="d"
                    control={<Radio color="primary" />}
                    label="deterministic"
                  />
                  {(this.props.expert || this.props.autpref === "a") && (
                    <FormControlLabel
                      classes={{ root: this.props.classes.fclvertical }}
                      value="a"
                      control={<Radio />}
                      label="any"
                    />
                  )}
                </RadioGroup>
              </FormControl>
              <FormControl
                component="fieldset"
                className={this.props.classes.borderedgroupprimary}
              >
                <FormLabel component="legend">
                  Translation constraints
                </FormLabel>
                <FormControlLabel
                  classes={{ root: this.props.classes.fclvertical }}
                  control={
                    <Checkbox
                      checked={this.props.transopts["complete"]}
                      color="primary"
                      onChange={this.props.handleChangeTransOpts("complete")}
                    />
                  }
                  label={righthelp(
                    "complete",
                    "Make sure we can always move forward in the automaton, regardless of where we are and what letter we read."
                  )}
                />
                <FormControlLabel
                  classes={{ root: this.props.classes.fclvertical }}
                  control={
                    <Checkbox
                      checked={this.props.transopts["unambiguous"]}
                      color="primary"
                      onChange={this.props.handleChangeTransOpts("unambiguous")}
                    />
                  }
                  label={righthelp(
                    "unambiguous",
                    "Accepted words should have only one accepting run.  Rejecting words may be rejected by many runs."
                  )}
                />
                <FormControlLabel
                  classes={{ root: this.props.classes.fclvertical }}
                  control={
                    <Checkbox
                      checked={this.props.transopts["statebased"]}
                      color="primary"
                      disabled={
                        this.props.acc === "m" || this.props.acc === "b"
                      }
                      onChange={this.props.handleChangeTransOpts("statebased")}
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
                className={this.props.classes.borderedgroupprimary}
              >
                <FormLabel component="legend">Display options</FormLabel>
                <FormControlLabel
                  classes={{ root: this.props.classes.fclvertical }}
                  control={
                    <Checkbox
                      checked={this.props.transopts["showscc"]}
                      color="primary"
                      onChange={this.props.handleChangeTransOpts("showscc")}
                    />
                  }
                  label={righthelp(
                    "show SCCs",
                    "Strongly Connected Components will be highlighted in green (accepting), red (rejecting), black (transiant), and gray (rejecting and useless)."
                  )}
                />
                <FormControlLabel
                  classes={{ root: this.props.classes.fclvertical }}
                  control={
                    <Checkbox
                      checked={this.props.transopts["showndet"]}
                      color="primary"
                      onChange={this.props.handleChangeTransOpts("showndet")}
                    />
                  }
                  label={"show non-determinism"}
                />
                <FormControlLabel
                  classes={{ root: this.props.classes.fclvertical }}
                  control={
                    <Checkbox
                      checked={this.props.transopts["forcetacc"]}
                      color="primary"
                      onChange={this.props.handleChangeTransOpts("forcetacc")}
                      disabled={this.props.acc === "m"}
                    />
                  }
                  label={righthelp(
                    "force transition-based acc.",
                    "If an automaton with state-based acceptance has ben built, move the acceptance marks of each state to its outgoing transitions.  (This is actually how automata are stored in Spot.)"
                  )}
                />
              </FormControl>
              {this.props.acc === "p" && (
                <FormControl
                  component="fieldset"
                  className={this.props.classes.borderedgroupprimary}
                >
                  <FormLabel component="legend">Parity style</FormLabel>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.props.transopts["colored"]}
                        color="primary"
                        onChange={this.props.handleChangeTransOpts("colored")}
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
                    value={this.props.minmax}
                    onChange={this.props.changeMinMax}
                    className={this.props.classes.flexhoriz}
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
                    value={this.props.oddeven}
                    onChange={this.props.changeOddEven}
                    className={this.props.classes.flexhoriz}
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
              {this.props.expert && (
                <FormControl
                  component="fieldset"
                  className={this.props.classes.borderedgroupsecondary}
                >
                  <FormLabel
                    component="legend"
                    classes={{ focused: this.props.classes.focused }}
                  >
                    Optimization level
                  </FormLabel>
                  <RadioGroup
                    aria-label="Optimization level"
                    name="optlevel"
                    value={this.props.optlevel}
                    className={this.props.classes.flexhoriz}
                    onChange={this.props.changeOptLevel}
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
        {this.state.result && (
          <LtlResult
            classes={this.props.classes}
            result={this.state.result()}
          />
        )}
      </React.Fragment>
    );
  }
}

class LtlCompare extends React.Component {
  timer = null;

  state = {
    formula2err: null,
    formula2lbt: false,
    result: null,
  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  setFormulaError2 = (val) => {
    this.setState({ formula2err: val });
  };
  setPrefixSyntax2 = (val) => {
    this.setState({ formula2lbt: val });
  };

  handleAnyParseError = (res) => {
    this.props.handleAnyParseError(res); // first formula
    if ("parse_error2" in res) this.setFormulaError2(res["parse_error2"]);
    else this.setFormulaError2(null);
    this.setPrefixSyntax2(res["prefix_syntax2"] === true);
  };

  buildResult(res) {
    if (!("txt" in res && "svg" in res)) return null;
    return (
      <React.Fragment>
        {"txt" in res && <Typography>{res["txt"]}</Typography>}
        {"svg" in res && (
          <SVGInline svg={res["svg"]} className={this.props.classes.vendiag} />
        )}
        <Table className={this.props.classes.wordtable}>
          <TableBody>
            {"w1" in res && (
              <TableRow className={this.props.classes.wordtablerow}>
                <TableCell
                  component="th"
                  scope="row"
                  className={this.props.classes.wordtablecell}
                >
                  w₁:
                </TableCell>
                <TableCell className={this.props.classes.wordtablecellw}>
                  {res["w1"]}
                </TableCell>
              </TableRow>
            )}
            {"w2" in res && (
              <TableRow className={this.props.classes.wordtablerow}>
                <TableCell
                  component="th"
                  scope="row"
                  className={this.props.classes.wordtablecell}
                >
                  w₂:
                </TableCell>
                <TableCell className={this.props.classes.wordtablecellw}>
                  {res["w2"]}
                </TableCell>
              </TableRow>
            )}
            {"w3" in res && (
              <TableRow className={this.props.classes.wordtablerow}>
                <TableCell
                  component="th"
                  scope="row"
                  className={this.props.classes.wordtablecell}
                >
                  w₃:
                </TableCell>
                <TableCell className={this.props.classes.wordtablecellw}>
                  {res["w3"]}
                </TableCell>
              </TableRow>
            )}
            {"w4" in res && (
              <TableRow className={this.props.classes.wordtablerow}>
                <TableCell
                  component="th"
                  scope="row"
                  className={this.props.classes.wordtablecell}
                >
                  w₄:
                </TableCell>
                <TableCell className={this.props.classes.wordtablecellw}>
                  {res["w4"]}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </React.Fragment>
    );
  }

  updateResult() {
    if (this.props.formula === "" || this.props.formula2 === "") {
      this.setState({ result: "" });
      return;
    }
    let url = new URL(
      api_endpoint() + "compare/" + encodeURIComponent(this.props.formula)
    );
    url.searchParams.append("g", this.props.formula2);

    this.timer = setTimeout(() => {
      this.setState({
        result: <CircularProgress className={this.props.classes.progress} />,
      });
    }, 800);
    fetch(url)
      .then(handleErrorsAndClearTimer(this.timer))
      .then((res) => {
        this.handleAnyParseError(res);
        this.setState({ result: this.buildResult(res) });
      })
      .catch((error) => {
        clearTimeout(this.timer);
        this.setState({ result: renderError(error.message) });
      });
  }

  componentDidMount() {
    this.updateResult();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.formula !== this.props.formula ||
      prevProps.formula2 !== this.props.formula2
    ) {
      this.updateResult();
    }
  }

  render() {
    return (
      <React.Fragment>
        <LtlInput
          classes={this.props.classes}
          className={this.props.classes.textField2}
          label="Second formula"
          expert={this.props.expert}
          defaultValue={this.props.formula2}
          setFormula={this.props.handleChangeFormula2}
          formulalbt={this.state.formula2lbt}
          formulaerr={this.state.formula2err}
        />
        {this.state.result && (
          <LtlResult classes={this.props.classes} result={this.state.result} />
        )}
      </React.Fragment>
    );
  }
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
    formula: "",
    formula2: "",
    formulaerr: null,
    formulalbt: false,
    minmax: "any",
    oddeven: "any",
    transopts: {
      // translation constraints
      unambig: false,
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
          scrollable
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
            expert={this.props.expert}
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
          <div className={classes.oppair} style={{ width: width }}>
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

        <ExpansionPanel classes={{ expanded: this.props.classes.helpexpanded }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="title">About</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              <Typography variant="body1" gutterBottom>
                This web application is built using the services of{" "}
                <a href="https://spot.lrde.epita.fr/">Spot</a> running on a
                shared computer. For serious uses, you can answer similar
                questions using the{" "}
                <a href="https://spot.lrde.epita.fr/tools.html">
                  command-line tools
                </a>
                , or by{" "}
                <a href="https://spot.lrde.epita.fr/tut.html">
                  writing some C++ or Python code
                </a>
                .
              </Typography>
              <Typography variant="body1" gutterBottom>
                The source code for this application can be found{" "}
                <a href="https://gitlab.lrde.epita.fr/spot/spot-web-app/">
                  on our gitlab
                </a>
                , and is distributed under the{" "}
                <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">
                  GNU GPL v3
                </a>{" "}
                license.
              </Typography>
              <Typography variant="body1" gutterBottom>
                For any question not answered in this small help text, or for
                reporting any bug, please send an email to{" "}
                <a href="mailto:spot@lrde.epita.fr">the Spot mailing list</a>.
              </Typography>
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={{ expanded: this.props.classes.helpexpanded }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="title">Operation modes</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography variant="body1">
              The application has four modes of operation that you can select at
              its top:
              <dl>
                <dt>
                  <Typography variant="body2">Rewrite</Typography>
                </dt>
                <dd>
                  for rewriting a formula (changing syntaxes, symplifying,
                  removing some operators)
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
                <dd>
                  for constructing an automaton equivalent to a given formula
                </dd>
              </dl>
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={{ expanded: this.props.classes.helpexpanded }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="title">LTL Infix Syntax</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              <Typography variant="body1" gutterBottom>
                To accomodate the syntaxes of different tools, Spot supports
                alternative representations for many operators. For the
                semantics of all operators see{" "}
                <a href="https://spot.lrde.epita.fr/tl.pdf">this document</a>.
              </Typography>
              <Typography variant="body2" color="primary">
                Atomic propositions
              </Typography>
              <Typography variant="body1" gutterBottom>
                Use alphanumeric identifiers or double-quoted strings for atomic
                propositions, and parentheses for grouping. Identifiers cannot
                start with the letter of a prefix operator (<Ltl f="F" />,{" "}
                <Ltl f="G" />, or <Ltl f="X" />
                ): for instance <Ltl f="GFa" /> means <Ltl f="G(F(a))" />. Use{" "}
                <Ltl f='"GFa"' />, with double quotes, if you really want to
                refer to <Ltl f="GFa" /> as a proposition. Conversely, infix
                letter operators are not assumed to be operators if they are
                part of an identifier: <Ltl f="aUb" /> is an atomic proposition,
                unlike <Ltl f="a&nbsp;U&nbsp;b" /> and <Ltl f="(a)U(b)" />.
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
                        <Ltl f="&amp;" />, <Ltl f="&amp;&amp;" />,{" "}
                        <Ltl f="/\" /*"*/ />
                      </>,
                    ],
                    [
                      "or",
                      <>
                        <Ltl f="|" />, <Ltl f="||" />, <Ltl f="\/" />,{" "}
                        <Ltl f="+" />
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
                <a href="http://www.ist.tugraz.at/staff/bloem/wring.html">
                  Wring
                </a>
                , atomic propositions can be followed by <Ltl f="=1" /> or{" "}
                <Ltl f="=0" /> to specify their polarity. For instance{" "}
                <Ltl f="a=0 U b=1" /> is equivalent to <Ltl f="!a U b" />.
              </Typography>
              <Typography variant="body2" color="primary">
                Temporal Operators
              </Typography>
              <Typography variant="body1" gutterBottom>
                The following binary operators are supported:
                {OpTable(
                  [
                    ["strong until", <Ltl f="U" />],
                    ["weak until", <Ltl f="W" />],
                    ["strong release", <Ltl f="M" />],
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
                <Ltl f="G[n..m]" /> are syntactic sugar for differents types of
                repetition of the <Ltl f="X" /> operator. For instance{" "}
                <Ltl f="F[3..5]p" /> is short for <Ltl f="XXX(p|X(p|Xp))" />.
              </Typography>
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={{ expanded: this.props.classes.helpexpanded }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="title">LTL Prefix Syntax</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              <Typography variant="body1" gutterBottom>
                If (and only if!) parsing the input formula using the infix
                syntax failed, the application will attempt to parse the formula
                using a prefix syntax (Polish notation) that should be a
                superset of what tools like{" "}
                <a href="http://www.tcs.hut.fi/Software/maria/tools/lbt/">
                  LBT
                </a>
                , <a href="http://www.tcs.hut.fi/Software/lbtt/">LBTT</a>,{" "}
                <a href="http://tcs.legacy.ics.tkk.fi/users/tlatvala/scheck/">
                  scheck
                </a>{" "}
                or <a href="http://www.ltl2dstar.de/">ltl2dstar</a> can read.
              </Typography>
              <Typography variant="body1">
                The following prefix operators are supported:
                {OpTable(
                  [
                    ["true", <Ltl f="t" />],
                    ["false", <Ltl f="f" />],
                    ["not", <Ltl f="!" />],
                    ["and", <Ltl f="&" />],
                    ["or", <Ltl f="|" />],
                    ["implication", <Ltl f="i" />],
                    ["equivalence", <Ltl f="e" />],
                    ["xor", <Ltl f="^" />],
                    ["next", <Ltl f="X" />],
                    ["eventually", <Ltl f="F" />],
                    ["globally", <Ltl f="G" />],
                    ["strong until", <Ltl f="U" />],
                    ["weak release", <Ltl f="V" />],
                    ["strong release", <Ltl f="M" />],
                    ["weak until", <Ltl f="W" />],
                  ],
                  "120px",
                  this.props.classes
                )}
                Double-quoted strings, as well as identifiers that do not look
                like operators, are assumed to be atomic propositions.
              </Typography>
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={{ expanded: this.props.classes.helpexpanded }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="title">PSL Infix Syntax</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              <Typography variant="body1" gutterBottom>
                A subset of PSL can be used to express linear properties that
                are more expressive than LTL. For the semantics of all operators
                see{" "}
                <a href="https://spot.lrde.epita.fr/tl.pdf">this document</a>.
              </Typography>
              <Typography variant="body1" gutterBottom>
                If you put the application in "expert mode", clicking on the
                dice will generate a random PSL formula instead of generating a
                random LTL formula.
              </Typography>
              <Typography variant="body2" color="primary">
                Semi-Extended Regular Expression (SERE)
              </Typography>
              <Typography variant="body1" gutterBottom>
                Those semi-extended regular expressions match finite prefixes,
                and are constructed above Boolean expressions built using the
                standard Boolean operators. A new constant, <Ltl f="[*0]" />{" "}
                represents the empty word.
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
                        <Ltl f="|" />, <Ltl f="||" />, <Ltl f="\/" />,{" "}
                        <Ltl f="+" />
                      </>,
                    ],
                    ["intersection", <Ltl f="&amp;&amp;" />],
                    ["NLM-intersection", <Ltl f="&amp;" />],
                  ],
                  "140px",
                  this.props.classes
                )}
                The "Non-length-matching intersection" accepts words that match
                one operand and that have a prefix matching the other operand.
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
                    ["Kleene plus", <Ltl f="[+]" />],
                    [
                      "fusion star",
                      <>
                        <Ltl f="[:*]" />, <Ltl f="[:*i..j]" />
                      </>,
                    ],
                    ["fusion plus", <Ltl f="[:+]" />],
                    ["goto", <Ltl f="[->i..j]" />],
                    ["nonconseq. rep.", <Ltl f="[=i..j]" />],
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
                In the following, <Ltl f="r" /> denotes a SERE, and{" "}
                <Ltl f="f" /> denotes any PSL or LTL formula.
                {OpTable(
                  [
                    [
                      "universal suffix implication (a.k.a. trigger)",
                      <>
                        <Ltl f="{r}[]->f" />, <Ltl f="{r}|->f" />,{" "}
                        <Ltl f="{r}(f)" />
                      </>,
                    ],
                    [
                      "existential suffix implication (a.k.a. seq)",
                      <Ltl f="{r}<>->f" />,
                    ],
                    [
                      "non-overlapping universal suffix implication",
                      <>
                        <Ltl f="{r}[]=>f" />, <Ltl f="{r}|=>f" />
                      </>,
                    ],
                    [
                      "non-overlapping existential suffix implication",
                      <Ltl f="{r}<>=>f" />,
                    ],
                    ["weak closure", <Ltl f="{r}" />],
                    ["strong closure", <Ltl f="{r}!" />],
                  ],
                  "300px",
                  this.props.classes
                )}
              </Typography>
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={{ expanded: this.props.classes.helpexpanded }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="title">Acceptance conditions</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              <Typography variant="body1" gutterBottom>
                Formulas can be translated into ω-automata with various types of
                acceptance conditions (Generalized Büchi acceptance is selected
                by default).
                <dl>
                  <dt>
                    <Typography variant="body2">monitor</Typography>
                  </dt>
                  <dd>
                    In a monitor, the only words that are rejected are those
                    that cannot be read by the automaton. Such automata will
                    accept any finite prefix that can be extended into an
                    infinite word accepted by the formula. Only safety
                    properties can be recognized precisely. If a non-safety
                    formula is translated into a monitor, the resulting
                    automaton will accept a superset of the specified language.
                  </dd>
                  <dt>
                    <Typography variant="body2">Büchi acceptance</Typography>
                  </dt>
                  <dd>
                    Büchi automata have a set of accepting states represented
                    with double circles. An infinite word is accepted if it
                    visits some accepting state infinitely often. (For
                    historical reason, only state-based Büchi acceptance is
                    supported.)
                  </dd>
                  <dt>
                    <Typography variant="body2">co-Büchi acceptance</Typography>
                  </dt>
                  <dd>
                    Co-Büchi automata have a set of <i>rejecting states</i>{" "}
                    represented with double circles (when state-based acceptance
                    is used) or <i>rejecting transitions</i> annotated with a
                    "⓿". An infinite word is accepted if it visits elements of
                    the rejecting set a finite number of times.
                  </dd>
                  <dt>
                    <Typography variant="body2">
                      generalized Büchi acceptance
                    </Typography>
                  </dt>
                  <dd>
                    In generalized Büchi automata, multiple sets of states or
                    transitions are used. States or transitions are anotated by
                    circled numbers (like ⓿) denoting the sets they belong to. A
                    run is accepted if it visits a state or transitions of each
                    set infinitely often.
                  </dd>
                  <dt>
                    <Typography variant="body2">parity acceptance</Typography>
                  </dt>
                  <dd>
                    In automata with parity acceptance, multiple sets of states
                    or transitions are used. States or transitions are anotated
                    by circled numbers (like ⓿) denoting the sets they belong
                    to. A run is accepted if the maximum or minimum set number
                    visited infinitely often is odd or even. The choice between
                    min or max, and odd or even, is indicated at the top of the
                    automaton and can be forced with some options. The{" "}
                    <b>colored</b> option forces each transitions (or state) to
                    belong to exactly one acceptance set; this is usually what
                    people working with parity automata are expecting.
                  </dd>
                  <dt>
                    <Typography variant="body2">
                      Emerson-Lei acceptance
                    </Typography>
                  </dt>
                  <dd>
                    When using Emerson-Lei acceptance, the acceptance condition
                    produced can be any positive boolean formula over terms like{" "}
                    <b>Fin(⓿)</b> (meaning that elements of set ⓿ should be seen{" "}
                    <i>finitely</i> often) or <b>Inf(⓿)</b> (<i>infinitely</i>{" "}
                    often). Multiple acceptance sets are used.
                  </dd>
                </dl>
                By default, automata with transition-based acceptance are
                produced, except for monitors (where it makes no sense) and
                Büchi automata (for historical reasons). The translation
                constraint "force state-based acc." can be used to force the
                produced automata to use state-based acceptance, possibly
                increasing the number of states. However, even when automata are
                displayed as state-based, they are stored using transition-based
                acceptance internally: this can be seen using the "force
                transition-based acc." <i>display</i> option. This explains why
                these two options are not mutually exclusive.
              </Typography>
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
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

export default withStyles(styles)(LtlApps);
