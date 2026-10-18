<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Kelola Siswa</h2>
      <button @click="openAddModal" class="btn-primary text-sm">+ Tambah Siswa</button>
    </div>

    <!-- Search & Filter -->
    <div class="card mb-6 flex flex-wrap gap-3">
      <input
        v-model="search"
        type="text"
        class="input-field flex-1 min-w-[200px]"
        placeholder="Cari nama, NIS, username, sekolah..."
        @input="debouncedSearch"
      />
      <select v-model="statusFilter" class="input-field w-40" @change="fetchStudents">
        <option value="">Semua Status</option>
        <option value="active">Aktif</option>
        <option value="inactive">Nonaktif</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">NIS</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Username</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sekolah</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Usia</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kelas</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="s in students" :key="s._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{{ s.name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ s.nrp || '—' }}</td>
              <td class="px-4 py-3 text-gray-600">{{ s.username }}</td>
              <td class="px-4 py-3 text-gray-600">{{ s.school }}</td>
              <td class="px-4 py-3 text-gray-600">{{ s.age }} th</td>
              <td class="px-4 py-3 text-gray-600">{{ s.classGroup }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
                >
                  {{ s.status === 'active' ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2 text-xs">
                  <button @click="openEditModal(s)" class="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                  <button @click="openResetModal(s)" class="text-amber-600 hover:text-amber-800 font-medium">Reset PW</button>
                  <button @click="openDeleteModal(s)" class="text-red-600 hover:text-red-800 font-medium">Hapus</button>
                </div>
              </td>
            </tr>
            <tr v-if="students.length === 0 && !loading">
              <td colspan="8" class="px-4 py-12 text-center text-gray-400">Belum ada data siswa</td>
            </tr>
            <tr v-if="loading">
              <td colspan="8" class="px-4 py-12 text-center text-gray-400">Memuat...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ADD MODAL -->
    <div v-if="showAdd" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showAdd = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold mb-4">Tambah Siswa Baru</h3>
        <form @submit.prevent="handleAdd" class="space-y-3">
          <div v-if="modalError" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{{ modalError }}</div>
          <div><label class="text-xs font-semibold text-gray-600">Nama Lengkap</label>
            <input v-model="addForm.name" type="text" class="input-field mt-1" required /></div>
          <div><label class="text-xs font-semibold text-gray-600">Username</label>
            <input v-model="addForm.username" type="text" class="input-field mt-1" required minlength="3" /></div>
          <div><label class="text-xs font-semibold text-gray-600">NIS</label>
            <input v-model="addForm.nrp" type="text" class="input-field mt-1" placeholder="2024001" /></div>
          <div><label class="text-xs font-semibold text-gray-600">Password Awal</label>
            <input v-model="addForm.password" type="password" class="input-field mt-1" required minlength="6" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-xs font-semibold text-gray-600">Sekolah</label>
              <input v-model="addForm.school" type="text" class="input-field mt-1" placeholder="SMP Negeri 1" /></div>
            <div><label class="text-xs font-semibold text-gray-600">Usia</label>
              <input v-model.number="addForm.age" type="number" min="5" max="30" class="input-field mt-1" /></div>
          </div>
          <div><label class="text-xs font-semibold text-gray-600">Kelas</label>
            <input v-model="addForm.classGroup" type="text" class="input-field mt-1" placeholder="Kelas 8A" /></div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showAdd = false" class="btn-secondary text-sm">Batal</button>
            <button type="submit" class="btn-primary text-sm" :disabled="submitting">{{ submitting ? 'Menyimpan...' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEdit" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showEdit = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold mb-4">Edit Siswa</h3>
        <form @submit.prevent="handleEdit" class="space-y-3">
          <div v-if="modalError" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{{ modalError }}</div>
          <div><label class="text-xs font-semibold text-gray-600">Nama</label>
            <input v-model="editForm.name" type="text" class="input-field mt-1" /></div>
          <div><label class="text-xs font-semibold text-gray-600">NIS</label>
            <input v-model="editForm.nrp" type="text" class="input-field mt-1" placeholder="2024001" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-xs font-semibold text-gray-600">Sekolah</label>
              <input v-model="editForm.school" type="text" class="input-field mt-1" /></div>
            <div><label class="text-xs font-semibold text-gray-600">Usia</label>
              <input v-model.number="editForm.age" type="number" class="input-field mt-1" /></div>
          </div>
          <div><label class="text-xs font-semibold text-gray-600">Kelas</label>
            <input v-model="editForm.classGroup" type="text" class="input-field mt-1" /></div>
          <div><label class="text-xs font-semibold text-gray-600">Status Akun</label>
            <select v-model="editForm.status" class="input-field mt-1">
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showEdit = false" class="btn-secondary text-sm">Batal</button>
            <button type="submit" class="btn-primary text-sm" :disabled="submitting">{{ submitting ? 'Menyimpan...' : 'Update' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- RESET PASSWORD MODAL -->
    <div v-if="showReset" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showReset = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-semibold mb-2">Reset Password</h3>
        <p class="text-sm text-gray-500 mb-4">Password baru untuk <strong>{{ resetTarget?.username }}</strong></p>
        <form @submit.prevent="handleReset" class="space-y-3">
          <div v-if="modalError" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{{ modalError }}</div>
          <input v-model="resetForm.newPassword" type="password" class="input-field" placeholder="Password baru (min 6)" required minlength="6" />
          <div class="flex justify-end gap-3">
            <button type="button" @click="showReset = false" class="btn-secondary text-sm">Batal</button>
            <button type="submit" class="btn-primary text-sm" :disabled="submitting">Reset</button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div v-if="showDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showDelete = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-semibold mb-2">Hapus Siswa</h3>
        <p class="text-sm text-gray-600 mb-4">
          Yakin menghapus <strong>{{ deleteTarget?.name }}</strong>? Seluruh riwayat belajar akan ikut terhapus.
        </p>
        <div class="flex justify-end gap-3">
          <button @click="showDelete = false" class="btn-secondary text-sm">Batal</button>
          <button @click="handleDelete" class="btn-danger text-sm" :disabled="submitting">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types';

definePageMeta({ layout: 'dashboard' });

const api = useApi();
const students = ref<User[]>([]);
const loading = ref(false);
const submitting = ref(false);
const search = ref('');
const statusFilter = ref('');
const modalError = ref('');

const showAdd = ref(false);
const showEdit = ref(false);
const showReset = ref(false);
const showDelete = ref(false);

const editTarget = ref<User | null>(null);
const resetTarget = ref<User | null>(null);
const deleteTarget = ref<User | null>(null);

const addForm = reactive({ name: '', username: '', password: '', nrp: '', school: '', age: 13, classGroup: '' });
const editForm = reactive({ name: '', nrp: '', school: '', age: 13, classGroup: '', status: 'active' });
const resetForm = reactive({ newPassword: '' });

async function fetchStudents() {
  loading.value = true;
  const params = new URLSearchParams();
  if (search.value) params.set('search', search.value);
  if (statusFilter.value) params.set('status', statusFilter.value);

  const res = await api.get<User[]>(`/admin/students?${params}`);
  if (res.success && res.data) students.value = res.data;
  loading.value = false;
}

let searchTimer: ReturnType<typeof setTimeout>;
function debouncedSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(fetchStudents, 300);
}

function openAddModal() {
  addForm.name = ''; addForm.username = ''; addForm.password = ''; addForm.nrp = '';
  addForm.school = ''; addForm.age = 13; addForm.classGroup = '';
  modalError.value = '';
  showAdd.value = true;
}

async function handleAdd() {
  modalError.value = '';
  submitting.value = true;
  const res = await api.post('/admin/students', addForm);
  if (res.success) { showAdd.value = false; fetchStudents(); }
  else modalError.value = res.message;
  submitting.value = false;
}

function openEditModal(u: User) {
  editTarget.value = u;
  editForm.name = u.name; editForm.nrp = u.nrp || '';
  editForm.school = u.school || '';
  editForm.age = u.age || 13; editForm.classGroup = u.classGroup || '';
  editForm.status = u.status;
  modalError.value = '';
  showEdit.value = true;
}

async function handleEdit() {
  if (!editTarget.value) return;
  modalError.value = '';
  submitting.value = true;
  const res = await api.put(`/admin/students/${editTarget.value._id}`, editForm);
  if (res.success) { showEdit.value = false; fetchStudents(); }
  else modalError.value = res.message;
  submitting.value = false;
}

function openResetModal(u: User) {
  resetTarget.value = u;
  resetForm.newPassword = '';
  modalError.value = '';
  showReset.value = true;
}

async function handleReset() {
  if (!resetTarget.value) return;
  modalError.value = '';
  submitting.value = true;
  const res = await api.post(`/admin/students/${resetTarget.value._id}/reset-password`, resetForm);
  if (res.success) { showReset.value = false; }
  else modalError.value = res.message;
  submitting.value = false;
}

function openDeleteModal(u: User) {
  deleteTarget.value = u;
  showDelete.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  submitting.value = true;
  const res = await api.del(`/admin/students/${deleteTarget.value._id}`);
  if (res.success) { showDelete.value = false; fetchStudents(); }
  submitting.value = false;
}

onMounted(fetchStudents);
</script>
