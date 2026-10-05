import mongoose from "mongoose";

const fileSchema = {
  url: { type: String, default: "" },
  publicId: { type: String, default: "" },
  resourceType: { type: String, default: "" },
};

const certificateSchema = new mongoose.Schema(
  {
    certificateNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
    studentName: { type: String, required: true, trim: true },
    studentEmail: { type: String, required: true, lowercase: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    courseCode: { type: String, required: true, uppercase: true, trim: true },
    issueDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "revoked"], default: "active" },
    studentPhoto: fileSchema,
    certificateFile: fileSchema,
    issuedBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

export default mongoose.model("Certificate", certificateSchema);
