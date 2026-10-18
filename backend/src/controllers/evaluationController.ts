import { Exam, EvaluationQuestion, EvaluationSubmission } from "../models/Evaluation";
import { Chapter } from "../models/Chapter";
import { User } from "../models/User";
import { EvaluationStatus, Role, type ApiResponse } from "../types";

async function teacherOf(studentId: string): Promise<string | null> {
  const student = await User.findById(studentId).select("role createdBy");
  if (!student) return null;
  if (student.role === Role.ADMIN) return student._id.toString();
  return student.createdBy ? student.createdBy.toString() : null;
}

export class EvaluationController {
  // ═══ ADMIN: EXAM CRUD ════════════════════════════════════

  // Admin: Ambil semua ujian miliknya
  static async getExamsAdmin(adminId: string, chapterId?: string): Promise<ApiResponse> {
    const filter: Record<string, unknown> = { createdBy: adminId };
    if (chapterId) filter.chapterId = chapterId;

    const exams = await Exam.find(filter)
      .populate("chapterId", "title order slug")
      .sort({ createdAt: -1 });

    const examIds = exams.map((e) => e._id);
    const [questionCounts, submissionCounts] = await Promise.all([
      EvaluationQuestion.aggregate([
        { $match: { examId: { $in: examIds } } },
        { $group: { _id: "$examId", count: { $sum: 1 } } },
      ]),
      EvaluationSubmission.aggregate([
        { $match: { examId: { $in: examIds } } },
        { $group: { _id: "$examId", count: { $sum: 1 } } },
      ]),
    ]);

    const qCountMap = new Map(questionCounts.map((c) => [c._id.toString(), c.count]));
    const sCountMap = new Map(submissionCounts.map((c) => [c._id.toString(), c.count]));

    const data = exams.map((e) => ({
      ...e.toJSON(),
      questionCount: qCountMap.get(e._id.toString()) || 0,
      submissionCount: sCountMap.get(e._id.toString()) || 0,
    }));

    return { success: true, message: "Daftar ujian berhasil diambil", data };
  }

  // Admin: Buat ujian baru
  static async createExam(adminId: string, body: {
    chapterId: string;
    title: string;
    description?: string;
    isPublished?: boolean;
  }): Promise<ApiResponse> {
    const chapter = await Chapter.findOne({ _id: body.chapterId, createdBy: adminId });
    if (!chapter) return { success: false, message: "Bab tidak ditemukan" };

    const exam = await Exam.create({ ...body, createdBy: adminId });
    const populated = await exam.populate("chapterId", "title order slug");
    return { success: true, message: "Ujian berhasil dibuat", data: populated };
  }

  // Admin: Update ujian
  static async updateExam(adminId: string, id: string, body: any): Promise<ApiResponse> {
    const exam = await Exam.findOneAndUpdate({ _id: id, createdBy: adminId }, body, { new: true }).populate(
      "chapterId",
      "title order slug"
    );
    if (!exam) return { success: false, message: "Ujian tidak ditemukan" };
    return { success: true, message: "Ujian berhasil diupdate", data: exam };
  }

  // Admin: Hapus ujian (beserta soal & submission)
  static async deleteExam(adminId: string, id: string): Promise<ApiResponse> {
    const exam = await Exam.findOneAndDelete({ _id: id, createdBy: adminId });
    if (!exam) return { success: false, message: "Ujian tidak ditemukan" };
    await Promise.all([
      EvaluationQuestion.deleteMany({ examId: id }),
      EvaluationSubmission.deleteMany({ examId: id }),
    ]);
    return { success: true, message: "Ujian beserta data terkait berhasil dihapus" };
  }

  // ═══ ADMIN: SOAL DALAM UJIAN ═════════════════════════════

  // Admin: Ambil soal dalam ujian + ringkasan submission
  static async getExamDetail(adminId: string, examId: string): Promise<ApiResponse> {
    const exam = await Exam.findOne({ _id: examId, createdBy: adminId }).populate("chapterId", "title order slug");
    if (!exam) return { success: false, message: "Ujian tidak ditemukan" };

    const questions = await EvaluationQuestion.find({ examId }).sort({ order: 1 });
    const submissionCount = await EvaluationSubmission.countDocuments({ examId });

    return {
      success: true,
      message: "Detail ujian berhasil diambil",
      data: {
        exam: { ...exam.toJSON(), questionCount: questions.length, submissionCount },
        questions,
      },
    };
  }

