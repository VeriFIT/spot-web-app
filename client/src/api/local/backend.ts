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
  url: string;
  resolve: (answer: Answer) => void;
  reject: (reason: unknown) => void;
}

let worker: Worker | null = null;
let nextId = 0;
/** Requests sent to the worker, in the order it will handle them. */
const pending = new Map<number, Request>();

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

function startWorker(): Worker {
  const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  w.onmessage = (
    event: MessageEvent<{ id: number; answer?: Answer; error?: string }>
  ) => {
    const { id, answer, error } = event.data;
    const request = pending.get(id);
    if (!request) return; // aborted
    pending.delete(id);
    if (answer) {
      remember(request.url, answer);
      request.resolve(answer);
    } else {
      request.reject(new Error(error));
    }
  };
  w.onerror = (event) => {
    // The module failed to load or crashed: fail every request, and start
    // afresh on the next one.
    event.preventDefault();
    const failed = [...pending.values()];
    pending.clear();
    w.terminate();
    if (worker === w) worker = null;
    for (const request of failed) request.reject(new Error(event.message));
  };
  return w;
}

/**
 * Replace the worker by a new one, and hand it the requests the old one had not
 * answered. This is how a computation is interrupted: WebAssembly code cannot
 * be stopped from the outside except by terminating its worker.
 */
function restartWorker(): void {
  worker?.terminate();
  worker = startWorker();
  for (const [id, request] of pending) worker.postMessage({ id, url: request.url });
}

/** Answer `url` (an `/api/...` path) as `server/spotapi.py` would. */
export function localFetch(url: string, signal?: AbortSignal): Promise<Answer> {
  const cached = cache.get(url);
  if (cached) return Promise.resolve(structuredClone(cached));

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const id = nextId++;
    pending.set(id, { url, resolve, reject });
    worker ??= startWorker();
    worker.postMessage({ id, url });

    signal?.addEventListener(
      "abort",
      () => {
        if (!pending.has(id)) return;
        // The worker handles requests in order, so the first pending one is
        // the one it is computing. Only that one is worth interrupting.
        const running = pending.keys().next().value === id;
        pending.delete(id);
        reject(signal.reason);
        if (running) restartWorker();
      },
      { once: true }
    );
  });
}
