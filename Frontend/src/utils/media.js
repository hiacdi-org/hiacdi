export function optimizedImage(url, width = 1200) {
  if (!url || !String(url).includes("/upload/")) return url;
  return String(url).replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}
