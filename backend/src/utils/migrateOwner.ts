import { connectDB } from "./database";
import { User } from "../models/User";
import { Chapter } from "../models/Chapter";
import { Quiz } from "../models/Practice";
import { Exam } from "../models/Evaluation";
import { Video } from "../models/Video";

/**
 * One-time migration: pindahkan data tanpa owner (createdBy null,
 * dibuat sebelum fitur multi-guru) ke akun admin bawaan.
 * Jalankan: bun run src/utils/migrateOwner.ts
 */
async function migrateOwner() {
  await connectDB();

  const admin = await User.findOne({ username: "admin", role: "admin" });
  if (!admin) {
    console.log("Akun admin bawaan tidak ditemukan — jalankan 'bun run seed' dulu.");
    process.exit(1);
  }
  const adminId = admin._id;
  console.log(`Owner target: admin (${admin._id})`);

  const orphans: Record<string, unknown> = {};
  const nilFilter = {
    $or: [{ createdBy: null }, { createdBy: { $exists: false } }],
  };

  orphans.chapters = await Chapter.updateMany(nilFilter, { $set: { createdBy: adminId } });
  orphans.videos = await Video.updateMany(nilFilter, { $set: { createdBy: adminId } });
  orphans.quizzes = await Quiz.updateMany(nilFilter, { $set: { createdBy: adminId } });
  orphans.exams = await Exam.updateMany(nilFilter, { $set: { createdBy: adminId } });

  // Siswa tanpa guru (dibuat sebelum multi-guru)
  orphans.students = await User.updateMany(
    { role: "siswa", ...nilFilter },
    { $set: { createdBy: adminId } }
  );

  for (const [k, v] of Object.entries(orphans)) {
    const r = v as { modifiedCount: number };
    console.log(`${k}: ${r.modifiedCount} dipindahkan`);
  }

  // Verifikasi
  const check = {
    chapters: await Chapter.countDocuments({ createdBy: adminId }),
    videos: await Video.countDocuments({ createdBy: adminId }),
    quizzes: await Quiz.countDocuments({ createdBy: adminId }),
    exams: await Exam.countDocuments({ createdBy: adminId }),
    students: await User.countDocuments({ role: "siswa", createdBy: adminId }),
    remainingOrphans: await Chapter.countDocuments({
      $or: [{ createdBy: null }, { createdBy: { $exists: false } }],
    }),
  };
  console.log("Verifikasi milik admin:", check);

  process.exit(0);
}

migrateOwner().catch((e) => {
  console.error("Migration gagal:", e);
  process.exit(1);
});
