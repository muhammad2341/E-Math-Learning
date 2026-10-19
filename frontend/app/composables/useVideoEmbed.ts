export function useVideoEmbed() {
  function toEmbedUrl(url: string): string | null {
    if (!url) return null;

    // YouTube: watch?v= / youtu.be / shorts / embed
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    // Already an embed URL
    if (url.includes('/embed/') || url.includes('player.vimeo.com')) return url;

    return null;
  }

  function embedSrc(url: string): string | null {
    return toEmbedUrl(url);
  }

  return { toEmbedUrl, embedSrc };
}
