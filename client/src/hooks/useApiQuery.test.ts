import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useApiQuery } from "./useApiQuery";

interface PendingCall {
  key: string;
  signal: AbortSignal;
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}

/**
 * A loader whose requests stay pending until the test settles them, so the
 * order in which the answers arrive can be controlled.
 */
function controlledLoader() {
  const calls: PendingCall[] = [];
  const load = vi.fn(
    (key: string, signal: AbortSignal) =>
      new Promise<string>((resolve, reject) => {
        calls.push({ key, signal, resolve, reject });
      })
  );
  return { load, calls };
}

describe("useApiQuery", () => {
  it("runs the loader for the key and exposes the result", async () => {
    const { load, calls } = controlledLoader();
    const { result } = renderHook(() => useApiQuery("a", load));

    expect(result.current).toEqual({ data: null, error: null, loading: true });
    expect(load).toHaveBeenCalledTimes(1);
    expect(load.mock.calls[0][0]).toBe("a");
    expect(load.mock.calls[0][1]).toBeInstanceOf(AbortSignal);

    await act(async () => calls[0].resolve("A"));

    expect(result.current).toEqual({ data: "A", error: null, loading: false });
  });

  it("does not run the loader while the key is null", async () => {
    const { load, calls } = controlledLoader();
    const { result } = renderHook(() => useApiQuery(null, load));

    await act(async () => {});

    expect(load).not.toHaveBeenCalled();
    expect(calls).toHaveLength(0);
    expect(result.current).toEqual({ data: null, error: null, loading: false });
  });

  it("refetches when the key changes", async () => {
    const { load, calls } = controlledLoader();
    const { result, rerender } = renderHook(({ key }) => useApiQuery(key, load), {
      initialProps: { key: "a" },
    });

    await act(async () => calls[0].resolve("A"));
    rerender({ key: "b" });

    expect(load).toHaveBeenCalledTimes(2);
    expect(load.mock.calls[1][0]).toBe("b");

    await act(async () => calls[1].resolve("B"));

    expect(result.current).toEqual({ data: "B", error: null, loading: false });
  });

  it("keeps the previous result visible while the next request is pending", async () => {
    const { calls, load } = controlledLoader();
    const { result, rerender } = renderHook(({ key }) => useApiQuery(key, load), {
      initialProps: { key: "a" },
    });

    await act(async () => calls[0].resolve("A"));
    rerender({ key: "b" });

    expect(result.current.data).toBe("A");
    expect(result.current.loading).toBe(true);
  });

  it("aborts the previous request when the key changes", async () => {
    const { load, calls } = controlledLoader();
    const { rerender } = renderHook(({ key }) => useApiQuery(key, load), {
      initialProps: { key: "a" },
    });

    expect(calls[0].signal.aborted).toBe(false);
    rerender({ key: "b" });

    expect(calls[0].signal.aborted).toBe(true);
    expect(calls[1].signal.aborted).toBe(false);
  });

  it("ignores the answer of a superseded request", async () => {
    const { load, calls } = controlledLoader();
    const { result, rerender } = renderHook(({ key }) => useApiQuery(key, load), {
      initialProps: { key: "a" },
    });

    rerender({ key: "b" });
    // The newest request comes back first, then the abandoned one.
    await act(async () => calls[1].resolve("B"));
    await act(async () => calls[0].resolve("A"));

    expect(result.current).toEqual({ data: "B", error: null, loading: false });
  });

  it("aborts the request in flight when unmounting", () => {
    const { load, calls } = controlledLoader();
    const { unmount } = renderHook(() => useApiQuery("a", load));

    unmount();

    expect(calls[0].signal.aborted).toBe(true);
  });

  it("exposes the failure of a request", async () => {
    const { load, calls } = controlledLoader();
    const { result } = renderHook(() => useApiQuery("a", load));

    const error = new Error("500 Internal Server Error");
    await act(async () => calls[0].reject(error));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(error);
  });

  it("wraps a non-Error rejection", async () => {
    const { load, calls } = controlledLoader();
    const { result } = renderHook(() => useApiQuery("a", load));

    await act(async () => calls[0].reject("boom"));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("boom");
  });

  it("clears a previous result when a new request fails", async () => {
    const { load, calls } = controlledLoader();
    const { result, rerender } = renderHook(({ key }) => useApiQuery(key, load), {
      initialProps: { key: "a" },
    });

    await act(async () => calls[0].resolve("A"));
    rerender({ key: "b" });
    await act(async () => calls[1].reject(new Error("boom")));

    expect(result.current.data).toBeNull();
    expect(result.current.error?.message).toBe("boom");
  });

  it("clears the result and stops querying when the key becomes null", async () => {
    const { load, calls } = controlledLoader();
    const { result, rerender } = renderHook(({ key }) => useApiQuery(key, load), {
      initialProps: { key: "a" as string | null },
    });

    await act(async () => calls[0].resolve("A"));
    rerender({ key: null });

    expect(calls[0].signal.aborted).toBe(true);
    expect(result.current).toEqual({ data: null, error: null, loading: false });

    await act(async () => {});

    expect(load).toHaveBeenCalledTimes(1);
  });

  it("does not refetch when only the loader identity changes", async () => {
    const first = controlledLoader();
    const second = controlledLoader();
    const { rerender } = renderHook(
      ({ load }: { load: typeof first.load }) => useApiQuery("a", load),
      { initialProps: { load: first.load } }
    );

    rerender({ load: second.load });

    expect(second.load).not.toHaveBeenCalled();
    expect(first.load).toHaveBeenCalledTimes(1);
  });

  it("uses the latest loader for the next request", async () => {
    const first = controlledLoader();
    const second = controlledLoader();
    const { result, rerender } = renderHook(
      ({ key, load }: { key: string; load: typeof first.load }) => useApiQuery(key, load),
      { initialProps: { key: "a", load: first.load } }
    );

    await act(async () => first.calls[0].resolve("A"));
    rerender({ key: "b", load: second.load });

    expect(second.load).toHaveBeenCalledTimes(1);
    await act(async () => second.calls[0].resolve("B"));

    expect(result.current).toEqual({ data: "B", error: null, loading: false });
  });
});
