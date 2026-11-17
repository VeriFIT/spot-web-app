import type {
  CompareResponse,
  RandomResponse,
  RewriteResponse,
  StudyResponse,
  TranslateResponse,
  VersionsResponse,
} from "./types";
import {
  validateCompare,
  validateRandom,
  validateRewrite,
  validateStudy,
  validateTranslate,
  validateVersions,
} from "./validate";

/**
 * HTTP error carrying the status code, so the UI can branch on it instead of
 * parsing the message text.
 */
export class ApiError extends Error {
  readonly status: number;

  // A `Response`, or the same two fields from the client-only build, whose
  // messages (C++ exceptions) need not be valid HTTP status texts.
  constructor(response: { status: number; statusText: string }) {
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

/**
 * Fetch `url`, decode the JSON body and check it against `validate`, turning
 * HTTP errors into `ApiError`.
 *
 * The validator is required rather than optional: a response that is only cast
 * to a type is not typed at all once it comes off the network (see
 * `api/validate.ts`).
 */
export async function fetchJson<T>(
  url: string,
  signal: AbortSignal | undefined,
  validate: (body: unknown, url: string) => T
): Promise<T> {
  if (import.meta.env.VITE_SPOT_BACKEND === "wasm") {
    // Client-only build: Spot runs in the browser (see `api/local/`). The
    // import is dynamic so that the server build does not include it.
    const { localFetch } = await import("./local/backend");
    const answer = await localFetch(url, signal);
    if (answer.status !== 200) {
      throw new ApiError({
        status: answer.status,
        statusText: answer.error ?? (answer.status === 404 ? "Not Found" : "Error"),
      });
    }
    return validate(answer.body, url);
  }
  const response = await fetch(url, { signal });
  if (!response.ok) throw new ApiError(response);
  return validate(await response.json(), url);
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
  return fetchJson(url, signal, validateRewrite);
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
  return fetchJson(url, signal, validateRandom);
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
  return fetchJson(url, signal, validateVersions);
}

/** URL of the study request for `formula`; see `spotapi.py:study`. */
export function studyUrl(formula: string): string {
  return API_ENDPOINT + "study/" + encodeURIComponent(formula);
}

/** Loader for the study tab. */
export function getStudy(url: string, signal: AbortSignal): Promise<StudyResponse> {
  return fetchJson(url, signal, validateStudy);
}

/** URL of the comparison of `formula` (first) with `formula2` (second). */
export function compareUrl(formula: string, formula2: string): string {
  const params = new URLSearchParams();
  params.append("g", formula2);
  return API_ENDPOINT + "compare/" + encodeURIComponent(formula) + queryString(params);
}

/** Loader for the compare tab. */
export function getCompare(url: string, signal: AbortSignal): Promise<CompareResponse> {
  return fetchJson(url, signal, validateCompare);
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
  return fetchJson(url, signal, validateTranslate);
}
