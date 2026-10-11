import { Link, Navigate, useParams } from "react-router-dom";
import ContentPage from "./ContentPage";
import PageHero from "../components/layout/PageHero";
import { aboutPages, involvedPages, newsPages, projectPages, resourcePages } from "../data/cboPages";
import { usePublicGallery, usePublicPost, usePublicPosts, usePublicResources } from "../hooks/usePublicContent";

const trees = {
  about: aboutPages,
  projects: projectPages,
  news: newsPages,
  resources: resourcePages,
  "get-involved": involvedPages,
};

export default function HubLanding({ hub }) {
  const pages = trees[hub];
  const titles = {
    about: ["About HIACDI", "Who we are and how we work"],
    projects: ["Projects & Impact", "Featured work, results, and community stories"],
    news: ["News & Events", "Updates, campaigns, workshops, and field notes"],
    resources: ["Resources", "Reports, policies, guidelines, and downloads"],
    "get-involved": ["Get involved", "Volunteer, partner, donate, or work with HIACDI"],
  };
  const [title, text] = titles[hub] || ["HIACDI", ""];

  if (hub === "news") return <NewsHub title={title} text={text} pages={pages} />;
  if (hub === "resources") return <ResourcesHub title={title} text={text} pages={pages} />;

  return (
    <ContentPage
      eyebrow={title}
      title={title}
      text={text}
      body="These pages are ready for HIACDI staff to add approved content."
      links={pages}
    />
  );
}

function NewsHub({ title, text, pages }) {
  const { rows, loading, error, retry } = usePublicPosts();
  return (
    <div>
      <PageHero eyebrow={title} title={title} text={text} />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {error ? (
          <p className="mb-4 text-sm font-semibold text-red-700">
            {error}{" "}
            <button type="button" className="underline" onClick={retry}>
              Retry
            </button>
          </p>
        ) : null}
        {loading ? <p className="text-sm text-muted">Loading news…</p> : null}
        {rows.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((post) => (
              <Link
                key={post._id || post.slug}
                to={`/news/${post.slug}`}
                className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_12px_40px_rgba(10,46,109,0.06)] hover:border-gold"
              >
                {post.image?.url ? <img src={post.image.url} alt="" className="mb-4 h-40 w-full rounded-xl object-cover" /> : null}
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">{post.category}</p>
                <h2 className="font-heading mt-2 text-lg font-bold text-navy">{post.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{post.summary}</p>
              </Link>
            ))}
          </div>
        ) : loading ? null : (
          <p className="text-sm text-muted">No published news yet. Published posts from the admin dashboard appear here.</p>
        )}
        {pages?.length ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((item) => (
              <Link key={item.to} to={item.to} className="rounded-2xl border border-navy/10 bg-white p-5 text-sm font-semibold text-navy hover:border-gold">
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ResourcesHub({ title, text, pages }) {
  const { rows, loading, error, retry } = usePublicResources();
  return (
    <div>
      <PageHero eyebrow={title} title={title} text={text} />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {error ? (
          <p className="mb-4 text-sm font-semibold text-red-700">
            {error}{" "}
            <button type="button" className="underline" onClick={retry}>
              Retry
            </button>
          </p>
        ) : null}
        {loading ? <p className="text-sm text-muted">Loading resources…</p> : null}
        {rows.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((item) => (
              <article key={item._id} className="rounded-2xl border border-navy/10 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">{item.category}</p>
                <h2 className="font-heading mt-2 text-lg font-bold text-navy">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{item.summary}</p>
                {item.file?.url ? (
                  <a href={item.file.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm font-semibold text-gold">
                    Open file
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        ) : loading ? null : (
          <p className="text-sm text-muted">No resources yet. Files published from the admin dashboard appear here.</p>
        )}
        {pages?.length ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((item) => (
              <Link key={item.to} to={item.to} className="rounded-2xl border border-navy/10 bg-white p-5 text-sm font-semibold text-navy hover:border-gold">
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function GalleryHub() {
  const { rows, loading, error, retry } = usePublicGallery();
  return (
    <div>
      <PageHero eyebrow="Projects & Impact" title="Gallery" text="Photos from HIACDI programmes and community work." />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {error ? (
          <p className="mb-4 text-sm font-semibold text-red-700">
            {error}{" "}
            <button type="button" className="underline" onClick={retry}>
              Retry
            </button>
          </p>
        ) : null}
        {loading ? <p className="text-sm text-muted">Loading gallery…</p> : null}
        {rows.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((item) => (
              <figure key={item._id} className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
                {item.image?.url ? <img src={item.image.url} alt={item.title} className="h-56 w-full object-cover" /> : null}
                <figcaption className="p-4">
                  <p className="font-heading font-bold text-navy">{item.title}</p>
                  {item.caption ? <p className="mt-1 text-sm text-muted">{item.caption}</p> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : loading ? null : (
          <p className="text-sm text-muted">No gallery photos yet. Uploads from the admin dashboard appear here.</p>
        )}
      </section>
    </div>
  );
}

export function HubArticle({ hub }) {
  const { slug } = useParams();
  if (hub === "news") return <NewsArticle slug={slug} />;
  if (hub === "projects" && slug === "gallery") return <GalleryHub />;
  const pages = trees[hub] || [];
  const page = pages.find((item) => item.slug === slug);
  if (!page) return <Navigate to={`/${hub}`} replace />;
  if (page.to && page.to !== `/${hub}/${slug}`) return <Navigate to={page.to} replace />;
  return <ContentPage eyebrow={hub.replace("-", " ")} title={page.title} text={page.text} body={page.body} />;
}

function NewsArticle({ slug }) {
  const { post, loading } = usePublicPost(slug);
  if (loading) return <div className="px-4 py-24 text-center text-sm text-muted">Loading article…</div>;
  if (post) {
    return (
      <div>
        <PageHero eyebrow={post.category || "News"} title={post.title} text={post.summary} />
        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          {post.image?.url ? <img src={post.image.url} alt="" className="mb-6 w-full rounded-2xl object-cover" /> : null}
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted sm:text-base">{post.body}</p>
          <Link to="/news" className="mt-8 inline-flex text-sm font-semibold text-gold">
            ← News & Events
          </Link>
        </section>
      </div>
    );
  }
  const page = newsPages.find((item) => item.slug === slug);
  if (!page) return <Navigate to="/news" replace />;
  return <ContentPage eyebrow="news" title={page.title} text={page.text} body={page.body} />;
}
