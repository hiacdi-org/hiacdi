import { Link } from "react-router-dom";

function isExternal(url, openInNewTab) {
  return Boolean(openInNewTab) || /^https?:\/\//i.test(url || "");
}

export default function NavDropdown({ items, onNavigate }) {
  return (
    <div className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-navy/10 bg-white p-2 shadow-xl">
      {items.map((item) => {
        const href = item.to || item.url || "/";
        const className = "block rounded-xl px-4 py-3 hover:bg-[#f7f3e8]";
        const content = (
          <>
            <p className="text-sm font-semibold text-navy">{item.label}</p>
            {item.text ? <p className="mt-1 text-xs leading-5 text-muted">{item.text}</p> : null}
          </>
        );
        if (isExternal(href, item.openInNewTab)) {
          return (
            <a key={href + item.label} href={href} target="_blank" rel="noopener noreferrer" onClick={onNavigate} className={className}>
              {content}
            </a>
          );
        }
        return (
          <Link key={href + item.label} to={href} onClick={onNavigate} className={className}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