  // Admin: Ambil submissions untuk ujian tertentu
  static async getSubmissionsByExam(adminId: string, examId: string): Promise<ApiResponse> {
    const exam = await Exam.findOne({ _id: examId, createdBy: adminId }).populate("chapterId", "title order slug");
    if (!exam) return { success: false, message: "Ujian tidak ditemukan" };

    const submissions = await EvaluationSubmission.find({ examId })
      .populate("studentId", "name username nrp school classGroup")
      .populate("verifierId", "name username")
      .sort({ submittedAt: -1 });

    return {
      success: true,
      message: "Daftar submission berhasil diambil",
      data: { exam: exam.toJSON(), submissions },
    };
  }

  // Admin: Ambil detail 1 submission (untuk review per siswa)
  static async getSubmissionDetail(adminId: string, submissionId: string): Promise<ApiResponse> {
    const submission = await EvaluationSubmission.findById(submissionId)
      .populate("studentId", "name username nrp school classGroup")
      .populate("examId", "title description createdBy")
      .populate("chapterId", "title order")
      .populate("verifierId", "name username")
      .populate({
        path: "answers.questionId",
        select: "questionText questionType options correctAnswer points order",
      });

    if (!submission) return { success: false, message: "Submission tidak ditemukan" };

    const exam = submission.examId as unknown as { createdBy?: unknown };
    if (!exam?.createdBy || exam.createdBy.toString() !== adminId) {
      return { success: false, message: "Submission tidak ditemukan" };
    }

    return { success: true, message: "Detail submission berhasil diambil", data: submission };
  }

  // Admin: Tambah soal ke ujian
  static async createQuestion(adminId: string, body: any): Promise<ApiResponse> {
    const exam = await Exam.findOne({ _id: body.examId, createdBy: adminId });
    if (!exam) return { success: false, message: "Ujian tidak ditemukan" };

    if (body.correctAnswer && body.questionType === "multiple_choice") {
      body.correctAnswer = body.correctAnswer.toUpperCase();
    }
    if (body.options) {
      body.options = body.options.map((o: any) => ({
        key: o.key.toUpperCase(),
        text: o.text,
      }));
    }
    const question = await EvaluationQuestion.create(body);
    return { success: true, message: "Soal berhasil ditambahkan", data: question };
  }

  // Admin: Update soal (cek exam miliknya)
  static async updateQuestion(adminId: string, id: string, body: any): Promise<ApiResponse> {
    const existing = await EvaluationQuestion.findById(id);
    if (!existing) return { success: false, message: "Soal tidak ditemukan" };

    const exam = await Exam.findOne({ _id: existing.examId, createdBy: adminId });
    if (!exam) return { success: false, message: "Ujian tidak ditemukan" };

    if (body.correctAnswer && body.questionType === "multiple_choice") {
      body.correctAnswer = body.correctAnswer.toUpperCase();
    }
    if (body.options) {
      body.options = body.options.map((o: any) => ({
        key: o.key.toUpperCase(),
        text: o.text,
      }));
    }
    const question = await EvaluationQuestion.findByIdAndUpdate(id, body, { new: true });
    if (!question) return { success: false, message: "Soal tidak ditemukan" };
    return { success: true, message: "Soal berhasil diupdate", data: question };
  }

  // Admin: Hapus soal (cek exam miliknya)
  static async deleteQuestion(adminId: string, id: string): Promise<ApiResponse> {
    const existing = await EvaluationQuestion.findById(id);
    if (!existing) return { success: false, message: "Soal tidak ditemukan" };

    const exam = await Exam.findOne({ _id: existing.examId, createdBy: adminId });
    if (!exam) return { success: false, message: "Ujian tidak ditemukan" };

    await EvaluationQuestion.findByIdAndDelete(id);
    return { success: true, message: "Soal berhasil dihapus" };
  }

  // ═══ SISWA ═══════════════════════════════════════════════

