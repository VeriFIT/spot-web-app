import React from "react";

/** Translation constraints and display options of the translate panel. */
export type TranslationOptions = {
  unambiguous: boolean;
  complete: boolean;
  statebased: boolean;
  showscc: boolean;
  showndet: boolean;
  forcetacc: boolean;
  colored: boolean;
};

/** Operators that the rewrite panel can unabbreviate. */
export type UnabbrevOptions = {
  M: boolean;
  W: boolean;
  R: boolean;
  G: boolean;
  F: boolean;
  e: boolean;
  i: boolean;
  "^": boolean;
};

/** Simplifications that can be turned off one by one. */
export type SimplificationOptions = {
  br: boolean;
  lf: boolean;
  si: boolean;
  eu: boolean;
  lc: boolean;
  fs: boolean;
  pn: boolean;
  bi: boolean;
};

/** The nested groups of flags, each toggled one key at a time. */
export type OptionsGroup = "transopts" | "unabbrev" | "ltlsimp";

/**
 * Preferences of one app instance, grouped in a single object: they are what
 * the tabs turn into query parameters, so one reducer keeps the handlers and
 * the requests in step.
 */
export interface Options {
  action: number;
  acc: string;
  autpref: string;
  optlevel: string;
  syntax: string;
  expert: boolean;
  hideoptions: boolean;
  simplify: boolean;
  delta2: boolean;
  minmax: string;
  oddeven: string;
  transopts: TranslationOptions;
  unabbrev: UnabbrevOptions;
  ltlsimp: SimplificationOptions;
}

export const INITIAL_OPTIONS: Options = {
  action: 3,
  acc: "g",
  autpref: "s",
  optlevel: "h",
  syntax: "o",
  expert: false,
  hideoptions: false,
  simplify: true,
  delta2: false,
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
  unabbrev: {
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

/**
 * `set` replaces one preference; `toggle` flips one flag of a nested group.
 *
 * The `set` value is tied to the name it goes with, so a handler cannot store a
 * string in a boolean option.
 */
export type OptionsChange =
  | {
      [K in keyof Options]: { type: "set"; name: K; value: Options[K] };
    }[keyof Options]
  | { type: "toggle"; name: OptionsGroup; key: string };

/**
 * Build a `set` action, typed so `name` and `value` cannot disagree.
 *
 * TypeScript cannot relate the key to the value type through `OptionsChange`'s
 * mapped union, so the correlation is asserted here, once, rather than at every
 * call site.
 */
export function setAction<K extends keyof Options>(
  name: K,
  value: Options[K]
): OptionsChange {
  return { type: "set", name, value } as OptionsChange;
}

/** `set` replaces one preference; `toggle` flips one flag of a nested group. */
export function optionsReducer(options: Options, action: OptionsChange): Options {
  switch (action.type) {
    case "set":
      // Selecting the current value again must not re-render the tabs.
      if (Object.is(options[action.name], action.value)) return options;
      // The value's type is tied to the name by `OptionsChange`, but TypeScript
      // cannot carry that correlation through a computed key.
      return { ...options, [action.name]: action.value } as Options;
    case "toggle": {
      // Each group holds booleans under names that come from the descriptor
      // tables the tabs render, so the flag is looked up by string.
      const group: Record<string, boolean> = options[action.name];
      return {
        ...options,
        [action.name]: { ...group, [action.key]: !group[action.key] },
      };
    }
    default:
      throw new Error("Unknown options action: " + (action as { type: string }).type);
  }
}

interface OptionsContextValue {
  options: Options;
  setOption: <K extends keyof Options>(name: K, value: Options[K]) => void;
  toggleOption: (name: OptionsGroup, key: string) => void;
}

const OptionsContext = React.createContext<OptionsContextValue | null>(null);

interface OptionsProviderProps {
  options: Options;
  dispatch: (change: OptionsChange) => void;
  children?: React.ReactNode;
}

/**
 * Hand the preferences of one app instance to its tabs, so that each tab reads
 * the options it needs instead of receiving a dozen individual props.
 */
export function OptionsProvider({ options, dispatch, children }: OptionsProviderProps) {
  const value = React.useMemo<OptionsContextValue>(
    () => ({
      options,
      setOption: (name, newValue) => dispatch(setAction(name, newValue)),
      toggleOption: (name, key) => dispatch({ type: "toggle", name, key }),
    }),
    [options, dispatch]
  );

  return <OptionsContext.Provider value={value}>{children}</OptionsContext.Provider>;
}

/** The preferences of the surrounding app instance, and the actions changing them. */
export function useOptions(): OptionsContextValue {
  const value = React.useContext(OptionsContext);
  if (value === null) throw new Error("useOptions() needs an <OptionsProvider> above it");
  return value;
}
