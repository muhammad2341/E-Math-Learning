<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Materi Pelajaran</h2>
      <p class="text-sm text-gray-500">Akses materi pembelajaran per bab</p>
    </div>

    <div class="space-y-4">
      <div v-for="ch in chapters" :key="ch._id" class="card">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Bab {{ ch.order }}</span>
              <span v-if="ch.completedMaterialCount >= ch.totalMaterialCount" class="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                ✓ Selesai
              </span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mt-1">{{ ch.title }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ ch.description }}</p>
            <div v-if="ch.learningObjectives.length" class="mt-2">
              <p class="text-xs font-semibold text-gray-600">Tujuan Pembelajaran:</p>
              <ul class="list-disc list-inside text-xs text-gray-500 space-y-0.5 mt-1">
                <li v-for="(obj, i) in ch.learningObjectives" :key="i">{{ obj }}</li>
              </ul>
            </div>
            <p class="text-xs text-gray-400 mt-2">
              Materi selesai: {{ ch.completedMaterialCount }}/{{ ch.totalMaterialCount }}
            </p>
          </div>
        </div>

        <!-- Materials -->
        <div class="border-t border-gray-100 pt-3 space-y-2">
          <div
            v-for="mat in ch.materials"
            :key="mat._id"
            class="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                :class="mat.type === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'"
              >{{ mat.type }}</span>
              <div class="min-w-0">
                <p class="text-sm text-gray-800 truncate">{{ mat.title }}</p>
                <p class="text-xs text-gray-400">{{ mat.fileSize }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span
                v-if="isCompleted(ch, mat._id)"
                class="text-xs text-emerald-600 font-medium"
              >✓ Selesai</span>
              <a
                v-if="mat.fileUrl !== '#'"
                :href="fileUrl(mat.fileUrl)"
                target="_blank"
                class="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >Lihat</a>
              <a
                v-if="mat.fileUrl !== '#'"
                :href="fileDownloadUrl(mat.fileUrl)"
                class="text-xs border border-gray-300 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition"
              >Unduh</a>
              <button
                v-if="!isCompleted(ch, mat._id)"
                @click="markComplete(ch, mat)"
                class="text-xs border border-gray-300 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition"
              >Tandai Selesai</button>
            </div>
          </div>
          <p v-if="!ch.materials.length" class="text-xs text-gray-400 py-2">Belum ada materi tersedia</p>
        </div>
      </div>

      <div v-if="!loadedChapters" class="card text-center text-gray-400 py-12">Memuat materi...</div>
      <div v-else-if="chapters.length === 0" class="card text-center py-12">
        <p class="text-gray-500 font-medium">Data kosong</p>
        <p class="text-sm text-gray-400 mt-1">Belum ada materi yang dipublikasikan guru.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChapterWithProgress, MaterialItem } from '~/types';

definePageMeta({ layout: 'dashboard' });

const api = useApi();
const { fileUrl, fileDownloadUrl } = useFileUrl();
const chapters = ref<ChapterWithProgress[]>([]);
const loadedChapters = ref(false);

function isCompleted(ch: ChapterWithProgress, matId: string): boolean {
  return ch.completedMaterialIds.includes(matId);
}

async function markComplete(ch: ChapterWithProgress, mat: MaterialItem) {
  await api.post(`/chapters/${ch._id}/materials/${mat._id}/complete`, {});
  fetchChapters();
}

async function fetchChapters() {
  try {
    const res = await api.get<ChapterWithProgress[]>('/chapters/with-progress');
    if (res.success && res.data) chapters.value = res.data;
  } finally {
    loadedChapters.value = true;
  }
}

onMounted(fetchChapters);
</script>
