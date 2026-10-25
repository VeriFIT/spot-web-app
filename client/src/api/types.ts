/** `GET /api/versions` — one `[tool, version, url]` triplet per dependency. */
export type VersionInfo = [tool: string, version: string | null, url: string | null];

/**
 * Shapes of the JSON documents returned by the Spot API (`server/spotapi.py`).
 *
 * The endpoints return sparse objects: keys are only present when they carry
 * information, so every field is optional and callers must narrow with
 * `"key" in response` (or an explicit `undefined` check) before using one.
 */

/**
 * Added to responses when the submitted formula could not be read as infix
 * syntax. `prefix_syntax` is set when the fallback LBT/prefix parser succeeded.
 */
export interface ParseInfo {
  /** Human-readable parse error, produced by Spot's error formatter. */
  parse_error?: string;
  /** True when the formula was read using the prefix (LBT) syntax instead. */
  prefix_syntax?: boolean;
}

/** `GET /api/random` — a random formula, as a JSON string. */
export type RandomResponse = string;

/** `GET /api/versions` — the dependency list shown by the Versions menu. */
export type VersionsResponse = VersionInfo[];

/** `GET /api/rewrite/<formula>` — see `spotapi.py:rewrite`. */
export type RewriteResponse = ParseInfo & {
  /** Rewritten formula in the requested output syntax. */
  formula?: string;
  /** Graphviz rendering of the AST, when `ff=g` was requested. */
  svg?: string;
  /** The selected syntax cannot express this formula (e.g. PSL in LBT syntax). */
  error?: string;
};

/** `GET /api/study/<formula>` — see `spotapi.py:study`. */
export type StudyResponse = ParseInfo & {
  /** Manna–Pnueli class of the formula, e.g. `S` or `R`. */
  mp_class?: string;
  /** Human-readable description of `mp_class`. */
  mp_class_text?: string;
  /** Rendering of the Manna–Pnueli hierarchy, with the class highlighted. */
  mp_hierarchy_svg?: string;
  /** Syntactic-future hierarchy class, `""` when it does not apply. */
  sfh_class?: string;
  sfh_class_text?: string;
  /** True for a pathological formula; `"sfh"` when only the syntactic class is off. */
  pathological?: boolean | "sfh";
  safety_liveness?: "safety" | "liveness" | "both" | "none";
  Rabin_index?: number | string | null;
  Streett_index?: number | string | null;
  /** Example word accepted by the formula, `null` for a tautology. */
  acc_word?: string | null;
  /** Example word rejected by the formula, `null` for an unsatisfiable one. */
  rej_word?: string | null;
  /** `"no X"` when syntactically stutter-invariant, otherwise a boolean. */
  stutter_invariant?: boolean | "no X";
  /** Equivalent formula that is syntactically stutter-invariant. */
  stutter_invariant_eq?: string;
};

/** `GET /api/compare/<formula>?g=<formula2>` — see `spotapi.py:compare`. */
export type CompareResponse = ParseInfo & {
  /** Prose description of the relation between the two formulas. */
  txt?: string;
  /** Diagram of the relation between the two languages. */
  svg?: string;
  /** Words in the four regions of the diagram; absent when `null`. */
  w1?: string;
  w2?: string;
  w3?: string;
  w4?: string;
  /** Classes of the two formulas, only when they differ and are equivalent. */
  sfh1?: string;
  sfh1_text?: string;
  sfh2?: string;
  sfh2_text?: string;
  /** Parse information for the second formula (the first uses `ParseInfo`). */
  parse_error2?: string;
  prefix_syntax2?: boolean;
};

/** `GET /api/translate/<formula>` — see `spotapi.py:translate`. */
export type TranslateResponse = ParseInfo & {
  states?: number;
  edges?: number;
  /** True when the automaton is deterministic. */
  det?: boolean;
  /** Warnings, e.g. when the automaton is too large to be displayed. */
  note?: string[];
  automaton_svg?: string;
  /** HOA source of the automaton. */
  automaton_hoa?: string;
  /** Spin never-claim source, only for SBA/TGBA-style automata. */
  automaton_spin?: string;
};
