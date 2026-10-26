import { INITIAL_OPTIONS, type Options } from "./options";

/**
 * The four modes, in the order of the `action` numbers the tabs use: selecting
 * a tab sets `action` to its index. The mode is the first path segment, so a
 * view can be linked to as `/app/translate?...`.
 */
export const MODES = ["rewrite", "study", "compare", "translate"] as const;

export type Mode = (typeof MODES)[number];

/** The `action` of `mode`, or `null` when the path segment is not a mode. */
export function actionOfMode(mode: string | undefined): number | null {
  const index = MODES.indexOf(mode as Mode);
  return index < 0 ? null : index;
}

/** The mode of `action`; the default mode when the number is out of range. */
export function modeOfAction(action: number): Mode {
  return MODES[action] ?? "translate";
}

/** Where a bare `/app/` lands. */
export const DEFAULT_MODE = modeOfAction(INITIAL_OPTIONS.action);

/** One panel: the formulas it works on and the options that change its answer. */
export interface PanelState {
  options: Options;
  formula: string;
  formula2: string;
}

/**
 * The duplicate panel's parameters are the primary panel's, prefixed: the
 * primary panel's mode is the path segment, so it needs no prefix of its own,
 * and `p2-mode` doubles as the flag saying the second panel is open.
 */
const SECONDARY_PREFIX = "p2-";
const SECONDARY_MODE = SECONDARY_PREFIX + "mode";

/** Add one panel's parameters to `params`; everything at its default is left out. */
function addPanel(params: URLSearchParams, prefix: string, panel: PanelState): void {
  const { options, formula, formula2 } = panel;

  if (formula !== "") params.set(prefix + "f", formula);
  if (formula2 !== "") params.set(prefix + "g", formula2);

  if (options.syntax !== INITIAL_OPTIONS.syntax) {
    params.set(prefix + "syntax", options.syntax);
  }
  if (options.simplify !== INITIAL_OPTIONS.simplify) {
    params.set(prefix + "simplify", options.simplify ? "1" : "0");
  }
  const simplifications = enabledFlags(options.ltlsimp);
  if (simplifications !== enabledFlags(INITIAL_OPTIONS.ltlsimp)) {
    params.set(prefix + "simp", simplifications);
  }
  if (options.delta2 !== INITIAL_OPTIONS.delta2) {
    params.set(prefix + "delta2", options.delta2 ? "1" : "0");
  }
  const unabbreviations = enabledFlags(options.unabbrev);
  if (unabbreviations !== "") params.set(prefix + "unab", unabbreviations);

  if (options.acc !== INITIAL_OPTIONS.acc) params.set(prefix + "acc", options.acc);
  if (options.autpref !== INITIAL_OPTIONS.autpref) {
    params.set(prefix + "pref", options.autpref);
  }
  if (options.optlevel !== INITIAL_OPTIONS.optlevel) {
    params.set(prefix + "opt", options.optlevel);
  }
  if (options.minmax !== INITIAL_OPTIONS.minmax) {
    params.set(prefix + "minmax", options.minmax);
  }
  if (options.oddeven !== INITIAL_OPTIONS.oddeven) {
    params.set(prefix + "oddeven", options.oddeven);
  }
  const translationOptions = enabledFlags(options.transopts);
  if (translationOptions !== "") params.set(prefix + "trans", translationOptions);
}

