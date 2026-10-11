import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchApiHealth, isServerUnreachableError } from "../services/api";

const MAX_AUTO_RETRIES = 3;
const BACKOFF_MS = [1000, 2000, 4000];

const ServerReachabilityContext = createContext({
  offline: false,
  checking: false,
  markDown: () => {},
  markUp: () => {},
  retry: () => {},
  subscribe: () => () => {},
});

export function ServerReachabilityProvider({ children }) {
  const [offline, setOffline] = useState(false);
  const [checking, setChecking] = useState(false);
  const attemptsRef = useRef(0);
  const timerRef = useRef(null);
  const listenersRef = useRef(new Set());

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const notify = useCallback(() => {
    listenersRef.current.forEach((fn) => {
      try {
        fn();
      } catch {
        /* subscriber errors stay local */
      }
    });
  }, []);

  const scheduleAutoRetry = useCallback(() => {
    if (attemptsRef.current >= MAX_AUTO_RETRIES) return;
    const delay = BACKOFF_MS[attemptsRef.current] || BACKOFF_MS[BACKOFF_MS.length - 1];
    attemptsRef.current += 1;
    clearTimer();
    timerRef.current = setTimeout(() => {
      setChecking(true);
      notify();
    }, delay);
  }, [notify]);

  const markDown = useCallback(() => {
    setOffline(true);
    scheduleAutoRetry();
  }, [scheduleAutoRetry]);

  const markUp = useCallback(() => {
    attemptsRef.current = 0;
    clearTimer();
    setOffline(false);
    setChecking(false);
  }, []);

  const retry = useCallback(() => {
    attemptsRef.current = 0;
    setChecking(true);
    setOffline(true);
    notify();
    fetchApiHealth()
      .then(() => markUp())
      .catch((error) => {
        if (isServerUnreachableError(error) || error) {
          setChecking(false);
          setOffline(true);
          scheduleAutoRetry();
        }
      });
  }, [markUp, notify, scheduleAutoRetry]);

  const subscribe = useCallback((fn) => {
    listenersRef.current.add(fn);
    return () => listenersRef.current.delete(fn);
  }, []);

  useEffect(() => () => clearTimer(), []);

  const value = useMemo(
    () => ({ offline, checking, markDown, markUp, retry, subscribe }),
    [offline, checking, markDown, markUp, retry, subscribe]
  );

  return <ServerReachabilityContext.Provider value={value}>{children}</ServerReachabilityContext.Provider>;
}

export function useServerReachability() {
  return useContext(ServerReachabilityContext);
}
