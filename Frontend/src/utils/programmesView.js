export function groupProgrammes(rows = []) {
  const list = Array.isArray(rows) ? rows : [];
  return list
    .filter((row) => row.isGroup)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((group) => ({
      ...group,
      items: list
        .filter((row) => !row.isGroup && row.groupSlug === group.slug)
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    }));
}

export function findProgrammeGroup(rows, groupSlug) {
  return groupProgrammes(rows).find((group) => group.slug === groupSlug) || null;
}

export function findProgrammeItem(rows, groupSlug, itemSlug) {
  const group = findProgrammeGroup(rows, groupSlug);
  if (!group) return null;
  const item = group.items.find((entry) => entry.slug === itemSlug);
  return item ? { group, item } : null;
}

export function publicPathForContent({ kind, page, url, slug, groupSlug }) {
  if (url) return url;
  if (kind === "faqs" || page === "faqs") return "/about/faqs";
  if (kind === "team" || page === "about") return "/about";
  if (kind === "nav") return url || "/";
  if (kind === "posts" || kind === "news") return slug ? `/news/${slug}` : "/news";
  if (kind === "resources") return "/resources";
  if (kind === "gallery") return "/projects/gallery";
  if (kind === "programmes") return groupSlug ? `/programmes/${groupSlug}` : "/programmes";
  if (page === "contact") return "/contact";
  if (page === "home" || kind === "slides" || kind === "stats" || kind === "partners" || kind === "testimonials") {
    return "/";
  }
  return "/";
}
