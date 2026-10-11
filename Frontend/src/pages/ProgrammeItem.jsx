import { Link, Navigate, useParams } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import { EDUCATION_SITE_URL } from "../data/cboPages";
import { useProgrammes } from "../hooks/useProgrammes";

export default function ProgrammeItem() {
  const { groupSlug, itemSlug } = useParams();
  const { findItem, loading, error, retry } = useProgrammes(groupSlug);
  if (loading) {
    return <div className="px-4 py-24 text-center text-sm text-muted">Loading programme…</div>;
  }
  const found = findItem(groupSlug, itemSlug);
  if (!found) {
    if (error) {
      return (
        <div className="px-4 py-24 text-center">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button type="button" className="mt-3 text-sm font-semibold text-gold" onClick={retry}>
            Retry
          </button>
        </div>
      );
    }
    return <Navigate to="/programmes" replace />;
  }
  const { group, item } = found;

  return (
    <div>
      <PageHero eyebrow={group.title} title={item.title} text={item.summary} />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        {item.coverImage?.url ? (
          <img src={item.coverImage.url} alt="" className="mb-6 w-full rounded-2xl object-cover" />
        ) : null}
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