  // Siswa: Ambil daftar ujian published per bab (cek prasyarat)
  static async getExamsForStudent(studentId: string, chapterOrder: number): Promise<ApiResponse> {
    const tenantId = await teacherOf(studentId);
    if (!tenantId) return { success: false, message: "Bab tidak ditemukan" };

    // Enforce Chapter Prerequisite
    if (chapterOrder > 1) {
      const prevChapter = await Chapter.findOne({ order: chapterOrder - 1, createdBy: tenantId });
      if (prevChapter) {
        const prevSubmissions = await EvaluationSubmission.find({
          studentId,
          chapterId: prevChapter._id,
          status: { $in: [EvaluationStatus.VERIFIED, EvaluationStatus.RELEASED] },
        });

        const allReleased = prevSubmissions.length > 0 && prevSubmissions.every((s) => s.isReleased);
        if (!allReleased) {
          return {
            success: false,
            message: `Ujian terkunci! Anda harus menyelesaikan Bab ${chapterOrder - 1} ("${prevChapter.title}") terlebih dahulu.`,
            data: {
              locked: true,
              prerequisiteChapter: prevChapter.title,
              prerequisiteOrder: chapterOrder - 1,
            },
          };
        }
      }
    }

    const chapter = await Chapter.findOne({ order: chapterOrder, createdBy: tenantId });
    if (!chapter) return { success: false, message: "Bab tidak ditemukan" };

    const exams = await Exam.find({
      chapterId: chapter._id,
      isPublished: true,
      createdBy: tenantId,
    }).sort({ createdAt: 1 });

    const examIds = exams.map((e) => e._id);
    const [questionCounts, studentSubmissions] = await Promise.all([
      EvaluationQuestion.aggregate([
        { $match: { examId: { $in: examIds } } },
        { $group: { _id: "$examId", count: { $sum: 1 } } },
      ]),
      EvaluationSubmission.find({ studentId, examId: { $in: examIds } }),
    ]);

    const qCountMap = new Map(questionCounts.map((c) => [c._id.toString(), c.count]));
    const subMap = new Map(studentSubmissions.map((s) => [s.examId.toString(), s]));

    const data = exams.map((e) => {
      const sub = subMap.get(e._id.toString());
      return {
        ...e.toJSON(),
        questionCount: qCountMap.get(e._id.toString()) || 0,
        submission: sub
          ? {
              status: sub.status,
              isReleased: sub.isReleased,
              finalScore: sub.isReleased || sub.status === EvaluationStatus.VERIFIED ? sub.finalScore : null,
              submittedAt: sub.submittedAt,
            }
          : null,
      };
    });

    return {
      success: true,
      message: "Daftar ujian berhasil diambil",
      data: {
        chapter: chapter.toJSON(),
        exams: data,
        locked: false,
      },
    };
  }

  // Siswa: Ambil soal ujian untuk dikerjakan
  static async getExamForStudent(studentId: string, examId: string): Promise<ApiResponse> {
    const tenantId = await teacherOf(studentId);
    if (!tenantId) return { success: false, message: "Ujian tidak ditemukan" };

    const exam = await Exam.findOne({ _id: examId, createdBy: tenantId }).populate("chapterId", "title order slug");
    if (!exam) return { success: false, message: "Ujian tidak ditemukan" };
    if (!exam.isPublished) return { success: false, message: "Ujian belum dipublish" };

    const existingSubmission = await EvaluationSubmission.findOne({ studentId, examId });

    // Sembunyikan kunci jawaban dari siswa
    const questions = await EvaluationQuestion.find({ examId })
      .select("-correctAnswer")
      .sort({ order: 1 });

    const submissionInfo = existingSubmission
      ? {
          status: existingSubmission.status,
          isReleased: existingSubmission.isReleased,
          finalScore:
            existingSubmission.isReleased || existingSubmission.status === EvaluationStatus.VERIFIED
              ? existingSubmission.finalScore
              : null,
          submittedAt: existingSubmission.submittedAt,
          verificationNotes: existingSubmission.isReleased ? existingSubmission.verificationNotes : "",
        }
      : null;

    return {
      success: true,
      message: "Data ujian berhasil diambil",
      data: {
        exam: {
          _id: exam._id,
          title: exam.title,
          description: exam.description,
          chapterId: exam.chapterId,
        },
        questions,
        submission: submissionInfo,
      },
    };
  }

