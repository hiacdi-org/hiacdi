import { useEffect } from "react";

const SITE_URL = "https://hiacdi.org";

function absoluteUrl(url) {
  if (!url) {
    return SITE_URL;
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${SITE_URL}${url}`;
  }

  return `${SITE_URL}/${url}`;
}

function setMetaName(name, content) {
  if (!content) return;

  let element = document.querySelector(
    `meta[name="${name}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setMetaProperty(property, content) {
  if (!content) return;

  let element = document.querySelector(
    `meta[property="${property}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setCanonical(url) {
  let canonical = document.querySelector(
    'link[rel="canonical"]'
  );

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", url);
}

export default function SEO({
  title = "HIACDI | Humanity, Inclusion and Advancement Community Development Initiative",

  description = "HIACDI advances health, education, youth empowerment, gender equality, protection, inclusion and sustainable community development.",

  path = "/",

  image = "/brand/logo-mark.png",

  type = "website",

  noIndex = false
}) {
  useEffect(() => {
    const canonicalUrl = absoluteUrl(path);
    const imageUrl = absoluteUrl(image);

    document.title = title;

    setMetaName(
      "description",
      description
    );

    setMetaName(
      "robots",
      noIndex
        ? "noindex, nofollow"
        : "index, follow"
    );

    setMetaName(
      "googlebot",
      noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    setCanonical(canonicalUrl);

    setMetaProperty(
      "og:type",
      type
    );

    setMetaProperty(
      "og:site_name",
      "HIACDI"
    );

    setMetaProperty(
      "og:locale",
      "en_KE"
    );

    setMetaProperty(
      "og:url",
      canonicalUrl
    );

    setMetaProperty(
      "og:title",
      title
    );

    setMetaProperty(
      "og:description",
      description
    );

    setMetaProperty(
      "og:image",
      imageUrl
    );

    setMetaProperty(
      "og:image:alt",
      "HIACDI - Humanity, Inclusion and Advancement Community Development Initiative logo"
    );

    setMetaName(
      "twitter:card",
      "summary_large_image"
    );

    setMetaName(
      "twitter:title",
      title
    );

    setMetaName(
      "twitter:description",
      description
    );

    setMetaName(
      "twitter:image",
      imageUrl
    );

    setMetaName(
      "twitter:image:alt",
      "HIACDI - Humanity, Inclusion and Advancement Community Development Initiative logo"
    );
  }, [
    title,
    description,
    path,
    image,
    type,
    noIndex
  ]);

  return null;
}
