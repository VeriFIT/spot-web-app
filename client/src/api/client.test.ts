import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiEndpoint, rewriteUrl } from "./client";
import type { RewriteOptions } from "./client";

/*
 * The query string built here is the contract with `server/spotapi.py:rewrite`:
 * `ff` picks the output syntax, repeated `r` parameters enable simplification
 * passes, `u` concatenates un-abbreviation flags and `d=2` asks for Δ₂. These
 * tests pin that mapping down so a refactor of the UI options cannot silently
 * change what the server receives.
 */

const defaults: RewriteOptions = {
  syntax: "o",
  simplify: false,
  ltlsimp: {},
  unabbrev: {},
  delta2: false,
};

function options(overrides: Partial<RewriteOptions>): RewriteOptions {
  return { ...defaults, ...overrides };
}

/** Split a request URL into the part the server routes on and its parameters. */
function inspect(url: string): { pathname: string; params: URLSearchParams } {
  const parsed = new URL(url);
  return { pathname: parsed.pathname, params: parsed.searchParams };
}

beforeEach(() => {
  vi.stubEnv("VITE_API_ENDPOINT", "/api/");
  vi.stubEnv("VITE_API_PORT", ":5000");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("apiEndpoint", () => {
  it("uses the API port when one is configured", () => {
    expect(apiEndpoint()).toBe("http://localhost:5000/api/");
  });

  it("stays on the page origin in production, where no port is set", () => {
    vi.stubEnv("VITE_API_PORT", "");
    expect(apiEndpoint()).toBe("http://localhost:3000/api/");
  });
});

describe("rewriteUrl", () => {
  it("targets the rewrite route with the default options", () => {
    const { pathname, params } = inspect(rewriteUrl("a U b", defaults));

    expect(pathname).toBe("/api/rewrite/a%20U%20b");
    expect([...params.entries()]).toEqual([["ff", "o"]]);
  });

  it("percent-encodes the formula, including slashes and reserved characters", () => {
    expect(inspect(rewriteUrl("a & b", defaults)).pathname).toBe(
      "/api/rewrite/a%20%26%20b"
    );
    // A slash must be encoded, otherwise the server's <path:ltlformula>
    // converter would never match the route.
    expect(inspect(rewriteUrl("G a/b", defaults)).pathname).toBe(
      "/api/rewrite/G%20a%2Fb"
    );
  });

  it("sends the selected output syntax", () => {
    expect([...inspect(rewriteUrl("a", options({ syntax: "i" }))).params]).toEqual([
      ["ff", "i"],
    ]);
  });

  it("sends one r parameter per enabled simplification option", () => {
    const { params } = inspect(
      rewriteUrl(
        "a",
        options({ simplify: true, ltlsimp: { br: true, lf: false, si: true } })
      )
    );

    expect(params.getAll("r")).toEqual(["br", "si"]);
  });

  it("sends no simplification parameter while Simplify is off", () => {
    const { params } = inspect(
      rewriteUrl("a", options({ simplify: false, ltlsimp: { br: true } }))
    );

    expect(params.has("r")).toBe(false);
  });

  it("concatenates the enabled un-abbreviation flags", () => {
    const { params } = inspect(
      rewriteUrl("a", options({ unabbrev: { F: true, G: false, W: true } }))
    );

    expect(params.get("u")).toBe("FW");
  });

  it("omits u when no un-abbreviation is selected", () => {
    const { params } = inspect(rewriteUrl("a", options({ unabbrev: {} })));
    expect(params.has("u")).toBe(false);
  });

  it("asks for Δ₂", () => {
    expect([...inspect(rewriteUrl("a", options({ delta2: true }))).params]).toEqual([
      ["d", "2"],
      ["ff", "o"],
    ]);
  });

  it("combines every option", () => {
    const { pathname, params } = inspect(
      rewriteUrl(
        "G (a U b)",
        options({
          syntax: "l",
          simplify: true,
          ltlsimp: { br: true, lc: true },
          unabbrev: { F: true },
          delta2: true,
        })
      )
    );

    expect(pathname).toBe("/api/rewrite/G%20(a%20U%20b)");
    expect([...params.entries()]).toEqual([
      ["r", "br"],
      ["r", "lc"],
      ["d", "2"],
      ["ff", "l"],
      ["u", "F"],
    ]);
  });
});
