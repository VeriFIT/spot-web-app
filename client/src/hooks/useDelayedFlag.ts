import { useEffect, useState } from "react";

/**
 * True only once `active` has been true for `delayMs`.
 *
 * The API answers fast requests in a few milliseconds; flashing a spinner for
 * those makes the app feel slower than it is. Show one only when the request
 * actually takes a while. (The delay matches the previous behaviour of the
 * class components; modernize.md section 7 discusses shortening it.)
 */
export function useDelayedFlag(active: boolean, delayMs: number): boolean {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const timer = setTimeout(() => setShown(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  return shown;
}
