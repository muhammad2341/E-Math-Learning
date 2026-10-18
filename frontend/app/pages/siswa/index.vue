<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Dashboard Siswa</h2>
      <p class="text-sm text-gray-500 mt-1">Selamat belajar, {{ authStore.user?.name }}!</p>
    </div>

    <!-- Student info card -->
    <div class="card mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
          </div>
          <div>
            <p class="font-semibold text-lg">{{ authStore.user?.name }}</p>
            <p class="text-blue-100 text-sm">{{ authStore.user?.school }} • Usia: {{ authStore.user?.age }} tahun • {{ authStore.user?.classGroup }}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-blue-200 text-xs">Progress Belajar</p>
          <p class="text-4xl font-bold">{{ progress.overallProgress ?? 0 }}%</p>
        </div>
      </div>
      <div class="mt-4 w-full bg-white/20 rounded-full h-3">
        <div class="bg-white h-3 rounded-full transition-all" :style="{ width: (progress.overallProgress ?? 0) + '%' }" />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="card text-center">
        <p class="text-3xl font-bold text-blue-600">{{ progress.avgPractice ?? 0 }}</p>
        <p class="text-xs text-gray-500 mt-1 font-semibold uppercase">Rata-rata Latihan</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-indigo-600">{{ progress.completedChapters ?? 0 }}/{{ progress.totalChapters ?? 5 }}</p>
        <p class="text-xs text-gray-500 mt-1 font-semibold uppercase">Bab Selesai</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-emerald-600">{{ progress.avgEvaluation ?? '—' }}</p>
        <p class="text-xs text-gray-500 mt-1 font-semibold uppercase">Rata-rata Evaluasi</p>
      </div>
    </div>

    <!-- Quick access -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink to="/siswa/materials" class="card hover:shadow-md transition-shadow text-center py-6">
        <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p class="font-semibold text-gray-800 text-sm">Materi Pelajaran</p>
        <p class="text-xs text-gray-500">Baca & unduh materi</p>
      </NuxtLink>
      <NuxtLink to="/siswa/practice" class="card hover:shadow-md transition-shadow text-center py-6">
        <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <p class="font-semibold text-gray-800 text-sm">Latihan Soal</p>
        <p class="text-xs text-gray-500">Kerjakan latihan</p>
      </NuxtLink>
      <NuxtLink to="/siswa/evaluations" class="card hover:shadow-md transition-shadow text-center py-6">
        <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="font-semibold text-gray-800 text-sm">Evaluasi</p>
        <p class="text-xs text-gray-500">Ujian bab formal</p>
      </NuxtLink>
      <NuxtLink to="/siswa/videos" class="card hover:shadow-md transition-shadow text-center py-6">
        <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="font-semibold text-gray-800 text-sm">Video</p>
        <p class="text-xs text-gray-500">Tonton pembelajaran</p>
      </NuxtLink>
    </div>

    <!-- Progress per chapter mini chart -->
    <div class="card mt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Progress per Bab</h3>
      <div class="space-y-3">
        <div v-for="ch in progress.chapters" :key="ch.chapterId" class="flex items-center gap-3">
          <span class="text-xs font-semibold text-gray-500 w-6">{{ ch.order }}</span>
          <span class="text-sm text-gray-700 flex-1 min-w-0 truncate">{{ ch.title }}</span>
          <div class="w-32 bg-gray-100 rounded-full h-2">
            <div
              class="h-2 rounded-full"
              :class="ch.isCompleted ? 'bg-emerald-500' : 'bg-blue-400'"
              :style="{ width: chapterProgress(ch) + '%' }"
            />
          </div>
          <span class="text-xs font-semibold w-10 text-right" :class="ch.isCompleted ? 'text-emerald-600' : 'text-gray-500'">
            {{ chapterProgress(ch) }}%
          </span>
        </div>
        <div v-if="!loaded" class="text-center text-gray-400 py-4 text-sm">Memuat data...</div>
        <div v-else-if="!progress.chapters?.length" class="text-center text-gray-400 py-4 text-sm">Data kosong</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudentProgressData, ChapterStat } from '~/types';

definePageMeta({ layout: 'dashboard' });

const authStore = useAuthStore();
const api = useApi();
const progress = ref<Partial<StudentProgressData>>({});
const loaded = ref(false);

function chapterProgress(ch: ChapterStat): number {
  if (ch.isCompleted) return 100;
  let score = 0;
  if (ch.practiceScore !== null) score += 40;
  if (ch.evaluationStatus === 'RELEASED' && ch.evaluationScore !== null) score += 50;
  if (ch.completedMaterials >= ch.totalMaterials && ch.totalMaterials > 0) score += 10;
  return Math.min(score, 100);
}

onMounted(async () => {
  try {
    const res = await api.get<StudentProgressData>('/progress/me');
    if (res.success && res.data) progress.value = res.data;
  } finally {
    loaded.value = true;
  }
});
</script>
