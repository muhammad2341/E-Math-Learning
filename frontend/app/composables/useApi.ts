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

  async function upload<T>(endpoint: string, formData: FormData, onProgress?: (percent: number) => void): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${baseURL}${endpoint}`);
      if (authStore.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${authStore.token}`);
      }
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText) as ApiResponse<T>;
          resolve(data);
        } catch {
          reject(new Error(`Respons server tidak valid (status ${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new Error('Upload gagal — periksa koneksi'));
      xhr.ontimeout = () => reject(new Error('Upload gagal — waktu habis'));
      xhr.send(formData);
    });
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
