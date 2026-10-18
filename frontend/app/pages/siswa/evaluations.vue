<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Evaluasi</h2>
      <p class="text-sm text-gray-500">Ujian evaluasi per bab — hasil diverifikasi oleh Admin</p>
    </div>

    <!-- ═══ STEP 1: PILIH BAB ═══ -->
    <template v-if="!selectedOrder && !selectedExamId">
      <div class="card">
        <label class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pilih Bab</label>
        <div class="mt-3 space-y-2">
          <button
            v-for="ch in chapterList"
            :key="ch._id"
            class="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
            @click="selectChapter(ch.order)"
          >
            <span class="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mr-2">Bab {{ ch.order }}</span>
            <span class="text-sm font-medium text-gray-800">{{ ch.title }}</span>
          </button>
          <div v-if="!loadingChapters && chapterList.length === 0" class="text-sm text-gray-400 text-center py-8">Data kosong</div>
          <div v-else-if="loadingChapters" class="text-sm text-gray-400 text-center py-8">Memuat bab...</div>
        </div>
      </div>
    </template>

    <!-- Locked -->
    <div v-if="locked && selectedOrder && !selectedExamId" class="mb-4">
      <button @click="backToChapters" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </button>
      <div class="card border-l-4 border-l-amber-500">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Ujian Terkunci</h3>
            <p class="text-sm text-gray-600 mt-1">{{ lockMessage }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ STEP 2: PILIH UJIAN DALAM BAB ═══ -->
    <template v-if="selectedOrder && !selectedExamId && !locked">
      <div class="mb-4">
        <button @click="backToChapters" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke daftar bab
        </button>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ chapterData?.title }}</h3>
        <p class="text-sm text-gray-500 mb-4">{{ chapterData?.description }}</p>

        <p class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Daftar Ujian</p>
        <div class="space-y-2">
          <div
            v-for="exam in examList"
            :key="exam._id"
            class="px-4 py-3 rounded-lg border border-gray-200"
            :class="exam.submission || isExamLocked(exam) ? 'bg-gray-50' : 'hover:border-blue-300 hover:bg-blue-50 cursor-pointer'"
            @click="!exam.submission && !isExamLocked(exam) && selectExam(exam._id)"
          >
            <div class="flex items-center justify-between">
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ exam.title }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ exam.description || 'Ujian evaluasi' }}</p>
                <div v-if="exam.startTime || exam.endTime || exam.durationMinutes" class="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-400">
                  <span v-if="exam.startTime" class="inline-flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Mulai: {{ formatDateTime(exam.startTime) }}
                  </span>
                  <span v-if="exam.endTime" class="inline-flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Tenggat: {{ formatDateTime(exam.endTime) }}
                  </span>
                  <span v-if="exam.durationMinutes" class="inline-flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {{ exam.durationMinutes }} menit
                  </span>
                </div>
                <span v-if="isExamLocked(exam) && !exam.submission" class="inline-flex items-center gap-1 mt-1 text-[11px] text-amber-600 font-medium">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  {{ examLockReason(exam) }}
                </span>
                <span v-if="exam.submission" class="inline-flex mt-2 px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="submissionBadgeClass(exam.submission.status)"
                >
                  {{ submissionStatusLabel(exam.submission.status) }}
                  <span v-if="exam.submission.finalScore !== null" class="ml-1">· Nilai: {{ exam.submission.finalScore }}</span>
                </span>
              </div>
              <div class="flex items-center gap-2 shrink-0 ml-2">
                <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {{ exam.questionCount }} soal
                </span>
                <button
                  v-if="!exam.submission && !isExamLocked(exam)"
                  class="btn-primary text-xs py-1.5 px-3"
                >
                  Mulai
                </button>
              </div>
            </div>
          </div>
          <div v-if="examList.length === 0 && !loadingExams" class="text-sm text-gray-400 text-center py-8">
            Data kosong — belum ada ujian di bab ini
          </div>
          <div v-if="loadingExams" class="text-sm text-gray-400 text-center py-8">Memuat ujian...</div>
        </div>
      </div>
    </template>

    <!-- ═══ STEP 3: KERJAKAN UJIAN ═══ -->
    <template v-if="selectedExamId && examData && !examData.submission">
      <div class="mb-4">
        <button @click="backToExams" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke daftar ujian
        </button>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-gray-900">{{ examData.exam.title }}</h3>
            <p class="text-xs text-gray-500 mt-1">
              {{ examData.questions.length }} soal • Kerjakan dengan cermat
            </p>
          </div>
          <p class="text-xs text-gray-500">{{ answeredCount }}/{{ examData.questions.length }}</p>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <svg class="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xs text-blue-700">
            <strong>Perhatian:</strong> Setelah dikirim, jawaban Anda akan direview Admin.
            Nilai hanya terlihat setelah Admin merilis hasil.
          </p>
        </div>

        <div v-for="(q, idx) in examData.questions" :key="q._id" class="border-b border-gray-100 last:border-0 pb-4 mb-4 last:mb-0 last:pb-0">
          <p class="text-sm font-medium text-gray-800 mb-3">
            <span class="text-blue-600 font-bold mr-1">Soal {{ idx + 1 }}.</span>
            {{ q.questionText }}
            <span class="text-xs text-gray-400 ml-2">({{ q.points }} poin)</span>
          </p>

          <!-- Multiple choice -->
          <div v-if="q.questionType === 'multiple_choice' && q.options" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              v-for="opt in q.options"
              :key="opt.key"
              @click="selectEvalAnswer(q._id, opt.key)"
              class="flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition"
              :class="evalAnswers[q._id] === opt.key
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
            >
              <span class="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0"
                :class="evalAnswers[q._id] === opt.key ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'"
              >{{ opt.key }}</span>
              {{ opt.text }}
            </button>
          </div>

          <!-- Fill in blank -->
          <div v-else>
            <input
              v-model="evalAnswers[q._id]"
              type="text"
              class="input-field"
              placeholder="Ketik jawaban Anda..."
            />
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <button
            @click="submitEvaluation"
            class="btn-primary w-full"
            :disabled="submitting || answeredCount < examData.questions.length"
          >
            {{ submitting ? 'Mengirim...' : 'Kirim Jawaban' }}
          </button>
        </div>
      </div>
    </template>

    <!-- ═══ SUDAH SUBMIT (STATUS) ═══ -->
    <template v-if="selectedExamId && examData?.submission">
      <div class="mb-4">
        <button @click="backToExams" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke daftar ujian
        </button>
      </div>

      <div class="space-y-4">
        <div class="card" :class="submissionCardClass">
          <div class="flex items-center justify-between">
            <div>
              <span class="inline-flex px-3 py-1 text-sm font-medium rounded-full" :class="submissionBadgeClass(examData.submission.status)">
                {{ submissionStatusLabel(examData.submission.status) }}
              </span>
              <p class="text-sm text-gray-600 mt-2">
                Dikirim: {{ formatDate(examData.submission.submittedAt) }}
              </p>
              <p v-if="examData.submission.verificationNotes" class="text-sm text-gray-600 mt-1 italic">
                Catatan: {{ examData.submission.verificationNotes }}
              </p>
            </div>
            <div v-if="examData.submission.finalScore !== null" class="text-right">
              <p class="text-xs text-gray-500">Nilai</p>
              <p class="text-4xl font-bold" :class="examData.submission.finalScore >= 70 ? 'text-emerald-600' : 'text-red-500'">
                {{ examData.submission.finalScore }}
              </p>
            </div>
            <div v-else class="text-right">
              <p class="text-sm text-gray-500 italic">Nilai belum dirilis</p>
            </div>
          </div>
        </div>

        <div v-if="examData.submission.status === 'REVISION_REQUIRED'" class="card bg-red-50 border-red-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm font-semibold text-red-700">Perlu Revisi</p>
          </div>
          <p class="text-sm text-red-600 mb-3">Anda perlu mengulangi ujian ini.</p>
          <button @click="startNewAttempt" class="btn-primary text-sm">Kerjakan Ulang</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Chapter, EvaluationForStudent, ExamForStudent } from '~/types';

