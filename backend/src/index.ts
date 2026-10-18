import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { connectDB } from "./utils/database";
import { appRoutes } from "./routes/appRoutes";
import { join } from "path";

const PORT = Number(process.env.PORT) || 3001;

// Comma-separated allowed origins (e.g. "https://faridpens.my.id,http://localhost:3000")
const CORS_ORIGIN =
  process.env.CORS_ORIGIN || "http://localhost:3000";
const corsOrigins = CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);

await connectDB();

const app = new Elysia()
  .use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  )
  .onError(({ error, set }) => {
    const err = error as Error & { status?: number };
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("API Error:", message);
    set.status = err.status || (set.status !== 200 ? set.status : 500);
    return { success: false, message };
  })
  .get("/api/health", () => ({
    success: true,
    message: "E-Learning Math API running",
    timestamp: new Date().toISOString(),
  }))
  // Serve uploaded files (materials)
  .get("/uploads/:filename", async ({ params, query, set }) => {
    const safeName = params.filename.replace(/[^a-zA-Z0-9._-]/g, "");
    if (!safeName || safeName !== params.filename) {
      set.status = 400;
      return { success: false, message: "Nama file tidak valid" };
    }
    const filePath = join(process.cwd(), "uploads", safeName);
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      set.status = 404;
      return { success: false, message: "File tidak ditemukan" };
    }
    const headers = new Headers();
    const ext = safeName.split(".").pop()?.toLowerCase();
    const mime =
      ext === "pdf"
        ? "application/pdf"
        : ext === "pptx"
          ? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
          : ext === "ppt"
            ? "application/vnd.ms-powerpoint"
            : "application/octet-stream";
    headers.set("Content-Type", mime);
    if (query.download) {
      const original = encodeURIComponent(safeName.replace(/^\d+_/, ""));
      headers.set("Content-Disposition", `attachment; filename*=UTF-8''${original}`);
    }
    return new Response(file.stream(), { headers });
  })
  .use(appRoutes)
  .listen(PORT);

console.log(`🚀 E-Learning Math API running at http://localhost:${PORT}`);
export type App = typeof app;
