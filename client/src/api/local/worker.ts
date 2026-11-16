/**
 * Web Worker running Spot and GraphViz, both compiled to WebAssembly.
 *
 * It receives `{ id, url }` messages, where `url` is the API request the client
 * would have sent to the server, and answers `{ id, answer }` (see `serve.ts`)
 * or `{ id, error }`, with `fatal: true` when this worker must not be used
 * again: Spot or GraphViz could not be loaded, or the WebAssembly code
 * trapped. Running in a worker keeps the page responsive during long
 * translations, and lets `backend.ts` stop a computation by terminating it.
 */
import { Graphviz } from "@hpcc-js/wasm-graphviz";
import { serve, type Answer, type SpotApi } from "./serve";

/** The parts of the Emscripten module built by `wasm/Makefile` used here. */
interface SpotModule {
  cwrap(name: "spotapi", returns: "string", args: ["string"]): SpotApi;
}

// The module is not part of the bundle: `wasm/Makefile` installs it in
// `public/wasm/`, next to its `.wasm` file, which it finds relative to itself.
const moduleUrl = import.meta.env.BASE_URL + "wasm/spotapi.mjs";

/** Load Spot and GraphViz, and return the request handler. */
function load(): Promise<(url: string) => Answer> {
  return Promise.all([
    import(/* @vite-ignore */ moduleUrl).then(
      (module: { default: () => Promise<SpotModule> }) => module.default()
    ),
    Graphviz.load(),
  ]).then(([spot, graphviz]) => {
    const spotapi = spot.cwrap("spotapi", "string", ["string"]);
    return (url: string) => serve(spotapi, graphviz, url);
  });
}

let ready: ReturnType<typeof load> | undefined;

self.onmessage = async (event: MessageEvent<{ id: number; url: string }>) => {
  const { id, url } = event.data;
  let handle;
  try {
    handle = await (ready ??= load());
  } catch (error) {
    // Not retried here: some browsers remember a failed import() in the
    // worker's module map, so backend.ts starts a new worker instead.
    self.postMessage({ id, error: String(error), fatal: true });
    return;
  }
  try {
    self.postMessage({ id, answer: handle(url) });
  } catch (error) {
    // Spot's own errors are C++ exceptions, which spotapi() turns into 500
    // answers, so this is a trap (e.g., out of memory). It can leave the
    // instance in a broken state, so backend.ts replaces this worker.
    self.postMessage({ id, error: String(error), fatal: true });
  }
};
