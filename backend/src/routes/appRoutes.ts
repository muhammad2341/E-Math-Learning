import Elysia, { t } from "elysia";
import { AuthController } from "../controllers/authController";
import { StudentController } from "../controllers/studentController";
import { ChapterController } from "../controllers/chapterController";
import { PracticeController } from "../controllers/practiceController";
import { EvaluationController } from "../controllers/evaluationController";
import { ProgressController } from "../controllers/progressController";
import { VideoController } from "../controllers/videoController";
import { jwtPlugin, requireUser, requireAdmin, signToken } from "../middleware/auth";
import { getTenantId } from "../utils/tenant";

export const appRoutes = new Elysia({ prefix: "/api" })
  .use(jwtPlugin)

  // ─── AUTH ────────────────────────────────────────────────
  .post(
    "/auth/register",
    async ({ body, set }) => {
      const res = await AuthController.register(body as any);
      if (!res.success) set.status = 400;
      return res;
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        username: t.String({ minLength: 3 }),
        password: t.String({ minLength: 6 }),
        school: t.Optional(t.String()),
      }),
    }
  )

  .post(
    "/auth/login",
    async ({ body, set }) => {
      const res = await AuthController.login(body as any, signToken);
      if (!res.success) set.status = 401;
      return res;
    },
    { body: t.Object({ username: t.String(), password: t.String() }) }
  )

  .get("/auth/profile", async ({ request }) => {
    const user = await requireUser(request);
    return AuthController.getProfile(user.id);
  })

  // ─── CHAPTERS & MATERIALS ────────────────────────────────
  .get("/chapters", async ({ request }) => {
    const user = await requireUser(request);
    const tenantId = await getTenantId(user.id);
    const isAdmin = user.role === "admin";
    return ChapterController.getChapters(tenantId, isAdmin);
  })

  .get("/chapters/:slug", async ({ request, params }) => {
    const user = await requireUser(request);
    const tenantId = await getTenantId(user.id);
    return ChapterController.getChapterBySlug(params.slug, tenantId);
  })

  .get("/chapters/with-progress", async ({ request }) => {
    const user = await requireUser(request);
    return ChapterController.getChaptersWithProgress(user.id);
  })

  .post(
    "/chapters/:chapterId/materials/:materialId/complete",
    async ({ request, params }) => {
      const user = await requireUser(request);
      return ChapterController.markMaterialCompleted(user.id, params.chapterId, params.materialId);
    }
  )

  // ─── PRACTICE (SISWA) ────────────────────────────────────
  .get("/practice/chapter/:slug", async ({ request, params }) => {
    const user = await requireUser(request);
    return PracticeController.getQuizzesForStudent(user.id, params.slug);
  })

  .get("/practice/:quizId", async ({ request, params }) => {
    const user = await requireUser(request);
    return PracticeController.getQuizWithHistory(user.id, params.quizId);
  })

  .post(
    "/practice/:quizId/submit",
    async ({ request, params, body }) => {
      const user = await requireUser(request);
      return PracticeController.submitAttempt(user.id, params.quizId, body as any);
    }
  )

  // ─── EVALUATIONS (SISWA) ─────────────────────────────────
  .get("/evaluations/chapter/:order", async ({ request, params }) => {
    const user = await requireUser(request);
    return EvaluationController.getExamsForStudent(user.id, Number(params.order));
  })

  .get("/evaluations/exam/:examId", async ({ request, params }) => {
    const user = await requireUser(request);
    return EvaluationController.getExamForStudent(user.id, params.examId);
  })

  .post(
    "/evaluations/exam/:examId/submit",
    async ({ request, params, body }) => {
      const user = await requireUser(request);
      return EvaluationController.submitEvaluation(user.id, params.examId, body as any);
    }
  )

  // ─── VIDEOS (SISWA) ──────────────────────────────────────
  .get("/videos", async ({ request, query }) => {
    const user = await requireUser(request);
    return VideoController.getPublishedVideos(user.id, query.chapterId);
  })

  // ─── PROGRESS (SISWA) ────────────────────────────────────
  .get("/progress/me", async ({ request }) => {
    const user = await requireUser(request);
    return ProgressController.getStudentProgress(user.id);
  })

  // ═══════════════════════════════════════════════════════════
  // ADMIN ROUTES (require admin role)
  // ═══════════════════════════════════════════════════════════

  // Admin: Dashboard
  .get("/admin/summary", async ({ request }) => {
    const admin = await requireAdmin(request);
    return ProgressController.getAdminSummary(admin.id);
  })
  .get("/admin/progress", async ({ request, query }) => {
    const admin = await requireAdmin(request);
    return ProgressController.getAllStudentsProgress(admin.id, query);
  })

  // Admin: Students
  .get("/admin/students", async ({ request, query }) => {
    const admin = await requireAdmin(request);
    return StudentController.getAllStudents(admin.id, query);
  })
  .post(
    "/admin/students",
    async ({ request, body }) => {
      const admin = await requireAdmin(request);
      return StudentController.createStudent(admin.id, body as any);
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        username: t.String({ minLength: 3 }),
        password: t.String({ minLength: 6 }),
        nrp: t.Optional(t.String()),
        school: t.Optional(t.String()),
        age: t.Optional(t.Number()),
        classGroup: t.Optional(t.String()),
      }),
    }
  )
  .put(
    "/admin/students/:id",
    async ({ request, params, body }) => {
      const admin = await requireAdmin(request);
      return StudentController.updateStudent(admin.id, params.id, body as any);
    }
  )
  .post(
    "/admin/students/:id/reset-password",
    async ({ request, params, body }) => {
      const admin = await requireAdmin(request);
      return StudentController.resetPassword(admin.id, params.id, body as any);
    },
    { body: t.Object({ newPassword: t.String({ minLength: 6 }) }) }
  )
  .delete("/admin/students/:id", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return StudentController.deleteStudent(admin.id, params.id);
  })

  // Admin: Chapters & Materials
  .get("/admin/chapters", async ({ request }) => {
    const admin = await requireAdmin(request);
    return ChapterController.getChaptersAdmin(admin.id);
  })
  .post(
    "/admin/upload",
    async ({ request, body, set }) => {
      await requireAdmin(request);
      const file = (body as any).file as File;
      if (!file || file.size === 0) {
        set.status = 400;
        return { success: false, message: "File tidak ditemukan" };
      }
      const allowed = ["pdf", "ppt", "pptx"];
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      if (!allowed.includes(ext)) {
        set.status = 400;
        return { success: false, message: "Format file harus PDF, PPT, atau PPTX" };
      }
      const { mkdir, writeFile } = await import("fs/promises");
      const { join } = await import("path");
      const uploadsDir = join(process.cwd(), "uploads");
      await mkdir(uploadsDir, { recursive: true });
      const safeBase = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${Date.now()}_${safeBase}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(join(uploadsDir, filename), buffer);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        success: true,
        data: {
          fileUrl: `/uploads/${filename}`,
          fileName: file.name,
          fileSize: `${sizeMb} MB`,
          type: ext === "pdf" ? "pdf" : ext === "pptx" ? "pptx" : "ppt",
        },
      };
    },
    {
      body: t.Object({
        file: t.File(),
      }),
    }
  )
  .post("/admin/chapters", async ({ request, body }) => {
    const admin = await requireAdmin(request);
    return ChapterController.createChapter(admin.id, body as any);
  })
  .put("/admin/chapters/:id", async ({ request, params, body }) => {
    const admin = await requireAdmin(request);
    return ChapterController.updateChapter(admin.id, params.id, body as any);
  })
  .delete("/admin/chapters/:id", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return ChapterController.deleteChapter(admin.id, params.id);
  })
  .post(
    "/admin/chapters/:id/materials",
    async ({ request, params, body }) => {
      const admin = await requireAdmin(request);
      return ChapterController.addMaterial(admin.id, params.id, body as any);
    }
  )
  .delete("/admin/chapters/:id/materials/:matId", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return ChapterController.removeMaterial(admin.id, params.id, params.matId);
  })
  .patch("/admin/chapters/:id/materials/:matId/toggle", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return ChapterController.toggleMaterialPublished(admin.id, params.id, params.matId);
  })

  // Admin: Practice Quizzes & Questions
  .get("/admin/practice/quizzes", async ({ request, query }) => {
    const admin = await requireAdmin(request);
    return PracticeController.getQuizzesAdmin(admin.id, query.chapterId);
  })
  .post("/admin/practice/quizzes", async ({ request, body }) => {
    const admin = await requireAdmin(request);
    return PracticeController.createQuiz(admin.id, body as any);
  })
  .put("/admin/practice/quizzes/:id", async ({ request, params, body }) => {
    const admin = await requireAdmin(request);
    return PracticeController.updateQuiz(admin.id, params.id, body as any);
  })
  .delete("/admin/practice/quizzes/:id", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return PracticeController.deleteQuiz(admin.id, params.id);
  })
  .get("/admin/practice/quizzes/:id/questions", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return PracticeController.getQuestionsByQuiz(admin.id, params.id);
  })
  .post("/admin/practice/questions", async ({ request, body }) => {
    const admin = await requireAdmin(request);
    return PracticeController.createQuestion(admin.id, body as any);
  })
  .put("/admin/practice/questions/:id", async ({ request, params, body }) => {
    const admin = await requireAdmin(request);
    return PracticeController.updateQuestion(admin.id, params.id, body as any);
  })
  .delete("/admin/practice/questions/:id", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return PracticeController.deleteQuestion(admin.id, params.id);
  })

  // Admin: Evaluation Exams & Questions
  .get("/admin/evaluations/exams", async ({ request, query }) => {
    const admin = await requireAdmin(request);
    return EvaluationController.getExamsAdmin(admin.id, query.chapterId);
  })
  .post("/admin/evaluations/exams", async ({ request, body }) => {
    const admin = await requireAdmin(request);
    return EvaluationController.createExam(admin.id, body as any);
  })
  .put("/admin/evaluations/exams/:id", async ({ request, params, body }) => {
    const admin = await requireAdmin(request);
    return EvaluationController.updateExam(admin.id, params.id, body as any);
  })
  .delete("/admin/evaluations/exams/:id", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return EvaluationController.deleteExam(admin.id, params.id);
  })
  .get("/admin/evaluations/exams/:id", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return EvaluationController.getExamDetail(admin.id, params.id);
  })
  .get("/admin/evaluations/exams/:id/submissions", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return EvaluationController.getSubmissionsByExam(admin.id, params.id);
  })
  .get("/admin/evaluations/submissions/:id", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return EvaluationController.getSubmissionDetail(admin.id, params.id);
  })
  .post("/admin/evaluations/questions", async ({ request, body }) => {
    const admin = await requireAdmin(request);
    return EvaluationController.createQuestion(admin.id, body as any);
  })
  .put("/admin/evaluations/questions/:id", async ({ request, params, body }) => {
    const admin = await requireAdmin(request);
    return EvaluationController.updateQuestion(admin.id, params.id, body as any);
  })
  .delete("/admin/evaluations/questions/:id", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return EvaluationController.deleteQuestion(admin.id, params.id);
  })
  .post(
    "/admin/evaluations/submissions/:id/verify",
    async ({ request, params, body }) => {
      const admin = await requireAdmin(request);
      return EvaluationController.verifyAndRelease(admin.id, params.id, body as any);
    }
  )

  // Admin: Videos
  .get("/admin/videos", async ({ request }) => {
    const admin = await requireAdmin(request);
    return VideoController.getAllVideos(admin.id);
  })
  .post(
    "/admin/videos",
    async ({ request, body }) => {
      const admin = await requireAdmin(request);
      return VideoController.createVideo(admin.id, body as any);
    },
    {
      body: t.Object({
        chapterId: t.String(),
        title: t.String({ minLength: 2 }),
        videoUrl: t.String(),
        description: t.Optional(t.String()),
        order: t.Optional(t.Number()),
      }),
    }
  )
  .put("/admin/videos/:id", async ({ request, params, body }) => {
    const admin = await requireAdmin(request);
    return VideoController.updateVideo(admin.id, params.id, body as any);
  })
  .patch("/admin/videos/:id/toggle", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return VideoController.togglePublish(admin.id, params.id);
  })
  .delete("/admin/videos/:id", async ({ request, params }) => {
    const admin = await requireAdmin(request);
    return VideoController.deleteVideo(admin.id, params.id);
  });
