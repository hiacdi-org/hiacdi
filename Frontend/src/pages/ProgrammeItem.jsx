import { Link, Navigate, useParams } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import { EDUCATION_SITE_URL } from "../data/cboPages";
import { findItem } from "../data/programmes";

export default function ProgrammeItem() {
  const { groupSlug, itemSlug } = useParams();
  const found = findItem(groupSlug, itemSlug);
  if (!found) return <Navigate to="/programmes" replace />;
  const { group, item } = found;

  return (
    <div>
      <PageHero eyebrow={group.title} title={item.title} text={item.summary} />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-sm leading-7 text-muted sm:text-base">{item.content}</p>
        {item.issuesCertificates ? (
          <p className="mt-6 rounded-xl bg-navy/5 px-4 py-3 text-sm font-semibold text-navy">
            Graduates receive a verifiable HIACDI certificate.{" "}
            <Link to="/verify" className="text-gold">
              Verify a certificate
            </Link>
            .
          </p>
        ) : null}
        {item.educationSite || group.educationSite ? (
          <a
            href={EDUCATION_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white"
          >
            Visit our Education Website
          </a>
        ) : null}
        <div className="mt-8">
          <Link to={`/programmes/${group.slug}`} className="text-sm font-semibold text-gold">
            ← {group.title}
          </Link>
        </div>
      </section>
    </div>
  );
}
