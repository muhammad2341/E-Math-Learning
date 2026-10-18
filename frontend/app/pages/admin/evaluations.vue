<template>
  <div>
    <!-- ═══ VIEW: DAFTAR UJIAN ═══ -->
    <template v-if="!selectedExam">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Evaluasi</h2>
          <p class="text-sm text-gray-500">Kelola ujian evaluasi dan review hasil siswa</p>
        </div>
        <button @click="openAddExam" class="btn-primary text-sm">+ Buat Ujian</button>
      </div>

      <!-- Filter -->
      <div class="card mb-6">
        <select v-model="chapterFilter" class="input-field max-w-xs" @change="fetchExams">
          <option value="">Semua Bab</option>
          <option v-for="ch in chapters" :key="ch._id" :value="ch._id">Bab {{ ch.order }} - {{ ch.title }}</option>
        </select>
      </div>

      <!-- Exam list -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="exam in exams"
          :key="exam._id"
          class="card cursor-pointer hover:shadow-md transition-shadow"
          @click="openExam(exam)"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="exam.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
            >
              {{ exam.isPublished ? 'Published' : 'Draft' }}
            </span>
            <div class="flex items-center gap-1" @click.stop>
              <button @click="toggleExamPublish(exam)" class="text-[11px] text-gray-500 hover:text-gray-700">
                {{ exam.isPublished ? 'Unpublish' : 'Publish' }}
              </button>
              <span class="text-gray-300">|</span>
              <button @click="removeExam(exam)" class="text-[11px] text-red-500 hover:text-red-700">Hapus</button>
            </div>
          </div>
          <h3 class="text-base font-semibold text-gray-900 mb-1">{{ exam.title }}</h3>
          <p class="text-xs text-gray-500 line-clamp-2 mb-2">{{ exam.description || 'Tanpa deskripsi' }}</p>
          <div v-if="exam.startTime || exam.endTime || exam.durationMinutes" class="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mb-2">
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
          <div class="flex items-center justify-between text-xs">
            <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              Bab {{ getChapterOrder(exam) }} — {{ getChapterTitle(exam) }}
            </span>
            <div class="flex items-center gap-2 text-gray-500">
              <span>{{ exam.questionCount || 0 }} soal</span>
              <span class="text-gray-300">·</span>
              <span class="font-semibold text-gray-700">{{ exam.submissionCount || 0 }} siswa</span>
            </div>
          </div>
        </div>

        <div v-if="exams.length === 0" class="card text-center text-gray-400 py-12 col-span-full">
          Belum ada ujian. Klik "+ Buat Ujian" untuk memulai.
        </div>
      </div>
    </template>

    <!-- ═══ VIEW: DETAIL UJIAN ═══ -->
    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div class="flex items-center gap-3 min-w-0">
          <button @click="closeExam" class="text-gray-400 hover:text-gray-600 shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="min-w-0">
            <h2 class="text-xl font-bold text-gray-900 truncate">{{ selectedExam.title }}</h2>
            <p class="text-xs text-gray-500">
              {{ getChapterTitle(selectedExam) }} · {{ questions.length }} soal · {{ submissions.length }} submission
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button @click="openEditExam(selectedExam)" class="btn-secondary text-sm py-2">Edit Ujian</button>
          <button @click="openAddQuestion" class="btn-primary text-sm">+ Tambah Soal</button>
        </div>
      </div>

      <!-- Exam info -->
      <div class="card mb-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm text-gray-600">{{ selectedExam.description || 'Tanpa deskripsi' }}</p>
            <span
              class="inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium"
              :class="selectedExam.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
            >
              {{ selectedExam.isPublished ? 'Published' : 'Draft' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tabs: Soal | Submission -->
      <div class="flex gap-1 mb-4 border-b border-gray-200">
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
          :class="activeTab === 'questions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'questions'"
        >
          Soal ({{ questions.length }})
        </button>
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
          :class="activeTab === 'submissions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'submissions'"
        >
          Submission Siswa ({{ submissions.length }})
        </button>
      </div>

      <!-- Tab: Questions -->
      <div v-if="activeTab === 'questions'" class="space-y-3">
        <div v-for="(q, idx) in questions" :key="q._id" class="card">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Soal {{ idx + 1 }}</span>
                <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                  {{ q.questionType === 'multiple_choice' ? 'Pilihan Ganda' : 'Isian' }}
                </span>
                <span class="text-[10px] text-gray-400">{{ q.points }} poin</span>
              </div>
              <p class="text-sm font-medium text-gray-900">{{ q.questionText }}</p>
              <div v-if="q.options" class="grid grid-cols-2 gap-1 mt-2 text-xs">
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
              <p v-else class="text-xs text-gray-500 mt-2">
                Jawaban: <strong class="text-emerald-700">{{ q.correctAnswer }}</strong>
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

      <!-- Tab: Submissions -->
      <div v-if="activeTab === 'submissions'">
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Siswa</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal Submit</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Skor</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="sub in submissions" :key="sub._id" class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <p class="font-medium text-gray-900">{{ sub.studentId?.name }}</p>
                    <p class="text-xs text-gray-500">{{ sub.studentId?.username }} · NIS: {{ sub.studentId?.nrp || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 text-gray-600 text-xs">{{ formatDate(sub.submittedAt) }}</td>
                  <td class="px-4 py-3 font-semibold" :class="sub.isReleased ? (sub.finalScore >= 70 ? 'text-emerald-600' : 'text-red-500') : 'text-gray-400'">
                    {{ sub.isReleased ? sub.finalScore : (sub.autoCalculatedScore + ' (auto)') }}
                  </td>
                  <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full" :class="statusClass(sub.status)">
                      {{ statusLabel(sub.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <button @click="openSubmission(sub)" class="text-xs font-medium text-blue-600 hover:text-blue-800">
                      Detail
                    </button>
                  </td>
                </tr>
                <tr v-if="submissions.length === 0">
                  <td colspan="5" class="px-4 py-12 text-center text-gray-400">Belum ada siswa yang mengerjakan</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══ MODAL: ADD/EDIT EXAM ═══ -->
    <div v-if="showExamModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showExamModal = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold mb-4">{{ editExamId ? 'Edit Ujian' : 'Buat Ujian Baru' }}</h3>
        <form @submit.prevent="handleSaveExam" class="space-y-3">
          <div v-if="modalError" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{{ modalError }}</div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Bab</label>
            <select v-model="examForm.chapterId" class="input-field mt-1" required>
              <option value="" disabled>Pilih bab</option>
              <option v-for="ch in chapters" :key="ch._id" :value="ch._id">Bab {{ ch.order }} - {{ ch.title }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Judul Ujian</label>
            <input v-model="examForm.title" type="text" class="input-field mt-1" placeholder="Misal: Ujian Bab 1 — Bilangan Bulat" required />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Deskripsi (opsional)</label>
            <textarea v-model="examForm.description" rows="2" class="input-field mt-1" placeholder="Deskripsi singkat ujian..."></textarea>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="text-xs font-semibold text-gray-600">Waktu Mulai</label>
              <input v-model="examForm.startTime" type="datetime-local" class="input-field mt-1" />
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600">Tenggat (Selesai)</label>
              <input v-model="examForm.endTime" type="datetime-local" class="input-field mt-1" />
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600">Durasi (menit)</label>
              <input v-model.number="examForm.durationMinutes" type="number" min="1" max="600" class="input-field mt-1" placeholder="90" />
            </div>
          </div>
          <p class="text-[11px] text-gray-400 -mt-1">Ketiga kolom opsional. Durasi = batas waktu mengerjakan setelah mulai.</p>
          <div>
            <label class="text-xs font-semibold text-gray-600">Status</label>
            <select v-model="examForm.isPublished" class="input-field mt-1">
              <option :value="false">Draft</option>
              <option :value="true">Published</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showExamModal = false" class="btn-secondary text-sm">Batal</button>
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
            <label class="text-xs font-semibold text-gray-600">Tipe Soal</label>
            <select v-model="questionForm.questionType" class="input-field mt-1">
              <option value="multiple_choice">Pilihan Ganda</option>
              <option value="fill_in_blank">Isian (Fill in the blank)</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Pertanyaan</label>
            <textarea v-model="questionForm.questionText" class="input-field mt-1" rows="2" required />
          </div>
          <!-- Options for MC -->
          <div v-if="questionForm.questionType === 'multiple_choice'" class="grid grid-cols-1 gap-2">
            <div v-for="key in ['A', 'B', 'C', 'D']" :key="key">
              <label class="text-xs font-semibold text-gray-600">Opsi {{ key }}</label>
              <input v-model="questionForm.options[key]" type="text" class="input-field mt-1" required />
            </div>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Jawaban Benar</label>
            <select v-if="questionForm.questionType === 'multiple_choice'" v-model="questionForm.correctAnswer" class="input-field mt-1" required>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
            <input v-else v-model="questionForm.correctAnswer" type="text" class="input-field mt-1" placeholder="Ketik jawaban yang benar" required />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Poin</label>
            <input v-model.number="questionForm.points" type="number" min="1" class="input-field mt-1" />
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

    <!-- ═══ MODAL: SUBMISSION DETAIL (REVIEW) ═══ -->
    <div v-if="showSubmissionDetail && submissionDetail" class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto" @click.self="showSubmissionDetail = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 my-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold">Detail Jawaban Siswa</h3>
            <p class="text-sm text-gray-500">
              {{ submissionDetail.studentId?.name }} ({{ submissionDetail.studentId?.nrp || submissionDetail.studentId?.username }})
            </p>
          </div>
          <button @click="showSubmissionDetail = false" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <!-- Score summary -->
        <div class="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="text-center">
            <p class="text-xs text-gray-500">Skor Auto</p>
            <p class="text-2xl font-bold text-gray-700">{{ submissionDetail.autoCalculatedScore }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-gray-500">Skor Final</p>
            <p class="text-2xl font-bold" :class="submissionDetail.isReleased ? (submissionDetail.finalScore >= 70 ? 'text-emerald-600' : 'text-red-500') : 'text-gray-400'">
              {{ submissionDetail.isReleased ? submissionDetail.finalScore : '—' }}
            </p>
          </div>
          <div class="flex-1">
            <span class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full" :class="statusClass(submissionDetail.status)">
              {{ statusLabel(submissionDetail.status) }}
            </span>
            <p class="text-xs text-gray-500 mt-1">{{ formatDate(submissionDetail.submittedAt) }}</p>
          </div>
        </div>

        <!-- Per-question answer breakdown -->
        <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-2 mb-4">
          <div v-for="(ans, idx) in submissionDetail.answers" :key="idx" class="bg-white border rounded-lg p-4"
            :class="isAnswerCorrect(ans) ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-bold rounded-full px-2 py-0.5"
                    :class="isAnswerCorrect(ans) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
                  >
                    Soal {{ idx + 1 }} {{ isAnswerCorrect(ans) ? '✓ Benar' : '✕ Salah' }}
                  </span>
                  <span class="text-[10px] text-gray-400">{{ getQuestionData(ans)?.points || 10 }} poin</span>
                </div>
                <p class="text-sm font-medium text-gray-800">{{ getQuestionData(ans)?.questionText || 'Soal' }}</p>
                <div class="mt-2 space-y-1 text-xs">
                  <p>
                    <span class="font-semibold text-gray-600">Jawaban siswa:</span>
                    <span :class="isAnswerCorrect(ans) ? 'text-emerald-700 font-medium' : 'text-red-600 font-medium'">
                      {{ ans.answerText || '(kosong)' }}
                    </span>
                  </p>
                  <p v-if="!isAnswerCorrect(ans)">
                    <span class="font-semibold text-gray-600">Kunci jawaban:</span>
                    <span class="text-emerald-700 font-medium">{{ getQuestionData(ans)?.correctAnswer || '-' }}</span>
                  </p>
                  <p v-if="ans.feedback" class="italic text-gray-500">Catatan: {{ ans.feedback }}</p>
                </div>
              </div>
              <div class="w-32 shrink-0">
                <label class="text-xs font-semibold text-gray-600">Skor Manual</label>
                <input
                  v-model.number="manualScores[idx]"
                  type="number"
                  min="0"
                  :max="getQuestionData(ans)?.points || 10"
                  class="input-field mt-1 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Verification controls -->
        <div class="border-t border-gray-200 pt-4 space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-semibold text-gray-600">Skor Final (0-100)</label>
              <input v-model.number="finalScore" type="number" min="0" max="100" class="input-field mt-1" />
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600">Status</label>
              <select v-model="verifyStatus" class="input-field mt-1">
                <option value="VERIFIED">Verified (Terverifikasi)</option>
                <option value="RELEASED">Released (Rilis ke Siswa)</option>
                <option value="REVISION_REQUIRED">Revision Required (Perlu Revisi)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600">Catatan Verifikasi</label>
            <textarea v-model="verifyNotes" class="input-field mt-1" rows="2" placeholder="Catatan untuk siswa..." />
          </div>
          <div class="flex justify-end gap-3">
            <button @click="showSubmissionDetail = false" class="btn-secondary text-sm">Batal</button>
            <button @click="handleVerify" class="btn-primary text-sm" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : verifyStatus === 'RELEASED' ? 'Verifikasi & Rilis' : 'Verifikasi' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chapter, Exam, EvaluationQuestionFull, EvaluationSubmissionFull, EvaluationAnswer } from '~/types';

definePageMeta({ layout: 'dashboard' });

const api = useApi();
const chapters = ref<Chapter[]>([]);
const exams = ref<Exam[]>([]);
const chapterFilter = ref('');

// Exam detail
const selectedExam = ref<Exam | null>(null);
const questions = ref<EvaluationQuestionFull[]>([]);
const submissions = ref<EvaluationSubmissionFull[]>([]);
const activeTab = ref<'questions' | 'submissions'>('questions');

// Exam modal
const showExamModal = ref(false);
const editExamId = ref<string | null>(null);
const examForm = reactive({ chapterId: '', title: '', description: '', startTime: '', endTime: '', durationMinutes: undefined as number | undefined, isPublished: false });

// Question modal
const showQuestionModal = ref(false);
const editQuestionId = ref<string | null>(null);
const questionForm = reactive({
  questionType: 'multiple_choice' as string,
  questionText: '',
  options: { A: '', B: '', C: '', D: '' },
  correctAnswer: 'A',
  points: 25,
  order: 1,
});

// Submission detail modal
const showSubmissionDetail = ref(false);
const submissionDetail = ref<EvaluationSubmissionFull | null>(null);
const manualScores = ref<number[]>([]);
const finalScore = ref(0);
const verifyStatus = ref('RELEASED');
const verifyNotes = ref('');

const submitting = ref(false);
const modalError = ref('');

function getChapterOrder(exam: Exam): number | '?' {
  if (typeof exam.chapterId === 'object') return exam.chapterId.order;
  const ch = chapters.value.find((c) => c._id === exam.chapterId);
  return ch?.order ?? '?';
}

function getChapterTitle(exam: Exam): string {
  if (typeof exam.chapterId === 'object') return exam.chapterId.title;
  const ch = chapters.value.find((c) => c._id === exam.chapterId);
  return ch?.title ?? 'Bab ?';
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    NOT_STARTED: 'Belum Mulai',
    IN_PROGRESS: 'Sedang Dikerjakan',
    SUBMITTED: 'Dikirim',
    PENDING_REVIEW: 'Menunggu Review',
    REVISION_REQUIRED: 'Perlu Revisi',
    VERIFIED: 'Terverifikasi',
    RELEASED: 'Sudah Dirilis',
  };
  return map[s] || s;
}

function statusClass(s: string) {
  const map: Record<string, string> = {
    PENDING_REVIEW: 'bg-amber-100 text-amber-700',
    SUBMITTED: 'bg-amber-100 text-amber-700',
    VERIFIED: 'bg-blue-100 text-blue-700',
    RELEASED: 'bg-emerald-100 text-emerald-700',
    REVISION_REQUIRED: 'bg-red-100 text-red-700',
  };
  return map[s] || 'bg-gray-100 text-gray-500';
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function isAnswerCorrect(ans: any): boolean {
  if (ans.isCorrect !== undefined) return ans.isCorrect;
  return ans.autoScore > 0;
}

function getQuestionData(ans: any): any {
  if (typeof ans.questionId === 'object' && ans.questionId) return ans.questionId;
  return null;
}

// ─── Fetch ───

async function fetchChapters() {
  const res = await api.get<Chapter[]>('/chapters');
  if (res.success && res.data) chapters.value = res.data;
}

async function fetchExams() {
  const params = chapterFilter.value ? `?chapterId=${chapterFilter.value}` : '';
  const res = await api.get<Exam[]>(`/admin/evaluations/exams${params}`);
  if (res.success && res.data) exams.value = res.data;
}

async function fetchExamDetail() {
  if (!selectedExam.value) return;
  const res = await api.get<{ exam: Exam; questions: EvaluationQuestionFull[] }>(
    `/admin/evaluations/exams/${selectedExam.value._id}`
  );
  if (res.success && res.data) {
    selectedExam.value = res.data.exam;
    questions.value = res.data.questions;
  }
}

async function fetchSubmissions() {
  if (!selectedExam.value) return;
  const res = await api.get<{ exam: Exam; submissions: EvaluationSubmissionFull[] }>(
    `/admin/evaluations/exams/${selectedExam.value._id}/submissions`
  );
  if (res.success && res.data) {
    submissions.value = res.data.submissions;
  }
}

// ─── Exam CRUD ───

function openAddExam() {
  editExamId.value = null;
  examForm.chapterId = chapters.value[0]?._id || '';
  examForm.title = '';
  examForm.description = '';
  examForm.startTime = '';
  examForm.endTime = '';
  examForm.durationMinutes = undefined;
  examForm.isPublished = false;
  modalError.value = '';
  showExamModal.value = true;
}

function openEditExam(exam: Exam) {
  editExamId.value = exam._id;
  examForm.chapterId = typeof exam.chapterId === 'object' ? exam.chapterId._id : exam.chapterId;
  examForm.title = exam.title;
  examForm.description = exam.description;
  examForm.startTime = exam.startTime ? toLocalDatetime(exam.startTime) : '';
  examForm.endTime = exam.endTime ? toLocalDatetime(exam.endTime) : '';
  examForm.durationMinutes = exam.durationMinutes;
  examForm.isPublished = exam.isPublished;
  modalError.value = '';
  showExamModal.value = true;
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function handleSaveExam() {
  modalError.value = '';
  submitting.value = true;

  const body: Record<string, unknown> = {
    chapterId: examForm.chapterId,
    title: examForm.title,
    description: examForm.description,
    isPublished: examForm.isPublished,
  };
  if (examForm.startTime) body.startTime = new Date(examForm.startTime).toISOString();
  else body.startTime = null;
  if (examForm.endTime) body.endTime = new Date(examForm.endTime).toISOString();
  else body.endTime = null;
  if (examForm.durationMinutes) body.durationMinutes = examForm.durationMinutes;
  else body.durationMinutes = null;

  const res = editExamId.value
    ? await api.put(`/admin/evaluations/exams/${editExamId.value}`, body)
    : await api.post('/admin/evaluations/exams', body);

  if (res.success) {
    showExamModal.value = false;
    fetchExams();
    if (selectedExam.value && editExamId.value) {
      selectedExam.value = { ...selectedExam.value, ...body } as Exam;
    }
  } else {
    modalError.value = res.message;
  }
  submitting.value = false;
}

async function toggleExamPublish(exam: Exam) {
  await api.put(`/admin/evaluations/exams/${exam._id}`, { isPublished: !exam.isPublished });
  fetchExams();
}

async function removeExam(exam: Exam) {
  if (!confirm(`Hapus ujian "${exam.title}"? Semua soal dan submission ikut terhapus.`)) return;
  await api.del(`/admin/evaluations/exams/${exam._id}`);
  fetchExams();
}

// ─── Exam Detail ───

function openExam(exam: Exam) {
  selectedExam.value = exam;
  questions.value = [];
  submissions.value = [];
  activeTab.value = 'questions';
  fetchExamDetail();
  fetchSubmissions();
}

function closeExam() {
  selectedExam.value = null;
  questions.value = [];
  submissions.value = [];
}

// ─── Question CRUD ───

function openAddQuestion() {
  editQuestionId.value = null;
  questionForm.questionType = 'multiple_choice';
  questionForm.questionText = '';
  questionForm.options = { A: '', B: '', C: '', D: '' };
  questionForm.correctAnswer = 'A';
  questionForm.points = 25;
  questionForm.order = questions.value.length + 1;
  modalError.value = '';
  showQuestionModal.value = true;
}

function openEditQuestion(q: EvaluationQuestionFull) {
  editQuestionId.value = q._id;
  questionForm.questionType = q.questionType;
  questionForm.questionText = q.questionText;
  if (q.options) q.options.forEach((o) => { questionForm.options[o.key] = o.text; });
  questionForm.correctAnswer = q.correctAnswer;
  questionForm.points = q.points;
  questionForm.order = q.order;
  modalError.value = '';
  showQuestionModal.value = true;
}

async function handleSaveQuestion() {
  if (!selectedExam.value) return;
  modalError.value = '';
  submitting.value = true;

  const body: any = {
    examId: selectedExam.value._id,
    questionType: questionForm.questionType,
    questionText: questionForm.questionText,
    correctAnswer: questionForm.correctAnswer,
    points: questionForm.points,
    order: questionForm.order,
  };

  if (questionForm.questionType === 'multiple_choice') {
    body.options = ['A', 'B', 'C', 'D'].map((k) => ({
      key: k,
      text: questionForm.options[k as keyof typeof questionForm.options],
    }));
  }

  const res = editQuestionId.value
    ? await api.put(`/admin/evaluations/questions/${editQuestionId.value}`, body)
    : await api.post('/admin/evaluations/questions', body);

  if (res.success) {
    showQuestionModal.value = false;
    fetchExamDetail();
    fetchExams();
  } else {
    modalError.value = res.message;
  }
  submitting.value = false;
}

async function removeQuestion(q: EvaluationQuestionFull) {
  if (!confirm('Hapus soal ini?')) return;
  await api.del(`/admin/evaluations/questions/${q._id}`);
  fetchExamDetail();
  fetchExams();
}

// ─── Submission Review ───

async function openSubmission(sub: EvaluationSubmissionFull) {
  const res = await api.get<EvaluationSubmissionFull>(`/admin/evaluations/submissions/${sub._id}`);
  if (res.success && res.data) {
    submissionDetail.value = res.data;
    manualScores.value = res.data.answers.map((a) => a.manualScore ?? a.autoScore);
    finalScore.value = res.data.autoCalculatedScore;
    verifyStatus.value = res.data.status === 'PENDING_REVIEW' || res.data.status === 'SUBMITTED' ? 'RELEASED' : res.data.status;
    verifyNotes.value = res.data.verificationNotes || '';
    showSubmissionDetail.value = true;
  }
}

async function handleVerify() {
  if (!submissionDetail.value) return;
  submitting.value = true;

  const body = {
    finalScore: finalScore.value,
    verificationNotes: verifyNotes.value,
    status: verifyStatus.value,
    release: verifyStatus.value === 'RELEASED',
    answerScores: submissionDetail.value.answers.map((a, idx) => ({
      questionId: typeof a.questionId === 'object' ? a.questionId._id : a.questionId,
      manualScore: manualScores.value[idx],
    })),
  };

  const res = await api.post(`/admin/evaluations/submissions/${submissionDetail.value._id}/verify`, body);
  if (res.success) {
    showSubmissionDetail.value = false;
    fetchSubmissions();
    fetchExams();
  }
  submitting.value = false;
}

onMounted(() => { fetchChapters().then(fetchExams); });
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
