// @vitest-environment node
/**
 * The checks of `server/test_spotapi.py`, run against the WebAssembly port of
 * the API (`wasm/spotapi.cc`) together with `serve.ts`, i.e., what the worker
 * runs in the client-only build.
 *
 * They need the module built by `wasm/Makefile`, and are skipped without it.
 */
import { Graphviz } from "@hpcc-js/wasm-graphviz";
import { beforeAll, describe, expect, it } from "vitest";
import { serve, type DotRenderer, type SpotApi } from "./serve";
import {
  validateCompare,
  validateRandom,
  validateRewrite,
  validateStudy,
  validateTranslate,
  validateVersions,
} from "../validate";

// Empty when the module has not been built.
const built = import.meta.glob<{ default: () => Promise<SpotModule> }>(
  "../../../public/wasm/spotapi.mjs"
);
const loadModule = Object.values(built)[0];

interface SpotModule {
  cwrap(name: "spotapi", returns: "string", args: ["string"]): SpotApi;
}

describe.skipIf(!loadModule)("WebAssembly API", () => {
  let spotapi: SpotApi;
  let graphviz: DotRenderer;

  beforeAll(async () => {
    const { default: create } = await loadModule();
    spotapi = (await create()).cwrap("spotapi", "string", ["string"]);
    graphviz = await Graphviz.load();
  });

  /** The body of a successful answer to `url`. */
  function get(url: string): unknown {
    const answer = serve(spotapi, graphviz, url);
    expect(answer.status).toBe(200);
    return answer.body;
  }

  it("lists each dependency", () => {
    const versions = validateVersions(get("/api/versions"), "versions");

    expect(versions.map(([tool]) => tool)).toEqual(["Spot", "Emscripten", "GraphViz"]);
  });

  it("gives random formulas that differ between calls", () => {
    const formulas = new Set(
      Array.from({ length: 5 }, () => validateRandom(get("/api/random"), "random"))
    );

    expect(formulas.size).toBeGreaterThan(1);
  });

  it("avoids the constants in random formulas", () => {
    for (let i = 0; i < 10; ++i) expect(["1", "0"]).not.toContain(get("/api/random"));
  });

  it("offers random PSL formulas in expert mode", () => {
    const formula = validateRandom(get("/api/random?p=1"), "random");

    expect(formula).not.toBe("");
  });

  it("rewrites a formula", () => {
    expect(get("/api/rewrite/a%20U%20b")).toEqual({ formula: "a U b" });
  });

  it("applies the rewriting options", () => {
    const result = validateRewrite(
      get("/api/rewrite/G(a%20-%3E%20Fb)?r=br&r=eu&ff=i"),
      "rewrite"
    );

    expect(result.formula).toBe("[](!a || <>b)");
  });

  it("reports a syntax error", () => {
    expect(get("/api/rewrite/a%20U")).toHaveProperty("parse_error");
  });

  it("reads LBT formulas", () => {
    expect(get("/api/rewrite/U%20a%20b")).toEqual({
      prefix_syntax: true,
      formula: "a U b",
    });
  });

  it("draws the AST", () => {
    const result = validateRewrite(get("/api/rewrite/G%20a?ff=g"), "rewrite");

    expect(result.svg).toContain("<svg");
  });

  it("rejects PSL in a syntax that cannot express it", () => {
    expect(get("/api/rewrite/%7Ba%5B*%5D%7D%5B%5D-%3Eb?ff=l")).toHaveProperty("error");
  });

  it("accepts PSL in the default syntax", () => {
    const result = validateRewrite(
      get("/api/rewrite/%7Ba%5B*%5D%7D%5B%5D-%3Eb?ff="),
      "rewrite"
    );

    expect(result.error).toBeUndefined();
    expect(result.formula).toBeDefined();
  });

  it("classifies a safety formula", () => {
    const result = validateStudy(get("/api/study/G%20a"), "study");

    expect(result.mp_class).toBe("S");
    expect(result.mp_class_text).toBe("a safety property");
    expect(result.mp_hierarchy_svg).toContain("<svg");
  });

  it("gives an accepted and a rejected word", () => {
    const result = validateStudy(get("/api/study/a%20U%20b"), "study");

    expect(result.mp_class).toBe("G");
    expect(typeof result.acc_word).toBe("string");
    expect(typeof result.rej_word).toBe("string");
  });

  it("finds that a formula is not stutter-invariant", () => {
    const result = validateStudy(get("/api/study/GF(a%20%26%20Xb)"), "study");

    expect(result.stutter_invariant).toBe(false);
    expect(result.Rabin_index).toBe(1);
  });

  it("finds equivalent formulas", () => {
    const result = validateCompare(get("/api/compare/a?g=a"), "compare");

    expect(result.txt).toContain("equivalent");
    expect(result.svg).toContain("<svg");
    expect(result.w1).toBeDefined();
  });

  it("finds complementary formulas", () => {
    const result = validateCompare(get("/api/compare/a?g=!a"), "compare");

    expect(result.txt).toContain("complementary");
  });

  it("reports a parse error in the second formula", () => {
    expect(get("/api/compare/a?g=a+U")).toHaveProperty("parse_error2");
  });

  it("explains equivalent formulas of different classes", () => {
    const result = validateCompare(get("/api/compare/G%20F%20a?g=F+G+F+a"), "compare");

    expect(result.txt).toContain("equivalent");
    expect(result.sfh1).not.toBe(result.sfh2);
    expect(result.sfh1_text).toBeDefined();
    expect(result.sfh2_text).toBeDefined();
  });

  it("counts the automaton", () => {
    const result = validateTranslate(get("/api/translate/G%20a"), "translate");

    expect(result.states).toBe(1);
    expect(result.edges).toBe(1);
    expect(result.det).toBe(true);
    expect(result.automaton_hoa).toContain("HOA");
    expect(result.automaton_spin).toBeDefined();
    expect(result.automaton_svg).toContain("<svg");
  });

  it("warns that a monitor is too weak", () => {
    const result = validateTranslate(get("/api/translate/F%20a?a=m"), "translate");

    expect(result.note?.some((note) => note.includes("safety"))).toBe(true);
  });

  it("names an equivalent parity condition", () => {
    const result = validateTranslate(
      get("/api/translate/GFa%20%26%20GFb?a=p&m=max&e=odd&p=d&l=h&o=colored"),
      "translate"
    );

    expect(result.note).toEqual([
      "Acceptance condition 'Streett 1' is equivalent to 'parity max odd 2'.",
    ]);
  });

  it("answers 404 for an unknown endpoint", () => {
    expect(serve(spotapi, graphviz, "/api/nope")).toEqual({ status: 404, body: null });
  });
});
