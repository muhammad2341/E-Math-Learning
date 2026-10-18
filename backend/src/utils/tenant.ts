import { User } from "../models/User";
import { Role, type JWTPayload } from "../types";

/**
 * Resolve tenant (guru pemilik data) dari user yang sedang login.
 * - Admin  → id sendiri (data miliknya)
 * - Siswa  → createdBy miliknya (guru yang membuat akunnya), null jika belum ada
 */
export async function getTenantId(userId: string): Promise<string | null> {
  const user = await User.findById(userId).select("role createdBy");
  if (!user) return null;
  if (user.role === Role.ADMIN) return user._id.toString();
  return user.createdBy ? user.createdBy.toString() : null;
}

/**
 * Dari payload JWT → { tenantId, isAdmin }.
 * Helper untuk route handler.
 */
export async function resolveScope(user: JWTPayload): Promise<{
  tenantId: string | null;
  isAdmin: boolean;
}> {
  const tenantId = await getTenantId(user.id);
  return { tenantId, isAdmin: user.role === Role.ADMIN };
}
