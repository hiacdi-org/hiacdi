import mongoose from "mongoose";

const fileSchema = {
  url: { type: String, default: "" },
  publicId: { type: String, default: "" },
  resourceType: { type: String, default: "" },
};

export const Post = mongoose.model(
  "Post",
  new mongoose.Schema(
    {
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      category: { type: String, default: "news" },
      summary: { type: String, default: "" },
      body: { type: String, default: "" },
      image: fileSchema,
      published: { type: Boolean, default: true },
    },
    { timestamps: true }
  )
);
Post.schema.index({ published: 1, createdAt: -1 });
Post.schema.index({ slug: 1, published: 1 });

export const GalleryItem = mongoose.model(
  "GalleryItem",
  new mongoose.Schema(
    {
      title: { type: String, required: true },
      caption: { type: String, default: "" },
      image: fileSchema,
      order: { type: Number, default: 0 },
    },
    { timestamps: true }
  )
);

export const Resource = mongoose.model(
  "Resource",
  new mongoose.Schema(
    {
      title: { type: String, required: true },
      category: { type: String, default: "downloads" },
      summary: { type: String, default: "" },
      file: fileSchema,
    },
    { timestamps: true }
  )
);
