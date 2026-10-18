<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Latihan Soal</h2>
      <p class="text-sm text-gray-500">Pilih bab → pilih quiz → kerjakan latihan</p>
    </div>

    <!-- ═══ STEP 1: PILIH BAB ═══ -->
    <template v-if="!selectedChapterSlug && !selectedQuizId">
      <div class="card">
        <label class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pilih Bab</label>
        <div class="mt-3 space-y-2">
          <button
            v-for="ch in chapterList"
            :key="ch.slug"
            class="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
            @click="selectChapter(ch.slug)"
          >
            <span class="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mr-2">Bab {{ ch.order }}</span>
            <span class="text-sm font-medium text-gray-800">{{ ch.title }}</span>
          </button>
          <div v-if="!loadingChapters && chapterList.length === 0" class="text-sm text-gray-400 text-center py-8">Data kosong</div>
          <div v-else-if="loadingChapters" class="text-sm text-gray-400 text-center py-8">Memuat bab...</div>
        </div>
      </div>
    </template>

    <!-- ═══ STEP 2: PILIH QUIZ DALAM BAB ═══ -->
    <template v-if="selectedChapterSlug && !selectedQuizId">
      <div class="mb-4">
        <button @click="backToChapters" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke daftar bab
        </button>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ currentChapter?.title }}</h3>
        <p class="text-sm text-gray-500 mb-4">{{ currentChapter?.description }}</p>

        <p class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Daftar Quiz</p>
        <div class="space-y-2">
          <button
            v-for="quiz in quizList"
            :key="quiz._id"
            class="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
            :class="{ 'opacity-50 cursor-not-allowed': isQuizLocked(quiz) }"
            :disabled="isQuizLocked(quiz)"
            @click="!isQuizLocked(quiz) && selectQuiz(quiz._id)"
          >
            <div class="flex items-center justify-between">
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ quiz.title }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ quiz.description || 'Latihan soal' }}</p>
                <div v-if="quiz.startTime || quiz.endTime || quiz.durationMinutes" class="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-400">
                  <span v-if="quiz.startTime" class="inline-flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Mulai: {{ formatDateTime(quiz.startTime) }}
                  </span>
                  <span v-if="quiz.endTime" class="inline-flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Tenggat: {{ formatDateTime(quiz.endTime) }}
                  </span>
                  <span v-if="quiz.durationMinutes" class="inline-flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {{ quiz.durationMinutes }} menit
                  </span>
                </div>
                <p v-if="isQuizLocked(quiz)" class="text-[11px] text-amber-600 mt-1 font-medium">
                  {{ lockReason(quiz) }}
                </p>
              </div>
              <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full shrink-0 ml-2">
                {{ quiz.questionCount }} soal
              </span>
            </div>
          </button>
          <div v-if="quizList.length === 0 && !loadingQuizzes" class="text-sm text-gray-400 text-center py-8">
            Data kosong — belum ada quiz di bab ini
          </div>
          <div v-if="loadingQuizzes" class="text-sm text-gray-400 text-center py-8">Memuat quiz...</div>
        </div>
      </div>
    </template>

    <!-- ═══ STEP 3: KERJAKAN QUIZ ═══ -->
    <template v-if="selectedQuizId && !result">
      <div class="mb-4">
        <button @click="backToQuizzes" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke daftar quiz
        </button>
      </div>

      <!-- Quiz header + history -->
      <div class="card mb-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-gray-900">{{ currentQuiz?.title }}</h3>
            <p class="text-xs text-gray-500">{{ currentQuiz?.description }}</p>
          </div>
        </div>
        <div v-if="attempts.length" class="mt-3 flex flex-wrap gap-2">
          <span class="text-xs text-gray-500">Riwayat:</span>
          <span
            v-for="(a, i) in attempts.slice(0, 5)"
            :key="a._id"
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="a.score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
          >
            #{{ attempts.length - i }}: {{ a.score }}
          </span>
        </div>
      </div>

      <!-- Questions -->
      <div v-if="questions.length" class="card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-semibold text-gray-700">{{ questions.length }} Soal</p>
          <p class="text-xs text-gray-500">Jawaban: {{ answeredCount }}/{{ questions.length }}</p>
        </div>

        <div v-for="(q, idx) in questions" :key="q._id" class="border-b border-gray-100 last:border-0 pb-4 mb-4 last:mb-0 last:pb-0">
          <p class="text-sm font-medium text-gray-800 mb-3">
            <span class="text-blue-600 font-bold mr-1">Soal {{ idx + 1 }}.</span>
            {{ q.questionText }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              v-for="opt in q.options"
              :key="opt.key"
              @click="selectAnswer(q._id, opt.key)"
              class="flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition"
              :class="selectedAnswers[q._id] === opt.key
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
            >
              <span class="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0"
                :class="selectedAnswers[q._id] === opt.key ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'"
              >{{ opt.key }}</span>
              {{ opt.text }}
            </button>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <button @click="submitPractice" class="btn-primary w-full" :disabled="submitting || answeredCount < questions.length">
            {{ submitting ? 'Menilai...' : 'Kirim Jawaban' }}
          </button>
        </div>
      </div>

      <div v-if="!questions.length && !loading" class="card text-center text-gray-400 py-12">
        Belum ada soal di quiz ini
      </div>
      <div v-if="loading" class="card text-center text-gray-400 py-12">Memuat soal...</div>
    </template>

    <!-- ═══ HASIL ═══ -->
    <template v-if="result">
      <div class="space-y-4">
        <div class="card text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <p class="text-sm text-blue-200">Hasil Latihan</p>
          <p class="text-5xl font-bold mt-1">{{ result.score }}</p>
          <p class="text-blue-200 text-sm mt-1">{{ result.correctCount }} benar dari {{ result.totalQuestions }} soal</p>
          <button @click="resetPractice" class="mt-4 bg-white text-blue-700 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">
            Ulangi Latihan
          </button>
        </div>

        <div v-for="(r, idx) in result.review" :key="r._id" class="card" :class="r.isCorrect ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500'">
          <div class="flex items-start gap-3">
            <span class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
              :class="r.isCorrect ? 'bg-emerald-500' : 'bg-red-500'"
            >{{ r.isCorrect ? '✓' : '✕' }}</span>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-800">Soal {{ idx + 1 }}: {{ r.questionText }}</p>
              <div class="mt-2 space-y-1 text-xs">
                <p :class="r.isCorrect ? 'text-emerald-700' : 'text-red-600'">
                  Jawaban Anda: <strong>{{ r.selectedOption || '(tidak dijawab)' }}</strong>
                  <span v-if="!r.isCorrect && r.correctAnswer" class="text-gray-600"> — Jawaban Benar: <strong>{{ r.correctAnswer }}</strong></span>
                </p>
                <div v-if="r.explanation" class="bg-gray-50 rounded-lg p-3 mt-2">
                  <p class="text-xs font-semibold text-gray-600 mb-1">Pembahasan:</p>
                  <p class="text-xs text-gray-600">{{ r.explanation }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button @click="resetPractice" class="btn-secondary w-full">Kembali ke Pilihan Quiz</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Chapter, Quiz, PracticeQuestion, PracticeAttemptMeta, PracticeResult } from '~/types';

definePageMeta({ layout: 'dashboard' });

const api = useApi();
const chapterList = ref<Chapter[]>([]);
const loadingChapters = ref(true);
const quizList = ref<Quiz[]>([]);
const selectedChapterSlug = ref('');
const selectedQuizId = ref('');
const questions = ref<PracticeQuestion[]>([]);
const attempts = ref<PracticeAttemptMeta[]>([]);
const selectedAnswers = reactive<Record<string, string>>({});
const result = ref<PracticeResult | null>(null);
const submitting = ref(false);
const loading = ref(false);
const loadingQuizzes = ref(false);

const currentChapter = computed(() =>
  chapterList.value.find((c) => c.slug === selectedChapterSlug.value)
);
const currentQuiz = computed(() =>
  quizList.value.find((q) => q._id === selectedQuizId.value)
);

const answeredCount = computed(() =>
  Object.keys(selectedAnswers).filter((k) => selectedAnswers[k]).length
);

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function isQuizLocked(quiz: Quiz): boolean {
  const now = new Date();
  if (quiz.startTime && new Date(quiz.startTime) > now) return true;
  if (quiz.endTime && new Date(quiz.endTime) < now) return true;
  return false;
}

function lockReason(quiz: Quiz): string {
  const now = new Date();
  if (quiz.startTime && new Date(quiz.startTime) > now) return 'Belum dibuka';
  if (quiz.endTime && new Date(quiz.endTime) < now) return 'Tenggat waktu telah berakhir';
  return 'Belum dapat dikerjakan';
}

function selectAnswer(questionId: string, key: string) {
  selectedAnswers[questionId] = key;
}

function backToChapters() {
  selectedChapterSlug.value = '';
  quizList.value = [];
}

function backToQuizzes() {
  selectedQuizId.value = '';
  questions.value = [];
  attempts.value = [];
  result.value = null;
  Object.keys(selectedAnswers).forEach((k) => delete selectedAnswers[k]);
}

async function selectChapter(slug: string) {
  selectedChapterSlug.value = slug;
  loadingQuizzes.value = true;
  const res = await api.get<{ chapter: Chapter; quizzes: Quiz[] }>(`/practice/chapter/${slug}`);
  if (res.success && res.data) {
    quizList.value = res.data.quizzes;
  }
  loadingQuizzes.value = false;
}

async function selectQuiz(quizId: string) {
  selectedQuizId.value = quizId;
  loading.value = true;
  result.value = null;
  Object.keys(selectedAnswers).forEach((k) => delete selectedAnswers[k]);

  const res = await api.get<{
    quiz: { _id: string; title: string; description: string };
    questions: PracticeQuestion[];
    attempts: PracticeAttemptMeta[];
  }>(`/practice/${quizId}`);

  if (res.success && res.data) {
    questions.value = res.data.questions;
    attempts.value = res.data.attempts;
  }
  loading.value = false;
}

async function submitPractice() {
  submitting.value = true;
  const answers = questions.value
    .filter((q) => selectedAnswers[q._id])
    .map((q) => ({
      questionId: q._id,
      selectedOption: selectedAnswers[q._id] as 'A' | 'B' | 'C' | 'D',
    }));

  const res = await api.post<PracticeResult>(`/practice/${selectedQuizId.value}/submit`, { answers });
  if (res.success && res.data) {
    result.value = res.data;
    questions.value = [];
  }
  submitting.value = false;
}

function resetPractice() {
  result.value = null;
  questions.value = [];
  Object.keys(selectedAnswers).forEach((k) => delete selectedAnswers[k]);
}

onMounted(async () => {
  try {
    const res = await api.get<Chapter[]>('/chapters');
    if (res.success && res.data) chapterList.value = res.data;
  } finally {
    loadingChapters.value = false;
  }
});
</script>
