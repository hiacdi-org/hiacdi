import { Navigate, useParams } from "react-router-dom";
import ContentPage from "./ContentPage";
import { aboutPages, involvedPages, newsPages, projectPages, resourcePages } from "../data/cboPages";

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

export function HubArticle({ hub }) {
  const { slug } = useParams();
  const pages = trees[hub] || [];
  const page = pages.find((item) => item.slug === slug);
  if (!page) return <Navigate to={`/${hub}`} replace />;
  if (page.to && page.to !== `/${hub}/${slug}`) return <Navigate to={page.to} replace />;
  return <ContentPage eyebrow={hub.replace("-", " ")} title={page.title} text={page.text} body={page.body} />;
}
