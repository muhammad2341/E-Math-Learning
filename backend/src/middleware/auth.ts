import Elysia from "elysia";
import jwt from "@elysiajs/jwt";
import { Role, type JWTPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const JWT_EXP = process.env.JWT_EXPIRES_IN || "7d";

export const jwtPlugin = new Elysia().use(
  jwt({
    name: "jwt",
    secret: JWT_SECRET,
    exp: JWT_EXP,
  }),
);

// ─── Standalone HS256 JWT sign/verify (Web Crypto) ────────
function base64url(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function expToSeconds(exp: string): number {
  const n = parseInt(exp, 10);
  if (exp.endsWith("d")) return n * 86400;
  if (exp.endsWith("h")) return n * 3600;
  if (exp.endsWith("m")) return n * 60;
  return n;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(
    new TextEncoder().encode(
      JSON.stringify({ ...payload, iat: now, exp: now + expToSeconds(JWT_EXP) })
    )
  );
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${body}`));
  return `${header}.${body}.${base64url(sig)}`;
}

export async function verifyToken(token: string): Promise<JWTPayload | false> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [header, body, sig] = parts;
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlDecode(sig) as unknown as BufferSource,
      new TextEncoder().encode(`${header}.${body}`)
    );
    if (!valid) return false;
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(body)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;
    return payload as JWTPayload;
  } catch {
    return false;
  }
}

// ─── Runtime helpers for route handlers ────────────────────
export async function requireUser(request: Request): Promise<JWTPayload> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw Object.assign(new Error("Token tidak ditemukan. Silakan login terlebih dahulu."), { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);
  if (!payload) {
    throw Object.assign(new Error("Token tidak valid atau sudah kedaluwarsa."), { status: 401 });
  }
  return payload;
}

export async function requireAdmin(request: Request): Promise<JWTPayload> {
  const user = await requireUser(request);
  if (user.role !== Role.ADMIN) {
    throw Object.assign(new Error("Akses ditolak. Hanya admin yang dapat mengakses ini."), { status: 403 });
  }
  return user;
}
