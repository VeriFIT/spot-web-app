import React from "react";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

import { getRandomFormula, randomUrl } from "../api/client";
import { DiceIcon } from "./icons";
import { NoteText } from "./NoteText";

/** Compare mode shows two inputs; tinting them tells the two formulas apart. */
const HIGHLIGHT_SX = {
  first: { backgroundColor: "#b2ffff" },
  second: { backgroundColor: "#ffccff" },
};

const Wrapper = styled("div")({ width: "100%" });

const Helper = styled(FormHelperText)({ marginTop: 0 });

const ParseError = styled("pre")(({ theme }) => ({
  color: theme.palette.error.main,
}));

export function LtlInput(props) {
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
    <Wrapper>
      <TextField
        error={Boolean(props.formulaerr)}
        sx={HIGHLIGHT_SX[props.highlight]}
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
      <Helper>
        {tmpformula !== formula && (
          <span>
            Hit <i>Enter</i> or <i>Tab</i> to update the results.
          </span>
        )}
      </Helper>
      {props.formulalbt && (
        <NoteText
          text={
            "Assuming a prefix syntax in the style of " +
            "LBT/LTL2DSTAR, as the standard parser for " +
            "infix syntaxes failed."
          }
        />
      )}
      {props.formulaerr && <ParseError>{props.formulaerr}</ParseError>}
    </Wrapper>
  );
}
