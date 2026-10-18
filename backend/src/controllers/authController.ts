import { User } from "../models/User";
import { AccountStatus, Role, type JWTPayload, type ApiResponse } from "../types";

export class AuthController {
  static async register(body: {
    name: string;
    username: string;
    password: string;
    school?: string;
  }): Promise<ApiResponse> {
    const cleanUsername = body.username.trim().toLowerCase();

    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return { success: false, message: "Username sudah digunakan" };
    }

    const user = await User.create({
      name: body.name.trim(),
      username: cleanUsername,
      password: body.password,
      school: body.school || "-",
      role: Role.ADMIN,
      status: AccountStatus.ACTIVE,
    });

    return {
      success: true,
      message: "Pendaftaran berhasil. Silakan login.",
      data: user.toJSON(),
    };
  }

  static async login(
    body: { username: string; password: string },
    jwtSign: (payload: JWTPayload) => Promise<string>
  ): Promise<ApiResponse> {
    const { username, password } = body;
    const cleanUsername = username.trim().toLowerCase();

    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      return { success: false, message: "Username atau password salah" };
    }

    if (user.status === AccountStatus.INACTIVE) {
      return { success: false, message: "Akun Anda dinonaktifkan. Hubungi Administrator." };
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return { success: false, message: "Username atau password salah" };
    }

    const token = await jwtSign({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    return {
      success: true,
      message: "Login berhasil",
      data: { token, user: user.toJSON() },
    };
  }

  static async getProfile(userId: string): Promise<ApiResponse> {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "Pengguna tidak ditemukan" };
    }
    return { success: true, message: "Profil berhasil diambil", data: user.toJSON() };
  }
}
