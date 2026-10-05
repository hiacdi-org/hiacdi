export const defaultSettings = {
  organizationName: "Humanity, Inclusion and Advancement Community Development Initiative",
  shortName: "HIACDI",
  tagline: "Community development · Inclusion · Advancement",
  logo: { url: "/brand/logo-mark.png", publicId: "" },
  favicon: { url: "/brand/logo-mark.png", publicId: "" },
  primaryColor: "#0A2E6D",
  accentColor: "#D4AF37",
  contact: {
    email: "hiacditechhub@gmail.com",
    phone: "0741808582",
    whatsapp: "0741808582",
    address: "Kenya",
    mapEmbedUrl: "https://maps.google.com/maps?q=Kenya&t=&z=6&ie=UTF8&iwloc=&output=embed",
    officeHours: "Monday–Friday, 9:00–16:00 EAT",
  },
  social: { facebook: "", x: "", instagram: "", linkedin: "", youtube: "", tiktok: "" },
  footerText: "HIACDI works with communities on health, protection, education, livelihoods, environment, and digital inclusion.",
  copyright: "All rights reserved.",
  educationSiteUrl: "https://hiacdi.org/",
  certificatePrefix: "HIA",
  seo: {
    defaultTitle: "HIACDI | Humanity, Inclusion and Advancement",
    defaultDescription: "HIACDI is a community-based organisation working on humanity, inclusion, and advancement.",
    ogImage: { url: "/brand/logo-mark.png", publicId: "" },
  },
  announcementBar: {
    enabled: true,
    text: "HIACDI works with communities on health, protection, education, livelihoods, and climate. Get involved.",
    link: "/get-involved",
  },
};

export const defaultNav = [
  { label: "Home", url: "/", parent: "", order: 1 },
  { label: "About", url: "/about", parent: "", order: 2 },
  { label: "Our Programmes", url: "/programmes", parent: "", order: 3 },
  { label: "Projects & Impact", url: "/projects", parent: "", order: 4 },
  { label: "News & Events", url: "/news", parent: "", order: 5 },
  { label: "Resources", url: "/resources", parent: "", order: 6 },
  { label: "Get Involved", url: "/get-involved", parent: "", order: 7 },
  { label: "Contact", url: "/contact", parent: "", order: 8 },
  { label: "Verify Certificate", url: "/verify", parent: "", order: 9, locked: true },
];

