export interface VideoFormat {
  formatId: string;
  qualityLabel: string;
  ext: string;
  resolution: string;
  filesize: number;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  isVideoOnly: boolean;
  isAudioOnly: boolean;
}

export interface VideoInfo {
  id: string;
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  durationFormatted: string;
  uploader: string;
  viewCount: number;
  formats: VideoFormat[];
}

export interface DownloadItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  formatId: string;
  qualityLabel: string;
  ext: string;
  progress: number;
  speed: string;
  eta: string;
  status: 'idle' | 'fetching' | 'downloading' | 'completed' | 'error' | 'cancelled';
  filePath?: string;
  fileSize?: number;
  duration?: number;
  durationFormatted?: string;
  timestamp: number;
  errorMsg?: string;
}

export interface AppSettings {
  defaultQuality: string;
  downloadLocation: string;
  autoPasteClipboard: boolean;
  maxSimultaneousDownloads: number;
  theme: 'light' | 'dark' | 'synthwave' | 'dim' | 'emerald' | 'cupcake';
}
