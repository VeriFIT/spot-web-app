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
  /** Fail the `index`-th request received; `fatal` asks to be replaced. */
  fail(index: number, error: string, fatal: boolean) {
    const { id } = this.received[index];
    this.onmessage?.({ data: { id, error, fatal } });
  }
  urls() {
    return this.received.map(({ url }) => url);
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
    // The busy worker is replaced, and the queued request goes to the new one.
    expect(FakeWorker.all[0].terminated).toBe(true);
    expect(FakeWorker.all[0].urls()).toEqual(["/api/translate/slow"]);
    expect(FakeWorker.all[1].urls()).toEqual(["/api/study/a"]);
    FakeWorker.all[1].answer(0, { mp_class: "G" });
    await expect(queued).resolves.toEqual({ status: 200, body: { mp_class: "G" } });
  });

  it("never computes a queued request that is aborted", async () => {
    const { localFetch } = await loadBackend();
    const controller = new AbortController();
    const first = localFetch("/api/translate/a");
    const aborted = localFetch("/api/translate/slow", controller.signal);
    const last = localFetch("/api/study/a");

    controller.abort();

    await expect(aborted).rejects.toBe(controller.signal.reason);
    expect(FakeWorker.all).toHaveLength(1);
    expect(FakeWorker.all[0].terminated).toBe(false);
    // The worker gets one request at a time, and never the aborted one.
    expect(FakeWorker.all[0].urls()).toEqual(["/api/translate/a"]);
    FakeWorker.all[0].answer(0, "A");
    await expect(first).resolves.toEqual({ status: 200, body: "A" });
    expect(FakeWorker.all[0].urls()).toEqual(["/api/translate/a", "/api/study/a"]);
    FakeWorker.all[0].answer(1, "C");
    await expect(last).resolves.toEqual({ status: 200, body: "C" });
  });

  it("does not answer an aborted request from the cache", async () => {
    const { localFetch } = await loadBackend();
    const first = localFetch("/api/study/a");
    FakeWorker.all[0].answer(0, { mp_class: "G" });
    await first;
    const controller = new AbortController();
    controller.abort();

    await expect(localFetch("/api/study/a", controller.signal)).rejects.toBe(
      controller.signal.reason
    );
  });

  it("keeps the worker after an error of the API", async () => {
    const { localFetch } = await loadBackend();
    const result = localFetch("/api/study/a");
    FakeWorker.all[0].fail(0, "bad formula", false);

    await expect(result).rejects.toThrow("bad formula");
    void localFetch("/api/study/b");
    expect(FakeWorker.all).toHaveLength(1);
  });

  it("replaces the worker after a trap, and keeps the queue", async () => {
    const { localFetch } = await loadBackend();
    const trapped = localFetch("/api/translate/huge");
    const queued = localFetch("/api/study/a");
    FakeWorker.all[0].fail(0, "RuntimeError: Aborted(OOM)", true);

    await expect(trapped).rejects.toThrow("Aborted(OOM)");
    expect(FakeWorker.all[0].terminated).toBe(true);
    expect(FakeWorker.all[1].urls()).toEqual(["/api/study/a"]);
    FakeWorker.all[1].answer(0, { mp_class: "G" });
    await expect(queued).resolves.toEqual({ status: 200, body: { mp_class: "G" } });
  });

  it("fails the running request when the worker crashes", async () => {
    const { localFetch } = await loadBackend();
    const result = localFetch("/api/study/a");
    FakeWorker.all[0].onerror?.({ message: "out of memory", preventDefault: vi.fn() });

    await expect(result).rejects.toThrow("out of memory");
    // The next request starts a new worker.
    void localFetch("/api/study/b");
    expect(FakeWorker.all).toHaveLength(2);
  });

  it("replaces a worker that failed to load Spot", async () => {
    const { localFetch } = await loadBackend();
    const result = localFetch("/api/study/a");
    FakeWorker.all[0].fail(0, "TypeError: Failed to fetch", true);

    await expect(result).rejects.toThrow("Failed to fetch");
    expect(FakeWorker.all[0].terminated).toBe(true);
    // The next request goes to a new worker, which loads Spot again.
    const retry = localFetch("/api/study/a");
    expect(FakeWorker.all).toHaveLength(2);
    FakeWorker.all[1].answer(0, { mp_class: "G" });
    await expect(retry).resolves.toEqual({ status: 200, body: { mp_class: "G" } });
  });
});