export const defaultSections = [
  {
    page: "home",
    key: "hero",
    title: "Inclusive communities where every person can learn, grow, and live with dignity",
    subtitle: "HIACDI is a community-based organisation. We work with households, schools, youth, women, and local leaders on health, protection, education, livelihoods, environment, and digital inclusion.",
    body: "",
    buttons: [
      { label: "Our Programmes", url: "/programmes", style: "primary" },
      { label: "Verify a certificate", url: "/verify", style: "secondary" },
      { label: "Get involved", url: "/get-involved", style: "navy" },
    ],
    order: 1,
    locked: true,
  },
  {
    page: "home",
    key: "about-summary",
    title: "Our Vision and Mission",
    subtitle: "What we stand for",
    body: "",
    buttons: [
      { label: "About HIACDI", url: "/about", style: "primary" },
      { label: "Get involved", url: "/get-involved", style: "secondary" },
    ],
    extra: {
      vision: "To build inclusive, empowered, and sustainable communities where every individual has equal opportunities to learn, grow, participate, and achieve a better quality of life.",
      mission: "To empower individuals and communities through education, skills development, youth empowerment, health, sustainable agriculture, gender inclusion, environmental conservation, and community-driven initiatives that create lasting opportunities and improve lives.",
    },
    order: 2,
  },
  {
    page: "home",
    key: "programmes-overview",
    title: "Community work across twelve areas",
    subtitle: "Our Programmes",
    body: "<p>HIACDI programmes cover health, protection, education, environment, livelihoods, agriculture, WASH, peace, advocacy, emergencies, and digital inclusion.</p>",
    order: 3,
  },
  {
    page: "home",
    key: "impact",
    title: "Impact highlights",
    subtitle: "",
    body: "",
    order: 4,
  },
  {
    page: "home",
    key: "verify",
    title: "Verify a certificate",
    subtitle: "Enter the certificate number printed on the document. We check it against certificates issued by HIACDI.",
    body: "",
    order: 5,
    locked: true,
  },
  {
    page: "home",
    key: "news-preview",
    title: "What is happening in the community",
    subtitle: "News & Events",
    body: "<p>Field updates, workshops, and campaigns. Open the news section for the full calendar.</p>",
    buttons: [{ label: "News & Events", url: "/news", style: "gold" }],
    order: 6,
  },
  {
    page: "home",
    key: "get-involved",
    title: "Get involved",
    subtitle: "",
    body: "<p>Volunteer, partner, donate, or train with HIACDI. Communities move when people take part.</p>",
    buttons: [
      { label: "Ways to take part", url: "/get-involved", style: "primary" },
      { label: "Contact", url: "/contact", style: "secondary" },
    ],
    order: 7,
  },
  {
    page: "home",
    key: "partners",
    title: "Where Our Graduates Work",
    subtitle: "",
    body: "",
    order: 8,
  },
  {
    page: "home",
    key: "testimonials",
    title: "Our Testimonials",
    subtitle: "",
    body: "",
    order: 9,
  },
  {
    page: "home",
    key: "features",
    title: "How we work",
    subtitle: "",
    body: "",
    order: 10,
  },
  {
    page: "home",
    key: "courses",
    title: "Six course parts",
    subtitle: "",
    body: "<p>Choose a path, then pick the program and learning mode that fits you.</p>",
    order: 11,
  },
  {
    page: "about",
    key: "who-we-are",
    title: "Who We Are",
    subtitle: "About HIACDI",
    body: "<p>HIACDI is a community-based organisation. We work with households, schools, youth, women, and local leaders so people can learn, stay safe, earn, and take part in community life.</p>",
    order: 1,
  },
  {
    page: "about",
    key: "mission",
    title: "Our Mission",
    subtitle: "",
    body: "<p>To empower individuals and communities through education, skills development, youth empowerment, health, sustainable agriculture, gender inclusion, environmental conservation, and community-driven initiatives that create lasting opportunities and improve lives.</p>",
    order: 2,
  },
  {
    page: "about",
    key: "vision",
    title: "Our Vision",
    subtitle: "",
    body: "<p>To build inclusive, empowered, and sustainable communities where every individual has equal opportunities to learn, grow, participate, and achieve a better quality of life.</p>",
    order: 3,
  },
  {
    page: "about",
    key: "core-values",
    title: "Core Values",
    subtitle: "",
    body: "<p>Humanity, inclusion, advancement, accountability, and community ownership.</p>",
    order: 4,
  },
  {
    page: "about",
    key: "our-approach",
    title: "Our Approach",
    subtitle: "",
    body: "<p>We design work with local people, measure clear outcomes, and partner with schools, clinics, and community leaders.</p>",
    order: 5,
  },
  {
    page: "about",
    key: "governance",
    title: "Governance & Accountability",
    subtitle: "",
    body: "<p>HIACDI is accountable to the communities we serve. Policies and safeguarding standards guide every programme.</p>",
    order: 6,
  },
  {
    page: "about",
    key: "where-we-work",
    title: "Where We Work",
    subtitle: "",
    body: "<p>HIACDI is based in Kenya and works with communities across the country, with remote and in-person activities as programmes require.</p>",
    order: 7,
  },
  {
    page: "about",
    key: "policies",
    title: "Policies & Safeguarding",
    subtitle: "",
    body: "<p>Safeguarding, child protection, and inclusion policies are in place. Staff will publish the approved documents in Resources.</p>",
    order: 8,
  },
  {
    page: "contact",
    key: "intro",
    title: "Contact HIACDI",
    subtitle: "Get in touch",
    body: "<p>Questions about a programme, a partnership, or anything else? Send a message and the team will get back to you.</p>",
    order: 1,
  },
];

