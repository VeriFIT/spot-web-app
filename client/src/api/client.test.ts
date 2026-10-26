import { describe, expect, it } from "vitest";

import {
  API_ENDPOINT,
  compareUrl,
  randomUrl,
  rewriteUrl,
  studyUrl,
  translateUrl,
  versionsUrl,
} from "./client";
import type { RewriteOptions, TranslateOptions } from "./client";

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

/**
 * Split a request URL into the part the server routes on and its parameters.
 * The URLs are relative, so they are resolved against an arbitrary origin.
 */
function inspect(url: string): { pathname: string; params: URLSearchParams } {
  const parsed = new URL(url, "http://localhost");
  return { pathname: parsed.pathname, params: parsed.searchParams };
}

describe("api requests", () => {
  it("stay on the page's own origin, so one rule serves dev and production", () => {
    expect(API_ENDPOINT).toBe("/api/");
    // A relative URL: the dev proxy and the production server both see /api/.
    expect(rewriteUrl("a", defaults)).toBe("/api/rewrite/a?ff=o");
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

describe("randomUrl", () => {
  it("asks for an LTL formula by default", () => {
    const { pathname, params } = inspect(randomUrl(false));

    expect(pathname).toBe("/api/random");
    expect([...params.entries()]).toEqual([]);
  });

  it("asks for a PSL formula in expert mode", () => {
    expect([...inspect(randomUrl(true)).params.entries()]).toEqual([["p", "1"]]);
  });
});

describe("versionsUrl", () => {
  it("targets the versions route", () => {
    expect(inspect(versionsUrl()).pathname).toBe("/api/versions");
  });
});

describe("studyUrl", () => {
  it("targets the study route with no options", () => {
    const { pathname, params } = inspect(studyUrl("G (a U b)"));

    expect(pathname).toBe("/api/study/G%20(a%20U%20b)");
    expect([...params.entries()]).toEqual([]);
  });
});

describe("compareUrl", () => {
  it("puts the second formula in g", () => {
    const { pathname, params } = inspect(compareUrl("a U b", "b U a"));

    expect(pathname).toBe("/api/compare/a%20U%20b");
    expect([...params.entries()]).toEqual([["g", "b U a"]]);
  });
});

describe("translateUrl", () => {
  const translateDefaults: TranslateOptions = {
    acc: "g",
    autpref: "s",
    optlevel: "h",
    minmax: "any",
    oddeven: "any",
    transopts: {},
  };

  function translateOptions(overrides: Partial<TranslateOptions>): TranslateOptions {
    return { ...translateDefaults, ...overrides };
  }

  it("sends the acceptance, preference and optimization level", () => {
    const { pathname, params } = inspect(translateUrl("a U b", translateDefaults));

    expect(pathname).toBe("/api/translate/a%20U%20b");
    expect([...params.entries()]).toEqual([
      ["a", "g"],
      ["p", "s"],
      ["l", "h"],
    ]);
  });

  it("sends the parity style only for parity acceptance", () => {
    expect(inspect(translateUrl("a", translateDefaults)).params.has("m")).toBe(false);

    const { params } = inspect(
      translateUrl("a", translateOptions({ acc: "p", minmax: "max", oddeven: "odd" }))
    );

    expect(params.get("a")).toBe("p");
    expect(params.get("m")).toBe("max");
    expect(params.get("e")).toBe("odd");
  });

  it("sends one o parameter per enabled translation option", () => {
    const { params } = inspect(
      translateUrl(
        "a",
        translateOptions({
          transopts: { complete: true, colored: false, showscc: true },
        })
      )
    );

    expect(params.getAll("o")).toEqual(["complete", "showscc"]);
  });
});
