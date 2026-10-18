import { Chapter, type IMaterialItem } from "../models/Chapter";
import { StudentProgress } from "../models/Progress";
import { User } from "../models/User";
import { Role, type ApiResponse } from "../types";

async function teacherOf(studentId: string): Promise<string | null> {
  const student = await User.findById(studentId).select("role createdBy");
  if (!student) return null;
  if (student.role === Role.ADMIN) return student._id.toString();
  return student.createdBy ? student.createdBy.toString() : null;
}

export class ChapterController {
  /** Bab milik guru tertentu (tenant). */
  static async getChapters(tenantId: string | null, includeUnpublished = false): Promise<ApiResponse> {
    if (!tenantId) return { success: true, message: "Daftar bab berhasil diambil", data: [] };
    const filter: Record<string, unknown> = { createdBy: tenantId };
    if (!includeUnpublished) filter.isPublished = true;
    const chapters = await Chapter.find(filter).sort({ order: 1 });
    return { success: true, message: "Daftar bab berhasil diambil", data: chapters };
  }

  static async getChapterBySlug(slug: string, tenantId: string | null): Promise<ApiResponse> {
    if (!tenantId) return { success: false, message: "Bab tidak ditemukan" };
    const chapter = await Chapter.findOne({ slug, createdBy: tenantId });
    if (!chapter) return { success: false, message: "Bab tidak ditemukan" };
    return { success: true, message: "Detail bab berhasil diambil", data: chapter };
  }

  static async getChaptersWithProgress(studentId: string): Promise<ApiResponse> {
    const tenantId = await teacherOf(studentId);
    if (!tenantId) return { success: true, message: "Daftar bab dengan progress berhasil diambil", data: [] };

    const chapters = await Chapter.find({ createdBy: tenantId, isPublished: true }).sort({ order: 1 });
    const progress = await StudentProgress.findOne({ studentId });
    const completedMaterials = progress ? progress.completedMaterials : [];

    const result = chapters.map((ch) => {
      const chCompleted = completedMaterials.filter(
        (m) => m.chapterId.toString() === ch._id.toString()
      );

      return {
        ...ch.toJSON(),
        completedMaterialIds: chCompleted.map((m) => m.materialId),
        completedMaterialCount: chCompleted.length,
        totalMaterialCount: ch.materials.length,
      };
    });

    return { success: true, message: "Daftar bab dengan progress berhasil diambil", data: result };
  }

  static async markMaterialCompleted(studentId: string, chapterId: string, materialId: string): Promise<ApiResponse> {
    let progress = await StudentProgress.findOne({ studentId });
    if (!progress) {
      progress = await StudentProgress.create({
        studentId,
        completedMaterials: [],
        completedChapters: [],
      });
    }

    const alreadyDone = progress.completedMaterials.some(
      (m) => m.materialId === materialId && m.chapterId.toString() === chapterId
    );

    if (!alreadyDone) {
      progress.completedMaterials.push({
        chapterId: chapterId as any,
        materialId,
        completedAt: new Date(),
      });

      const tenantId = await teacherOf(studentId);
      const chapter = await Chapter.findOne({ _id: chapterId, createdBy: tenantId });
      if (chapter) {
        const totalMats = chapter.materials.length;
        const doneMats = progress.completedMaterials.filter(
          (m) => m.chapterId.toString() === chapterId
        ).length;

        if (doneMats >= totalMats) {
          const isChapterDone = progress.completedChapters.some(
            (c) => c.toString() === chapterId
          );
          if (!isChapterDone) {
            progress.completedChapters.push(chapterId as any);
          }
        }
      }

      await progress.save();
    }

    return { success: true, message: "Materi berhasil ditandai selesai" };
  }

