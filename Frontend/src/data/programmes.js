function slugify(title) {
  return String(title)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function item(title, extra = {}) {
  return {
    title,
    slug: extra.slug || slugify(title),
    summary:
      extra.summary ||
      `${title} is delivered with communities, partners, and local leaders. This page will be updated with programme detail.`,
    content:
      extra.content ||
      `HIACDI works on ${title} through awareness, training, referrals, and community-led action. Activities are designed with local people and measured against clear outcomes.`,
    issuesCertificates: Boolean(extra.issuesCertificates),
    educationSite: Boolean(extra.educationSite),
  };
}

export const CERT_ISSUING_SLUGS = [
  "digital-literacy",
  "computer-skills",
  "vocational-and-technical-skills",
  "life-skills",
  "farmer-training",
  "digital-entrepreneurship",
];

export const programmeGroups = [
  {
    slug: "health-wellbeing",
    title: "Health & Wellbeing",
    summary: "Community health, nutrition, mental wellbeing, and prevention so families can live healthier lives.",
    items: [
      "Community Health",
      "Maternal & Child Health",
      "Nutrition",
      "Mental Health & Psychosocial Wellbeing",
      "HIV/AIDS Awareness",
      "Health Education & Prevention",
      "Community Health Outreach",
      "Health Referrals & Linkages",
      "Menstrual Health & Hygiene",
    ].map((title) => item(title)),
  },
  {
    slug: "protection-gender-inclusion",
    title: "Protection, Gender & Inclusion",
    summary: "Protection from harm, gender equality, disability inclusion, and safeguarding for every person.",
    items: [
      "Gender-Based Violence (GBV)",
      "Female Genital Mutilation (FGM)",
      "Child Protection",
      "Child Rights",
      "Child Marriage Prevention",
      "Women Empowerment",
      "Gender Equality",
      "Disability Inclusion",
      "Human Rights & Social Justice",
      "Safeguarding & Referral Services",
    ].map((title) => item(title)),
  },
  {
    slug: "education-youth-empowerment",
    title: "Education & Youth Empowerment",
    summary: "Learning, leadership, and skills for children and young people. Full education programmes live on the HIACDI Education site.",
    educationSite: true,
    items: [
      item("Education & Learning", { educationSite: true }),
      item("Girls' Education"),
      item("Literacy & Numeracy"),
      item("Youth Leadership"),
      item("Youth Mentorship"),
      item("Life Skills", { issuesCertificates: true }),
      item("Digital Literacy", { issuesCertificates: true }),
      item("Vocational & Technical Skills", { issuesCertificates: true }),
      item("Career Guidance"),
      item("Entrepreneurship & Innovation"),
      item("Sports/Arts & Talent Development"),
    ],
  },
  {
    slug: "wildlife-environment-climate",
    title: "Wildlife, Environment & Climate",
    summary: "Conservation, climate awareness, and community stewardship of land, water, and wildlife.",
    items: [
      "Wildlife Conservation",
      "Biodiversity Protection",
      "Environmental Conservation",
      "Tree Planting & Reforestation",
      "Climate Change Awareness",
      "Climate Adaptation",
      "Waste Management",
      "Environmental Education",
      "Habitat Restoration",
      "Community Conservation",
      "Climate Resilience",
    ].map((title) => item(title)),
  },
  {
    slug: "livelihoods-economic-empowerment",
    title: "Livelihoods & Economic Empowerment",
    summary: "Enterprise, savings, and decent work so households can earn and plan with dignity.",
    items: [
      "Entrepreneurship",
      "Small Business Development",
      "Financial Literacy",
      "Savings & Community Savings Groups",
      "Youth Employment",
      "Women Economic Empowerment",
      "Income-Generating Activities",
      "Market Access",
      "Business Mentorship",
      "Economic Inclusion",
    ].map((title) => item(title)),
  },
  {
    slug: "agriculture-food-security",
    title: "Agriculture, Food Security & Nutrition",
    summary: "Climate-smart farming, food security, and nutrition education for resilient households.",
    items: [
      item("Sustainable Agriculture"),
      item("Climate-Smart Agriculture"),
      item("Food Security"),
      item("Kitchen Gardens"),
      item("Poultry & Livestock"),
      item("Farmer Training", { issuesCertificates: true }),
      item("Agricultural Entrepreneurship"),
      item("Food & Nutrition Education"),
      item("Value Addition"),
      item("Market Linkages"),
    ],
  },
  {
    slug: "community-development",
    title: "Community Development",
    summary: "Mobilisation, local leadership, and initiatives that communities own and sustain.",
    items: [
      "Community Mobilization",
      "Community Capacity Building",
      "Community Leadership",
      "Local Development Initiatives",
      "Community Infrastructure",
      "Community Participation",
      "Social Cohesion",
      "Community Needs Assessments",
      "Support for Vulnerable Households",
    ].map((title) => item(title)),
  },
  {
    slug: "wash-healthy-communities",
    title: "WASH & Healthy Communities",
    summary: "Safe water, sanitation, and hygiene so schools and households stay healthy.",
    items: [
      "Water Access & Awareness",
      "Sanitation",
      "Hygiene Promotion",
      "Menstrual Hygiene",
      "School WASH",
      "Community Cleanliness",
      "Safe Water Practices",
      "Hygiene Education",
    ].map((title) => item(title)),
  },
  {
    slug: "peace-governance",
    title: "Peace, Governance & Civic Participation",
    summary: "Dialogue, civic education, and accountable local leadership.",
    items: [
      "Peacebuilding",
      "Conflict Prevention",
      "Community Dialogue",
      "Social Cohesion",
      "Civic Education",
      "Public Participation",
      "Youth Leadership",
      "Women's Leadership",
      "Community Governance",
      "Accountability & Transparency",
      "Conflict Resolution",
    ].map((title) => item(title)),
  },
  {
    slug: "advocacy-research",
    title: "Advocacy, Research & Community Awareness",
    summary: "Evidence, campaigns, and public education that inform policy and practice.",
    items: [
      "Community Awareness",
      "Advocacy Campaigns",
      "Community Research",
      "Needs Assessments",
      "Surveys & Data Collection",
      "Policy Advocacy",
      "Public Education",
      "Community Dialogues",
      "Documentation & Knowledge Sharing",
      "Evidence-Based Programming",
    ].map((title) => item(title)),
  },
  {
    slug: "emergency-humanitarian",
    title: "Emergency & Humanitarian Support",
    summary: "Preparedness, response, and support for households when disaster strikes.",
    items: [
      "Emergency Preparedness",
      "Disaster Response",
      "Community Resilience",
      "Humanitarian Assistance",
      "Vulnerable Household Support",
      "Emergency Awareness",
      "Referral & Coordination",
      "Disaster Risk Reduction",
    ].map((title) => item(title)),
  },
  {
    slug: "technology-digital-inclusion",
    title: "Technology & Digital Inclusion",
    summary: "Digital skills, access, and technology for education and community development. Full tech training lives on the Education site.",
    items: [
      item("Digital Literacy", { issuesCertificates: true }),
      item("Computer Skills", { issuesCertificates: true }),
      item("Digital Entrepreneurship", { issuesCertificates: true }),
      item("Technology for Education"),
      item("Digital Access"),
      item("Online Safety"),
      item("Digital Skills for Youth"),
      item("Technology for Community Development"),
    ],
  },
];

export const defaultCourses = [
  { name: "Digital Literacy", code: "DIGLIT" },
  { name: "Computer Skills", code: "COMSK" },
  { name: "Vocational & Technical Skills", code: "VOCTECH" },
  { name: "Life Skills", code: "LIFESK" },
  { name: "Farmer Training", code: "FARMTR" },
  { name: "Digital Entrepreneurship", code: "DIGENT" },
];

export function findGroup(slug) {
  return programmeGroups.find((group) => group.slug === slug) || null;
}

export function findItem(groupSlug, itemSlug) {
  const group = findGroup(groupSlug);
  if (!group) return null;
  const found = group.items.find((entry) => entry.slug === itemSlug);
  return found ? { group, item: found } : null;
}

export function programmesForSeed() {
  const rows = [];
  programmeGroups.forEach((group, groupIndex) => {
    rows.push({
      group: group.title,
      groupSlug: group.slug,
      title: group.title,
      slug: group.slug,
      summary: group.summary,
      content: group.summary,
      order: groupIndex * 100,
      issuesCertificates: false,
      isGroup: true,
      educationSite: Boolean(group.educationSite),
    });
    group.items.forEach((entry, itemIndex) => {
      rows.push({
        group: group.title,
        groupSlug: group.slug,
        title: entry.title,
        slug: entry.slug,
        summary: entry.summary,
        content: entry.content,
        order: groupIndex * 100 + itemIndex + 1,
        issuesCertificates: Boolean(entry.issuesCertificates),
        isGroup: false,
        educationSite: Boolean(entry.educationSite),
      });
    });
  });
  return rows;
}
