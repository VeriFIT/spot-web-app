import React from "react";

/**
 * Preferences of one app instance, grouped in a single object: they are what
 * the tabs turn into query parameters, so one reducer keeps the handlers and
 * the requests in step (see modernize.md 3.5).
 */
export const INITIAL_OPTIONS = {
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

/** `set` replaces one preference; `toggle` flips one flag of a nested group. */
export function optionsReducer(options, action) {
  switch (action.type) {
    case "set":
      // Selecting the current value again must not re-render the tabs.
      if (Object.is(options[action.name], action.value)) return options;
      return { ...options, [action.name]: action.value };
    case "toggle":
      return {
        ...options,
        [action.name]: {
          ...options[action.name],
          [action.key]: !options[action.name][action.key],
        },
      };
    default:
      throw new Error("Unknown options action: " + action.type);
  }
}

const OptionsContext = React.createContext(null);

/**
 * Hand the preferences of one app instance to its tabs, so that each tab reads
 * the options it needs instead of receiving a dozen individual props.
 */
export function OptionsProvider({ options, dispatch, children }) {
  const value = React.useMemo(
    () => ({
      options,
      setOption: (name, newValue) => dispatch({ type: "set", name, value: newValue }),
      toggleOption: (name, key) => dispatch({ type: "toggle", name, key }),
    }),
    [options, dispatch]
  );

  return <OptionsContext.Provider value={value}>{children}</OptionsContext.Provider>;
}

/** The preferences of the surrounding app instance, and the actions changing them. */
export function useOptions() {
  const value = React.useContext(OptionsContext);
  if (value === null) throw new Error("useOptions() needs an <OptionsProvider> above it");
  return value;
}
