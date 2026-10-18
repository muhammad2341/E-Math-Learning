<template>
  <div>
    <!-- ═══ VIEW: DAFTAR QUIZ ═══ -->
    <template v-if="!selectedQuiz">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Latihan Soal</h2>
          <p class="text-sm text-gray-500">Kelola quiz latihan dan soal di dalamnya</p>
        </div>
        <button @click="openAddQuiz" class="btn-primary text-sm">+ Buat Quiz</button>
      </div>

      <!-- Filter -->
      <div class="card mb-6">
        <select v-model="chapterFilter" class="input-field max-w-xs" @change="fetchQuizzes">
          <option value="">Semua Bab</option>
          <option v-for="ch in chapters" :key="ch._id" :value="ch._id">Bab {{ ch.order }} - {{ ch.title }}</option>
        </select>
      </div>

      <!-- Quiz list -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="quiz in quizzes"
          :key="quiz._id"
          class="card cursor-pointer hover:shadow-md transition-shadow"
          @click="openQuiz(quiz)"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="quiz.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
            >
              {{ quiz.isPublished ? 'Published' : 'Draft' }}
            </span>
            <div class="flex items-center gap-1" @click.stop>
              <button @click="toggleQuizPublish(quiz)" class="text-[11px] text-gray-500 hover:text-gray-700">
                {{ quiz.isPublished ? 'Unpublish' : 'Publish' }}
              </button>
              <span class="text-gray-300">|</span>
              <button @click="removeQuiz(quiz)" class="text-[11px] text-red-500 hover:text-red-700">Hapus</button>
            </div>
          </div>
          <h3 class="text-base font-semibold text-gray-900 mb-1">{{ quiz.title }}</h3>
          <p class="text-xs text-gray-500 line-clamp-2 mb-2">{{ quiz.description || 'Tanpa deskripsi' }}</p>
          <div v-if="quiz.startTime || quiz.endTime || quiz.durationMinutes" class="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mb-2">
            <span v-if="quiz.startTime" class="inline-flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Mulai: {{ formatDateTime(quiz.startTime) }}
            </span>
            <span v-if="quiz.endTime" class="inline-flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Tenggat: {{ formatDateTime(quiz.endTime) }}
            </span>
            <span v-if="quiz.durationMinutes" class="inline-flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ quiz.durationMinutes }} menit
            </span>
          </div>
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              Bab {{ getChapterOrder(quiz) }} — {{ getChapterTitle(quiz) }}
            </span>
            <span class="font-semibold text-gray-600">{{ quiz.questionCount || 0 }} soal</span>
          </div>
        </div>

        <div v-if="quizzes.length === 0" class="card text-center text-gray-400 py-12 col-span-full">
          Belum ada quiz. Klik "+ Buat Quiz" untuk memulai.
        </div>
      </div>
    </template>

    <!-- ═══ VIEW: DETAIL QUIZ (KELOLA SOAL) ═══ -->
    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div class="flex items-center gap-3 min-w-0">
          <button @click="closeQuiz" class="text-gray-400 hover:text-gray-600 shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="min-w-0">
            <h2 class="text-xl font-bold text-gray-900 truncate">{{ selectedQuiz.title }}</h2>
            <p class="text-xs text-gray-500">
              {{ getChapterTitle(selectedQuiz) }} · {{ questions.length }} soal
            </p>
          </div>
        </div>
        <button @click="openAddQuestion" class="btn-primary text-sm">+ Tambah Soal</button>
      </div>

      <!-- Quiz info -->
      <div class="card mb-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm text-gray-600">{{ selectedQuiz.description || 'Tanpa deskripsi' }}</p>
            <div class="mt-2 flex items-center gap-2">
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="selectedQuiz.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
              >
                {{ selectedQuiz.isPublished ? 'Published' : 'Draft' }}
              </span>
            </div>
          </div>
          <button @click="openEditQuiz(selectedQuiz)" class="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0">
            Edit Quiz
          </button>
        </div>
      </div>

      <!-- Questions list -->
      <div class="space-y-3">
        <div v-for="(q, idx) in questions" :key="q._id" class="card">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Soal {{ idx + 1 }}</span>
              </div>
              <p class="text-sm font-medium text-gray-900">{{ q.questionText }}</p>
              <div class="grid grid-cols-2 gap-1 mt-2 text-xs">
                <div
                  v-for="opt in q.options"
                  :key="opt.key"
                  class="flex items-center gap-1.5"
                  :class="opt.key === q.correctAnswer ? 'text-emerald-700 font-bold' : 'text-gray-500'"
                >
                  <span>{{ opt.key }}.</span> {{ opt.text }}
                  <span v-if="opt.key === q.correctAnswer">✓</span>
                </div>
              </div>
              <p v-if="q.explanation" class="text-xs text-gray-500 mt-2 italic">
                Pembahasan: {{ q.explanation }}
              </p>
            </div>
            <div class="flex items-center gap-2 text-xs shrink-0">
              <button @click="openEditQuestion(q)" class="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
              <button @click="removeQuestion(q)" class="text-red-600 hover:text-red-800 font-medium">Hapus</button>
            </div>
          </div>
        </div>

        <div v-if="questions.length === 0" class="card text-center text-gray-400 py-12">
          Belum ada soal. Klik "+ Tambah Soal" untuk menambahkan.
        </div>
      </div>
    </template>

    <!-- ═══ MODAL: ADD/EDIT QUIZ ═══ -->
    <div v-if="showQuizModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showQuizModal = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold mb-4">{{ editQuizId ? 'Edit Quiz' : 'Buat Quiz Baru' }}</h3>
        <form @submit.prevent="handleSaveQuiz" class="space-y-3">
          <div v-if="modalError" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{{ modalError }}</div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Bab</label>
            <select v-model="quizForm.chapterId" class="input-field mt-1" required>
              <option value="" disabled>Pilih bab</option>
              <option v-for="ch in chapters" :key="ch._id" :value="ch._id">Bab {{ ch.order }} - {{ ch.title }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Judul Quiz</label>
            <input v-model="quizForm.title" type="text" class="input-field mt-1" placeholder="Misal: Latihan Bilangan Bulat" required />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Deskripsi (opsional)</label>
            <textarea v-model="quizForm.description" rows="2" class="input-field mt-1" placeholder="Deskripsi singkat quiz..."></textarea>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="text-xs font-semibold text-gray-600">Waktu Mulai</label>
              <input v-model="quizForm.startTime" type="datetime-local" class="input-field mt-1" />
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600">Tenggat (Selesai)</label>
              <input v-model="quizForm.endTime" type="datetime-local" class="input-field mt-1" />
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600">Durasi (menit)</label>
              <input v-model.number="quizForm.durationMinutes" type="number" min="1" max="600" class="input-field mt-1" placeholder="30" />
            </div>
          </div>
          <p class="text-[11px] text-gray-400 -mt-1">Ketiga kolom opsional. Durasi = batas waktu mengerjakan setelah mulai.</p>
          <div>
            <label class="text-xs font-semibold text-gray-600">Status</label>
            <select v-model="quizForm.isPublished" class="input-field mt-1">
              <option :value="false">Draft</option>
              <option :value="true">Published</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showQuizModal = false" class="btn-secondary text-sm">Batal</button>
            <button type="submit" class="btn-primary text-sm" :disabled="submitting">{{ submitting ? 'Menyimpan...' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══ MODAL: ADD/EDIT QUESTION ═══ -->
    <div v-if="showQuestionModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showQuestionModal = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">{{ editQuestionId ? 'Edit Soal' : 'Tambah Soal' }}</h3>
        <form @submit.prevent="handleSaveQuestion" class="space-y-3">
          <div v-if="modalError" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{{ modalError }}</div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Pertanyaan</label>
            <textarea v-model="questionForm.questionText" class="input-field mt-1" rows="2" required />
          </div>
          <div class="grid grid-cols-1 gap-2">
            <div v-for="key in ['A', 'B', 'C', 'D']" :key="key">
              <label class="text-xs font-semibold text-gray-600">Opsi {{ key }}</label>
              <input v-model="questionForm.options[key]" type="text" class="input-field mt-1" required />
            </div>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Jawaban Benar</label>
            <select v-model="questionForm.correctAnswer" class="input-field mt-1" required>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Pembahasan (opsional)</label>
            <textarea v-model="questionForm.explanation" class="input-field mt-1" rows="2" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Urutan</label>
            <input v-model.number="questionForm.order" type="number" min="1" class="input-field mt-1" />
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showQuestionModal = false" class="btn-secondary text-sm">Batal</button>
            <button type="submit" class="btn-primary text-sm" :disabled="submitting">{{ submitting ? 'Menyimpan...' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chapter, Quiz, PracticeQuestionFull } from '~/types';

definePageMeta({ layout: 'dashboard' });

const api = useApi();
const chapters = ref<Chapter[]>([]);
const quizzes = ref<Quiz[]>([]);
const chapterFilter = ref('');

// Quiz detail
const selectedQuiz = ref<Quiz | null>(null);
const questions = ref<PracticeQuestionFull[]>([]);

// Quiz modal
const showQuizModal = ref(false);
const editQuizId = ref<string | null>(null);
const quizForm = reactive({ chapterId: '', title: '', description: '', startTime: '', endTime: '', durationMinutes: undefined as number | undefined, isPublished: false });

// Question modal
const showQuestionModal = ref(false);
const editQuestionId = ref<string | null>(null);
const questionForm = reactive({
  questionText: '',
  options: { A: '', B: '', C: '', D: '' },
  correctAnswer: 'A',
  explanation: '',
  order: 1,
});

const submitting = ref(false);
const modalError = ref('');

function getChapterOrder(quiz: Quiz): number | '?' {
  if (typeof quiz.chapterId === 'object') return quiz.chapterId.order;
  const ch = chapters.value.find((c) => c._id === quiz.chapterId);
  return ch?.order ?? '?';
}

function getChapterTitle(quiz: Quiz): string {
  if (typeof quiz.chapterId === 'object') return quiz.chapterId.title;
  const ch = chapters.value.find((c) => c._id === quiz.chapterId);
  return ch?.title ?? 'Bab ?';
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Fetch ───

async function fetchChapters() {
  const res = await api.get<Chapter[]>('/chapters');
  if (res.success && res.data) chapters.value = res.data;
}

async function fetchQuizzes() {
  const params = chapterFilter.value ? `?chapterId=${chapterFilter.value}` : '';
  const res = await api.get<Quiz[]>(`/admin/practice/quizzes${params}`);
  if (res.success && res.data) quizzes.value = res.data;
}

async function fetchQuestions() {
  if (!selectedQuiz.value) return;
  const res = await api.get<{ quiz: Quiz; questions: PracticeQuestionFull[] }>(
    `/admin/practice/quizzes/${selectedQuiz.value._id}/questions`
  );
  if (res.success && res.data) {
    selectedQuiz.value = res.data.quiz;
    questions.value = res.data.questions;
  }
}

// ─── Quiz CRUD ───

function openAddQuiz() {
  editQuizId.value = null;
  quizForm.chapterId = chapters.value[0]?._id || '';
  quizForm.title = '';
  quizForm.description = '';
  quizForm.startTime = '';
  quizForm.endTime = '';
  quizForm.durationMinutes = undefined;
  quizForm.isPublished = false;
  modalError.value = '';
  showQuizModal.value = true;
}

function openEditQuiz(quiz: Quiz) {
  editQuizId.value = quiz._id;
  quizForm.chapterId = typeof quiz.chapterId === 'object' ? quiz.chapterId._id : quiz.chapterId;
  quizForm.title = quiz.title;
  quizForm.description = quiz.description;
  quizForm.startTime = quiz.startTime ? toLocalDatetime(quiz.startTime) : '';
  quizForm.endTime = quiz.endTime ? toLocalDatetime(quiz.endTime) : '';
  quizForm.durationMinutes = quiz.durationMinutes;
  quizForm.isPublished = quiz.isPublished;
  modalError.value = '';
  showQuizModal.value = true;
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function handleSaveQuiz() {
  modalError.value = '';
  submitting.value = true;

  const body: Record<string, unknown> = {
    chapterId: quizForm.chapterId,
    title: quizForm.title,
    description: quizForm.description,
    isPublished: quizForm.isPublished,
  };
  if (quizForm.startTime) body.startTime = new Date(quizForm.startTime).toISOString();
  else body.startTime = null;
  if (quizForm.endTime) body.endTime = new Date(quizForm.endTime).toISOString();
  else body.endTime = null;
  if (quizForm.durationMinutes) body.durationMinutes = quizForm.durationMinutes;
  else body.durationMinutes = null;

  const res = editQuizId.value
    ? await api.put(`/admin/practice/quizzes/${editQuizId.value}`, body)
    : await api.post('/admin/practice/quizzes', body);

  if (res.success) {
    showQuizModal.value = false;
    fetchQuizzes();
  } else {
    modalError.value = res.message;
  }
  submitting.value = false;
}

async function toggleQuizPublish(quiz: Quiz) {
  await api.put(`/admin/practice/quizzes/${quiz._id}`, { isPublished: !quiz.isPublished });
  fetchQuizzes();
}

async function removeQuiz(quiz: Quiz) {
  if (!confirm(`Hapus quiz "${quiz.title}"? Semua soal di dalamnya ikut terhapus.`)) return;
  await api.del(`/admin/practice/quizzes/${quiz._id}`);
  fetchQuizzes();
}

// ─── Quiz Detail ───

function openQuiz(quiz: Quiz) {
  selectedQuiz.value = quiz;
  questions.value = [];
  fetchQuestions();
}

function closeQuiz() {
  selectedQuiz.value = null;
  questions.value = [];
}

// ─── Question CRUD ───

function openAddQuestion() {
  editQuestionId.value = null;
  questionForm.questionText = '';
  questionForm.options = { A: '', B: '', C: '', D: '' };
  questionForm.correctAnswer = 'A';
  questionForm.explanation = '';
  questionForm.order = questions.value.length + 1;
  modalError.value = '';
  showQuestionModal.value = true;
}

function openEditQuestion(q: PracticeQuestionFull) {
  editQuestionId.value = q._id;
  questionForm.questionText = q.questionText;
  q.options.forEach((o) => { questionForm.options[o.key] = o.text; });
  questionForm.correctAnswer = q.correctAnswer;
  questionForm.explanation = q.explanation;
  questionForm.order = q.order;
  modalError.value = '';
  showQuestionModal.value = true;
}

async function handleSaveQuestion() {
  if (!selectedQuiz.value) return;
  modalError.value = '';
  submitting.value = true;

  const body = {
    quizId: selectedQuiz.value._id,
    questionText: questionForm.questionText,
    options: ['A', 'B', 'C', 'D'].map((k) => ({
      key: k,
      text: questionForm.options[k as keyof typeof questionForm.options],
    })),
    correctAnswer: questionForm.correctAnswer,
    explanation: questionForm.explanation,
    order: questionForm.order,
  };

  const res = editQuestionId.value
    ? await api.put(`/admin/practice/questions/${editQuestionId.value}`, body)
    : await api.post('/admin/practice/questions', body);

  if (res.success) {
    showQuestionModal.value = false;
    fetchQuestions();
    fetchQuizzes();
  } else {
    modalError.value = res.message;
  }
  submitting.value = false;
}

async function removeQuestion(q: PracticeQuestionFull) {
  if (!confirm('Hapus soal ini?')) return;
  await api.del(`/admin/practice/questions/${q._id}`);
  fetchQuestions();
  fetchQuizzes();
}

onMounted(() => { fetchChapters().then(fetchQuizzes); });
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
