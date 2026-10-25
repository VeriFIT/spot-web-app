import React from "react";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import { getRandomFormula, randomUrl } from "../api/client";
import { DiceIcon } from "./icons";
import { NoteText } from "./NoteText";

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
