import { useEffect, useRef, useState } from "react";

export interface ApiQueryResult<T> {
  /** Last successful response, kept while a newer request is in flight. */
  data: T | null;
  error: Error | null;
  loading: boolean;
}

/** A request function; `key` doubles as the request URL for the API helpers. */
export type ApiLoader<T> = (key: string, signal: AbortSignal) => Promise<T>;

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

/**
 * Run `load(key, signal)` whenever `key` changes, aborting the previous request.
 *
 * Passing `null` disables the query and clears its result. A superseded or
 * aborted request never writes state, so a slow answer can no longer overwrite
 * a newer one (see modernize.md 5.2).
 */
export function useApiQuery<T>(
  key: string | null,
  load: ApiLoader<T>
): ApiQueryResult<T> {
  const [result, setResult] = useState<ApiQueryResult<T>>({
    data: null,
    error: null,
    loading: false,
  });

  // Keeping the loader in a ref means callers may pass an inline arrow function
  // without triggering a refetch on every render.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    if (key === null) {
      // Disabled query: drop the previous answer, so clearing the input also
      // clears the result.
      setResult({ data: null, error: null, loading: false });
      return;
    }

    const controller = new AbortController();
    // Keep the previous data visible while loading instead of blanking the
    // panel on every keystroke-triggered request.
    setResult((previous) => ({ data: previous.data, error: null, loading: true }));

    loadRef.current(key, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return;
        setResult({ data, error: null, loading: false });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ data: null, error: toError(error), loading: false });
      }
    );

    return () => controller.abort();
  }, [key]);

  return result;
}
