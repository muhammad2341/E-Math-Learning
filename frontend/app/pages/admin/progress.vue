<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Laporan Perkembangan</h2>
        <p class="text-sm text-gray-500">Progress & performa seluruh siswa</p>
      </div>
      <input
        v-model="search"
        type="text"
        class="input-field max-w-xs text-sm"
        placeholder="Cari siswa..."
        @input="debouncedSearch"
      />
    </div>

    <div class="card overflow-hidden p-0">
      <!-- List: name + NIS only -->
      <div class="divide-y divide-gray-100">
        <div
          v-for="sp in studentsProgress"
          :key="sp.student._id"
        >
          <div class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 truncate">{{ sp.student.name }}</p>
              <p class="text-xs text-gray-500">NIS: {{ sp.student.nrp || '—' }}</p>
            </div>
            <button
              @click="toggleDetail(sp.student._id)"
              class="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition"
              :class="expandedId === sp.student._id
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 text-gray-600 hover:bg-gray-100'"
            >
              {{ expandedId === sp.student._id ? 'Tutup' : 'Detail' }}
            </button>
          </div>

          <!-- Expanded detail -->
          <div v-if="expandedId === sp.student._id" class="px-4 pb-4 bg-gray-50/50 border-t border-gray-100">
            <!-- Student info -->
            <div class="flex flex-wrap items-center justify-between gap-3 py-4">
              <div class="text-sm text-gray-600 space-y-0.5">
                <p><span class="text-gray-400">Sekolah:</span> {{ sp.student.school || '—' }}</p>
                <p><span class="text-gray-400">Usia:</span> {{ sp.student.age || '—' }} th • <span class="text-gray-400">Kelas:</span> {{ sp.student.classGroup || '—' }}</p>
                <p><span class="text-gray-400">Status:</span>
                  <span :class="sp.student.status === 'active' ? 'text-emerald-600' : 'text-red-500'">
                    {{ sp.student.status === 'active' ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </p>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <p class="text-xs text-gray-500">Progress</p>
                  <p class="text-xl font-bold text-blue-600">{{ sp.overallProgress }}%</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">Rata-rata Latihan</p>
                  <p class="text-xl font-bold" :class="(sp.avgPractice ?? 0) >= 70 ? 'text-emerald-600' : 'text-amber-600'">
                    {{ sp.avgPractice ?? '—' }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">Evaluasi Selesai</p>
                  <p class="text-xl font-bold text-indigo-600">{{ sp.completedChapters }}/{{ sp.totalChapters }}</p>
                </div>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="w-full bg-gray-100 rounded-full h-2.5 mb-4">
              <div class="bg-blue-600 h-2.5 rounded-full transition-all" :style="{ width: sp.overallProgress + '%' }" />
            </div>

            <!-- Chapter detail table -->
            <div class="overflow-x-auto bg-white rounded-lg border border-gray-200">
              <table class="w-full text-left text-xs">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-3 py-2 font-semibold text-gray-500 uppercase">Bab</th>
                    <th class="px-3 py-2 font-semibold text-gray-500 uppercase">Materi</th>
                    <th class="px-3 py-2 font-semibold text-gray-500 uppercase">Latihan</th>
                    <th class="px-3 py-2 font-semibold text-gray-500 uppercase">Evaluasi</th>
                    <th class="px-3 py-2 font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="ch in sp.chapters" :key="ch.chapterId">
                    <td class="px-3 py-2 font-medium text-gray-800">{{ ch.order }}. {{ ch.title }}</td>
                    <td class="px-3 py-2 text-gray-600">{{ ch.completedMaterials }}/{{ ch.totalMaterials }}</td>
                    <td class="px-3 py-2">
                      <span v-if="ch.practiceScore !== null" class="font-semibold" :class="ch.practiceScore >= 70 ? 'text-emerald-600' : 'text-amber-600'">
                        {{ ch.practiceScore }}
                      </span>
                      <span v-else class="text-gray-400">—</span>
                    </td>
                    <td class="px-3 py-2">
                      <span v-if="ch.isReleased && ch.evaluationScore !== null" class="font-semibold text-indigo-600">
                        {{ ch.evaluationScore }}
                      </span>
                      <span v-else class="text-gray-400">—</span>
                    </td>
                    <td class="px-3 py-2">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="evalStatusClass(ch.evaluationStatus)">
                        {{ evalStatusLabel(ch.evaluationStatus) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div v-if="studentsProgress.length === 0" class="text-center text-gray-400 py-12">
        {{ loading ? 'Memuat data...' : 'Belum ada data siswa' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudentProgressAdmin } from '~/types';

definePageMeta({ layout: 'dashboard' });

const api = useApi();
const studentsProgress = ref<StudentProgressAdmin[]>([]);
const search = ref('');
const loading = ref(false);
const expandedId = ref<string | null>(null);

function toggleDetail(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}

function evalStatusLabel(s: string) {
  const map: Record<string, string> = {
    NOT_STARTED: 'Belum Mulai',
    SUBMITTED: 'Dikirim',
    PENDING_REVIEW: 'Menunggu Review',
    VERIFIED: 'Terverifikasi',
    RELEASED: 'Selesai',
    REVISION_REQUIRED: 'Perlu Revisi',
  };
  return map[s] || s;
}

function evalStatusClass(s: string) {
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

async function fetchProgress() {
  loading.value = true;
  const params = search.value ? `?search=${encodeURIComponent(search.value)}` : '';
  const res = await api.get<StudentProgressAdmin[]>(`/admin/progress${params}`);
  if (res.success && res.data) studentsProgress.value = res.data;
  loading.value = false;
}

let searchTimer: ReturnType<typeof setTimeout>;
function debouncedSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(fetchProgress, 300);
}

onMounted(fetchProgress);
</script>
