import mongoose from "mongoose";

const fileSchema = {
  url: { type: String, default: "" },
  publicId: { type: String, default: "" },
  resourceType: { type: String, default: "" },
};

const buttonSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    url: { type: String, default: "" },
    style: { type: String, default: "primary" },
    openInNewTab: { type: Boolean, default: false },
  },
  { _id: false }
);

export const SiteSettings = mongoose.models.SiteSettings || mongoose.model(
  "SiteSettings",
  new mongoose.Schema(
    {
      organizationName: { type: String, default: "Humanity, Inclusion and Advancement Community Development Initiative" },
      shortName: { type: String, default: "HIACDI" },
      tagline: { type: String, default: "" },
      logo: fileSchema,
      favicon: fileSchema,
      primaryColor: { type: String, default: "#0A2E6D" },
      accentColor: { type: String, default: "#D4AF37" },
      contact: {
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        address: { type: String, default: "" },
        mapEmbedUrl: { type: String, default: "" },
        officeHours: { type: String, default: "" },
      },
      social: {
        facebook: { type: String, default: "" },
        x: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        youtube: { type: String, default: "" },
        tiktok: { type: String, default: "" },
      },
      footerText: { type: String, default: "" },
      copyright: { type: String, default: "" },
      educationSiteUrl: { type: String, default: "https://hiacdi.org/" },
      certificatePrefix: { type: String, default: "HIA" },
      seo: {
        defaultTitle: { type: String, default: "" },
        defaultDescription: { type: String, default: "" },
        ogImage: fileSchema,
      },
      pageSeo: { type: mongoose.Schema.Types.Mixed, default: {} },
      announcementBar: {
        enabled: { type: Boolean, default: false },
        text: { type: String, default: "" },
        link: { type: String, default: "" },
      },
      fromSeed: { type: Boolean, default: true },
      updatedBy: { type: String, default: "" },
    },
    { timestamps: true }
  )
);

const common = {
  order: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
  status: { type: String, enum: ["draft", "published"], default: "published" },
  fromSeed: { type: Boolean, default: true },
  updatedBy: { type: String, default: "" },
  locked: { type: Boolean, default: false },
};

export const PageSection = mongoose.models.PageSection || mongoose.model(
  "PageSection",
  new mongoose.Schema(
    {
      page: { type: String, required: true, index: true },
      key: { type: String, required: true, index: true },
      title: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      body: { type: String, default: "" },
      image: fileSchema,
      buttons: [buttonSchema],
      extra: { type: mongoose.Schema.Types.Mixed, default: {} },
      ...common,
    },
    { timestamps: true }
  )
);

export const ImpactStat = mongoose.models.ImpactStat || mongoose.model(
  "ImpactStat",
  new mongoose.Schema({ label: String, value: String, suffix: { type: String, default: "" }, icon: { type: String, default: "" }, ...common }, { timestamps: true })
);

export const HeroSlide = mongoose.models.HeroSlide || mongoose.model(
  "HeroSlide",
  new mongoose.Schema(
    {
      heading: String,
      subheading: { type: String, default: "" },
      image: fileSchema,
      buttonLabel: { type: String, default: "" },
      buttonUrl: { type: String, default: "" },
      ...common,
    },
    { timestamps: true }
  )
);

export const TeamMember = mongoose.models.TeamMember || mongoose.model(
  "TeamMember",
  new mongoose.Schema({ name: String, role: String, bio: { type: String, default: "" }, photo: fileSchema, ...common }, { timestamps: true })
);

export const Partner = mongoose.models.Partner || mongoose.model(
  "Partner",
  new mongoose.Schema({ name: String, logo: fileSchema, website: { type: String, default: "" }, ...common }, { timestamps: true })
);

export const Testimonial = mongoose.models.Testimonial || mongoose.model(
  "Testimonial",
  new mongoose.Schema({ name: String, role: { type: String, default: "" }, quote: String, photo: fileSchema, ...common }, { timestamps: true })
);

export const FAQ = mongoose.models.FAQ || mongoose.model(
  "FAQ",
  new mongoose.Schema({ question: String, answer: String, category: { type: String, default: "general" }, ...common }, { timestamps: true })
);

export const NavItem = mongoose.models.NavItem || mongoose.model(
  "NavItem",
  new mongoose.Schema(
    {
      label: String,
      url: String,
      parent: { type: String, default: "" },
      openInNewTab: { type: Boolean, default: false },
      ...common,
    },
    { timestamps: true }
  )
);

export const ContentRevision = mongoose.models.ContentRevision || mongoose.model(
  "ContentRevision",
  new mongoose.Schema(
    {
      model: { type: String, required: true, index: true },
      documentId: { type: String, required: true, index: true },
      snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
      editedBy: { type: String, default: "" },
    },
    { timestamps: true }
  )
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model(
  "AuditLog",
  new mongoose.Schema(
    {
      admin: { type: String, default: "admin" },
      action: { type: String, required: true },
      entity: { type: String, required: true },
      entityId: { type: String, default: "" },
      summary: { type: String, default: "" },
    },
    { timestamps: true }
  )
);

export const CMS_MODELS = {
  settings: SiteSettings,
  sections: PageSection,
  stats: ImpactStat,
  slides: HeroSlide,
  team: TeamMember,
  partners: Partner,
  testimonials: Testimonial,
  faqs: FAQ,
  nav: NavItem,
  revisions: ContentRevision,
  audit: AuditLog,
};
