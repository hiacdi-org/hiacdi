import { Link } from "react-router-dom";
import { usePublicSite } from "../../hooks/useCms";

export default function AnnouncementBar() {
  const site = usePublicSite();
  const bar = site.announcementBar;
  if (!bar?.enabled || !bar.text) return null;
  const href = bar.link || "";
  const external = /^https?:\/\//i.test(href);
  return (
    <div className="w-full bg-gold px-3 py-2 text-center text-[12px] font-semibold text-navy sm:text-sm">
      {href ? (
        external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            {bar.text}
          </a>
        ) : (
          <Link to={href} className="underline-offset-2 hover:underline">
            {bar.text}
          </Link>
        )
      ) : (
        <span>{bar.text}</span>
      )}
    </div>
  );
}
