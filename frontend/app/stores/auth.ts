import { defineStore } from 'pinia';
import type { User } from '~/types';

interface LoginPayload {
  username: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isSiswa = computed(() => user.value?.role === 'siswa');

  function init() {
    if (import.meta.client) {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        token.value = savedToken;
        try {
          user.value = JSON.parse(savedUser);
        } catch {
          logout();
        }
      }
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true;
    error.value = null;

    try {
      const api = useApi();
      const response = await api.post<{ token: string; user: User }>('/auth/login', payload);

      if (response.success && response.data) {
        token.value = response.data.token;
        user.value = response.data.user;

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        return { success: true };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (e: any) {
      error.value = e.message || 'Terjadi kesalahan';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function fetchProfile() {
    try {
      const api = useApi();
      const response = await api.get<User>('/auth/profile');

      if (response.success && response.data) {
        user.value = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigateTo('/login');
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isSiswa,
    init,
    login,
    fetchProfile,
    logout,
  };
});
