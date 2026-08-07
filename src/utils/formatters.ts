export function formatDuration(sec?: number): string {
  if (!sec || isNaN(sec) || sec <= 0) return '00:00';
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatFileSize(bytes?: number, qualityLabel: string = '720p', durationSec: number = 180): string {
  let sizeInBytes = bytes || 0;
  if (!sizeInBytes || sizeInBytes <= 0) {
    if (qualityLabel.includes('1080')) sizeInBytes = durationSec * 350000;
    else if (qualityLabel.includes('720')) sizeInBytes = durationSec * 200000;
    else if (qualityLabel.includes('480')) sizeInBytes = durationSec * 110000;
    else if (qualityLabel.includes('360')) sizeInBytes = durationSec * 70000;
    else if (qualityLabel.includes('MP3') || qualityLabel.includes('Audio')) sizeInBytes = durationSec * 16000;
    else sizeInBytes = durationSec * 150000;
  }

  const mb = sizeInBytes / (1024 * 1024);
  if (mb >= 1000) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}

export function parseFileSizeInBytes(bytes?: number, qualityLabel: string = '720p', durationSec: number = 180): number {
  if (bytes && bytes > 0) return bytes;
  if (qualityLabel.includes('1080')) return durationSec * 350000;
  if (qualityLabel.includes('720')) return durationSec * 200000;
  if (qualityLabel.includes('480')) return durationSec * 110000;
  if (qualityLabel.includes('360')) return durationSec * 70000;
  if (qualityLabel.includes('MP3') || qualityLabel.includes('Audio')) return durationSec * 16000;
  return durationSec * 150000;
}

export function formatViewCount(views?: number, lang: string = 'fa'): string {
  if (!views || isNaN(views)) return '0';
  if (lang === 'fa') {
    if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)} میلیارد`;
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)} میلیون`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)} هزار`;
    return views.toString();
  }
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

export function sanitizeEta(rawEta?: string, lang: string = 'fa'): string {
  if (!rawEta || rawEta === '-1' || rawEta === '-1s' || rawEta.includes('-') || rawEta === '0' || rawEta === 'downloading') {
    return lang === 'fa' ? 'در حال محاسبه...' : 'Calculating...';
  }
  return rawEta;
}
