import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICompletedMaterial {
  chapterId: Types.ObjectId;
  materialId: string;
  completedAt: Date;
}

export interface IStudentProgressDocument extends Document {
  studentId: Types.ObjectId;
  completedMaterials: ICompletedMaterial[];
  completedChapters: Types.ObjectId[];
}

const studentProgressSchema = new Schema<IStudentProgressDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    completedMaterials: [
      {
        _id: false,
        chapterId: { type: Schema.Types.ObjectId, ref: "Chapter" },
        materialId: { type: String, required: true },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    completedChapters: [{ type: Schema.Types.ObjectId, ref: "Chapter" }],
  },
  { timestamps: true }
);

export const StudentProgress = mongoose.model<IStudentProgressDocument>(
  "StudentProgress",
  studentProgressSchema
);
