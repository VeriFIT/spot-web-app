/**
 * Answer API requests in the browser, with Spot compiled to WebAssembly,
 * instead of sending them to the server.
 *
 * This is what `fetchJson` uses when the client is built with
 * `VITE_SPOT_BACKEND=wasm` (see the README). Nothing typed in the page then
 * leaves the browser.
 */
import type { Answer } from "./serve";

interface Request {
  id: number;
  url: string;
  resolve: (answer: Answer) => void;
  reject: (reason: unknown) => void;
}

let worker: Worker | null = null;
let nextId = 0;
/** The request the worker is computing, if any. */
let running: Request | null = null;
/**
 * Requests waiting for the worker. They stay here rather than in the worker's
 * message queue, so that cancelling one keeps it from being computed at all.
 */
const queue: Request[] = [];

/** Answers already computed, as the server's Cache-Control would allow. */
const cache = new Map<string, Answer>();
const CACHE_SIZE = 64;

function remember(url: string, answer: Answer): void {
  // /api/random must give a new formula each time; spotapi.py does not let
  // it be cached either.
  if (answer.status !== 200 || url.startsWith("/api/random")) return;
  cache.delete(url);
  cache.set(url, answer);
  if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value as string);
}

/** Send the next waiting request to the worker, if it is idle. */
function dispatch(): void {
  if (running !== null || queue.length === 0) return;
  worker ??= startWorker();
  running = queue.shift() ?? null;
  if (running) worker.postMessage({ id: running.id, url: running.url });
}

/**
 * Drop worker `w`, failing the request it was computing with `reason`, and
 * hand the waiting requests to a new one.
 */
function discard(w: Worker, reason: unknown): void {
  w.terminate();
  if (worker !== w) return;
  worker = null;
  const failed = running;
  running = null;
  failed?.reject(reason);
  dispatch();
}

function startWorker(): Worker {
  const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  w.onmessage = (
    event: MessageEvent<{ id: number; answer?: Answer; error?: string; fatal?: boolean }>
  ) => {
    const { id, answer, error, fatal } = event.data;
    const request = running;
    if (worker !== w || request?.id !== id) return;
    // Spot or GraphViz could not be loaded (e.g., the network was down), or
    // the WebAssembly code trapped, which can leave its instance in a broken
    // state. Either way this worker is not reused.
    if (fatal) {
      discard(w, new Error(error));
      return;
    }
    running = null;
    if (answer) {
      remember(request.url, answer);
      request.resolve(answer);
    } else {
      request.reject(new Error(error));
    }
    dispatch();
  };
  w.onerror = (event) => {
    // The worker failed to start or crashed.
    event.preventDefault();
    discard(w, new Error(event.message));
  };
  return w;
}

/** Answer `url` (an `/api/...` path) as `server/spotapi.py` would. */
export function localFetch(url: string, signal?: AbortSignal): Promise<Answer> {
  if (signal?.aborted) return Promise.reject(signal.reason);
  const cached = cache.get(url);
  if (cached) return Promise.resolve(structuredClone(cached));

  return new Promise((resolve, reject) => {
    const request = { id: nextId++, url, resolve, reject };
    queue.push(request);
    dispatch();

    signal?.addEventListener(
      "abort",
      () => {
        if (running === request) {
          // WebAssembly code cannot be stopped from the outside except by
          // terminating its worker.
          if (worker) discard(worker, signal.reason);
          return;
        }
        const index = queue.indexOf(request);
        if (index < 0) return; // already answered
        queue.splice(index, 1);
        reject(signal.reason);
      },
      { once: true }
    );
  });
}
