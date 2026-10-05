function page(label, slug, extra = {}) {
  return {
    label,
    slug,
    to: extra.to || `/${extra.hub}/${slug}`,
    title: extra.title || label,
    text:
      extra.text ||
      `${label} at HIACDI. This page will be updated with programme, policy, and field content.`,
    body:
      extra.body ||
      "HIACDI is a community-based organisation working on humanity, inclusion, and advancement. Placeholder copy is here so the site structure is complete; staff will replace it with approved content.",
  };
}

export const aboutPages = [
  page("Who We Are", "who-we-are", {
    hub: "about",
    text: "HIACDI — Humanity, Inclusion and Advancement Community Development Initiative.",
    body: "HIACDI is a community-based organisation. We work with households, schools, youth, women, and local leaders so people can learn, stay safe, earn, and take part in community life.",
  }),
  page("Our Mission", "mission", { hub: "about" }),
  page("Our Vision", "vision", { hub: "about" }),
  page("Core Values", "core-values", { hub: "about" }),
  page("Our Approach", "our-approach", { hub: "about" }),
  { label: "Leadership & Team", slug: "leadership", to: "/about", title: "Leadership & Team", text: "Meet the people who hold the HIACDI standard.", body: "" },
  page("Governance & Accountability", "governance", { hub: "about" }),
  page("Where We Work", "where-we-work", { hub: "about" }),
  page("Partners & Networks", "partners", { hub: "about" }),
  page("Policies & Safeguarding", "policies", { hub: "about" }),
  { label: "FAQs", slug: "faqs", to: "/about/faqs", title: "FAQs", text: "Answers about HIACDI programmes and services.", body: "" },
];

export const projectPages = [
  "Featured Projects",
  "Current Projects",
  "Completed Projects",
  "Community Impact",
  "Impact Stories",
  "Gallery",
  "Project Locations",
  "Partners",
  "Results",
  "Reports",
].map((label) => page(label, label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), { hub: "projects" }));

export const newsPages = [
  "News & Updates",
  "Community Activities",
  "Campaigns",
  "Workshops & Trainings",
  "Events Calendar",
  "Announcements",
  "Press/Media",
  "Field Updates",
].map((label) => page(label, label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), { hub: "news" }));

export const resourcePages = [
  "Reports",
  "Policies",
  "Guidelines",
  "Research & Publications",
  "Community Education Materials",
  "Training Materials",
  "Downloads",
  "FAQs",
].map((label) => page(label, label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), { hub: "resources" }));

export const involvedPages = [
  page("Volunteer", "volunteer", { hub: "get-involved" }),
  page("Partner with us", "partner", { hub: "get-involved" }),
  page("Donate", "donate", { hub: "get-involved" }),
  page("Careers", "careers", { hub: "get-involved", to: "/about/careers" }),
];

export const EDUCATION_SITE_URL = "https://hiacdi.org/";
