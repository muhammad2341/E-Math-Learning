import mongoose, { Schema, Document, Types } from "mongoose";
import { EvaluationStatus } from "../types";

export interface IExamDocument extends Document {
  chapterId: Types.ObjectId;
  title: string;
  description: string;
  startTime?: Date;
  endTime?: Date;
  durationMinutes?: number;
  isPublished: boolean;
  createdBy?: Types.ObjectId;
}

const examSchema = new Schema<IExamDocument>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    startTime: { type: Date },
    endTime: { type: Date },
    durationMinutes: { type: Number },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export const Exam = mongoose.model<IExamDocument>("Exam", examSchema);

export interface IEvaluationQuestionDocument extends Document {
  examId: Types.ObjectId;
  questionType: "multiple_choice" | "fill_in_blank";
  questionText: string;
  options?: { key: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: string;
  points: number;
  order: number;
}

const evaluationQuestionSchema = new Schema<IEvaluationQuestionDocument>(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    questionType: { type: String, enum: ["multiple_choice", "fill_in_blank"], required: true },
    questionText: { type: String, required: true },
    options: [
      {
        _id: false,
        key: { type: String, enum: ["A", "B", "C", "D"] },
        text: { type: String },
      },
    ],
    correctAnswer: { type: String, required: true },
    points: { type: Number, default: 10 },
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const EvaluationQuestion = mongoose.model<IEvaluationQuestionDocument>(
  "EvaluationQuestion",
  evaluationQuestionSchema
);

export interface IEvaluationAnswer {
  questionId: Types.ObjectId;
  answerText: string;
  autoScore: number;
  manualScore?: number;
  feedback?: string;
  isCorrect?: boolean;
}

export interface IEvaluationSubmissionDocument extends Document {
  studentId: Types.ObjectId;
  examId: Types.ObjectId;
  chapterId: Types.ObjectId;
  status: EvaluationStatus;
  answers: IEvaluationAnswer[];
  autoCalculatedScore: number;
  finalScore: number;
  isReleased: boolean;
  verifierId?: Types.ObjectId;
  verifiedAt?: Date;
  verificationNotes?: string;
  submittedAt: Date;
}

const evaluationSubmissionSchema = new Schema<IEvaluationSubmissionDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    status: {
      type: String,
      enum: Object.values(EvaluationStatus),
      default: EvaluationStatus.PENDING_REVIEW,
    },
    answers: [
      {
        _id: false,
        questionId: { type: Schema.Types.ObjectId, ref: "EvaluationQuestion" },
        answerText: { type: String, default: "" },
        autoScore: { type: Number, default: 0 },
        manualScore: { type: Number },
        feedback: { type: String, default: "" },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    autoCalculatedScore: { type: Number, default: 0 },
    finalScore: { type: Number, default: 0 },
    isReleased: { type: Boolean, default: false },
    verifierId: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    verificationNotes: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique index: satu siswa hanya bisa punya satu submission per ujian
evaluationSubmissionSchema.index({ studentId: 1, examId: 1 }, { unique: true });

export const EvaluationSubmission = mongoose.model<IEvaluationSubmissionDocument>(
  "EvaluationSubmission",
  evaluationSubmissionSchema
);