  // Siswa: Submit jawaban ujian
  static async submitEvaluation(
    studentId: string,
    examId: string,
    body: { answers: { questionId: string; answerText: string }[] }
  ): Promise<ApiResponse> {
    const tenantId = await teacherOf(studentId);
    if (!tenantId) return { success: false, message: "Ujian tidak ditemukan" };

    const exam = await Exam.findOne({ _id: examId, createdBy: tenantId });
    if (!exam) return { success: false, message: "Ujian tidak ditemukan" };
    if (!exam.isPublished) return { success: false, message: "Ujian belum dipublish" };

    const now = new Date();
    if (exam.startTime && now < exam.startTime)
      return { success: false, message: "Ujian belum dibuka" };
    if (exam.endTime && now > exam.endTime)
      return { success: false, message: "Tenggat waktu ujian telah berakhir" };

    // Cek apakah sudah pernah submit & status aktif
    const existing = await EvaluationSubmission.findOne({ studentId, examId });
    if (
      existing &&
      (existing.status === EvaluationStatus.PENDING_REVIEW ||
        existing.status === EvaluationStatus.SUBMITTED ||
        existing.status === EvaluationStatus.VERIFIED ||
        existing.status === EvaluationStatus.RELEASED)
    ) {
      return { success: false, message: "Anda sudah pernah mengirim ujian ini." };
    }

    const questions = await EvaluationQuestion.find({ examId });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let totalPoints = 0;
    let earnedPoints = 0;

    const evaluatedAnswers = body.answers.map((ans) => {
      const q = questionMap.get(ans.questionId);
      const points = q?.points || 10;
      totalPoints += points;

      let autoScore = 0;
      let isCorrect = false;
      if (q?.questionType === "multiple_choice") {
        if (q.correctAnswer.trim().toUpperCase() === ans.answerText.trim().toUpperCase()) {
          autoScore = points;
          earnedPoints += points;
          isCorrect = true;
        }
      }
      // fill_in_blank: autoScore = 0, dinilai manual oleh admin

      return {
        questionId: ans.questionId as any,
        answerText: ans.answerText,
        autoScore,
        isCorrect,
      };
    });

    const autoScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    const submission = await EvaluationSubmission.findOneAndUpdate(
      { studentId, examId },
      {
        chapterId: exam.chapterId,
        status: EvaluationStatus.PENDING_REVIEW,
        answers: evaluatedAnswers,
        autoCalculatedScore: autoScore,
        finalScore: autoScore,
        isReleased: false,
        submittedAt: new Date(),
        verifierId: undefined,
        verifiedAt: undefined,
        verificationNotes: "",
      },
      { upsert: true, new: true }
    );

    return {
      success: true,
      message: "Ujian berhasil dikirim dan sedang menunggu verifikasi Admin.",
      data: {
        status: submission.status,
        isReleased: false,
        submittedAt: submission.submittedAt,
      },
    };
  }

  // ═══ ADMIN: VERIFIKASI ═══════════════════════════════════

  // Admin: Verifikasi & rilis nilai
  static async verifyAndRelease(
    adminId: string,
    submissionId: string,
    body: {
      finalScore: number;
      verificationNotes?: string;
      status: EvaluationStatus;
      release: boolean;
      answerScores?: { questionId: string; manualScore?: number; feedback?: string }[];
    }
  ): Promise<ApiResponse> {
    const submission = await EvaluationSubmission.findById(submissionId).populate("examId", "createdBy");
    if (!submission) {
      return { success: false, message: "Pengajuan ujian tidak ditemukan" };
    }

    const ownedExam = submission.examId as unknown as { createdBy?: unknown };
    if (!ownedExam?.createdBy || ownedExam.createdBy.toString() !== adminId) {
      return { success: false, message: "Pengajuan ujian tidak ditemukan" };
    }

    if (submission.status === EvaluationStatus.RELEASED && !body.release) {
      return { success: false, message: "Ujian sudah dirilis, tidak bisa diubah kembali." };
    }

    if (body.answerScores && body.answerScores.length > 0) {
      for (const ansScore of body.answerScores) {
        const ans = submission.answers.find(
          (a) => a.questionId.toString() === ansScore.questionId
        );
        if (ans) {
          if (ansScore.manualScore !== undefined) ans.manualScore = ansScore.manualScore;
          if (ansScore.feedback !== undefined) ans.feedback = ansScore.feedback;
        }
      }
    }

    submission.finalScore = body.finalScore;
    submission.verificationNotes = body.verificationNotes || "";
    submission.status = body.status;
    submission.isReleased = body.release;
    submission.verifierId = adminId as any;
    submission.verifiedAt = new Date();

    await submission.save();

    return {
      success: true,
      message: body.release
        ? "Ujian berhasil diverifikasi dan hasil dirilis ke siswa."
        : "Ujian berhasil diverifikasi.",
      data: submission,
    };
  }
}
