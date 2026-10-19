<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Bisindo</h2>
      <p class="text-sm text-gray-500">Tonton Bisindo per bab</p>
    </div>

    <!-- Filter -->
    <div class="card mb-6">
      <select v-model="chapterFilter" class="input-field max-w-xs" @change="fetchVideos">
        <option value="">Semua Bab</option>
        <option v-for="ch in chapters" :key="ch._id" :value="ch._id">
          Bab {{ ch.order }} - {{ ch.title }}
        </option>
      </select>
    </div>

    <!-- Videos grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="v in videos" :key="v._id" class="card overflow-hidden p-0">
        <!-- Video embed -->
        <div class="aspect-video bg-gray-900">
          <iframe
            v-if="isEmbeddable(v.videoUrl)"
            :src="v.videoUrl"
            class="w-full h-full"
            frameborder="0"
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-white text-center p-4">
            <div>
              <svg class="w-10 h-10 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <a :href="v.videoUrl" target="_blank" class="text-blue-400 underline text-sm">Buka video di tab baru</a>
            </div>
          </div>
        </div>
        <div class="p-4">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3 class="font-semibold text-gray-900 text-sm">{{ v.title }}</h3>
              <p class="text-xs text-gray-500 mt-1">{{ v.description }}</p>
            </div>
            <span class="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full shrink-0">
              Bab {{ getChapterOrder(v) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="videos.length === 0" class="card md:col-span-2 text-center text-gray-400 py-12">
        {{ loading ? 'Memuat...' : 'Belum ada video tersedia' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chapter, Video } from '~/types';

definePageMeta({ layout: 'dashboard' });

const api = useApi();
const chapters = ref<Chapter[]>([]);
const videos = ref<Video[]>([]);
const chapterFilter = ref('');
const loading = ref(false);

function isEmbeddable(url: string): boolean {
  return url.includes('youtube.com/embed') || url.includes('player.vimeo.com') || url.includes('/embed/');
}

function getChapterOrder(v: Video): number | string {
  if (typeof v.chapterId === 'object') return v.chapterId.order;
  return '?';
}

async function fetchVideos() {
  loading.value = true;
  const params = chapterFilter.value ? `?chapterId=${chapterFilter.value}` : '';
  const res = await api.get<Video[]>(`/videos${params}`);
  if (res.success && res.data) videos.value = res.data;
  loading.value = false;
}

onMounted(async () => {
  const chRes = await api.get<Chapter[]>('/chapters');
  if (chRes.success && chRes.data) chapters.value = chRes.data;
  fetchVideos();
});
</script>
