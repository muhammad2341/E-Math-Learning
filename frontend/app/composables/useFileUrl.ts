export function useFileUrl() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;
  const backendBase = apiBase.replace(/\/api\/?$/, '');

  function fileUrl(path?: string | null): string {
    if (!path || path === '#') return '';
    if (path.startsWith('http')) return path;
    return `${backendBase}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  function fileDownloadUrl(path?: string | null): string {
    const url = fileUrl(path);
    if (!url) return '';
    return `${url}${url.includes('?') ? '&' : '?'}download=1`;
  }

  return { fileUrl, fileDownloadUrl };
}
