import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuizDocument extends Document {
  chapterId: Types.ObjectId;
  title: string;
  description: string;
  startTime?: Date;
  endTime?: Date;
  durationMinutes?: number;
  isPublished: boolean;
  createdBy?: Types.ObjectId;
}

const quizSchema = new Schema<IQuizDocument>(
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

export const Quiz = mongoose.model<IQuizDocument>("Quiz", quizSchema);

export interface IPracticeQuestionDocument extends Document {
  quizId: Types.ObjectId;
  questionText: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  order: number;
}

const practiceQuestionSchema = new Schema<IPracticeQuestionDocument>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    questionText: { type: String, required: true },
    options: [
      {
        _id: false,
        key: { type: String, enum: ["A", "B", "C", "D"], required: true },
        text: { type: String, required: true },
      },
    ],
    correctAnswer: { type: String, enum: ["A", "B", "C", "D"], required: true },
    explanation: { type: String, default: "" },
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const PracticeQuestion = mongoose.model<IPracticeQuestionDocument>(
  "PracticeQuestion",
  practiceQuestionSchema
);

export interface IPracticeAttemptDocument extends Document {
  studentId: Types.ObjectId;
  quizId: Types.ObjectId;
  chapterId: Types.ObjectId;
  answers: {
    questionId: Types.ObjectId;
    selectedOption: "A" | "B" | "C" | "D";
    isCorrect: boolean;
  }[];
  totalQuestions: number;
  correctCount: number;
  score: number;
  submittedAt: Date;
}

const practiceAttemptSchema = new Schema<IPracticeAttemptDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    answers: [
      {
        _id: false,
        questionId: { type: Schema.Types.ObjectId, ref: "PracticeQuestion" },
        selectedOption: { type: String, enum: ["A", "B", "C", "D"] },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    score: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const PracticeAttempt = mongoose.model<IPracticeAttemptDocument>(
  "PracticeAttempt",
  practiceAttemptSchema
);