definePageMeta({ layout: 'dashboard' });

const api = useApi();
const chapterList = ref<Chapter[]>([]);
const loadingChapters = ref(true);
const chapterData = ref<Chapter | null>(null);
const examList = ref<EvaluationForStudent['exams']>([]);
const selectedOrder = ref(0);
const selectedExamId = ref('');
const examData = ref<ExamForStudent | null>(null);
const locked = ref(false);
const lockMessage = ref('');
const evalAnswers = reactive<Record<string, string>>({});
const submitting = ref(false);
const loadingExams = ref(false);

const answeredCount = computed(() =>
  Object.keys(evalAnswers).filter((k) => evalAnswers[k]?.trim()).length
);

function submissionStatusLabel(s: string) {
  const map: Record<string, string> = {
    SUBMITTED: 'Dikirim',
    PENDING_REVIEW: 'Menunggu Review',
    VERIFIED: 'Terverifikasi',
    RELEASED: 'Sudah Dirilis',
    REVISION_REQUIRED: 'Perlu Revisi',
  };
  return map[s] || s;
}

function submissionBadgeClass(s: string) {
  const map: Record<string, string> = {
    PENDING_REVIEW: 'bg-amber-100 text-amber-700',
    SUBMITTED: 'bg-amber-100 text-amber-700',
    VERIFIED: 'bg-blue-100 text-blue-700',
    RELEASED: 'bg-emerald-100 text-emerald-700',
    REVISION_REQUIRED: 'bg-red-100 text-red-700',
  };
  return map[s] || 'bg-gray-100 text-gray-500';
}

