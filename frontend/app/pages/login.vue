<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 px-4">
    <div class="w-full max-w-md">
      <!-- Back to landing -->
      <div class="mb-6 text-center">
        <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke beranda
        </NuxtLink>
      </div>

      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
          <span class="text-white font-bold text-3xl">&sum;</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">E-Learning Matematika</h1>
        <p class="text-gray-500 mt-1">Masuk dengan akun yang diberikan Admin</p>
      </div>

      <!-- Login form -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          >
            {{ errorMessage }}
          </div>

          <div>
            <label for="username" class="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Username
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="input-field"
              placeholder="Masukkan username"
              required
              autocomplete="username"
            />
          </div>

          <div>
            <label for="password" class="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="input-field"
              placeholder="Masukkan password"
              required
              autocomplete="current-password"
            />
          </div>

          <button type="submit" class="btn-primary w-full" :disabled="authStore.loading">
            {{ authStore.loading ? 'Memproses...' : 'Masuk' }}
          </button>
        </form>

        <div class="mt-6 text-center border-t border-gray-100 pt-5">
          <p class="text-sm text-gray-500">
            Belum punya akun?
            <NuxtLink to="/register" class="text-blue-600 font-semibold hover:text-blue-700">Daftar</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' });

const authStore = useAuthStore();
const errorMessage = ref('');

const form = reactive({
  username: '',
  password: '',
});

async function handleLogin() {
  errorMessage.value = '';
  const result = await authStore.login(form);

  if (result.success) {
    if (authStore.isAdmin) {
      navigateTo('/admin');
    } else {
      navigateTo('/siswa');
    }
  } else {
    errorMessage.value = result.message || 'Login gagal';
  }
}
</script>
