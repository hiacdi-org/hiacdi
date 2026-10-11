export default function StatusBadge({ status, visible }) {
  if (visible === false) {
    return <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">Hidden</span>;
  }
  if ((status || "published") === "draft") {
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">Draft — not on site</span>;
  }
  return <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-800">Published</span>;
}

export function ViewOnSite({ href, label = "View on site" }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gold">
      {label}
    </a>
  );
}
