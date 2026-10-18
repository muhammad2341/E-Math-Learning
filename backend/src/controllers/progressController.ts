import { Chapter } from "../models/Chapter";
import { User } from "../models/User";
import { PracticeAttempt, Quiz } from "../models/Practice";
import { EvaluationSubmission, Exam } from "../models/Evaluation";
import { StudentProgress } from "../models/Progress";
import { Role, EvaluationStatus, type ApiResponse } from "../types";

async function teacherOf(studentId: string): Promise<string | null> {
  const student = await User.findById(studentId).select("role createdBy");
  if (!student) return null;
  if (student.role === Role.ADMIN) return student._id.toString();
  return student.createdBy ? student.createdBy.toString() : null;
}

export class ProgressController {
  // Siswa: Ambil progress belajar sendiri
  static async getStudentProgress(studentId: string): Promise<ApiResponse> {
    const student = await User.findById(studentId);
    const tenantId = await teacherOf(studentId);
    const chapters = tenantId
      ? await Chapter.find({ createdBy: tenantId, isPublished: true }).sort({ order: 1 })
      : [];
    const progress = await StudentProgress.findOne({ studentId });
    const practiceAttempts = await PracticeAttempt.find({ studentId }).sort({ submittedAt: 1 });
    const evaluationSubmissions = await EvaluationSubmission.find({ studentId });

    const chapterStats = chapters.map((ch) => {
      const chId = ch._id.toString();
      const attempts = practiceAttempts.filter((p) => p.chapterId.toString() === chId);
      const bestPractice =
        attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;

      const evalSub = evaluationSubmissions.find((e) => e.chapterId.toString() === chId);

      const practiceCount = attempts.length;
      const completedMaterials = progress
        ? progress.completedMaterials.filter((m) => m.chapterId.toString() === chId).length
        : 0;

      return {
        chapterId: ch._id,
        order: ch.order,
        title: ch.title,
        slug: ch.slug,
        practiceScore: bestPractice,
        practiceAttempts: practiceCount,
        evaluationScore: evalSub?.isReleased ? evalSub.finalScore : null,
        evaluationStatus: evalSub ? evalSub.status : EvaluationStatus.NOT_STARTED,
        isEvaluationReleased: evalSub?.isReleased || false,
        completedMaterials,
        totalMaterials: ch.materials.length,
        isCompleted: evalSub?.isReleased && evalSub.finalScore >= 70,
      };
    });

    const releasedEvals = chapterStats.filter(
      (c) => c.evaluationStatus === EvaluationStatus.RELEASED
    );
    const completedCount = chapterStats.filter((c) => c.isCompleted).length;
    const overallProgress = Math.round(
      (completedCount / (chapters.length || 1)) * 100
    );

    const validPracticeScores = chapterStats
      .map((c) => c.practiceScore)
      .filter((s): s is number => s !== null);
    const avgPractice = validPracticeScores.length
      ? Math.round(
          validPracticeScores.reduce((a, b) => a + b, 0) / validPracticeScores.length
        )
      : 0;

    const validEvalScores = chapterStats
      .map((c) => c.evaluationScore)
      .filter((s): s is number => s !== null);
    const avgEvaluation = validEvalScores.length
      ? Math.round(
          validEvalScores.reduce((a, b) => a + b, 0) / validEvalScores.length
        )
      : 0;

    return {
      success: true,
      message: "Data progress berhasil diambil",
      data: {
        student: student?.toJSON(),
        overallProgress,
        avgPractice,
        avgEvaluation,
        completedChapters: completedCount,
        totalChapters: chapters.length,
        chapters: chapterStats,
        practiceTimeline: practiceAttempts.map((p) => ({
          date: p.submittedAt,
          score: p.score,
          chapterId: p.chapterId,
        })),
        recentEvaluations: evaluationSubmissions.map((e) => ({
          _id: e._id,
          chapterId: e.chapterId,
          status: e.status,
          finalScore: e.isReleased ? e.finalScore : null,
          isReleased: e.isReleased,
          submittedAt: e.submittedAt,
          verifiedAt: e.verifiedAt,
        })),
      },
    };
  }

