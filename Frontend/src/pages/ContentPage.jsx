import { Link } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import ApplyCta from "../components/ui/ApplyCta";

export default function ContentPage({ eyebrow, title, text, body, links = [], cta }) {
  return (
    <div>
      <PageHero eyebrow={eyebrow} title={title} text={text} />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {body ? <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">{body}</p> : null}
        {links.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_12px_40px_rgba(10,46,109,0.06)] hover:border-gold"
              >
                <h2 className="font-heading text-lg font-bold text-navy">{item.label}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              </Link>
            ))}
          </div>
        ) : null}
        {cta || (
          <ApplyCta className="mt-10 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white hover:bg-gold-dark">
            Get involved
          </ApplyCta>
        )}
      </section>
    </div>
  );
}
