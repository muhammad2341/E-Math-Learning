<template>
  <div class="min-h-screen bg-white">
    <!-- ═══ NAVBAR ═══ -->
    <nav class="border-b border-gray-100 bg-white/90 backdrop-blur sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span class="text-white font-bold text-lg">&sum;</span>
          </div>
          <div>
            <p class="font-bold text-gray-900 leading-tight text-sm">E-Learning Matematika</p>
            <p class="text-[10px] text-gray-500">Platform belajar matematika terintegrasi</p>
          </div>
        </div>
        <div class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#tentang" class="hover:text-blue-600">Tentang</a>
          <a href="#overview" class="hover:text-blue-600">Overview Web</a>
          <a href="#cara" class="hover:text-blue-600">Cara Belajar</a>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/register" class="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50">
            Daftar
          </NuxtLink>
          <NuxtLink to="/login" class="btn-primary text-sm">Masuk</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- ═══ HERO: tentang apa ═══ -->
    <header class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
      <div class="max-w-3xl">
        <span class="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full ring-1 ring-blue-100">
          Apa ini?
        </span>
        <h1 class="mt-5 text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1]">
          Website belajar matematika<br />
          <span class="text-blue-600">untuk siswa &amp; guru</span>
        </h1>
        <div class="mt-5 space-y-4 text-gray-600 leading-relaxed">
          <p>
            <strong class="text-gray-900">E-Learning Matematika</strong> adalah platform
            pembelajaran daring yang menghubungkan guru dengan siswanya. Guru mengelola
            bab pelajaran, materi, video, latihan soal, dan ujian evaluasi — semua data
            terisolasi per guru, sehingga setiap kelas belajar dengan materinya sendiri.
          </p>
          <p>
            Siswa masuk menggunakan akun yang diberikan guru, mempelajari materi bab per
            bab, mengerjakan latihan yang dinilai otomatis, lalu mengerjakan ujian
            evaluasi yang hasilnya direview langsung oleh guru. Progress belajar tiap
            siswa terpantau dan tercatat rapi.
          </p>
        </div>

        <div class="mt-7 flex flex-wrap gap-3">
          <NuxtLink to="/login" class="btn-primary px-5 py-2.5 text-sm">Mulai Belajar — Masuk</NuxtLink>
          <NuxtLink to="/register" class="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Daftar Akun Guru
          </NuxtLink>
        </div>

        <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="s in stats" :key="s.label" class="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
            <p class="text-lg font-bold text-blue-600">{{ s.value }}</p>
            <p class="text-[11px] text-gray-500 leading-tight mt-0.5">{{ s.label }}</p>
          </div>
        </div>
      </div>
    </header>

    <!-- ═══ TENTANG: untuk siapa ═══ -->
    <section id="tentang" class="bg-gray-50 border-y border-gray-100 py-14 scroll-mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-900">Untuk Siapa Saja Ini?</h2>
        <p class="text-gray-500 mt-1.5 text-sm">Dua peran, satu platform yang saling terhubung.</p>
        <div class="mt-7 grid md:grid-cols-2 gap-6">
          <div v-for="r in roles" :key="r.title" class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="r.bg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" :class="r.fg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="r.icon" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-gray-900">{{ r.title }}</p>
                <p class="text-xs text-gray-500">{{ r.subtitle }}</p>
              </div>
            </div>
            <p class="mt-4 text-sm text-gray-600 leading-relaxed">{{ r.desc }}</p>
            <ul class="mt-4 space-y-1.5">
              <li v-for="item in r.bullets" :key="item" class="flex items-start gap-2 text-sm text-gray-600">
                <svg class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ OVERVIEW WEB: isi setiap menu ═══ -->
    <section id="overview" class="py-14 scroll-mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-900">Overview Web</h2>
        <p class="text-gray-500 mt-1.5 text-sm">Isi setiap menu yang tersedia di dalam aplikasi.</p>

        <div class="mt-7 grid lg:grid-cols-2 gap-6">
          <!-- Menu admin -->
          <div class="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-gray-900">Menu Guru / Admin</h3>
              <span class="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2.5 py-1 rounded-full">8 menu</span>
            </div>
            <div class="mt-4 space-y-2.5">
              <div v-for="m in adminMenus" :key="m.name" class="bg-white rounded-xl border border-gray-100 px-4 py-3 flex gap-3 items-start">
                <div class="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="m.icon" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ m.name }}</p>
                  <p class="text-xs text-gray-500 leading-snug mt-0.5">{{ m.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Menu siswa -->
          <div class="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-gray-900">Menu Siswa</h3>
              <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full">6 menu</span>
            </div>
            <div class="mt-4 space-y-2.5">
              <div v-for="m in siswaMenus" :key="m.name" class="bg-white rounded-xl border border-gray-100 px-4 py-3 flex gap-3 items-start">
                <div class="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="m.icon" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ m.name }}</p>
                  <p class="text-xs text-gray-500 leading-snug mt-0.5">{{ m.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fitur unggulan -->
        <div class="mt-8 grid sm:grid-cols-3 gap-5">
          <div v-for="f in features" :key="f.title" class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 mb-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="f.icon" />
              </svg>
            </div>
            <p class="font-semibold text-gray-900">{{ f.title }}</p>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CARA BELAJAR ═══ -->
    <section id="cara" class="bg-gray-900 py-14 scroll-mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-white text-center">Cara Belajar di Sini</h2>
        <p class="text-gray-400 text-sm text-center mt-1.5">Empat langkah dari login sampai nilai.</p>
        <div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(step, i) in steps" :key="i" class="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 text-center">
            <div class="w-10 h-10 mx-auto rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg">
              {{ i + 1 }}
            </div>
            <p class="mt-3 font-semibold text-white">{{ step.title }}</p>
            <p class="text-sm text-gray-400 mt-1.5 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
        <div class="mt-9 text-center">
          <NuxtLink to="/login" class="inline-block btn-primary px-6 py-3">Masuk &amp; Mulai Belajar</NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══ FOOTER ═══ -->
    <footer class="py-8 text-center text-sm text-gray-400 border-t border-gray-100">
      © {{ new Date().getFullYear() }} E-Learning Matematika — Platform belajar matematika terintegrasi
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' });

useHead({
  title: 'E-Learning Matematika — Platform Belajar Matematika untuk Siswa & Guru',
  meta: [
    { name: 'description', content: 'Platform e-learning matematika: materi bab, video, latihan soal bernilai otomatis, dan ujian evaluasi yang direview guru. Data terisolasi per guru.' },
  ],
});

const authStore = useAuthStore();

authStore.init();
if (authStore.isAuthenticated) {
  navigateTo(authStore.isAdmin ? '/admin' : '/siswa');
}

const stats = [
  { value: '2', label: 'Peran: Guru & Siswa' },
  { value: '5', label: 'Bab pelajaran terstruktur' },
  { value: 'Otomatis', label: 'Penilaian latihan' },
  { value: 'Review', label: 'Nilai ujian oleh guru' },
];

const roles = [
  {
    title: 'Guru / Admin',
    subtitle: 'Pengelola materi & penilai',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    bg: 'bg-blue-100',
    fg: 'text-blue-600',
    desc: 'Guru membuat akun siswa, menyusun bab pelajaran, mengunggah materi & video, membuat soal, lalu mereview hasil ujian evaluasi tiap siswa.',
    bullets: [
      'Kelola siswa satu kelas dalam satu tempat',
      'Konten per bab: materi, PDF, video, soal',
      'Jadwalkan ujian (waktu mulai, tenggat, durasi)',
      'Verifikasi & rilis nilai evaluasi per siswa',
    ],
  },
  {
    title: 'Siswa',
    subtitle: 'Pelajar yang mengikuti kelas',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    bg: 'bg-emerald-100',
    fg: 'text-emerald-600',
    desc: 'Siswa belajar mandiri mengikuti struktur bab dari guru: baca materi, tonton video, kerjakan latihan, dan ikuti ujian evaluasi sesuai jadwal.',
    bullets: [
      'Akses materi & video bab yang dipublikasikan',
      'Latihan soal dengan nilai langsung terhitung',
      'Ujian evaluasi dengan status terkunci/jadwal',
      'Pantau progress belajar dan rata-rata nilai',
    ],
  },
];

const adminMenus = [
  { name: 'Dashboard', desc: 'Ringkasan jumlah siswa, bab, rata-rata nilai.', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Kelola Siswa', desc: 'Tambah data siswa (NIS, kelas, sekolah), reset password, hapus.', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a4 4 0 11-4-4' },
  { name: 'Bab Pelajaran', desc: 'Buat & urutkan bab, tentukan tujuan belajar, publish/unpublish.', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { name: 'Materi Pelajaran', desc: 'Unggah file PDF/PPT sebagai materi bab, atur publikasi.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { name: 'Latihan Soal', desc: 'Buat quiz per bab: pilihan ganda & isian, nilai otomatis.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { name: 'Evaluasi', desc: 'Ujian bab: jadwal mulai/tenggat, durasi, verifikasi nilai.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Video Pembelajaran', desc: 'Tambah video (URL/bab), publish untuk siswa.', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { name: 'Laporan Perkembangan', desc: 'Progres per siswa & per bab, rekap nilai latihan/evaluasi.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

const siswaMenus = [
  { name: 'Dashboard', desc: 'Ringkasan bab, progres belajar, dan nilai terakhir.', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Materi Pelajaran', desc: 'Baca & unduh materi bab yang sudah dipublikasikan guru.', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { name: 'Latihan Soal', desc: 'Kerjakan quiz bab, lihat nilai & pembahasan otomatis.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { name: 'Evaluasi', desc: 'Ujian bab sesuai jadwal (mulai–tenggat), nilai direview guru.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Video Pembelajaran', desc: 'Tonton video pembelajaran per bab dari guru.', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { name: 'Progress Belajar', desc: 'Grafik nilai latihan & evaluasi, progres tiap bab.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

const features = [
  {
    title: 'Penilaian Otomatis',
    desc: 'Latihan soal dinilai seketika saat dikumpulkan — siswa langsung tahu hasilnya.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    title: 'Isolasi Data per Guru',
    desc: 'Setiap guru hanya melihat siswa & kontennya sendiri — aman untuk banyak kelas/guru.',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    title: 'Review Guru per Siswa',
    desc: 'Hasil ujian evaluasi diverifikasi & dirilis guru beserta catatan untuk siswa.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

const steps = [
  { title: 'Masuk Akun', desc: 'Login dengan akun siswa yang diberikan guru.' },
  { title: 'Pelajari Bab', desc: 'Baca materi dan tonton video tiap bab.' },
  { title: 'Kerjakan Latihan', desc: 'Uji pemahaman lewat latihan soal bernilai otomatis.' },
  { title: 'Ujian & Review', desc: 'Kerjakan evaluasi, guru mereview dan merilis nilainya.' },
];
</script>
