import { connectDB } from "./database";
import { User } from "../models/User";
import { Chapter } from "../models/Chapter";
import { Quiz, PracticeQuestion } from "../models/Practice";
import { Exam, EvaluationQuestion } from "../models/Evaluation";
import { Video } from "../models/Video";
import { StudentProgress } from "../models/Progress";
import { Role, AccountStatus } from "../types";

async function seed() {
  await connectDB();
  console.log("Seeding E-Learning Math database...");

  await Promise.all([
    User.deleteMany({}),
    Chapter.deleteMany({}),
    Quiz.deleteMany({}),
    PracticeQuestion.deleteMany({}),
    Exam.deleteMany({}),
    EvaluationQuestion.deleteMany({}),
    Video.deleteMany({}),
    StudentProgress.deleteMany({}),
  ]);

  // Drop legacy unique index on email (empty emails conflict)
  try {
    await User.collection.dropIndex("email_1");
    console.log("Dropped legacy email_1 index");
  } catch {
    // index doesn't exist, ignore
  }

  // Drop legacy global unique indexes on chapters (now unique per guru)
  for (const idxName of ["order_1", "slug_1"]) {
    try {
      await Chapter.collection.dropIndex(idxName);
      console.log(`Dropped legacy chapter index ${idxName}`);
    } catch {
      // index doesn't exist, ignore
    }
  }

  // ─── Akun Default ──────────────────────────────────────────
  const admin = await User.create({
    name: "Administrator Matematika",
    username: "admin",
    password: "admin123",
    role: Role.ADMIN,
    status: AccountStatus.ACTIVE,
  });

  const siswa1 = await User.create({
    name: "Budi Santoso",
    username: "budi",
    nrp: "2024001",
    password: "siswa123",
    role: Role.SISWA,
    school: "SMP Negeri 1 Jakarta",
    age: 14,
    classGroup: "Kelas 8A",
    status: AccountStatus.ACTIVE,
    createdBy: admin._id,
  });

  const siswa2 = await User.create({
    name: "Siti Aminah",
    username: "siti",
    nrp: "2024002",
    password: "siswa123",
    role: Role.SISWA,
    school: "SMP Negeri 2 Bandung",
    age: 13,
    classGroup: "Kelas 8B",
    status: AccountStatus.ACTIVE,
    createdBy: admin._id,
  });

  const siswa3 = await User.create({
    name: "Andi Pratama",
    username: "andi",
    nrp: "2024003",
    password: "siswa123",
    role: Role.SISWA,
    school: "SMP Negeri 3 Surabaya",
    age: 15,
    classGroup: "Kelas 9A",
    status: AccountStatus.ACTIVE,
    createdBy: admin._id,
  });

  await Promise.all(
    [siswa1, siswa2, siswa3].map((s) =>
      StudentProgress.create({
        studentId: s._id,
        completedMaterials: [],
        completedChapters: [],
      })
    )
  );

  // ─── 5 Bab Matematika ──────────────────────────────────────
  const chaptersData = [
    {
      order: 1,
      title: "Bilangan Bulat dan Pecahan",
      slug: "bilangan-bulat-dan-pecahan",
      description:
        "Memahami operasi hitung bilangan bulat, pecahan, desimal, dan sifat-sifat operasinya.",
      learningObjectives: [
        "Menyelesaikan operasi tambah, kurang, kali, dan bagi bilangan bulat",
        "Menyederhanakan dan mengoperasikan pecahan biasa dan campuran",
        "Memahami bilangan bulat dalam kehidupan sehari-hari",
      ],
      materials: [
        { title: "Modul Lengkap Bilangan Bulat & Pecahan.pdf", type: "pdf" as const, fileUrl: "#", fileSize: "2.4 MB", isPublished: true },
        { title: "Presentasi Operasi Pecahan.pptx", type: "pptx" as const, fileUrl: "#", fileSize: "4.1 MB", isPublished: true },
      ],
      isPublished: true,
    },
    {
      order: 2,
      title: "Aljabar",
      slug: "aljabar",
      description:
        "Bentuk aljabar, variabel, koefisien, konstanta, dan penyelesaian persamaan linier satu variabel.",
      learningObjectives: [
        "Mengenal unsur-unsur bentuk aljabar",
        "Menyelesaikan persamaan dan pertidaksamaan linier satu variabel",
        "Menyusun bentuk aljabar dari masalah cerita",
      ],
      materials: [
        { title: "Buku Saku Aljabar Dasar.pdf", type: "pdf" as const, fileUrl: "#", fileSize: "1.8 MB", isPublished: true },
      ],
      isPublished: true,
    },
    {
      order: 3,
      title: "Perbandingan dan Skala",
      slug: "perbandingan-dan-skala",
      description:
        "Perbandingan senilai, berbalik nilai, dan aplikasi skala pada peta dan denah.",
      learningObjectives: [
        "Menghitung perbandingan senilai dan berbalik nilai",
        "Menghitung jarak sebenarnya berdasarkan skala peta",
        "Menyelesaikan masalah perbandingan tiga besaran",
      ],
      materials: [
        { title: "Ringkasan Perbandingan & Skala.pdf", type: "pdf" as const, fileUrl: "#", fileSize: "1.5 MB", isPublished: true },
      ],
      isPublished: true,
    },
    {
      order: 4,
      title: "Geometri",
      slug: "geometri",
      description:
        "Bangun datar dan bangun ruang: luas, keliling, volume, luas permukaan, dan teorema Pythagoras.",
      learningObjectives: [
        "Menghitung luas dan keliling bangun datar gabungan",
        "Menghitung volume kubus, balok, dan prisma",
        "Menerapkan teorema Pythagoras",
      ],
      materials: [
        { title: "Rumus Praktis Geometri.pdf", type: "pdf" as const, fileUrl: "#", fileSize: "3.2 MB", isPublished: true },
        { title: "Latihan Geometri Interaktif.pptx", type: "pptx" as const, fileUrl: "#", fileSize: "5.0 MB", isPublished: true },
      ],
      isPublished: true,
    },
    {
      order: 5,
      title: "Penyajian Data",
      slug: "penyajian-data",
      description:
        "Pengumpulan data, membaca tabel, diagram batang, garis, lingkaran, serta mean, median, modus.",
      learningObjectives: [
        "Membaca dan menyajikan data ke dalam diagram",
        "Menghitung ukuran pemusatan data (Mean, Median, Modus)",
        "Menafsirkan grafik dan tabel data",
      ],
      materials: [
        { title: "Panduan Analisis & Diagram Data.pdf", type: "pdf" as const, fileUrl: "#", fileSize: "2.1 MB", isPublished: true },
      ],
      isPublished: true,
    },
  ];

  const createdChapters = await Chapter.insertMany(
    chaptersData.map((c) => ({ ...c, createdBy: admin._id }))
  );
  console.log(`✓ ${createdChapters.length} chapters created`);

  // ─── Quiz Latihan (Practice) ─────────────────────────────
  // Buat 1 quiz per bab
  const quizData = [
    { chapterId: createdChapters[0]._id, title: "Latihan Bilangan Bulat & Pecahan", description: "Uji pemahaman operasi hitung bilangan bulat dan pecahan", isPublished: true },
    { chapterId: createdChapters[1]._id, title: "Latihan Aljabar Dasar", description: "Bentuk aljabar dan persamaan linier", isPublished: true },
    { chapterId: createdChapters[2]._id, title: "Latihan Perbandingan & Skala", description: "Perbandingan senilai dan aplikasi skala", isPublished: true },
    { chapterId: createdChapters[3]._id, title: "Latihan Geometri", description: "Luas, keliling, dan Pythagoras", isPublished: true },
    { chapterId: createdChapters[4]._id, title: "Latihan Penyajian Data", description: "Mean, median, dan modus", isPublished: true },
  ];
  const createdQuizzes = await Quiz.insertMany(
    quizData.map((q) => ({ ...q, createdBy: admin._id }))
  );
  console.log(`✓ ${createdQuizzes.length} quizzes created`);

  // Soal-soal per quiz
  const practiceData = [
    // Quiz 1 - Bilangan Bulat & Pecahan
    {
      quizId: createdQuizzes[0]._id,
      questionText: "Hasil dari (-12) + 25 - (-8) adalah...",
      options: [
        { key: "A", text: "5" },
        { key: "B", text: "21" },
        { key: "C", text: "29" },
        { key: "D", text: "45" },
      ],
      correctAnswer: "B",
      explanation: "(-12) + 25 = 13, kemudian 13 - (-8) = 13 + 8 = 21.",
      order: 1,
    },
    {
      quizId: createdQuizzes[0]._id,
      questionText: "Sederhanakan pecahan 18/24...",
      options: [
        { key: "A", text: "2/3" },
        { key: "B", text: "3/4" },
        { key: "C", text: "6/8" },
        { key: "D", text: "9/12" },
      ],
      correctAnswer: "B",
      explanation: "18/24 = (6×3)/(6×4) = 3/4 (FPB = 6).",
      order: 2,
    },
    {
      quizId: createdQuizzes[0]._id,
      questionText: "Hasil dari (-5) × (-4) × 3 adalah...",
      options: [
        { key: "A", text: "-60" },
        { key: "B", text: "60" },
        { key: "C", text: "-20" },
        { key: "D", text: "20" },
      ],
      correctAnswer: "B",
      explanation: "(-5)×(-4) = 20, lalu 20×3 = 60.",
      order: 3,
    },
    // Quiz 2 - Aljabar
    {
      quizId: createdQuizzes[1]._id,
      questionText: "Sederhanakan: 3x + 5x - 2x...",
      options: [
        { key: "A", text: "6x" },
        { key: "B", text: "5x" },
        { key: "C", text: "8x" },
        { key: "D", text: "4x" },
      ],
      correctAnswer: "A",
      explanation: "3x + 5x - 2x = (3+5-2)x = 6x.",
      order: 1,
    },
    {
      quizId: createdQuizzes[1]._id,
      questionText: "Jika 2x + 6 = 14, maka x = ...",
      options: [
        { key: "A", text: "4" },
        { key: "B", text: "3" },
        { key: "C", text: "5" },
        { key: "D", text: "8" },
      ],
      correctAnswer: "A",
      explanation: "2x = 14 - 6 = 8, x = 8/2 = 4.",
      order: 2,
    },
    // Quiz 3 - Perbandingan
    {
      quizId: createdQuizzes[2]._id,
      questionText: "Perbandingan 12 : 18 disederhanakan menjadi...",
      options: [
        { key: "A", text: "2 : 3" },
        { key: "B", text: "3 : 2" },
        { key: "C", text: "4 : 6" },
        { key: "D", text: "6 : 9" },
      ],
      correctAnswer: "A",
      explanation: "12:18 = (6×2):(6×3) = 2:3 (FPB = 6).",
      order: 1,
    },
    {
      quizId: createdQuizzes[2]._id,
      questionText: "Peta skala 1 : 50.000. Jarak 8 cm pada peta berarti...",
      options: [
        { key: "A", text: "400 meter" },
        { key: "B", text: "4 km" },
        { key: "C", text: "40 km" },
        { key: "D", text: "400 km" },
      ],
      correctAnswer: "B",
      explanation: "8 × 50.000 = 400.000 cm = 4.000 m = 4 km.",
      order: 2,
    },
    // Quiz 4 - Geometri
    {
      quizId: createdQuizzes[3]._id,
      questionText: "Luas persegi panjang dengan panjang 12 cm dan lebar 5 cm adalah...",
      options: [
        { key: "A", text: "34 cm²" },
        { key: "B", text: "60 cm²" },
        { key: "C", text: "30 cm²" },
        { key: "D", text: "17 cm²" },
      ],
      correctAnswer: "B",
      explanation: "L = p × l = 12 × 5 = 60 cm².",
      order: 1,
    },
    {
      quizId: createdQuizzes[3]._id,
      questionText: "Hitung sisi miring segitiga siku-siku dengan sisi tegak 6 dan alas 8...",
      options: [
        { key: "A", text: "10" },
        { key: "B", text: "12" },
        { key: "C", text: "14" },
        { key: "D", text: "16" },
      ],
      correctAnswer: "A",
      explanation: "Pythagoras: c = √(6² + 8²) = √(36+64) = √100 = 10.",
      order: 2,
    },
    // Quiz 5 - Penyajian Data
    {
      quizId: createdQuizzes[4]._id,
      questionText: "Rata-rata dari data 4, 6, 8, 10, 12 adalah...",
      options: [
        { key: "A", text: "6" },
        { key: "B", text: "8" },
        { key: "C", text: "10" },
        { key: "D", text: "12" },
      ],
      correctAnswer: "B",
      explanation: "(4+6+8+10+12)/5 = 40/5 = 8.",
      order: 1,
    },
    {
      quizId: createdQuizzes[4]._id,
      questionText: "Median dari data 3, 7, 5, 9, 1 adalah...",
      options: [
        { key: "A", text: "5" },
        { key: "B", text: "3" },
        { key: "C", text: "7" },
        { key: "D", text: "9" },
      ],
      correctAnswer: "A",
      explanation: "Urutkan: 1, 3, 5, 7, 9 → median = nilai tengah = 5.",
      order: 2,
    },
  ];

  await PracticeQuestion.insertMany(practiceData);
  console.log(`✓ ${practiceData.length} practice questions created`);

  // ─── Ujian Evaluasi (Exam) ────────────────────────────────
  const examData = [
    { chapterId: createdChapters[0]._id, title: "Ujian Bab 1 — Bilangan Bulat & Pecahan", description: "Evaluasi pemahaman operasi bilangan bulat dan pecahan", isPublished: true },
    { chapterId: createdChapters[1]._id, title: "Ujian Bab 2 — Aljabar", description: "Evaluasi bentuk aljabar dan persamaan linier", isPublished: true },
  ];
  const createdExams = await Exam.insertMany(
    examData.map((e) => ({ ...e, createdBy: admin._id }))
  );
  console.log(`✓ ${createdExams.length} exams created`);

  // Soal-soal per ujian
  const evalData = [
    // Ujian 1 - Bilangan Bulat & Pecahan
    {
      examId: createdExams[0]._id,
      questionType: "multiple_choice",
      questionText: "Hasil dari 3/4 + 1/2 adalah...",
      options: [
        { key: "A", text: "5/4" },
        { key: "B", text: "4/6" },
        { key: "C", text: "7/4" },
        { key: "D", text: "1 1/4" },
      ],
      correctAnswer: "A",
      points: 25,
      order: 1,
    },
    {
      examId: createdExams[0]._id,
      questionType: "fill_in_blank",
      questionText: "Jika suhu di kutub mula-mula -5°C lalu turun 7°C, suhu sekarang adalah ___ °C.",
      correctAnswer: "-12",
      points: 25,
      order: 2,
    },
    {
      examId: createdExams[0]._id,
      questionType: "multiple_choice",
      questionText: "Hasil dari (-8) ÷ (-4) + 3 adalah...",
      options: [
        { key: "A", text: "1" },
        { key: "B", text: "-1" },
        { key: "C", text: "5" },
        { key: "D", text: "-5" },
      ],
      correctAnswer: "C",
      points: 25,
      order: 3,
    },
    {
      examId: createdExams[0]._id,
      questionType: "fill_in_blank",
      questionText: "Sederhanakan pecahan 36/48 menjadi ___ / ___ (isi pembilang saja, angka terkecil).",
      correctAnswer: "3",
      points: 25,
      order: 4,
    },
    // Ujian 2 - Aljabar
    {
      examId: createdExams[1]._id,
      questionType: "multiple_choice",
      questionText: "Jika 3x - 7 = 11, maka x = ...",
      options: [
        { key: "A", text: "4" },
        { key: "B", text: "6" },
        { key: "C", text: "3" },
        { key: "D", text: "9" },
      ],
      correctAnswer: "B",
      points: 50,
      order: 1,
    },
    {
      examId: createdExams[1]._id,
      questionType: "fill_in_blank",
      questionText: "Sederhanakan bentuk aljabar: 5a + 3b - 2a + 4b = ___a + ___b (isi angka a saja).",
      correctAnswer: "3",
      points: 50,
      order: 2,
    },
  ];

  await EvaluationQuestion.insertMany(evalData);
  console.log(`✓ ${evalData.length} evaluation questions created`);

  // ─── Video Pembelajaran ───────────────────────────────────
  const videoData = [
    {
      chapterId: createdChapters[0]._id,
      title: "Trik Cepat Menghitung Pecahan",
      description: "Tutorial langkah demi langkah mengoperasikan pecahan tanpa kalkulator.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      order: 1,
      isPublished: true,
    },
    {
      chapterId: createdChapters[1]._id,
      title: "Dasar-Dasar Aljabar untuk Pemula",
      description: "Pengenalan variabel, koefisien, dan cara menyusun persamaan.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      order: 1,
      isPublished: true,
    },
    {
      chapterId: createdChapters[3]._id,
      title: "Teorema Pythagoras dalam Kehidupan",
      description: "Penerapan Pythagoras untuk menyelesaikan masalah sehari-hari.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      order: 1,
      isPublished: true,
    },
  ];

  await Video.insertMany(videoData.map((v) => ({ ...v, createdBy: admin._id })));
  console.log(`✓ ${videoData.length} videos created`);

  console.log("\n✅ Seed completed!");
  console.log("┌─────────────────────────────────────────────┐");
  console.log("│ Admin: username='admin'    password='admin123' │");
  console.log("│ Siswa: username='budi'     password='siswa123' │");
  console.log("│ Siswa: username='siti'     password='siswa123' │");
  console.log("│ Siswa: username='andi'     password='siswa123' │");
  console.log("└─────────────────────────────────────────────┘");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
