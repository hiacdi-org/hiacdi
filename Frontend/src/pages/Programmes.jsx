import { Link } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import { programmeGroups } from "../data/programmes";

export default function Programmes() {
  return (
    <div>
      <PageHero
        eyebrow="Our Programmes"
        title="Twelve areas of community work"
        text="HIACDI programmes cover health, protection, education, environment, livelihoods, agriculture, WASH, peace, advocacy, emergencies, and digital inclusion."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programmeGroups.map((group) => (
            <Link
              key={group.slug}
              to={`/programmes/${group.slug}`}
              className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_12px_40px_rgba(10,46,109,0.06)] hover:border-gold"
            >
              <h2 className="font-heading text-lg font-bold text-navy">{group.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{group.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
