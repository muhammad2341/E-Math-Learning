<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Bab Pelajaran</h2>
        <p class="text-sm text-gray-500">Kelola daftar bab pembelajaran</p>
      </div>
      <button @click="openAddChapter" class="btn-primary text-sm">+ Tambah Bab</button>
    </div>

    <div class="space-y-4">
      <div v-for="ch in chapters" :key="ch._id" class="card">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Bab {{ ch.order }}</span>
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="ch.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
              >
                {{ ch.isPublished ? 'Published' : 'Draft' }}
              </span>
              <span class="text-[10px] text-gray-400">/{{ ch.slug }}</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mt-1">{{ ch.title }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ ch.description }}</p>
            <div v-if="ch.learningObjectives.length" class="mt-2">
              <p class="text-xs font-semibold text-gray-600 mb-1">Tujuan Pembelajaran:</p>
              <ul class="list-disc list-inside text-xs text-gray-500 space-y-0.5">
                <li v-for="(obj, i) in ch.learningObjectives" :key="i">{{ obj }}</li>
              </ul>
            </div>
            <p class="text-xs text-gray-400 mt-2">{{ ch.materials.length }} materi</p>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0">
            <button @click="togglePublish(ch)" class="text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-gray-50">
              {{ ch.isPublished ? 'Unpublish' : 'Publish' }}
            </button>
            <div class="flex items-center gap-2">
              <button @click="openEditChapter(ch)" class="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
              <button @click="removeChapter(ch)" class="text-xs text-red-600 hover:text-red-800 font-medium">Hapus</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loadingChapters" class="card text-center text-gray-400 py-12">Memuat bab...</div>
      <div v-else-if="chapters.length === 0" class="card text-center py-12">
        <p class="text-gray-500 font-medium">Data kosong</p>
        <p class="text-sm text-gray-400 mt-1">Belum ada bab. Klik "+ Tambah Bab" untuk membuat bab pertama.</p>
      </div>
    </div>

    <!-- ADD/EDIT CHAPTER MODAL -->
    <div v-if="showChapterModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showChapterModal = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">{{ editingChapter ? 'Edit Bab' : 'Tambah Bab Baru' }}</h3>
        <form @submit.prevent="handleSaveChapter" class="space-y-3">
          <div v-if="modalError" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{{ modalError }}</div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-semibold text-gray-600">Nomor Bab</label>
              <input v-model.number="chForm.order" type="number" min="1" max="100" class="input-field mt-1" required />
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600">Status</label>
              <select v-model="chForm.isPublished" class="input-field mt-1">
                <option :value="false">Draft</option>
                <option :value="true">Published</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Judul Bab</label>
            <input v-model="chForm.title" type="text" class="input-field mt-1" required />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Deskripsi</label>
            <textarea v-model="chForm.description" rows="2" class="input-field mt-1" placeholder="Deskripsi singkat bab..."></textarea>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Tujuan Pembelajaran <span class="font-normal text-gray-400">(satu per baris)</span></label>
            <textarea v-model="chForm.objectivesText" rows="3" class="input-field mt-1" placeholder="Memahami konsep X&#10;Menghitung Y"></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showChapterModal = false" class="btn-secondary text-sm">Batal</button>
            <button type="submit" class="btn-primary text-sm" :disabled="submitting">{{ submitting ? 'Menyimpan...' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chapter } from '~/types';

definePageMeta({ layout: 'dashboard' });

const api = useApi();
const chapters = ref<Chapter[]>([]);
const loadingChapters = ref(true);
const submitting = ref(false);
const modalError = ref('');

const showChapterModal = ref(false);
const editingChapter = ref<Chapter | null>(null);
const chForm = reactive({ order: 1, title: '', description: '', objectivesText: '', isPublished: false });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

async function fetchChapters() {
  try {
    const res = await api.get<Chapter[]>('/admin/chapters');
    if (res.success && res.data) chapters.value = res.data;
  } finally {
    loadingChapters.value = false;
  }
}

function openAddChapter() {
  editingChapter.value = null;
  chForm.order = chapters.value.length
    ? Math.max(...chapters.value.map((c) => c.order)) + 1
    : 1;
  chForm.title = ''; chForm.description = '';
  chForm.objectivesText = ''; chForm.isPublished = false;
  modalError.value = '';
  showChapterModal.value = true;
}

function openEditChapter(ch: Chapter) {
  editingChapter.value = ch;
  chForm.order = ch.order;
  chForm.title = ch.title;
  chForm.description = ch.description;
  chForm.objectivesText = ch.learningObjectives.join('\n');
  chForm.isPublished = ch.isPublished;
  modalError.value = '';
  showChapterModal.value = true;
}

async function handleSaveChapter() {
  modalError.value = '';
  submitting.value = true;

  const learningObjectives = chForm.objectivesText
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const res = editingChapter.value
    ? await api.put(`/admin/chapters/${editingChapter.value._id}`, {
        order: chForm.order,
        title: chForm.title,
        description: chForm.description,
        learningObjectives,
        isPublished: chForm.isPublished,
      })
    : await api.post('/admin/chapters', {
        order: chForm.order,
        title: chForm.title,
        slug: slugify(chForm.title),
        description: chForm.description,
        learningObjectives,
        isPublished: chForm.isPublished,
      });

  if (res.success) {
    showChapterModal.value = false;
    fetchChapters();
  } else {
    modalError.value = res.message;
  }
  submitting.value = false;
}

async function removeChapter(ch: Chapter) {
  if (!confirm(`Hapus bab "${ch.title}" (Bab ${ch.order})? Semua materi di dalamnya ikut terhapus.`)) return;
  const res = await api.del(`/admin/chapters/${ch._id}`);
  if (!res.success) alert(res.message);
  else fetchChapters();
}

async function togglePublish(ch: Chapter) {
  await api.put(`/admin/chapters/${ch._id}`, { isPublished: !ch.isPublished });
  fetchChapters();
}

onMounted(fetchChapters);
</script>
