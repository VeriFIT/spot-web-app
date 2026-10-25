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

/** `GET /api/rewrite/<formula>` — see `spotapi.py:rewrite`. */
export type RewriteResponse = ParseInfo & {
  /** Rewritten formula in the requested output syntax. */
  formula?: string;
  /** Graphviz rendering of the AST, when `ff=g` was requested. */
  svg?: string;
  /** The selected syntax cannot express this formula (e.g. PSL in LBT syntax). */
  error?: string;
};
