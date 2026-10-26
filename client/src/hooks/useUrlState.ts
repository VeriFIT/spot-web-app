import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";

import { optionsReducer } from "../options";
import { modeOfAction, searchFromState, stateFromSearch } from "../urlState";

/** The two actions `optionsReducer` accepts. */
export type OptionsChange =
  | { type: "set"; name: string; value: string | number | boolean }
  | { type: "toggle"; name: string; key: string };

export interface UrlState {
  options: ReturnType<typeof stateFromSearch>["options"];
  formula: string;
  formula2: string;
  dispatch: (change: OptionsChange) => void;
  setFormula: (formula: string) => void;
  setFormula2: (formula2: string) => void;
}

/**
 * The state of a panel, kept in the URL: the mode is the first path segment,
 * and the formulas and result-affecting options are the query string. Reading
 * it back is what makes a link (or a reload, or Back) restore a view.
 *
 * `action` comes from the route, since the mode is a path segment rather than a
 * query parameter.
 */
export function useUrlState(action: number): UrlState {
  const { search } = useLocation();
  const navigate = useNavigate();

  const { options, formula, formula2 } = useMemo(
    () => stateFromSearch(search, action),
    [search, action]
  );

  const go = useCallback(
    (
      next: {
        options: ReturnType<typeof stateFromSearch>["options"];
        formula: string;
        formula2: string;
      },
      replace: boolean
    ) => {
      navigate(
        {
          pathname: "/" + modeOfAction(next.options.action),
          search: searchFromState(next.options, next.formula, next.formula2),
        },
        { replace }
      );
    },
    [navigate]
  );

  const dispatch = useCallback(
    (change: OptionsChange) => {
      if (change.type === "set" && change.name === "action") {
        if (change.value === options.action) return;
        // A mode change is a navigation step, so Back returns to the previous tab.
        navigate(
          { pathname: "/" + modeOfAction(Number(change.value)), search },
          { replace: false }
        );
        return;
      }

      const nextOptions = optionsReducer(options, change);
      if (nextOptions === options) return;
      // Option tweaks replace the current entry instead of filling the history.
      go({ options: nextOptions, formula, formula2 }, true);
    },
    [options, formula, formula2, navigate, search, go]
  );

  const setFormula = useCallback(
    (value: string) => {
      if (value === formula) return;
      go({ options, formula: value, formula2 }, true);
    },
    [options, formula, formula2, go]
  );

  const setFormula2 = useCallback(
    (value: string) => {
      if (value === formula2) return;
      go({ options, formula, formula2: value }, true);
    },
    [options, formula, formula2, go]
  );

  return useMemo(
    () => ({ options, formula, formula2, dispatch, setFormula, setFormula2 }),
    [options, formula, formula2, dispatch, setFormula, setFormula2]
  );
}
