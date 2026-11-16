import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Stand-in for the worker: records what it is sent, answers on demand. */
class FakeWorker {
  static all: FakeWorker[] = [];
  received: { id: number; url: string }[] = [];
  terminated = false;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { message: string; preventDefault(): void }) => void) | null = null;

  constructor() {
    FakeWorker.all.push(this);
  }
  postMessage(message: { id: number; url: string }) {
    this.received.push(message);
  }
  terminate() {
    this.terminated = true;
  }
  /** Answer the `index`-th request received, with `body`. */
  answer(index: number, body: unknown) {
    const { id } = this.received[index];
    this.onmessage?.({ data: { id, answer: { status: 200, body } } });
  }
}

// backend.ts keeps its worker and cache in module state, so each test loads a
// fresh copy.
async function loadBackend() {
  vi.resetModules();
  return import("./backend");
}

describe("localFetch", () => {
  beforeEach(() => {
    FakeWorker.all = [];
    vi.stubGlobal("Worker", FakeWorker);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("answers through the worker", async () => {
    const { localFetch } = await loadBackend();
    const result = localFetch("/api/study/a");
    FakeWorker.all[0].answer(0, { mp_class: "G" });

    await expect(result).resolves.toEqual({ status: 200, body: { mp_class: "G" } });
  });

  it("answers a repeated request from the cache", async () => {
    const { localFetch } = await loadBackend();
    const first = localFetch("/api/study/a");
    FakeWorker.all[0].answer(0, { mp_class: "G" });
    await first;

    await expect(localFetch("/api/study/a")).resolves.toEqual({
      status: 200,
      body: { mp_class: "G" },
    });
    expect(FakeWorker.all[0].received).toHaveLength(1);
  });

  it("does not cache random formulas", async () => {
    const { localFetch } = await loadBackend();
    const first = localFetch("/api/random");
    FakeWorker.all[0].answer(0, "a");
    await first;
    void localFetch("/api/random");

    expect(FakeWorker.all[0].received).toHaveLength(2);
  });

  it("interrupts the running request when it is aborted", async () => {
    const { localFetch } = await loadBackend();
    const controller = new AbortController();
    const running = localFetch("/api/translate/slow", controller.signal);
    const queued = localFetch("/api/study/a");

    controller.abort();

    await expect(running).rejects.toBe(controller.signal.reason);
    // The busy worker is replaced, and the queued request is sent again.
    expect(FakeWorker.all[0].terminated).toBe(true);
    expect(FakeWorker.all[1].received.map(({ url }) => url)).toEqual(["/api/study/a"]);
    FakeWorker.all[1].answer(0, { mp_class: "G" });
    await expect(queued).resolves.toEqual({ status: 200, body: { mp_class: "G" } });
  });

  it("keeps the worker when a queued request is aborted", async () => {
    const { localFetch } = await loadBackend();
    const controller = new AbortController();
    void localFetch("/api/translate/a");
    const queued = localFetch("/api/study/a", controller.signal);

    controller.abort();

    await expect(queued).rejects.toBe(controller.signal.reason);
    expect(FakeWorker.all).toHaveLength(1);
    expect(FakeWorker.all[0].terminated).toBe(false);
  });

  it("fails the pending requests when the worker crashes", async () => {
    const { localFetch } = await loadBackend();
    const result = localFetch("/api/study/a");
    FakeWorker.all[0].onerror?.({ message: "out of memory", preventDefault() {} });

    await expect(result).rejects.toThrow("out of memory");
    // The next request starts a new worker.
    void localFetch("/api/study/b");
    expect(FakeWorker.all).toHaveLength(2);
  });
});
