import React from "react";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

import { getRandomFormula, randomUrl } from "../api/client";
import { DiceIcon } from "./icons";
import { NoteText } from "./NoteText";
import { renderError } from "./renderError";

/** Compare mode shows two inputs; tinting them tells the two formulas apart. */
const HIGHLIGHT_SX: Record<"first" | "second", SxProps<Theme>> = {
  first: { backgroundColor: "#b2ffff" },
  second: { backgroundColor: "#ffccff" },
};

const Wrapper = styled("div")({ width: "100%" });

// Asserted back to `FormHelperText`: Material's `styled` drops the polymorphic
// `component` prop, and the helper holds a note and an error block, so it has
// to be a div rather than a paragraph.
const Helper = styled(FormHelperText)({ marginTop: 0 }) as typeof FormHelperText;

const ParseError = styled("pre")(({ theme }) => ({
  color: theme.palette.error.main,
}));

/** Why the dice button produced no formula, under the field like a parse error. */
const RandomError = styled("div")(({ theme }) => ({
  color: theme.palette.error.main,
}));

export interface LtlInputProps {
  /** Which of the two compare inputs this is, when it is one of them. */
  highlight?: "first" | "second";
  label: string;
  /** Expert mode randomizes over PSL instead of LTL. */
  expert: boolean;
  /** Take the caret when the field appears. Only the main panel asks for it. */
  focusOnMount?: boolean;
  /** The confirmed formula, owned by the parent. */
  defaultValue: string;
  setFormula: (formula: string) => void;
  /** The formula was read with the prefix (LBT) syntax instead. */
  formulalbt: boolean;
  /** Why the formula could not be read, if it could not. */
  formulaerr: string | null;
}

export function LtlInput(props: LtlInputProps) {
  // The text being typed, and the formula the app actually queries. They
  // differ while the user has not confirmed the edit with Enter or Tab.
  const [tmpformula, setTmpformula] = React.useState(props.defaultValue || "");
  const [formula, setFormula] = React.useState(props.defaultValue || "");
  // The random formula request in flight, if any, and the reason the last one
  // produced no formula.
  const randomRequest = React.useRef<AbortController | null>(null);
  const [randomError, setRandomError] = React.useState<Error | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);

  // The main panel asks for the caret on arrival, since typing a formula is
  // what the page is for. Focusing here instead of with the `autoFocus`
  // attribute lets the field stand back when something already has focus: the
  // caret belongs where the user has got to, not to a field that mounted late.
  React.useEffect(() => {
    if (!props.focusOnMount) return;
    const active = document.activeElement;
    if (active !== null && active !== document.body) return;
    inputRef.current?.focus();
  }, [props.focusOnMount]);

  // A request still in flight when the input goes away must not land later.
  React.useEffect(() => {
    return () => {
      if (randomRequest.current !== null) randomRequest.current.abort();
    };
  }, []);

  // When the app changes the formula from the outside — a link was opened, or
  // Back restored an earlier one — the field follows it.
  const defaultValue = props.defaultValue || "";
  React.useEffect(() => {
    setTmpformula(defaultValue);
    setFormula(defaultValue);
  }, [defaultValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setTmpformula(event.target.value);

  const updateFormula = () => {
    setFormula(tmpformula);
    props.setFormula(tmpformula);
  };

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") updateFormula();
  };

  const randomizeFormula = () => {
    // Abort a previous click, so only the newest answer can reach the input.
    if (randomRequest.current !== null) randomRequest.current.abort();
    const controller = new AbortController();
    randomRequest.current = controller;
    setRandomError(null);

    getRandomFormula(randomUrl(props.expert), controller.signal).then(
      (fmt) => {
        if (controller.signal.aborted) return;
        randomRequest.current = null;
        setTmpformula(fmt);
        setFormula(fmt);
        props.setFormula(fmt);
      },
      (error: unknown) => {
        // An aborted request was superseded on purpose, so it has nothing to
        // report; a real failure must say so instead of failing silently.
        if (controller.signal.aborted) return;
        randomRequest.current = null;
        setRandomError(error instanceof Error ? error : new Error(String(error)));
      }
    );
  };

  return (
    <Wrapper>
      <TextField
        error={Boolean(props.formulaerr)}
        sx={props.highlight === undefined ? undefined : HIGHLIGHT_SX[props.highlight]}
        fullWidth
        value={tmpformula}
        label={props.label}
        inputRef={inputRef}
        onChange={handleChange}
        onKeyDown={handleKey}
        onBlur={updateFormula}
        slotProps={{
          input: {
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
          },
        }}
      />
      <Helper component="div">
        {tmpformula !== formula && (
          <span>
            Hit <i>Enter</i> or <i>Tab</i> to update the results.
          </span>
        )}
        {randomError !== null && (
          <RandomError>
            Could not fetch a random formula: {renderError(randomError)}
          </RandomError>
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
