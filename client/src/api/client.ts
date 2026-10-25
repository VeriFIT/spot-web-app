import type { RewriteResponse } from "./types";

/**
 * HTTP error carrying the status code, so the UI can branch on it instead of
 * parsing the message text (see modernize.md 5.7).
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
 * Base URL of the API.
 *
 * VITE_API_ENDPOINT and VITE_API_PORT are defined in
 * client/.env.{production,development}. When developing, the API and the web
 * pages run on different ports; in production we assume they are served from
 * the same server.
 */
export function apiEndpoint(): string {
  return (
    window.location.protocol +
    "//" +
    (import.meta.env.VITE_API_PORT
      ? window.location.hostname + import.meta.env.VITE_API_PORT
      : window.location.host) +
    import.meta.env.VITE_API_ENDPOINT
  );
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
  const url = new URL(apiEndpoint() + "rewrite/" + encodeURIComponent(formula));

  if (options.simplify) {
    for (const [key, enabled] of Object.entries(options.ltlsimp)) {
      if (enabled) url.searchParams.append("r", key);
    }
  }
  if (options.delta2) url.searchParams.append("d", "2");
  url.searchParams.append("ff", options.syntax);

  const unabbrev = Object.entries(options.unabbrev)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key)
    .join("");
  if (unabbrev !== "") url.searchParams.append("u", unabbrev);

  return url.toString();
}

/** Loader for `useApiQuery`: the request URL doubles as the query key. */
export function getRewrite(url: string, signal: AbortSignal): Promise<RewriteResponse> {
  return fetchJson<RewriteResponse>(url, signal);
}
