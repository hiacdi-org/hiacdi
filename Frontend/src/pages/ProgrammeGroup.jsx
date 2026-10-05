import { Link, Navigate, useParams } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import { EDUCATION_SITE_URL } from "../data/cboPages";
import { findGroup } from "../data/programmes";

export default function ProgrammeGroup() {
  const { groupSlug } = useParams();
  const group = findGroup(groupSlug);
  if (!group) return <Navigate to="/programmes" replace />;

  const isEducation = Boolean(group.educationSite);

  return (
    <div>
      <PageHero eyebrow="Our Programmes" title={group.title} text={group.summary} />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {isEducation ? (
          <div className="mb-10 max-w-3xl rounded-2xl border border-gold/40 bg-[#f7f4ec] p-6">
            <h2 className="font-heading text-xl font-bold text-navy">Education at HIACDI</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              This page is a concise overview. Key activities include literacy, girls&apos; education, youth
              leadership, vocational skills, and digital literacy. Selected projects and impact are published on
              the dedicated education website.
            </p>
            <a
              href={EDUCATION_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-mid"
            >
              Visit our Education Website
            </a>
          </div>
        ) : null}
        <h2 className="font-heading text-2xl font-bold text-navy">Key activities</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {group.items.map((entry) => (
            <Link
              key={entry.slug}
              to={`/programmes/${group.slug}/${entry.slug}`}
              className="rounded-2xl border border-navy/10 bg-white p-5 hover:border-gold"
            >
              <h3 className="font-heading font-bold text-navy">{entry.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{entry.summary}</p>
              {entry.issuesCertificates ? (
                <p className="mt-3 text-xs font-semibold text-gold">
                  Graduates receive a verifiable HIACDI certificate.{" "}
                  <Link to="/verify" className="text-navy underline-offset-2 hover:underline">
                    Verify a certificate
                  </Link>
                </p>
              ) : null}
            </Link>
          ))}
        </div>
        <Link
          to="/get-involved"
          className="mt-10 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white hover:bg-gold-dark"
        >
          Get involved
        </Link>
      </section>
    </div>
  );
}