const submissionCardClass = computed(() => {
  const s = examData.value?.submission?.status;
  if (s === 'RELEASED') return 'border-l-4 border-l-emerald-500';
  if (s === 'REVISION_REQUIRED') return 'border-l-4 border-l-red-500';
  return 'border-l-4 border-l-amber-500';
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function isExamLocked(exam: { startTime?: string; endTime?: string }): boolean {
  const now = new Date();
  if (exam.startTime && new Date(exam.startTime) > now) return true;
  if (exam.endTime && new Date(exam.endTime) < now) return true;
  return false;
}

function examLockReason(exam: { startTime?: string; endTime?: string }): string {
  const now = new Date();
  if (exam.startTime && new Date(exam.startTime) > now) return 'Belum dibuka';
  if (exam.endTime && new Date(exam.endTime) < now) return 'Tenggat waktu telah berakhir';
  return 'Belum dapat dikerjakan';
}

function selectEvalAnswer(questionId: string, key: string) {
  evalAnswers[questionId] = key;
}

function backToChapters() {
  selectedOrder.value = 0;
  chapterData.value = null;
  examList.value = [];
  locked.value = false;
  lockMessage.value = '';
}

function backToExams() {
  selectedExamId.value = '';
  examData.value = null;
  Object.keys(evalAnswers).forEach((k) => delete evalAnswers[k]);
}

async function selectChapter(order: number) {
  selectedOrder.value = order;
  loadingExams.value = true;
  locked.value = false;
  lockMessage.value = '';

  const res = await api.get<EvaluationForStudent>(`/evaluations/chapter/${order}`);
  if (res.success && res.data) {
    chapterData.value = res.data.chapter;
    examList.value = res.data.exams;
    locked.value = res.data.locked;
  } else {
    locked.value = true;
    lockMessage.value = res.message;
  }
  loadingExams.value = false;
}

async function selectExam(examId: string) {
  selectedExamId.value = examId;
  Object.keys(evalAnswers).forEach((k) => delete evalAnswers[k]);

  const res = await api.get<ExamForStudent>(`/evaluations/exam/${examId}`);
  if (res.success && res.data) {
    examData.value = res.data;
  } else {
    alert(res.message);
    selectedExamId.value = '';
  }
}

async function submitEvaluation() {
  if (!examData.value) return;
  if (!confirm('Yakin ingin mengirim jawaban ini? Jawaban tidak bisa diubah setelah dikirim.')) return;

  submitting.value = true;
  const answers = examData.value.questions
    .filter((q) => evalAnswers[q._id]?.trim())
    .map((q) => ({
      questionId: q._id,
      answerText: evalAnswers[q._id],
    }));

  const res = await api.post(`/evaluations/exam/${examData.value.exam._id}/submit`, { answers });
  if (res.success) {
    alert('Ujian berhasil dikirim! Menunggu verifikasi Admin.');
    selectExam(examData.value.exam._id);
  } else {
    alert(res.message);
  }
  submitting.value = false;
}

function startNewAttempt() {
  if (!examData.value) return;
  examData.value = { ...examData.value, submission: null };
  Object.keys(evalAnswers).forEach((k) => delete evalAnswers[k]);
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
