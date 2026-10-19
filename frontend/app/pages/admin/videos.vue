<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Bisindo</h2>
        <p class="text-sm text-gray-500">Kelola Bisindo per bab</p>
      </div>
      <button @click="openAddModal" class="btn-primary text-sm">
        + Tambah Video
      </button>
    </div>

    <!-- Videos table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
              >
                Judul
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
              >
                Bab
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
              >
                URL
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
              >
                Status
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="v in videos" :key="v._id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <p class="font-medium text-gray-900">{{ v.title }}</p>
                <p class="text-xs text-gray-500 truncate max-w-xs">
                  {{ v.description }}
                </p>
              </td>
              <td class="px-4 py-3 text-gray-600 text-xs">
                Bab {{ (v.chapterId as any)?.order }} -
                {{ (v.chapterId as any)?.title }}
              </td>
              <td
                class="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate"
              >
                {{ v.videoUrl }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="
                    v.isPublished
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  "
                >
                  {{ v.isPublished ? "Published" : "Draft" }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2 text-xs">
                  <button
                    @click="togglePublish(v)"
                    class="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    {{ v.isPublished ? "Unpublish" : "Publish" }}
                  </button>
                  <button
                    @click="handleDelete(v)"
                    class="text-red-600 hover:text-red-800 font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="videos.length === 0">
              <td colspan="5" class="px-4 py-12 text-center text-gray-400">
                Belum ada video
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ADD MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">Tambah Video</h3>
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <div
            v-if="modalError"
            class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm"
          >
            {{ modalError }}
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Bab</label>
            <select v-model="form.chapterId" class="input-field mt-1" required>
              <option value="" disabled>Pilih bab</option>
              <option v-for="ch in chapters" :key="ch._id" :value="ch._id">
                Bab {{ ch.order }} - {{ ch.title }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600"
              >Judul Video</label
            >
            <input
              v-model="form.title"
              type="text"
              class="input-field mt-1"
              required
            />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Deskripsi</label>
            <textarea
              v-model="form.description"
              class="input-field mt-1"
              rows="2"
            />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600"
              >URL Video (YouTube / Vimeo — watch atau embed)</label
            >
            <input
              v-model="form.videoUrl"
              type="text"
              class="input-field mt-1"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>
          <div v-if="embedSrc(form.videoUrl)" class="rounded-lg overflow-hidden border border-gray-200">
            <iframe
              :src="embedSrc(form.videoUrl)"
              class="w-full aspect-video"
              frameborder="0"
              allowfullscreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          <p v-else-if="form.videoUrl" class="text-[11px] text-amber-600">
            URL belum bisa di-embed — siswa tetap bisa membuka link di tab baru.
          </p>
          <div>
            <label class="text-xs font-semibold text-gray-600">Urutan</label>
            <input
              v-model.number="form.order"
              type="number"
              min="1"
              class="input-field mt-1"
            />
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="showModal = false"
              class="btn-secondary text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn-primary text-sm"
              :disabled="submitting"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chapter, Video } from "~/types";

definePageMeta({ layout: "dashboard" });

const api = useApi();
const { embedSrc } = useVideoEmbed();
const chapters = ref<Chapter[]>([]);
const videos = ref<Video[]>([]);
const submitting = ref(false);
const modalError = ref("");
const showModal = ref(false);

const form = reactive({
  chapterId: "",
  title: "",
  description: "",
  videoUrl: "",
  order: 1,
});

async function fetchAll() {
  const [chRes, vRes] = await Promise.all([
    api.get<Chapter[]>("/chapters"),
    api.get<Video[]>("/admin/videos"),
  ]);
  if (chRes.success && chRes.data) chapters.value = chRes.data;
  if (vRes.success && vRes.data) videos.value = vRes.data;
}

function openAddModal() {
  form.chapterId = chapters.value[0]?._id || "";
  form.title = "";
  form.description = "";
  form.videoUrl = "";
  form.order = 1;
  modalError.value = "";
  showModal.value = true;
}

async function handleSubmit() {
  modalError.value = "";
  submitting.value = true;
  const res = await api.post("/admin/videos", form);
  if (res.success) {
    showModal.value = false;
    fetchAll();
  } else modalError.value = res.message;
  submitting.value = false;
}

async function togglePublish(v: Video) {
  await api.patch(`/admin/videos/${v._id}/toggle`);
  fetchAll();
}

async function handleDelete(v: Video) {
  if (!confirm(`Hapus video "${v.title}"?`)) return;
  await api.del(`/admin/videos/${v._id}`);
  fetchAll();
}

onMounted(fetchAll);
</script>
