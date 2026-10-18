import { User } from "../models/User";
import { Role, AccountStatus, type ApiResponse } from "../types";
import { StudentProgress } from "../models/Progress";
import { PracticeAttempt } from "../models/Practice";
import { EvaluationSubmission } from "../models/Evaluation";
import { AuditLog } from "../models/AuditLog";

export class StudentController {
  static async createStudent(adminId: string, body: {
    name: string;
    username: string;
    password: string;
    nrp?: string;
    school?: string;
    age?: number;
    classGroup?: string;
  }): Promise<ApiResponse> {
    const cleanUsername = body.username.trim().toLowerCase();
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return { success: false, message: "Username sudah digunakan" };
    }

    if (body.nrp?.trim()) {
      const existingNrp = await User.findOne({ nrp: body.nrp.trim(), createdBy: adminId });
      if (existingNrp) {
        return { success: false, message: "NIS sudah digunakan" };
      }
    }

    const user = await User.create({
      name: body.name,
      username: cleanUsername,
      nrp: body.nrp?.trim() || "",
      password: body.password,
      role: Role.SISWA,
      school: body.school || "-",
      age: body.age || 0,
      classGroup: body.classGroup || "Reguler",
      status: AccountStatus.ACTIVE,
      createdBy: adminId,
    });

    await StudentProgress.create({
      studentId: user._id,
      completedMaterials: [],
      completedChapters: [],
    });

    await AuditLog.create({
      adminId,
      action: "CREATE_STUDENT",
      targetType: "user",
      targetId: user._id.toString(),
      details: `Membuat akun siswa: ${cleanUsername}`,
    });

    return { success: true, message: "Akun siswa berhasil dibuat", data: user.toJSON() };
  }

  static async getAllStudents(adminId: string, query: { search?: string; status?: string }): Promise<ApiResponse> {
    const filter: Record<string, unknown> = { role: Role.SISWA, createdBy: adminId };

    if (query.status === "active" || query.status === "inactive") {
      filter.status = query.status;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { username: { $regex: query.search, $options: "i" } },
        { nrp: { $regex: query.search, $options: "i" } },
        { school: { $regex: query.search, $options: "i" } },
        { classGroup: { $regex: query.search, $options: "i" } },
      ];
    }

    const students = await User.find(filter).sort({ createdAt: -1 });
    return {
      success: true,
      message: "Daftar siswa berhasil diambil",
      data: students.map((s) => s.toJSON()),
    };
  }

  static async updateStudent(adminId: string, id: string, body: {
    name?: string;
    nrp?: string;
    school?: string;
    age?: number;
    classGroup?: string;
    status?: AccountStatus;
  }): Promise<ApiResponse> {
    const user = await User.findOne({ _id: id, createdBy: adminId });
    if (!user || user.role !== Role.SISWA) {
      return { success: false, message: "Siswa tidak ditemukan" };
    }

    if (body.nrp !== undefined && body.nrp.trim()) {
      const existingNrp = await User.findOne({ nrp: body.nrp.trim(), createdBy: adminId, _id: { $ne: id } });
      if (existingNrp) {
        return { success: false, message: "NIS sudah digunakan" };
      }
      user.nrp = body.nrp.trim();
    }

    if (body.name) user.name = body.name;
    if (body.school !== undefined) user.school = body.school;
    if (body.age !== undefined) user.age = body.age;
    if (body.classGroup !== undefined) user.classGroup = body.classGroup;
    if (body.status !== undefined) user.status = body.status;

    await user.save();

    await AuditLog.create({
      adminId,
      action: "UPDATE_STUDENT",
      targetType: "user",
      targetId: id,
      details: `Mengupdate data siswa: ${user.username}`,
    });

    return { success: true, message: "Data siswa berhasil diupdate", data: user.toJSON() };
  }

  static async resetPassword(adminId: string, id: string, body: { newPassword: string }): Promise<ApiResponse> {
    const user = await User.findOne({ _id: id, createdBy: adminId });
    if (!user) return { success: false, message: "Siswa tidak ditemukan" };

    user.password = body.newPassword;
    await user.save();

    await AuditLog.create({
      adminId,
      action: "RESET_PASSWORD",
      targetType: "user",
      targetId: id,
      details: `Reset password siswa: ${user.username}`,
    });

    return { success: true, message: "Password siswa berhasil direset" };
  }

  static async deleteStudent(adminId: string, id: string): Promise<ApiResponse> {
    const user = await User.findOne({ _id: id, createdBy: adminId });
    if (!user) return { success: false, message: "Siswa tidak ditemukan" };

    await Promise.all([
      User.findByIdAndDelete(id),
      StudentProgress.findOneAndDelete({ studentId: id }),
      PracticeAttempt.deleteMany({ studentId: id }),
      EvaluationSubmission.deleteMany({ studentId: id }),
    ]);

    await AuditLog.create({
      adminId,
      action: "DELETE_STUDENT",
      targetType: "user",
      targetId: id,
      details: `Menghapus akun siswa: ${user.username}`,
    });

    return { success: true, message: "Akun dan riwayat siswa berhasil dihapus" };
  }
}
