/**
 * Finish, in JavaScript, the answers of the WebAssembly port of the API.
 *
 * `wasm/spotapi.cc` answers the same URLs as `server/spotapi.py`, except that
 * it cannot run GraphViz: where the server returns an SVG picture, it returns
 * the dot source under a key ending in `_dot`. This module renders those with
 * the WebAssembly build of GraphViz, so that the panels receive exactly the
 * documents the server would have sent.
 *
 * It is kept free of imports so that it can run both in the worker and in the
 * tests that load the real WebAssembly module.
 */

/** The `spotapi()` function exported by the WebAssembly module. */
export type SpotApi = (url: string) => string;

/** The parts of `@hpcc-js/wasm-graphviz` used here. */
export interface DotRenderer {
  dot(source: string): string;
  version(): string;
}

/** What the server would have answered: an HTTP status and a JSON body. */
export interface Answer {
  status: number;
  body: unknown;
  /** The C++ exception message, for a 500. */
  error?: string;
}

// GraphViz 2.42.x inverts the scale parameters; both should be <= 1 in our
// case. This is what spot.aux.str_to_svg() corrects in Python.
// https://gitlab.com/graphviz/graphviz/issues/1605
const invertedScale = /transform="scale\(([\d.]+) ([\d.]+)\) rotate/g;

function fixScale(svg: string): string {
  return svg.replace(invertedScale, (match, x: string, y: string) => {
    let xs = parseFloat(x);
    let ys = parseFloat(y);
    if (xs < 1 || ys < 1) return match;
    xs = 1 / xs;
    ys = 1 / ys;
    return `transform="scale(${xs} ${ys}) rotate`;
  });
}

const scale = /transform="scale\(([.\d]+) /;

function scaleOf(svg: string): number | null {
  const match = scale.exec(svg);
  return match ? parseFloat(match[1]) : null;
}

function render(graphviz: DotRenderer, source: string): string {
  return fixScale(graphviz.dot(source));
}

function addNote(body: Record<string, unknown>, message: string): void {
  if (Array.isArray(body.note)) body.note.push(message);
  else body.note = [message];
}

/**
 * Replace the automaton's dot sources by the SVG the server would have chosen:
 * the horizontal layout, unless dot had to shrink it and the vertical layout
 * shrinks it less.
 */
function renderAutomaton(graphviz: DotRenderer, body: Record<string, unknown>): void {
  const horizontal = body.automaton_dot;
  const vertical = body.automaton_dot_vertical;
  delete body.automaton_dot;
  delete body.automaton_dot_vertical;
  if (typeof horizontal !== "string" || typeof vertical !== "string") return;
  try {
    let svg = render(graphviz, horizontal);
    const hscale = scaleOf(svg);
    if (hscale !== null && hscale <= 0.9) {
      const svg2 = render(graphviz, vertical);
      const vscale = scaleOf(svg2);
      if (vscale !== null && hscale < vscale) svg = svg2;
    }
    body.automaton_svg = svg;
  } catch (error) {
    addNote(body, "Could not display automaton. " + String(error));
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Answer `url` (e.g. `/api/translate/GFa?a=b`) as `server/spotapi.py` would. */
export function serve(spotapi: SpotApi, graphviz: DotRenderer, url: string): Answer {
  const answer = JSON.parse(spotapi(url)) as Answer;
  if (answer.status !== 200) return answer;

  const body = answer.body;
  if (url.split("?")[0] === "/api/versions" && Array.isArray(body)) {
    body.push(["GraphViz", graphviz.version(), "https://graphviz.gitlab.io/"]);
  } else if (isRecord(body)) {
    if (typeof body.svg_dot === "string") {
      body.svg = render(graphviz, body.svg_dot);
      delete body.svg_dot;
    }
    if ("automaton_dot" in body) renderAutomaton(graphviz, body);
  }
  return answer;
}
