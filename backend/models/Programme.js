import mongoose from "mongoose";

const programmeSchema = new mongoose.Schema(
  {
    group: { type: String, required: true },
    groupSlug: { type: String, required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    summary: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    order: { type: Number, default: 0 },
    issuesCertificates: { type: Boolean, default: false },
    isGroup: { type: Boolean, default: false },
    educationSite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

programmeSchema.index({ groupSlug: 1, slug: 1 }, { unique: true });

export default mongoose.model("Programme", programmeSchema);
