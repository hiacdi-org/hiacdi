export function optimizedImage(url, width = 1200) {
  if (!url || !String(url).includes("/upload/")) return url;
  return String(url).replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}

export function cloudinarySrcSet(url, widths = [400, 800, 1200, 1600]) {
  if (!url || !String(url).includes("/upload/")) return "";
  return widths.map((width) => `${optimizedImage(url, width)} ${width}w`).join(", ");
}
