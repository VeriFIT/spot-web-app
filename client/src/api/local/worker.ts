/**
 * Web Worker running Spot and GraphViz, both compiled to WebAssembly.
 *
 * It receives `{ id, url }` messages, where `url` is the API request the client
 * would have sent to the server, and answers `{ id, answer }` (see `serve.ts`)
 * or `{ id, error }`. Running in a worker keeps the page responsive during long
 * translations, and lets `backend.ts` stop a computation by terminating it.
 */
import { Graphviz } from "@hpcc-js/wasm-graphviz";
import { serve, type SpotApi } from "./serve";

/** The parts of the Emscripten module built by `wasm/Makefile` used here. */
interface SpotModule {
  cwrap(name: "spotapi", returns: "string", args: ["string"]): SpotApi;
}

// The module is not part of the bundle: `wasm/Makefile` installs it in
// `public/wasm/`, next to its `.wasm` file, which it finds relative to itself.
const moduleUrl = import.meta.env.BASE_URL + "wasm/spotapi.mjs";

const ready = Promise.all([
  import(/* @vite-ignore */ moduleUrl).then(
    (module: { default: () => Promise<SpotModule> }) => module.default()
  ),
  Graphviz.load(),
]).then(([spot, graphviz]) => {
  const spotapi = spot.cwrap("spotapi", "string", ["string"]);
  return (url: string) => serve(spotapi, graphviz, url);
});

self.onmessage = async (event: MessageEvent<{ id: number; url: string }>) => {
  const { id, url } = event.data;
  try {
    const handle = await ready;
    self.postMessage({ id, answer: handle(url) });
  } catch (error) {
    self.postMessage({ id, error: String(error) });
  }
};
