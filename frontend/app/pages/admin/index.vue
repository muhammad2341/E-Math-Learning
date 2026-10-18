<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Dashboard Admin</h2>
        <p class="text-sm text-gray-500 mt-1">Ringkasan performa pembelajaran</p>
      </div>
      <NuxtLink to="/admin/students" class="btn-primary text-sm">+ Tambah Siswa</NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="card">
        <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Total Siswa</p>
        <p class="text-3xl font-bold text-blue-600">{{ summary.totalStudents ?? 0 }}</p>
      </div>
      <div class="card">
        <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Evaluasi Menunggu Review</p>
        <p class="text-3xl font-bold text-amber-600">{{ summary.pendingEvaluations ?? 0 }}</p>
      </div>
      <div class="card">
        <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Rata-rata Latihan</p>
        <p class="text-3xl font-bold text-emerald-600">{{ summary.avgPracticeScore ?? 0 }}</p>
      </div>
      <div class="card">
        <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Rata-rata Evaluasi</p>
        <p class="text-3xl font-bold text-indigo-600">{{ summary.avgEvaluationScore ?? 0 }}</p>
      </div>
    </div>

    <!-- Chart per bab (bar chart sederhana) -->
    <div class="card mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Performa per Bab</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-xs text-gray-500 uppercase">
              <th class="py-2 pr-4">Bab</th>
              <th class="py-2 pr-4">Rata-rata Latihan</th>
              <th class="py-2 pr-4">Rata-rata Evaluasi</th>
              <th class="py-2 pr-4">Jumlah Submit Latihan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="ch in summary.chapters" :key="ch.chapterId">
              <td class="py-3 pr-4 font-medium text-gray-900">{{ ch.order }}. {{ ch.title }}</td>
              <td class="py-3 pr-4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-100 rounded-full h-2 w-24">
                    <div class="bg-blue-500 h-2 rounded-full" :style="{ width: ch.avgPractice + '%' }" />
                  </div>
                  <span class="text-xs font-semibold">{{ ch.avgPractice }}</span>
                </div>
              </td>
              <td class="py-3 pr-4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-100 rounded-full h-2 w-24">
                    <div class="bg-indigo-500 h-2 rounded-full" :style="{ width: ch.avgEvaluation + '%' }" />
                  </div>
                  <span class="text-xs font-semibold">{{ ch.avgEvaluation }}</span>
                </div>
              </td>
              <td class="py-3 text-gray-600">{{ ch.practiceSubmissions }}</td>
            </tr>
            <tr v-if="!loaded">
              <td colspan="4" class="py-6 text-center text-gray-400">Memuat data...</td>
            </tr>
            <tr v-else-if="!summary.chapters?.length">
              <td colspan="4" class="py-6 text-center text-gray-400">Data kosong</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink to="/admin/evaluations" class="card hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
        <p class="text-2xl font-bold text-amber-600">{{ summary.pendingEvaluations ?? 0 }}</p>
        <p class="text-sm text-gray-600 mt-1">Evaluasi menunggu verifikasi</p>
      </NuxtLink>
      <NuxtLink to="/admin/materials" class="card hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
        <p class="text-2xl font-bold text-blue-600">{{ summary.totalChapters ?? 5 }}</p>
        <p class="text-sm text-gray-600 mt-1">Bab pembelajaran tersedia</p>
      </NuxtLink>
      <NuxtLink to="/admin/progress" class="card hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
        <p class="text-2xl font-bold text-emerald-600">{{ summary.totalPracticeAttempts ?? 0 }}</p>
        <p class="text-sm text-gray-600 mt-1">Total latihan dikerjakan siswa</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminSummary } from '~/types';

definePageMeta({ layout: 'dashboard' });

const api = useApi();
const summary = ref<AdminSummary>({} as AdminSummary);
const loaded = ref(false);

onMounted(async () => {
  try {
    const res = await api.get<AdminSummary>('/admin/summary');
    if (res.success && res.data) {
      summary.value = res.data;
    }
  } finally {
    loaded.value = true;
  }
});
</script>
