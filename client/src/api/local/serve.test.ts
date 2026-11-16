import { describe, expect, it } from "vitest";
import { serve, type DotRenderer } from "./serve";

/** A GraphViz stand-in that draws `scale` into the SVG it returns. */
function fakeGraphviz(
  scales: Partial<Record<string, string>>
): DotRenderer & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    dot(source: string) {
      calls.push(source);
      const scale = scales[source];
      return scale === undefined
        ? `<svg>${source}</svg>`
        : `<svg><g transform="scale(${scale}) rotate(0)">${source}</g></svg>`;
    },
    version: () => "12.0.0",
  };
}

const answer =
  (body: unknown, status = 200) =>
  () =>
    JSON.stringify({ status, body });

describe("serve", () => {
  it("appends GraphViz to the versions", () => {
    const result = serve(
      answer([["Spot", "2.15", "u"]]),
      fakeGraphviz({}),
      "/api/versions"
    );

    expect(result.body).toEqual([
      ["Spot", "2.15", "u"],
      ["GraphViz", "12.0.0", "https://graphviz.gitlab.io/"],
    ]);
  });

  it("renders the syntax tree of a rewrite", () => {
    const result = serve(answer({ svg_dot: "tree" }), fakeGraphviz({}), "/api/rewrite/a");

    expect(result.body).toEqual({ svg: "<svg>tree</svg>" });
  });

  it("keeps the horizontal automaton when dot did not shrink it", () => {
    const graphviz = fakeGraphviz({ h: "1 1" });
    const result = serve(
      answer({ automaton_dot: "h", automaton_dot_vertical: "v", states: 1 }),
      graphviz,
      "/api/translate/a"
    );

    expect(result.body).toEqual({
      automaton_svg: '<svg><g transform="scale(1 1) rotate(0)">h</g></svg>',
      states: 1,
    });
    expect(graphviz.calls).toEqual(["h"]);
  });

  it("switches to the vertical automaton when it is shrunk less", () => {
    const result = serve(
      answer({ automaton_dot: "h", automaton_dot_vertical: "v" }),
      fakeGraphviz({ h: "0.5 0.5", v: "0.8 0.8" }),
      "/api/translate/a"
    );

    expect(result.body).toEqual({
      automaton_svg: '<svg><g transform="scale(0.8 0.8) rotate(0)">v</g></svg>',
    });
  });

  it("keeps the horizontal automaton when the vertical one is shrunk more", () => {
    const result = serve(
      answer({ automaton_dot: "h", automaton_dot_vertical: "v" }),
      fakeGraphviz({ h: "0.5 0.5", v: "0.4 0.4" }),
      "/api/translate/a"
    );

    expect(result.body).toEqual({
      automaton_svg: '<svg><g transform="scale(0.5 0.5) rotate(0)">h</g></svg>',
    });
  });

  it("corrects the inverted scale of some GraphViz versions", () => {
    const result = serve(
      answer({ automaton_dot: "h", automaton_dot_vertical: "v" }),
      fakeGraphviz({ h: "2 4" }),
      "/api/translate/a"
    );

    expect(result.body).toEqual({
      automaton_svg: '<svg><g transform="scale(0.5 0.25) rotate(0)">h</g></svg>',
    });
  });

  it("adds a note when GraphViz fails", () => {
    const graphviz: DotRenderer = {
      dot: () => {
        throw new Error("syntax error");
      },
      version: () => "",
    };
    const result = serve(
      answer({ note: ["first"], automaton_dot: "h", automaton_dot_vertical: "v" }),
      graphviz,
      "/api/translate/a"
    );

    expect(result.body).toEqual({
      note: ["first", "Could not display automaton. Error: syntax error"],
    });
  });

  it("passes errors through", () => {
    const result = serve(answer(null, 404), fakeGraphviz({}), "/api/nope");

    expect(result).toEqual({ status: 404, body: null });
  });
});
