import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePublicSite } from "../../hooks/useCms";
import { optimizedImage } from "../../utils/media";

function setMeta(attr, key, value) {
  if (!value) return;
  const selector = attr === "property" ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

export default function BrandTheme() {
  const site = usePublicSite();
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    if (site.primaryColor) {
      root.style.setProperty("--color-navy", site.primaryColor);
      root.style.setProperty("--color-navy-dark", site.primaryColor);
    }
    if (site.accentColor) root.style.setProperty("--color-gold", site.accentColor);

    const pageKey = pathname === "/" ? "home" : pathname.replace(/^\//, "").split("/")[0];
    const pageSeo = site.pageSeo?.[pageKey] || {};
    const title = pageSeo.title || site.seo?.defaultTitle;
    if (title) document.title = title;
    setMeta("name", "description", pageSeo.description || site.seo?.defaultDescription);

    const favicon = site.favicon?.url;
    if (favicon) {
      let link = document.querySelector('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = favicon;
    }
    const og = site.seo?.ogImage?.url;
    if (og) setMeta("property", "og:image", optimizedImage(og, 1200));
  }, [site, pathname]);

  return null;
}