  // Admin: Ringkasan dashboard admin
  static async getAdminSummary(adminId: string): Promise<ApiResponse> {
    const [totalStudents, activeStudents, chapters, pendingEvals, allPractices, allEvals] =
      await Promise.all([
        User.countDocuments({ role: Role.SISWA, createdBy: adminId }),
        User.countDocuments({ role: Role.SISWA, status: "active", createdBy: adminId }),
        Chapter.find({ createdBy: adminId }).sort({ order: 1 }),
        EvaluationSubmission.countDocuments({
          examId: { $in: await Exam.find({ createdBy: adminId }).distinct("_id") },
          status: { $in: [EvaluationStatus.PENDING_REVIEW, EvaluationStatus.SUBMITTED] },
        }),
        PracticeAttempt.find({
          quizId: { $in: await Quiz.find({ createdBy: adminId }).distinct("_id") },
        }),
        EvaluationSubmission.find({
          examId: { $in: await Exam.find({ createdBy: adminId }).distinct("_id") },
          isReleased: true,
        }),
      ]);

    const avgPractice = allPractices.length
      ? Math.round(
          allPractices.reduce((a, b) => a + b.score, 0) / allPractices.length
        )
      : 0;

    const avgEval = allEvals.length
      ? Math.round(
          allEvals.reduce((a, b) => a + b.finalScore, 0) / allEvals.length
        )
      : 0;

    // Data per bab untuk chart
    const chaptersWithStats = await Promise.all(
      chapters.map(async (ch) => {
        const chPractices = await PracticeAttempt.find({ chapterId: ch._id });
        const chEvals = await EvaluationSubmission.find({
          chapterId: ch._id,
          isReleased: true,
        });

        const chAvgPractice = chPractices.length
          ? Math.round(
              chPractices.reduce((a, b) => a + b.score, 0) / chPractices.length
            )
          : 0;

        const chAvgEval = chEvals.length
          ? Math.round(
              chEvals.reduce((a, b) => a + b.finalScore, 0) / chEvals.length
            )
          : 0;

        return {
          chapterId: ch._id,
          title: ch.title,
          order: ch.order,
          avgPractice: chAvgPractice,
          avgEvaluation: chAvgEval,
          practiceSubmissions: chPractices.length,
          evalSubmissions: chEvals.length,
        };
      })
    );

    return {
      success: true,
      message: "Ringkasan admin berhasil diambil",
      data: {
        totalStudents,
        activeStudents,
        totalChapters: chapters.length,
        pendingEvaluations: pendingEvals,
        avgPracticeScore: avgPractice,
        avgEvaluationScore: avgEval,
        totalPracticeAttempts: allPractices.length,
        totalEvalReleases: allEvals.length,
        chapters: chaptersWithStats,
      },
    };
  }

  // Admin: Progress semua siswa miliknya
  static async getAllStudentsProgress(adminId: string, query: {
    search?: string;
    chapterOrder?: number;
  }): Promise<ApiResponse> {
    const filter: Record<string, unknown> = { role: Role.SISWA, createdBy: adminId };
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { username: { $regex: query.search, $options: "i" } },
        { school: { $regex: query.search, $options: "i" } },
      ];
    }

    const students = await User.find(filter);
    const chapters = await Chapter.find({ createdBy: adminId, isPublished: true }).sort({ order: 1 });

    const result = await Promise.all(
      students.map(async (student) => {
        const sid = student._id.toString();
        const [practiceAttempts, evalSubmissions, studentProgress] = await Promise.all([
          PracticeAttempt.find({ studentId: sid }),
          EvaluationSubmission.find({ studentId: sid }),
          StudentProgress.findOne({ studentId: sid }),
        ]);

        const chapterDetails = chapters.map((ch) => {
          const chId = ch._id.toString();
          const attempts = practiceAttempts.filter(
            (p) => p.chapterId.toString() === chId
          );
          const bestPractice =
            attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;
          const evalSub = evalSubmissions.find((e) => e.chapterId.toString() === chId);
          const completedMats = studentProgress
            ? studentProgress.completedMaterials.filter(
                (m) => m.chapterId.toString() === chId
              ).length
            : 0;

          return {
            chapterId: ch._id,
            title: ch.title,
            order: ch.order,
            practiceScore: bestPractice,
            practiceAttempts: attempts.length,
            evaluationStatus: evalSub ? evalSub.status : EvaluationStatus.NOT_STARTED,
            evaluationScore: evalSub?.isReleased ? evalSub.finalScore : null,
            isReleased: evalSub?.isReleased || false,
            completedMaterials: completedMats,
            totalMaterials: ch.materials.length,
          };
        });

        const completedCount = chapterDetails.filter((c) => c.isReleased).length;
        const overallProgress = Math.round(
          (completedCount / (chapters.length || 1)) * 100
        );

        const validPractice = chapterDetails
          .map((c) => c.practiceScore)
          .filter((s): s is number => s !== null);
        const avgPractice = validPractice.length
          ? Math.round(
              validPractice.reduce((a, b) => a + b, 0) / validPractice.length
            )
          : null;

        return {
          student: student.toJSON(),
          overallProgress,
          avgPractice,
          completedChapters: completedCount,
          totalChapters: chapters.length,
          chapters: chapterDetails,
        };
      })
    );

    return {
      success: true,
      message: "Progress seluruh siswa berhasil diambil",
      data: result,
    };
  }
}
