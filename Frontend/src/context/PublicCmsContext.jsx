import { createContext, useContext, useEffect, useState } from "react";
import { fetchCmsHome, isServerUnreachableError } from "../services/api";
import { navLinks, site as fallbackSite } from "../data/site";
import { useServerReachability } from "./ServerReachabilityContext";

const CACHE_KEY = "hiacdi.publicHome.v2";
const PublicCmsContext = createContext(null);

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(value) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function PublicCmsProvider({ children }) {
  const [data, setData] = useState(() => readCache());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(() => !readCache());
  const { markDown, markUp, subscribe } = useServerReachability();

  function load() {
    setError("");
    fetchCmsHome()
      .then((value) => {
        setData(value);
        writeCache(value);
        setError("");
        markUp();
      })
      .catch((err) => {
        if (isServerUnreachableError(err)) markDown();
        if (!data) setError("offline");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    return subscribe(load);
  }, [subscribe]);

  const settings = data?.settings || {};
  const site = {
    ...fallbackSite,
    ...settings,
    name: settings.shortName || fallbackSite.name,
    fullName: settings.organizationName || fallbackSite.fullName,
    organizationName: settings.organizationName,
    shortName: settings.shortName,
    tagline: settings.tagline || fallbackSite.tagline,
    logo: settings.logo,
    favicon: settings.favicon,
    primaryColor: settings.primaryColor,
    accentColor: settings.accentColor,
    contact: settings.contact || {},
    social: settings.social || {},
    footerText: settings.footerText,
    copyright: settings.copyright,
    educationSiteUrl: settings.educationSiteUrl,
    announcementBar: settings.announcementBar,
    seo: settings.seo,
    pageSeo: settings.pageSeo,
    email: settings.contact?.email || fallbackSite.email,
    location: settings.contact?.address || fallbackSite.location,
  };

  const nav =
    data?.nav?.length > 0
      ? data.nav
      : navLinks.map((link, index) => ({ id: link.to, label: link.label, url: link.to, order: index, visible: true }));

  return (
    <PublicCmsContext.Provider
      value={{
        data,
        site,
        nav,
        programmeGroups: data?.programmeGroups || [],
        posts: data?.posts || [],
        error,
        loading,
        retry: load,
      }}
    >
      {children}
    </PublicCmsContext.Provider>
  );
}

export function usePublicCms() {
  const ctx = useContext(PublicCmsContext);
  if (!ctx) {
    return {
      data: null,
      site: fallbackSite,
      nav: navLinks.map((link, index) => ({ id: link.to, label: link.label, url: link.to, order: index, visible: true })),
      programmeGroups: [],
      posts: [],
      error: "",
      loading: false,
      retry: () => {},
    };
  }
  return ctx;
}
