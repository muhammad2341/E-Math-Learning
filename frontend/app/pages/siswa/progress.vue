<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Progress Belajar</h2>
      <p class="text-sm text-gray-500">Pantau perkembangan belajar Anda</p>
    </div>

    <!-- Overall progress -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="card text-center">
        <p class="text-4xl font-bold text-blue-600">{{ progress.overallProgress ?? 0 }}%</p>
        <p class="text-xs text-gray-500 font-semibold uppercase mt-1">Overall Progress</p>
      </div>
      <div class="card text-center">
        <p class="text-4xl font-bold text-emerald-600">{{ progress.avgPractice ?? 0 }}</p>
        <p class="text-xs text-gray-500 font-semibold uppercase mt-1">Rata-rata Latihan</p>
      </div>
      <div class="card text-center">
        <p class="text-4xl font-bold text-indigo-600">{{ progress.avgEvaluation ?? '—' }}</p>
        <p class="text-xs text-gray-500 font-semibold uppercase mt-1">Rata-rata Evaluasi</p>
      </div>
    </div>

    <!-- Line chart (simple) - Practice timeline -->
    <div class="card mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Trend Nilai Latihan</h3>
      <div v-if="progress.practiceTimeline?.length" class="overflow-x-auto">
        <div class="flex items-end gap-2 min-w-full" style="height: 160px">
          <div
            v-for="(point, idx) in progress.practiceTimeline"
            :key="idx"
            class="flex-1 min-w-[30px] flex flex-col items-center gap-1"
          >
            <span class="text-[10px] font-bold" :class="point.score >= 70 ? 'text-emerald-600' : 'text-amber-600'">{{ point.score }}</span>
            <div
              class="w-full rounded-t transition-all"
              :class="point.score >= 70 ? 'bg-emerald-500' : 'bg-amber-400'"
              :style="{ height: point.score + 'px' }"
            />
            <span class="text-[8px] text-gray-400">{{ new Date(point.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) }}</span>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-gray-400 text-center py-4">Belum ada latihan dikerjakan</p>
    </div>

    <!-- Bar chart per chapter -->
    <div class="card mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Performa per Bab</h3>
      <div class="space-y-4">
        <div v-for="ch in progress.chapters" :key="ch.chapterId" class="space-y-1">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-700 font-medium">{{ ch.order }}. {{ ch.title }}</span>
            <span class="text-xs text-gray-500">Latihan: {{ ch.practiceScore ?? '—' }} | Evaluasi: {{ ch.isEvaluationReleased ? ch.evaluationScore : '—' }}</span>
          </div>
          <div class="flex gap-2 items-center">
            <div class="flex-1 bg-gray-100 rounded-full h-4 relative">
              <div
                class="bg-blue-500 h-4 rounded-full absolute left-0 top-0"
                :style="{ width: (ch.practiceScore ?? 0) + '%' }"
              />
            </div>
            <div class="flex-1 bg-gray-100 rounded-full h-4 relative">
              <div
                class="bg-indigo-500 h-4 rounded-full absolute left-0 top-0"
                :style="{ width: (ch.isEvaluationReleased ? (ch.evaluationScore ?? 0) : 0) + '%' }"
              />
            </div>
          </div>
        </div>
        <div v-if="!loaded" class="text-center text-gray-400 py-4 text-sm">Memuat data...</div>
        <div v-else-if="!progress.chapters?.length" class="text-center text-gray-400 py-4 text-sm">Data kosong</div>
      </div>
      <div class="flex items-center gap-4 mt-4 text-xs">
        <span class="flex items-center gap-1"><span class="w-3 h-3 bg-blue-500 rounded-full" /> Latihan</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 bg-indigo-500 rounded-full" /> Evaluasi</span>
      </div>
    </div>

    <!-- Detail table -->
    <div class="card overflow-hidden">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Detail per Bab</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Bab</th>
              <th class="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Materi</th>
              <th class="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Latihan</th>
              <th class="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Evaluasi</th>
              <th class="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="ch in progress.chapters" :key="ch.chapterId" class="hover:bg-gray-50">
              <td class="px-3 py-3 font-medium text-gray-900">{{ ch.order }}. {{ ch.title }}</td>
              <td class="px-3 py-3 text-gray-600">{{ ch.completedMaterials }}/{{ ch.totalMaterials }}</td>
              <td class="px-3 py-3">
                <span v-if="ch.practiceScore !== null" class="font-semibold" :class="ch.practiceScore >= 70 ? 'text-emerald-600' : 'text-amber-600'">{{ ch.practiceScore }}</span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-3 py-3">
                <span v-if="ch.isEvaluationReleased && ch.evaluationScore !== null" class="font-semibold text-indigo-600">{{ ch.evaluationScore }}</span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-3 py-3">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="statusClass(ch.evaluationStatus)">
                  {{ statusLabel(ch.evaluationStatus) }}
                </span>
              </td>
            </tr>
            <tr v-if="!loaded">
              <td colspan="5" class="px-3 py-6 text-center text-gray-400">Memuat data...</td>
            </tr>
            <tr v-else-if="!progress.chapters?.length">
              <td colspan="5" class="px-3 py-6 text-center text-gray-400">Data kosong</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudentProgressData } from '~/types';

definePageMeta({ layout: 'dashboard' });

const api = useApi();
const progress = ref<Partial<StudentProgressData>>({});
const loaded = ref(false);

function statusLabel(s: string) {
  const map: Record<string, string> = {
    NOT_STARTED: 'Belum Mulai',
    SUBMITTED: 'Dikirim',
    PENDING_REVIEW: 'Menunggu Review',
    VERIFIED: 'Terverifikasi',
    RELEASED: 'Selesai',
    REVISION_REQUIRED: 'Perlu Revisi',
    IN_PROGRESS: 'Sedang Dikerjakan',
  };
  return map[s] || s;
}

function statusClass(s: string) {
  const map: Record<string, string> = {
    NOT_STARTED: 'bg-gray-100 text-gray-500',
    SUBMITTED: 'bg-amber-100 text-amber-700',
    PENDING_REVIEW: 'bg-amber-100 text-amber-700',
    VERIFIED: 'bg-blue-100 text-blue-700',
    RELEASED: 'bg-emerald-100 text-emerald-700',
    REVISION_REQUIRED: 'bg-red-100 text-red-700',
  };
  return map[s] || 'bg-gray-100 text-gray-500';
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
