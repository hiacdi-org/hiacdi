import { useEffect, useRef } from "react";

export function useLiveRefresh(load, { interval = 8000, enabled = true, paused = false } = {}) {
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    let failures = 0;

    async function tick() {
      if (paused || cancelled) return;
      try {
        await loadRef.current();
        failures = 0;
      } catch {
        failures += 1;
        if (failures >= 3) {
          cancelled = true;
          clearInterval(id);
        }
      }
    }

    const id = setInterval(tick, interval);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled, interval, paused]);
}