  static async upsertChapter(tenantId: string, body: {
    order: number;
    title: string;
    slug: string;
    description?: string;
    learningObjectives?: string[];
    materials?: IMaterialItem[];
    isPublished?: boolean;
  }): Promise<ApiResponse> {
    const chapter = await Chapter.findOneAndUpdate(
      { slug: body.slug, createdBy: tenantId },
      { ...body, createdBy: tenantId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return { success: true, message: "Bab berhasil disimpan", data: chapter };
  }

  static async createChapter(tenantId: string, body: {
    order: number;
    title: string;
    slug: string;
    description?: string;
    learningObjectives?: string[];
    isPublished?: boolean;
  }): Promise<ApiResponse> {
    const cleanSlug = body.slug.trim().toLowerCase().replace(/\s+/g, "-");

    const existingOrder = await Chapter.findOne({ order: body.order, createdBy: tenantId });
    if (existingOrder) {
      return { success: false, message: `Nomor bab ${body.order} sudah dipakai ("${existingOrder.title}")` };
    }

    const existingSlug = await Chapter.findOne({ slug: cleanSlug, createdBy: tenantId });
    if (existingSlug) {
      return { success: false, message: `Slug "${cleanSlug}" sudah dipakai` };
    }

    let chapter;
    try {
      chapter = await Chapter.create({
        order: body.order,
        title: body.title.trim(),
        slug: cleanSlug,
        description: body.description || "",
        learningObjectives: body.learningObjectives || [],
        materials: [],
        isPublished: body.isPublished ?? false,
        createdBy: tenantId,
      });
    } catch (e: any) {
      if (e?.code === 11000) {
        return {
          success: false,
          message: `Nomor bab ${body.order} atau slug "${cleanSlug}" sudah dipakai di akun Anda`,
        };
      }
      throw e;
    }

    return { success: true, message: "Bab berhasil ditambahkan", data: chapter };
  }

  static async updateChapter(tenantId: string, id: string, body: Partial<{
    order: number;
    title: string;
    description: string;
    learningObjectives: string[];
    materials: IMaterialItem[];
    isPublished: boolean;
  }>): Promise<ApiResponse> {
    if (body.order !== undefined) {
      const conflict = await Chapter.findOne({
        order: body.order,
        createdBy: tenantId,
        _id: { $ne: id },
      });
      if (conflict) {
        return { success: false, message: `Nomor bab ${body.order} sudah dipakai ("${conflict.title}")` };
      }
    }

    let chapter;
    try {
      chapter = await Chapter.findOneAndUpdate(
        { _id: id, createdBy: tenantId },
        body,
        { new: true }
      );
    } catch (e: any) {
      if (e?.code === 11000) {
        return {
          success: false,
          message: "Nomor bab atau slug sudah dipakai di akun Anda",
        };
      }
      throw e;
    }
    if (!chapter) return { success: false, message: "Bab tidak ditemukan" };
    return { success: true, message: "Bab berhasil diupdate", data: chapter };
  }

  static async deleteChapter(tenantId: string, id: string): Promise<ApiResponse> {
    const chapter = await Chapter.findOneAndDelete({ _id: id, createdBy: tenantId });
    if (!chapter) return { success: false, message: "Bab tidak ditemukan" };
    return { success: true, message: "Bab berhasil dihapus" };
  }

  static async getChaptersAdmin(tenantId: string): Promise<ApiResponse> {
    const chapters = await Chapter.find({ createdBy: tenantId }).sort({ order: 1 });
    return { success: true, message: "Daftar bab (admin) berhasil diambil", data: chapters };
  }

  static async addMaterial(tenantId: string, chapterId: string, material: {
    title: string;
    type: "pdf" | "ppt" | "pptx";
    fileUrl: string;
    fileSize?: string;
  }): Promise<ApiResponse> {
    const chapter = await Chapter.findOne({ _id: chapterId, createdBy: tenantId });
    if (!chapter) return { success: false, message: "Bab tidak ditemukan" };

    chapter.materials.push({
      ...material,
      fileSize: material.fileSize || "1 MB",
      isPublished: true,
    });
    await chapter.save();

    return { success: true, message: "Materi berhasil ditambahkan", data: chapter };
  }

  static async removeMaterial(tenantId: string, chapterId: string, materialId: string): Promise<ApiResponse> {
    const chapter = await Chapter.findOne({ _id: chapterId, createdBy: tenantId });
    if (!chapter) return { success: false, message: "Bab tidak ditemukan" };

    chapter.materials = chapter.materials.filter(
      (m) => m._id?.toString() !== materialId
    );
    await chapter.save();

    return { success: true, message: "Materi berhasil dihapus", data: chapter };
  }

  static async toggleMaterialPublished(tenantId: string, chapterId: string, materialId: string): Promise<ApiResponse> {
    const chapter = await Chapter.findOne({ _id: chapterId, createdBy: tenantId });
    if (!chapter) return { success: false, message: "Bab tidak ditemukan" };

    const mat = chapter.materials.find((m) => m._id?.toString() === materialId);
    if (!mat) return { success: false, message: "Materi tidak ditemukan" };

    mat.isPublished = !mat.isPublished;
    await chapter.save();

    return { success: true, message: "Status materi berhasil diubah", data: chapter };
  }
}
