import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";

import {
  INITIAL_OPTIONS,
  optionsReducer,
  type Options,
  type OptionsChange,
} from "../options";
import {
  modeOfAction,
  panelsFromSearch,
  searchFromPanels,
  type PanelState,
} from "../urlState";

export interface UrlState {
  options: Options;
  formula: string;
  formula2: string;
  dispatch: (change: OptionsChange) => void;
  setFormula: (formula: string) => void;
  setFormula2: (formula2: string) => void;
}

export interface PanelsState {
  primary: UrlState;
  /** The duplicate panel, or null while it is closed. */
  secondary: UrlState | null;
  openSecondary: () => void;
  closeSecondary: () => void;
}

/**
 * The state of the panels, kept in the URL: the primary panel's mode is the
 * first path segment, and the formulas and result-affecting options of both
 * panels are the query string (the duplicate panel's keys are prefixed `p2-`).
 * Reading it back is what makes a link (or a reload, or Back) restore a view.
 *
 * `action` comes from the route, since the primary panel's mode is a path
 * segment rather than a query parameter.
 */
export function useUrlState(action: number): PanelsState {
  const { search } = useLocation();
  const navigate = useNavigate();

  const { primary, secondary } = useMemo(
    () => panelsFromSearch(search, action),
    [search, action]
  );

  // Both panels are written together: the URL holds the whole page, so a change
  // to one of them has to carry the other one along.
  const go = useCallback(
    (next: { primary: PanelState; secondary: PanelState | null }, replace: boolean) => {
      navigate(
        {
          pathname: "/" + modeOfAction(next.primary.options.action),
          search: searchFromPanels(next.primary, next.secondary),
        },
        { replace }
      );
    },
    [navigate]
  );

  const primaryDispatch = useCallback(
    (change: OptionsChange) => {
      if (change.type === "set" && change.name === "action") {
        if (change.value === primary.options.action) return;
        // A mode change is a navigation step, so Back returns to the previous
        // tab. The primary panel's mode is the path, so only the path changes.
        navigate(
          { pathname: "/" + modeOfAction(Number(change.value)), search },
          { replace: false }
        );
        return;
      }

      const options = optionsReducer(primary.options, change);
      if (options === primary.options) return;
      // Option tweaks replace the current entry instead of filling the history.
      go({ primary: { ...primary, options }, secondary }, true);
    },
    [primary, secondary, navigate, search, go]
  );

  const secondaryDispatch = useCallback(
    (change: OptionsChange) => {
      if (secondary === null) return;
      const options = optionsReducer(secondary.options, change);
      if (options === secondary.options) return;
      const isModeChange = change.type === "set" && change.name === "action";
      // Its mode is a query parameter, but switching tab is still a navigation
      // step; its options only replace the current entry.
      go({ primary, secondary: { ...secondary, options } }, !isModeChange);
    },
    [primary, secondary, go]
  );

  const primarySetFormula = useCallback(
    (formula: string) => {
      if (formula === primary.formula) return;
      go({ primary: { ...primary, formula }, secondary }, true);
    },
    [primary, secondary, go]
  );

  const primarySetFormula2 = useCallback(
    (formula2: string) => {
      if (formula2 === primary.formula2) return;
      go({ primary: { ...primary, formula2 }, secondary }, true);
    },
    [primary, secondary, go]
  );

  const secondarySetFormula = useCallback(
    (formula: string) => {
      if (secondary === null || formula === secondary.formula) return;
      go({ primary, secondary: { ...secondary, formula } }, true);
    },
    [primary, secondary, go]
  );

  const secondarySetFormula2 = useCallback(
    (formula2: string) => {
      if (secondary === null || formula2 === secondary.formula2) return;
      go({ primary, secondary: { ...secondary, formula2 } }, true);
    },
    [primary, secondary, go]
  );

  const primaryState = useMemo<UrlState>(
    () => ({
      options: primary.options,
      formula: primary.formula,
      formula2: primary.formula2,
      dispatch: primaryDispatch,
      setFormula: primarySetFormula,
      setFormula2: primarySetFormula2,
    }),
    [primary, primaryDispatch, primarySetFormula, primarySetFormula2]
  );

  const secondaryState = useMemo<UrlState | null>(
    () =>
      secondary === null
        ? null
        : {
            options: secondary.options,
            formula: secondary.formula,
            formula2: secondary.formula2,
            dispatch: secondaryDispatch,
            setFormula: secondarySetFormula,
            setFormula2: secondarySetFormula2,
          },
    [secondary, secondaryDispatch, secondarySetFormula, secondarySetFormula2]
  );

  // Opening and closing are not navigation steps: they change what the page
  // shows without moving to another view, so they replace the current entry.
  const openSecondary = useCallback(() => {
    go(
      {
        primary,
        // A fresh panel starts at the defaults: the default mode, no formula.
        secondary: { options: INITIAL_OPTIONS, formula: "", formula2: "" },
      },
      true
    );
  }, [primary, go]);

  const closeSecondary = useCallback(() => {
    if (secondary === null) return;
    go({ primary, secondary: null }, true);
  }, [primary, secondary, go]);

  return useMemo(
    () => ({
      primary: primaryState,
      secondary: secondaryState,
      openSecondary,
      closeSecondary,
    }),
    [primaryState, secondaryState, openSecondary, closeSecondary]
  );
}
