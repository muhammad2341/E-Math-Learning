<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Materi Pelajaran</h2>
        <p class="text-sm text-gray-500">Kelola file materi pada setiap bab</p>
      </div>
      <button v-if="selectedChapter" @click="openAddMaterial" class="btn-primary text-sm">+ Tambah Materi</button>
    </div>

    <div class="flex gap-6 items-start">
      <!-- Chapter picker -->
      <aside class="w-64 shrink-0 hidden lg:block">
        <div class="card p-3 sticky top-20">
          <p class="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Daftar Bab</p>
          <button
            v-for="ch in chapters"
            :key="ch._id"
            class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1"
            :class="selectedChapter?._id === ch._id
              ? 'bg-blue-600 text-white font-medium'
              : 'text-gray-600 hover:bg-gray-100'"
            @click="selectedChapter = ch"
          >
            <span class="font-bold mr-1">Bab {{ ch.order }}</span>
            <span class="truncate block">{{ ch.title }}</span>
          </button>
          <div v-if="loadingChapters" class="text-xs text-gray-400 px-2 py-4 text-center">Memuat bab...</div>
          <div v-else-if="chapters.length === 0" class="text-xs text-gray-400 px-2 py-4 text-center">Data kosong</div>
        </div>
      </aside>

      <!-- Materials content -->
      <div class="flex-1 min-w-0">
        <div v-if="!selectedChapter" class="card text-center text-gray-400 py-12">
          {{ loadingChapters ? 'Memuat bab...' : chapters.length === 0 ? 'Data kosong — tambah bab terlebih dahulu di menu Bab Pelajaran' : 'Pilih bab di samping untuk mengelola materi' }}
        </div>

        <template v-else>
          <div class="card mb-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Bab {{ selectedChapter.order }}</span>
                  <span
                    class="text-xs px-2 py-0.5 rounded-full font-medium"
                    :class="selectedChapter.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ selectedChapter.isPublished ? 'Published' : 'Draft' }}
                  </span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mt-1">{{ selectedChapter.title }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ selectedChapter.description }}</p>
              </div>
              <NuxtLink to="/admin/chapters" class="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0">
                Kelola Bab →
              </NuxtLink>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-sm font-semibold text-gray-700">Daftar Materi</h4>
              <button @click="openAddMaterial" class="btn-primary text-xs py-1.5 px-3">+ Tambah Materi</button>
            </div>

            <div v-if="selectedChapter.materials.length" class="space-y-2">
              <div
                v-for="mat in selectedChapter.materials"
                :key="mat._id"
                class="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <span
                    class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                    :class="mat.type === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'"
                  >{{ mat.type }}</span>
                  <div class="min-w-0">
                    <p class="text-sm text-gray-800 truncate">{{ mat.title }}</p>
                    <p class="text-xs text-gray-400">{{ mat.fileSize }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-xs shrink-0">
                  <a
                    v-if="mat.fileUrl !== '#'"
                    :href="fileUrl(mat.fileUrl)"
                    target="_blank"
                    class="text-gray-500 hover:text-gray-700 font-medium"
                  >Lihat</a>
                  <span v-if="mat.fileUrl !== '#'" class="text-gray-300">|</span>
                  <a
                    v-if="mat.fileUrl !== '#'"
                    :href="fileDownloadUrl(mat.fileUrl)"
                    class="text-gray-500 hover:text-gray-700 font-medium"
                  >Unduh</a>
                  <span class="text-gray-300">|</span>
                  <button @click="toggleMaterial(mat)" class="font-medium" :class="mat.isPublished ? 'text-emerald-600 hover:text-emerald-700' : 'text-gray-400 hover:text-gray-600'">
                    {{ mat.isPublished ? 'Unpublish' : 'Publish' }}
                  </button>
                  <span class="text-gray-300">|</span>
                  <button @click="removeMaterial(mat)" class="text-red-500 hover:text-red-700 font-medium">Hapus</button>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-400 text-center py-8">Belum ada materi di bab ini</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Mobile chapter select -->
    <div class="lg:hidden mt-4">
      <label class="text-xs font-semibold text-gray-600">Pilih Bab</label>
      <select v-model="selectedId" class="input-field mt-1" @change="onSelectMobile">
        <option value="">— Pilih Bab —</option>
        <option v-for="ch in chapters" :key="ch._id" :value="ch._id">Bab {{ ch.order }} — {{ ch.title }}</option>
      </select>
    </div>

    <!-- ADD MATERIAL MODAL -->
    <div v-if="showAddMat" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showAddMat = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold mb-4">Tambah Materi — {{ selectedChapter?.title }}</h3>
        <form @submit.prevent="handleAddMaterial" class="space-y-3">
          <div v-if="modalError" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{{ modalError }}</div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Judul Materi</label>
            <input v-model="matForm.title" type="text" class="input-field mt-1" required />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">File (PDF / PPT / PPTX)</label>
            <input
              ref="fileInput"
              type="file"
              accept=".pdf,.ppt,.pptx"
              class="block w-full text-sm text-gray-600 mt-1
                file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 cursor-pointer"
              @change="onFileChange"
            />
            <p v-if="matForm.fileName" class="text-[11px] text-gray-500 mt-1">
              {{ matForm.fileName }} · {{ matForm.fileSize }}
            </p>
          </div>
          <div v-if="!matForm.fileName" class="text-[11px] text-gray-400 -mt-1">
            Tipe file dan ukuran otomatis terdeteksi dari file yang dipilih.
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showAddMat = false" class="btn-secondary text-sm">Batal</button>
            <button type="submit" class="btn-primary text-sm" :disabled="submitting">{{ submitting ? 'Mengunggah...' : 'Unggah & Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chapter, MaterialItem } from '~/types';

definePageMeta({ layout: 'dashboard' });

const api = useApi();
const { fileUrl, fileDownloadUrl } = useFileUrl();
const chapters = ref<Chapter[]>([]);
const loadingChapters = ref(true);
const selectedChapter = ref<Chapter | null>(null);
const selectedId = ref('');
const submitting = ref(false);
const modalError = ref('');

const showAddMat = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const matForm = reactive({ title: '', type: 'pdf' as string, fileUrl: '', fileSize: '1 MB', fileName: '' });

async function fetchChapters() {
  try {
    const res = await api.get<Chapter[]>('/admin/chapters');
    if (res.success && res.data) {
      chapters.value = res.data;
      if (selectedChapter.value) {
        const updated = res.data.find((c) => c._id === selectedChapter.value!._id);
        if (updated) selectedChapter.value = updated;
        else selectedChapter.value = res.data[0] ?? null;
      } else {
        selectedChapter.value = res.data[0] ?? null;
      }
      selectedId.value = selectedChapter.value?._id ?? '';
    }
  } finally {
    loadingChapters.value = false;
  }
}

function onSelectMobile() {
  selectedChapter.value = chapters.value.find((c) => c._id === selectedId.value) ?? null;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!['pdf', 'ppt', 'pptx'].includes(ext)) {
    selectedFile.value = null;
    matForm.fileName = '';
    modalError.value = 'Format file harus PDF, PPT, atau PPTX';
    return;
  }
  modalError.value = '';
  selectedFile.value = file;
  matForm.fileName = file.name;
  matForm.fileSize = formatSize(file.size);
  matForm.type = ext === 'pdf' ? 'pdf' : ext === 'pptx' ? 'pptx' : 'ppt';
}

function openAddMaterial() {
  matForm.title = ''; matForm.type = 'pdf'; matForm.fileUrl = ''; matForm.fileSize = ''; matForm.fileName = '';
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
  modalError.value = '';
  showAddMat.value = true;
}

async function handleAddMaterial() {
  if (!selectedChapter.value) return;
  if (!selectedFile.value) {
    modalError.value = 'Pilih file terlebih dahulu';
    return;
  }
  if (!matForm.title.trim()) {
    modalError.value = 'Judul materi wajib diisi';
    return;
  }
  modalError.value = '';
  submitting.value = true;

  const fd = new FormData();
  fd.append('file', selectedFile.value);
  const upRes = await api.upload<{ fileUrl: string; fileName: string; fileSize: string; type: string }>('/admin/upload', fd);
  if (!upRes.success || !upRes.data) {
    modalError.value = upRes.message || 'Gagal mengunggah file';
    submitting.value = false;
    return;
  }

  const res = await api.post(`/admin/chapters/${selectedChapter.value._id}/materials`, {
    title: matForm.title,
    type: upRes.data.type,
    fileUrl: upRes.data.fileUrl,
    fileSize: upRes.data.fileSize,
  });
  if (res.success) { showAddMat.value = false; fetchChapters(); }
  else modalError.value = res.message;
  submitting.value = false;
}

async function toggleMaterial(mat: MaterialItem) {
  if (!selectedChapter.value) return;
  await api.patch(`/admin/chapters/${selectedChapter.value._id}/materials/${mat._id}/toggle`);
  fetchChapters();
}

async function removeMaterial(mat: MaterialItem) {
  if (!selectedChapter.value) return;
  if (!confirm(`Hapus materi "${mat.title}"?`)) return;
  await api.del(`/admin/chapters/${selectedChapter.value._id}/materials/${mat._id}`);
  fetchChapters();
}

onMounted(fetchChapters);
</script>
