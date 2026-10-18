import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVideoDocument extends Document {
  chapterId: Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  order: number;
  isPublished: boolean;
  createdBy?: Types.ObjectId;
}

const videoSchema = new Schema<IVideoDocument>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: true },
    order: { type: Number, default: 1 },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export const Video = mongoose.model<IVideoDocument>("Video", videoSchema);
