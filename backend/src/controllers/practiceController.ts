import { Quiz, PracticeQuestion, PracticeAttempt } from "../models/Practice";
import { Chapter } from "../models/Chapter";
import { User } from "../models/User";
import { Role, type ApiResponse } from "../types";

async function teacherOf(studentId: string): Promise<string | null> {
  const student = await User.findById(studentId).select("role createdBy");
  if (!student) return null;
  if (student.role === Role.ADMIN) return student._id.toString();
  return student.createdBy ? student.createdBy.toString() : null;
}

export class PracticeController {
  // ═══ ADMIN: QUIZ CRUD ════════════════════════════════════

  // Admin: Ambil semua quiz miliknya
  static async getQuizzesAdmin(adminId: string, chapterId?: string): Promise<ApiResponse> {
    const filter: Record<string, unknown> = { createdBy: adminId };
    if (chapterId) filter.chapterId = chapterId;

    const quizzes = await Quiz.find(filter)
      .populate("chapterId", "title order slug")
      .sort({ createdAt: -1 });

    // Hitung jumlah soal per quiz
    const quizIds = quizzes.map((q) => q._id);
    const counts = await PracticeQuestion.aggregate([
      { $match: { quizId: { $in: quizIds } } },
      { $group: { _id: "$quizId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const data = quizzes.map((q) => ({
      ...q.toJSON(),
      questionCount: countMap.get(q._id.toString()) || 0,
    }));

    return { success: true, message: "Daftar quiz berhasil diambil", data };
  }

  // Admin: Buat quiz baru
  static async createQuiz(adminId: string, body: {
    chapterId: string;
    title: string;
    description?: string;
    isPublished?: boolean;
  }): Promise<ApiResponse> {
    const chapter = await Chapter.findOne({ _id: body.chapterId, createdBy: adminId });
    if (!chapter) return { success: false, message: "Bab tidak ditemukan" };

    const quiz = await Quiz.create({ ...body, createdBy: adminId });
    const populated = await quiz.populate("chapterId", "title order slug");
    return { success: true, message: "Quiz berhasil dibuat", data: populated };
  }

  // Admin: Update quiz
  static async updateQuiz(adminId: string, id: string, body: any): Promise<ApiResponse> {
    const quiz = await Quiz.findOneAndUpdate({ _id: id, createdBy: adminId }, body, { new: true }).populate(
      "chapterId",
      "title order slug"
    );
    if (!quiz) return { success: false, message: "Quiz tidak ditemukan" };
    return { success: true, message: "Quiz berhasil diupdate", data: quiz };
  }

  // Admin: Hapus quiz (beserta soal-soalnya)
  static async deleteQuiz(adminId: string, id: string): Promise<ApiResponse> {
    const quiz = await Quiz.findOneAndDelete({ _id: id, createdBy: adminId });
    if (!quiz) return { success: false, message: "Quiz tidak ditemukan" };
    await PracticeQuestion.deleteMany({ quizId: id });
    return { success: true, message: "Quiz dan semua soalnya berhasil dihapus" };
  }

  // ═══ ADMIN: SOAL DALAM QUIZ ══════════════════════════════

  // Admin: Ambil soal dalam quiz tertentu
  static async getQuestionsByQuiz(adminId: string, quizId: string): Promise<ApiResponse> {
    const quiz = await Quiz.findOne({ _id: quizId, createdBy: adminId }).populate("chapterId", "title order slug");
    if (!quiz) return { success: false, message: "Quiz tidak ditemukan" };

    const questions = await PracticeQuestion.find({ quizId }).sort({ order: 1 });

    return {
      success: true,
      message: "Daftar soal berhasil diambil",
      data: { quiz, questions },
    };
  }

  // Admin: Tambah soal ke quiz
  static async createQuestion(adminId: string, body: {
    quizId: string;
    questionText: string;
    options: { key: string; text: string }[];
    correctAnswer: string;
    explanation?: string;
    order?: number;
  }): Promise<ApiResponse> {
    const quiz = await Quiz.findOne({ _id: body.quizId, createdBy: adminId });
    if (!quiz) return { success: false, message: "Quiz tidak ditemukan" };

    const question = await PracticeQuestion.create({
      ...body,
      correctAnswer: body.correctAnswer.toUpperCase(),
      options: body.options.map((o) => ({
        key: o.key.toUpperCase(),
        text: o.text,
      })),
    });
    return { success: true, message: "Soal berhasil ditambahkan", data: question };
  }

  // Admin: Update soal (cek quiz miliknya)
  static async updateQuestion(adminId: string, id: string, body: any): Promise<ApiResponse> {
    const existing = await PracticeQuestion.findById(id);
    if (!existing) return { success: false, message: "Soal tidak ditemukan" };

    const quiz = await Quiz.findOne({ _id: existing.quizId, createdBy: adminId });
    if (!quiz) return { success: false, message: "Quiz tidak ditemukan" };

    if (body.correctAnswer) body.correctAnswer = body.correctAnswer.toUpperCase();
    if (body.options) {
      body.options = body.options.map((o: any) => ({
        key: o.key.toUpperCase(),
        text: o.text,
      }));
    }

    const question = await PracticeQuestion.findByIdAndUpdate(id, body, { new: true });
    if (!question) return { success: false, message: "Soal tidak ditemukan" };
    return { success: true, message: "Soal berhasil diupdate", data: question };
  }

  // Admin: Hapus soal (cek quiz miliknya)
  static async deleteQuestion(adminId: string, id: string): Promise<ApiResponse> {
    const existing = await PracticeQuestion.findById(id);
    if (!existing) return { success: false, message: "Soal tidak ditemukan" };

    const quiz = await Quiz.findOne({ _id: existing.quizId, createdBy: adminId });
    if (!quiz) return { success: false, message: "Quiz tidak ditemukan" };

    await PracticeQuestion.findByIdAndDelete(id);
    return { success: true, message: "Soal berhasil dihapus" };
  }

  // ═══ SISWA ═══════════════════════════════════════════════

  // Siswa: Ambil quiz yang published per bab (milik gurunya)
  static async getQuizzesForStudent(studentId: string, slug: string): Promise<ApiResponse> {
    const tenantId = await teacherOf(studentId);
    if (!tenantId) return { success: false, message: "Bab tidak ditemukan" };

    const chapter = await Chapter.findOne({ slug, createdBy: tenantId });
    if (!chapter) return { success: false, message: "Bab tidak ditemukan" };

    const quizzes = await Quiz.find({
      chapterId: chapter._id,
      isPublished: true,
      createdBy: tenantId,
    }).sort({ createdAt: 1 });

    const quizIds = quizzes.map((q) => q._id);
    const counts = await PracticeQuestion.aggregate([
      { $match: { quizId: { $in: quizIds } } },
      { $group: { _id: "$quizId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const data = quizzes.map((q) => ({
      ...q.toJSON(),
      questionCount: countMap.get(q._id.toString()) || 0,
    }));

    return {
      success: true,
      message: "Daftar quiz berhasil diambil",
      data: { chapter: chapter.toJSON(), quizzes: data },
    };
  }

  // Siswa: Ambil soal quiz + riwayat milik sendiri
  static async getQuizWithHistory(studentId: string, quizId: string): Promise<ApiResponse> {
    const tenantId = await teacherOf(studentId);
    if (!tenantId) return { success: false, message: "Quiz tidak ditemukan" };

    const quiz = await Quiz.findOne({ _id: quizId, createdBy: tenantId }).populate(
      "chapterId",
      "title order slug"
    );
    if (!quiz) return { success: false, message: "Quiz tidak ditemukan" };
    if (!quiz.isPublished) return { success: false, message: "Quiz belum dipublish" };

    const questions = await PracticeQuestion.find({ quizId })
      .select("-correctAnswer -explanation")
      .sort({ order: 1 });

    const attempts = await PracticeAttempt.find({
      studentId,
      quizId,
    }).sort({ submittedAt: -1 });

    return {
      success: true,
      message: "Soal quiz berhasil diambil",
      data: {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          chapterId: quiz.chapterId,
        },
        questions,
        attempts: attempts.map((a) => ({
          _id: a._id,
          score: a.score,
          correctCount: a.correctCount,
          totalQuestions: a.totalQuestions,
          submittedAt: a.submittedAt,
        })),
      },
    };
  }

  // Siswa: Submit jawaban — nilai dihitung 100% di backend
  static async submitAttempt(
    studentId: string,
    quizId: string,
    body: { answers: { questionId: string; selectedOption: "A" | "B" | "C" | "D" }[] }
  ): Promise<ApiResponse> {
    const tenantId = await teacherOf(studentId);
    if (!tenantId) return { success: false, message: "Quiz tidak ditemukan" };

    const quiz = await Quiz.findOne({ _id: quizId, createdBy: tenantId });
    if (!quiz) return { success: false, message: "Quiz tidak ditemukan" };
    if (!quiz.isPublished) return { success: false, message: "Quiz belum dipublish" };

    const now = new Date();
    if (quiz.startTime && now < quiz.startTime)
      return { success: false, message: "Quiz belum dibuka" };
    if (quiz.endTime && now > quiz.endTime)
      return { success: false, message: "Tenggat waktu quiz telah berakhir" };

    const questions = await PracticeQuestion.find({ quizId });
    if (questions.length === 0) {
      return { success: false, message: "Belum ada soal untuk quiz ini" };
    }

    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let correctCount = 0;
    const evaluatedAnswers = body.answers.map((ans) => {
      const q = questionMap.get(ans.questionId);
      const isCorrect = q ? q.correctAnswer === ans.selectedOption : false;
      if (isCorrect) correctCount++;
      return {
        questionId: ans.questionId as any,
        selectedOption: ans.selectedOption,
        isCorrect,
      };
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    const attempt = await PracticeAttempt.create({
      studentId,
      quizId,
      chapterId: quiz.chapterId,
      answers: evaluatedAnswers,
      totalQuestions,
      correctCount,
      score,
    });

    const review = questions.map((q) => {
      const studentAns = body.answers.find((a) => a.questionId === q._id.toString());
      return {
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        selectedOption: studentAns?.selectedOption || null,
        isCorrect: studentAns?.selectedOption === q.correctAnswer,
        explanation: q.explanation,
      };
    });

    return {
      success: true,
      message: "Latihan berhasil dinilai",
      data: { score, correctCount, totalQuestions, review, attemptId: attempt._id },
    };
  }
}
