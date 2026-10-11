import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { fetchApplicationWindow, isServerUnreachableError } from "../services/api";
import { useServerReachability } from "./ServerReachabilityContext";

const empty = {
  isOpen: false,
  anyOpen: false,
  globalOpen: false,
  openAt: null,
  closeAt: null,
  reason: "",
  catalog: [],
  openSummary: { global: false, areas: [], courses: [] },
  intake: null,
  loading: true,
};

const ApplicationWindowContext = createContext({
  ...empty,
  refresh: () => {},
    isCourseOpen: () => false,
});

const POLL_MS = 30000;

export function isCourseOpenIn(data, categorySlug, programSlug) {
  if (!data) return false;
  if (data.globalOpen) return true;
  const area = (data.catalog || []).find((item) => item.slug === categorySlug);
  if (area?.isOpen) return true;
  const course = area?.courses?.find((item) => item.slug === programSlug);
  if (course?.isOpen) return true;
  return false;
}

export function ApplicationWindowProvider({ children }) {
  const [state, setState] = useState(empty);
  const activeRef = useRef(true);
  const healthyRef = useRef(true);
  const { markDown, markUp, subscribe } = useServerReachability();

  const load = useCallback(() => {
    fetchApplicationWindow()
      .then((data) => {
        if (!activeRef.current || !data) return;
        healthyRef.current = true;
        markUp();
        setState({
          isOpen: Boolean(data.displayDeadline?.isOpen ?? (data.anyOpen !== false && data.isOpen !== false)),
          anyOpen: data.anyOpen !== false,
          globalOpen: Boolean(data.globalOpen),
          openAt: data.displayDeadline?.openAt || data.openAt || null,
          closeAt: data.displayDeadline?.closeAt || data.closeAt || null,
          reason: data.displayDeadline?.reason || data.reason || "",
          catalog: data.catalog || [],
          openSummary: data.openSummary || { global: false, areas: [], courses: [] },
          intake: data.intake || null,
          loading: false,
        });
      })
      .catch((error) => {
        if (isServerUnreachableError(error)) {
          healthyRef.current = false;
          markDown();
        }
      });
  }, [markDown, markUp]);

  useEffect(() => {
    activeRef.current = true;
    load();
    const id = setInterval(() => {
      if (healthyRef.current) load();
    }, POLL_MS);
    const unsubscribe = subscribe(load);
    return () => {
      activeRef.current = false;
      clearInterval(id);
      unsubscribe();
    };
  }, [load, subscribe]);

  const isCourseOpen = useCallback(
    (categorySlug, programSlug) => isCourseOpenIn(state, categorySlug, programSlug),
    [state]
  );

  return (
    <ApplicationWindowContext.Provider value={{ ...state, refresh: load, isCourseOpen }}>
      {children}
    </ApplicationWindowContext.Provider>
  );
}

export function useApplicationWindow() {
  return useContext(ApplicationWindowContext);
}
