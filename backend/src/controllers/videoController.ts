import { Video } from "../models/Video";
import { Chapter } from "../models/Chapter";
import { User } from "../models/User";
import { Role, type ApiResponse } from "../types";

async function teacherOf(studentId: string): Promise<string | null> {
  const student = await User.findById(studentId).select("role createdBy");
  if (!student) return null;
  if (student.role === Role.ADMIN) return student._id.toString();
  return student.createdBy ? student.createdBy.toString() : null;
}

export class VideoController {
  // Admin: Ambil semua video miliknya
  static async getAllVideos(adminId: string): Promise<ApiResponse> {
    const videos = await Video.find({ createdBy: adminId })
      .populate("chapterId", "title order slug")
      .sort({ order: 1 });
    return { success: true, message: "Daftar video berhasil diambil", data: videos };
  }

  // Siswa: Ambil video published (milik gurunya)
  static async getPublishedVideos(studentId: string, chapterId?: string): Promise<ApiResponse> {
    const tenantId = await teacherOf(studentId);
    if (!tenantId) return { success: true, message: "Daftar video berhasil diambil", data: [] };

    const filter: Record<string, unknown> = { isPublished: true, createdBy: tenantId };
    if (chapterId) filter.chapterId = chapterId;

    const videos = await Video.find(filter)
      .populate("chapterId", "title order slug")
      .sort({ order: 1 });

    return { success: true, message: "Daftar video berhasil diambil", data: videos };
  }

  static async createVideo(adminId: string, body: {
    chapterId: string;
    title: string;
    description?: string;
    videoUrl: string;
    order?: number;
  }): Promise<ApiResponse> {
    const chapter = await Chapter.findOne({ _id: body.chapterId, createdBy: adminId });
    if (!chapter) return { success: false, message: "Bab tidak ditemukan" };

    const video = await Video.create({ ...body, createdBy: adminId });
    return { success: true, message: "Video berhasil ditambahkan", data: video };
  }

  static async updateVideo(adminId: string, id: string, body: any): Promise<ApiResponse> {
    const video = await Video.findOneAndUpdate({ _id: id, createdBy: adminId }, body, { new: true });
    if (!video) return { success: false, message: "Video tidak ditemukan" };
    return { success: true, message: "Video berhasil diupdate", data: video };
  }

  static async togglePublish(adminId: string, id: string): Promise<ApiResponse> {
    const video = await Video.findOne({ _id: id, createdBy: adminId });
    if (!video) return { success: false, message: "Video tidak ditemukan" };
    video.isPublished = !video.isPublished;
    await video.save();
    return {
      success: true,
      message: video.isPublished ? "Video dipublikasikan" : "Video disembunyikan",
      data: video,
    };
  }

  static async deleteVideo(adminId: string, id: string): Promise<ApiResponse> {
    const video = await Video.findOneAndDelete({ _id: id, createdBy: adminId });
    if (!video) return { success: false, message: "Video tidak ditemukan" };
    return { success: true, message: "Video berhasil dihapus" };
  }
}
