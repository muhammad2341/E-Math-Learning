export interface User {
  _id: string;
  name: string;
  username: string;
  nrp?: string;
  email?: string;
  role: 'admin' | 'siswa';
  school?: string;
  age?: number;
  classGroup?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface MaterialItem {
  _id: string;
  title: string;
  type: 'pdf' | 'ppt' | 'pptx';
  fileUrl: string;
  fileSize: string;
  isPublished: boolean;
}

export interface Chapter {
  _id: string;
  order: number;
  title: string;
  slug: string;
  description: string;
  learningObjectives: string[];
  materials: MaterialItem[];
  isPublished: boolean;
}

export interface ChapterWithProgress extends Chapter {
  completedMaterialIds: string[];
  completedMaterialCount: number;
  totalMaterialCount: number;
}

export interface Quiz {
  _id: string;
  chapterId: { _id: string; title: string; order: number; slug: string } | string;
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  isPublished: boolean;
  questionCount?: number;
  createdAt?: string;
}

export interface PracticeQuestion {
  _id: string;
  questionText: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
}

export interface PracticeQuestionFull extends PracticeQuestion {
  quizId: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  order: number;
}

export interface PracticeAttemptMeta {
  _id: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  submittedAt: string;
}

export interface PracticeReviewItem {
  _id: string;
  questionText: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  selectedOption: string | null;
  isCorrect: boolean;
  explanation: string;
}

export interface PracticeResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  review: PracticeReviewItem[];
  attemptId: string;
}

export interface Exam {
  _id: string;
  chapterId: { _id: string; title: string; order: number; slug: string } | string;
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  isPublished: boolean;
  questionCount?: number;
  submissionCount?: number;
  createdAt?: string;
}

export interface EvaluationQuestion {
  _id: string;
  questionType: 'multiple_choice' | 'fill_in_blank';
  questionText: string;
  options?: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  points: number;
}

export interface EvaluationQuestionFull extends EvaluationQuestion {
  examId: string;
  correctAnswer: string;
  order: number;
}

export type EvaluationStatusType =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'PENDING_REVIEW'
  | 'REVISION_REQUIRED'
  | 'VERIFIED'
  | 'RELEASED';

export interface EvaluationSubmissionInfo {
  status: EvaluationStatusType;
  isReleased: boolean;
  finalScore: number | null;
  submittedAt: string;
  verificationNotes: string;
}

export interface EvaluationForStudent {
  chapter: Chapter;
  exams: (Exam & { submission: EvaluationSubmissionInfo | null })[];
  locked: boolean;
}

export interface ExamForStudent {
  exam: { _id: string; title: string; description: string };
  questions: EvaluationQuestion[];
  submission: EvaluationSubmissionInfo | null;
}

export interface EvaluationAnswer {
  questionId: string;
  answerText: string;
  autoScore: number;
  manualScore?: number;
  feedback?: string;
  isCorrect?: boolean;
}

export interface EvaluationSubmissionFull {
  _id: string;
  studentId: { _id: string; name: string; username: string; nrp?: string; school?: string; classGroup?: string };
  examId: { _id: string; title: string; description: string } | string;
  chapterId: { _id: string; title: string; order: number };
  status: EvaluationStatusType;
  answers: (EvaluationAnswer & { questionId: EvaluationQuestionFull | string })[];
  autoCalculatedScore: number;
  finalScore: number;
  isReleased: boolean;
  verifierId?: { _id: string; name: string; username: string } | string;
  verifiedAt?: string;
  verificationNotes: string;
  submittedAt: string;
}

export interface ExamSubmissionRow {
  _id: string;
  studentId: { _id: string; name: string; username: string; nrp?: string; school?: string; classGroup?: string };
  status: EvaluationStatusType;
  autoCalculatedScore: number;
  finalScore: number;
  isReleased: boolean;
  submittedAt: string;
  answerCount: number;
}

export interface Video {
  _id: string;
  chapterId: { _id: string; title: string; order: number } | string;
  title: string;
  description: string;
  videoUrl: string;
  order: number;
  isPublished: boolean;
}

export interface ChapterStat {
  chapterId: string;
  order: number;
  title: string;
  slug?: string;
  practiceScore: number | null;
  practiceAttempts?: number;
  evaluationScore: number | null;
  evaluationStatus: EvaluationStatusType;
  isEvaluationReleased?: boolean;
  completedMaterials: number;
  totalMaterials: number;
  isCompleted: boolean;
}

export interface StudentProgressData {
  student: User | null;
  overallProgress: number;
  avgPractice: number;
  avgEvaluation: number;
  completedChapters: number;
  totalChapters: number;
  chapters: ChapterStat[];
  practiceTimeline: { date: string; score: number; chapterId: string }[];
  recentEvaluations: {
    _id: string;
    chapterId: string;
    status: EvaluationStatusType;
    finalScore: number | null;
    isReleased: boolean;
    submittedAt: string;
    verifiedAt?: string;
  }[];
}

export interface AdminSummary {
  totalStudents: number;
  activeStudents: number;
  totalChapters: number;
  pendingEvaluations: number;
  avgPracticeScore: number;
  avgEvaluationScore: number;
  totalPracticeAttempts: number;
  totalEvalReleases: number;
  chapters: {
    chapterId: string;
    title: string;
    order: number;
    avgPractice: number;
    avgEvaluation: number;
    practiceSubmissions: number;
    evalSubmissions: number;
  }[];
}

export interface StudentProgressAdmin {
  student: User;
  overallProgress: number;
  avgPractice: number | null;
  completedChapters: number;
  totalChapters: number;
  chapters: {
    chapterId: string;
    title: string;
    order: number;
    practiceScore: number | null;
    practiceAttempts: number;
    evaluationStatus: EvaluationStatusType;
    evaluationScore: number | null;
    isReleased: boolean;
    completedMaterials: number;
    totalMaterials: number;
  }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
