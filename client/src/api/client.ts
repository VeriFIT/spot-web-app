import type {
  CompareResponse,
  RandomResponse,
  RewriteResponse,
  StudyResponse,
  TranslateResponse,
  VersionsResponse,
} from "./types";

/**
 * HTTP error carrying the status code, so the UI can branch on it instead of
 * parsing the message text.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(response: Response) {
    super(response.status + " " + response.statusText);
    this.name = "ApiError";
    this.status = response.status;
  }
}

/**
 * Base path of the API.
 *
 * It is same-origin: in production the API is served by the same server as the
 * pages, and in development the Vite dev server proxies this path to the Flask
 * server (see `vite.config.js`). Being a path rather than an absolute URL means
 * the client never has to be told where the API actually runs.
 */
export const API_ENDPOINT = "/api/";

/** Query string for `params`, or `""` when there is nothing to append. */
function queryString(params: URLSearchParams): string {
  const query = params.toString();
  return query === "" ? "" : "?" + query;
}

/** Fetch `url` and decode the JSON body, turning HTTP errors into `ApiError`. */
export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new ApiError(response);
  return (await response.json()) as T;
}

export interface RewriteOptions {
  /** Output syntax: `o` (Spot), `i` (Spin), `l` (LBT) or `g` (Graphviz). */
  syntax: string;
  /** Whether the simplification options in `ltlsimp` should be sent at all. */
  simplify: boolean;
  ltlsimp: Record<string, boolean>;
  unabbrev: Record<string, boolean>;
  delta2: boolean;
}

/**
 * Build the rewrite request URL. Pure, so the mapping from UI options to query
 * parameters (the actual contract with `spotapi.py`) can be tested directly.
 */
export function rewriteUrl(formula: string, options: RewriteOptions): string {
  const params = new URLSearchParams();

  if (options.simplify) {
    for (const [key, enabled] of Object.entries(options.ltlsimp)) {
      if (enabled) params.append("r", key);
    }
  }
  if (options.delta2) params.append("d", "2");
  params.append("ff", options.syntax);

  const unabbrev = Object.entries(options.unabbrev)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key)
    .join("");
  if (unabbrev !== "") params.append("u", unabbrev);

  return API_ENDPOINT + "rewrite/" + encodeURIComponent(formula) + queryString(params);
}

/** Loader for `useApiQuery`: the request URL doubles as the query key. */
export function getRewrite(url: string, signal: AbortSignal): Promise<RewriteResponse> {
  return fetchJson<RewriteResponse>(url, signal);
}

/**
 * URL of a random formula; `expert` asks for PSL instead of LTL. Unlike the
 * other endpoints this one must not be cached, so it is fetched on demand.
 */
export function randomUrl(expert: boolean): string {
  const params = new URLSearchParams();
  if (expert) params.append("p", "1");
  return API_ENDPOINT + "random" + queryString(params);
}

/** Loader for the random-formula button of the formula input. */
export function getRandomFormula(
  url: string,
  signal?: AbortSignal
): Promise<RandomResponse> {
  return fetchJson<RandomResponse>(url, signal);
}

/** URL of the versions list; see `spotapi.py:versions`. */
export function versionsUrl(): string {
  return API_ENDPOINT + "versions";
}

/** Loader for the versions menu. */
export function getVersions(
  url: string,
  signal?: AbortSignal
): Promise<VersionsResponse> {
  return fetchJson<VersionsResponse>(url, signal);
}

/** URL of the study request for `formula`; see `spotapi.py:study`. */
export function studyUrl(formula: string): string {
  return API_ENDPOINT + "study/" + encodeURIComponent(formula);
}

/** Loader for the study tab. */
export function getStudy(url: string, signal: AbortSignal): Promise<StudyResponse> {
  return fetchJson<StudyResponse>(url, signal);
}

/** URL of the comparison of `formula` (first) with `formula2` (second). */
export function compareUrl(formula: string, formula2: string): string {
  const params = new URLSearchParams();
  params.append("g", formula2);
  return API_ENDPOINT + "compare/" + encodeURIComponent(formula) + queryString(params);
}

/** Loader for the compare tab. */
export function getCompare(url: string, signal: AbortSignal): Promise<CompareResponse> {
  return fetchJson<CompareResponse>(url, signal);
}

export interface TranslateOptions {
  /** Acceptance condition: `g` (TGBA) by default, or `p` (parity), `e`, … */
  acc: string;
  /** Translation preference: `s` (small), `d` (deterministic) or `a` (any). */
  autpref: string;
  /** Optimization level, used in expert mode: `h`, `m` or `l`. */
  optlevel: string;
  /** Parity min/max preference; only sent with `acc: "p"`. */
  minmax: string;
  /** Parity odd/even preference; only sent with `acc: "p"`. */
  oddeven: string;
  /** Extra translation and display options, sent as one `o` each. */
  transopts: Record<string, boolean>;
}

/** Build the translation request URL; the counterpart of `spotapi.py:translate`. */
export function translateUrl(formula: string, options: TranslateOptions): string {
  const params = new URLSearchParams();

  params.append("a", options.acc);
  params.append("p", options.autpref);
  params.append("l", options.optlevel);
  if (options.acc === "p") {
    params.append("m", options.minmax);
    params.append("e", options.oddeven);
  }
  for (const [key, enabled] of Object.entries(options.transopts)) {
    if (enabled) params.append("o", key);
  }

  return API_ENDPOINT + "translate/" + encodeURIComponent(formula) + queryString(params);
}

/** Loader for the translate tab. */
export function getTranslate(
  url: string,
  signal: AbortSignal
): Promise<TranslateResponse> {
  return fetchJson<TranslateResponse>(url, signal);
}
