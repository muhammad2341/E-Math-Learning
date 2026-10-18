import mongoose, { Schema, Document } from "mongoose";

export interface IMaterialItem {
  _id?: mongoose.Types.ObjectId;
  title: string;
  type: "pdf" | "ppt" | "pptx";
  fileUrl: string;
  fileSize: string;
  isPublished: boolean;
  createdAt?: Date;
}

export interface IChapterDocument extends Document {
  order: number;
  title: string;
  slug: string;
  description: string;
  learningObjectives: string[];
  materials: IMaterialItem[];
  isPublished: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

const chapterSchema = new Schema<IChapterDocument>(
  {
    order: { type: Number, required: true, min: 1, max: 100 },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
    learningObjectives: [{ type: String }],
    materials: [
      {
        title: { type: String, required: true },
        type: { type: String, enum: ["pdf", "ppt", "pptx"], required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: String, default: "1 MB" },
        isPublished: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isPublished: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Unique per guru (tenant): order & slug hanya unik dalam satu akun admin
chapterSchema.index({ createdBy: 1, order: 1 }, { unique: true });
chapterSchema.index({ createdBy: 1, slug: 1 }, { unique: true });

export const Chapter = mongoose.model<IChapterDocument>("Chapter", chapterSchema);