export const defaultStats = [
  { label: "Programme areas from health to digital inclusion", value: "12", suffix: "", order: 1 },
  { label: "Work designed with local people and partners", value: "Community-led", suffix: "", order: 2 },
  { label: "Training graduates receive a HIACDI certificate", value: "Verifiable", suffix: "", order: 3 },
];

export const defaultSlides = [
  {
    heading: "Inclusive communities where every person can learn, grow, and live with dignity",
    subheading: "HIACDI is a community-based organisation working on health, protection, education, livelihoods, environment, and digital inclusion.",
    image: { url: "/home/hero-background.jpg", publicId: "" },
    buttonLabel: "Our Programmes",
    buttonUrl: "/programmes",
    order: 1,
  },
];

export const defaultTeam = [
  { name: "Hassan I. Mohamed", role: "Founder & CEO", bio: "Hassan leads HIACDI and sets the direction for programmes, delivery, and partnerships.", photo: { url: "/about/founder-ceo.jpg", publicId: "" }, order: 1 },
  { name: "Iqra D. Hanshi", role: "Executive Director", bio: "Iqra directs institutional delivery from plan to field and keeps partners and internal work on schedule.", photo: { url: "/about/iqra-hanshi.jpg", publicId: "" }, order: 2 },
  { name: "Abdiaziz A. Ali", role: "Academic Director and Lead Organizer", bio: "Abdiaziz owns academic quality and organises programme delivery.", photo: { url: "/about/academic-director.png", publicId: "" }, order: 3 },
  { name: "Zakaria A. Khalif", role: "Technical Mentor", bio: "Zakaria coaches learners in the lab and in review sessions, keeping teaching close to practice.", photo: { url: "/about/zakaria-khalif.png", publicId: "" }, order: 4 },
];

export const defaultPartners = [
  { name: "Safaricom", logo: { url: "/partners/safaricom.svg", publicId: "" }, website: "", order: 1 },
  { name: "Google", logo: { url: "/partners/google.svg", publicId: "" }, website: "", order: 2 },
  { name: "Microsoft", logo: { url: "/partners/microsoft.svg", publicId: "" }, website: "", order: 3 },
  { name: "Airtel", logo: { url: "/partners/airtel.svg", publicId: "" }, website: "", order: 4 },
  { name: "Amazon", logo: { url: "/partners/amazon.svg", publicId: "" }, website: "", order: 5 },
];

export const defaultTestimonials = [
  {
    name: "HIACDI",
    role: "Learn. Build. Innovate.",
    quote: "HIACDI is built so people do not only attend a session. They practise, build, and leave with work they can show. That is the standard we hold for every programme.",
    photo: { url: "/brand/logo-mark.png", publicId: "" },
    order: 1,
  },
];

export const defaultFaqs = [
  { question: "What is HIACDI?", answer: "HIACDI — Humanity, Inclusion and Advancement Community Development Initiative — is a community-based organisation working with households, schools, youth, women, and local leaders.", category: "general", order: 1 },
  { question: "Do you award certificates?", answer: "Yes. Graduates of selected training programmes receive a verifiable HIACDI certificate. Enter the number on the Verify a certificate page.", category: "certificates", order: 2 },
  { question: "How do I verify a certificate?", answer: "Go to Verify a certificate and enter the number printed on the document, for example HIA-DIGLIT-A1B2C3.", category: "certificates", order: 3 },
  { question: "Where can I find the education programmes?", answer: "Visit the Education website at https://hiacdi.org/ for the full education platform. This site introduces education work and links out.", category: "education", order: 4 },
];
