import { INITIAL_OPTIONS } from "./options";

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

type Options = typeof INITIAL_OPTIONS;

/** Encode the options as a query string; `""` when everything is at its default. */
export function searchFromState(
  options: Options,
  formula: string,
  formula2: string
): string {
  const params = new URLSearchParams();

  if (formula !== "") params.set("f", formula);
  if (formula2 !== "") params.set("g", formula2);

  if (options.syntax !== INITIAL_OPTIONS.syntax) params.set("syntax", options.syntax);
  if (options.simplify !== INITIAL_OPTIONS.simplify) {
    params.set("simplify", options.simplify ? "1" : "0");
  }
  const simplifications = enabledFlags(options.ltlsimp);
  if (simplifications !== enabledFlags(INITIAL_OPTIONS.ltlsimp)) {
    params.set("simp", simplifications);
  }
  if (options.delta2 !== INITIAL_OPTIONS.delta2) {
    params.set("delta2", options.delta2 ? "1" : "0");
  }
  const unabbreviations = enabledFlags(options.unabbrev);
  if (unabbreviations !== "") params.set("unab", unabbreviations);

  if (options.acc !== INITIAL_OPTIONS.acc) params.set("acc", options.acc);
  if (options.autpref !== INITIAL_OPTIONS.autpref) params.set("pref", options.autpref);
  if (options.optlevel !== INITIAL_OPTIONS.optlevel) params.set("opt", options.optlevel);
  if (options.minmax !== INITIAL_OPTIONS.minmax) params.set("minmax", options.minmax);
  if (options.oddeven !== INITIAL_OPTIONS.oddeven) {
    params.set("oddeven", options.oddeven);
  }
  const translationOptions = enabledFlags(options.transopts);
  if (translationOptions !== "") params.set("trans", translationOptions);

  // Keep the flag lists readable: a comma is legal in a query string.
  const query = params.toString().replace(/%2C/g, ",");
  return query === "" ? "" : "?" + query;
}

/** The options and formulas a URL asks for, with the defaults for the rest. */
export function stateFromSearch(
  search: string,
  action: number
): { options: Options; formula: string; formula2: string } {
  const params = new URLSearchParams(search);

  return {
    options: {
      ...INITIAL_OPTIONS,
      action,
      syntax: choice(params, "syntax", ["o", "l", "i", "g"], INITIAL_OPTIONS.syntax),
      simplify: flag(params, "simplify", INITIAL_OPTIONS.simplify),
      ltlsimp: flags(INITIAL_OPTIONS.ltlsimp, params.get("simp")),
      delta2: flag(params, "delta2", INITIAL_OPTIONS.delta2),
      unabbrev: flags(INITIAL_OPTIONS.unabbrev, params.get("unab")),
      acc: choice(params, "acc", ["m", "c", "b", "g", "p", "e"], INITIAL_OPTIONS.acc),
      autpref: choice(params, "pref", ["s", "d", "a"], INITIAL_OPTIONS.autpref),
      optlevel: choice(params, "opt", ["h", "m", "l"], INITIAL_OPTIONS.optlevel),
      minmax: choice(params, "minmax", ["any", "min", "max"], INITIAL_OPTIONS.minmax),
      oddeven: choice(params, "oddeven", ["any", "odd", "even"], INITIAL_OPTIONS.oddeven),
      transopts: flags(INITIAL_OPTIONS.transopts, params.get("trans")),
    },
    formula: params.get("f") ?? "",
    formula2: params.get("g") ?? "",
  };
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
