import type { ApiResponse } from '~/types';

export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const baseURL = config.public.apiBase as string;

  async function request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    const response = await fetch(`${baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();
    return data;
  }

  function get<T>(endpoint: string) {
    return request<T>(endpoint, { method: 'GET' });
  }

  function post<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async function upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {};
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return (await response.json()) as ApiResponse<T>;
  }

  function put<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  function patch<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  function del<T>(endpoint: string) {
    return request<T>(endpoint, { method: 'DELETE' });
  }

  return { get, post, put, patch, del, upload };
}