/** One panel's state as `params` describes it, with the defaults for the rest. */
function readPanel(params: URLSearchParams, prefix: string, action: number): PanelState {
  return {
    options: {
      ...INITIAL_OPTIONS,
      action,
      syntax: choice(
        params,
        prefix + "syntax",
        ["o", "l", "i", "g"],
        INITIAL_OPTIONS.syntax
      ),
      simplify: flag(params, prefix + "simplify", INITIAL_OPTIONS.simplify),
      ltlsimp: flags(INITIAL_OPTIONS.ltlsimp, params.get(prefix + "simp")),
      delta2: flag(params, prefix + "delta2", INITIAL_OPTIONS.delta2),
      unabbrev: flags(INITIAL_OPTIONS.unabbrev, params.get(prefix + "unab")),
      acc: choice(
        params,
        prefix + "acc",
        ["m", "c", "b", "g", "p", "e"],
        INITIAL_OPTIONS.acc
      ),
      autpref: choice(params, prefix + "pref", ["s", "d", "a"], INITIAL_OPTIONS.autpref),
      optlevel: choice(params, prefix + "opt", ["h", "m", "l"], INITIAL_OPTIONS.optlevel),
      minmax: choice(
        params,
        prefix + "minmax",
        ["any", "min", "max"],
        INITIAL_OPTIONS.minmax
      ),
      oddeven: choice(
        params,
        prefix + "oddeven",
        ["any", "odd", "even"],
        INITIAL_OPTIONS.oddeven
      ),
      transopts: flags(INITIAL_OPTIONS.transopts, params.get(prefix + "trans")),
    },
    formula: params.get(prefix + "f") ?? "",
    formula2: params.get(prefix + "g") ?? "",
  };
}

/** `?a=b`, or `""` when there is no parameter to write. */
function queryOf(params: URLSearchParams): string {
  // Keep the flag lists readable: a comma is legal in a query string.
  const query = params.toString().replace(/%2C/g, ",");
  return query === "" ? "" : "?" + query;
}

/** Encode the options as a query string; `""` when everything is at its default. */
export function searchFromState(
  options: Options,
  formula: string,
  formula2: string
): string {
  const params = new URLSearchParams();
  addPanel(params, "", { options, formula, formula2 });
  return queryOf(params);
}

/** The options and formulas a URL asks for, with the defaults for the rest. */
export function stateFromSearch(search: string, action: number): PanelState {
  return readPanel(new URLSearchParams(search), "", action);
}

/**
 * The query string of a whole page: the primary panel's parameters, then the
 * duplicate panel's when it is open.
 */
export function searchFromPanels(
  primary: PanelState,
  secondary: PanelState | null
): string {
  const params = new URLSearchParams();
  addPanel(params, "", primary);
  if (secondary !== null) {
    // The answer to "is the second panel open?" is the presence of its mode,
    // so that one parameter is always written.
    params.set(SECONDARY_MODE, modeOfAction(secondary.options.action));
    addPanel(params, SECONDARY_PREFIX, secondary);
  }
  return queryOf(params);
}

/** Both panels a URL describes; `secondary` is null when the duplicate is closed. */
export function panelsFromSearch(
  search: string,
  action: number
): { primary: PanelState; secondary: PanelState | null } {
  const params = new URLSearchParams(search);
  const primary = readPanel(params, "", action);
  const mode = params.get(SECONDARY_MODE);
  if (mode === null) return { primary, secondary: null };
  const secondaryAction = actionOfMode(mode) ?? INITIAL_OPTIONS.action;
  return { primary, secondary: readPanel(params, SECONDARY_PREFIX, secondaryAction) };
}

/** `a,b` for the flags that are on, in the declaration order of `checkedFlags`. */
function enabledFlags(checkedFlags: Record<string, boolean>): string {
  return Object.entries(checkedFlags)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key)
    .join(",");
}

/**
 * Turn a `a,b` list back into a flag map. An absent list keeps the defaults;
 * a present one is taken as the complete set of enabled flags, so the URL does
 * not have to know which flags are on by default.
 */
function flags<Flags extends Record<string, boolean>>(
  defaults: Flags,
  list: string | null
): Flags {
  if (list === null) return { ...defaults };
  const enabled = new Set(list.split(",").filter((key) => key !== ""));
  const result: Record<string, boolean> = {};
  for (const key of Object.keys(defaults)) result[key] = enabled.has(key);
  return result as Flags;
}

/** `value` of `params[key]` when it is one of `allowed`, `fallback` otherwise. */
function choice(
  params: URLSearchParams,
  key: string,
  allowed: string[],
  fallback: string
): string {
  const value = params.get(key);
  return value !== null && allowed.includes(value) ? value : fallback;
}

/** `true` for `1`, `false` for `0`, `fallback` for anything else. */
function flag(params: URLSearchParams, key: string, fallback: boolean): boolean {
  const value = params.get(key);
  if (value === "1") return true;
  if (value === "0") return false;
  return fallback;
}
