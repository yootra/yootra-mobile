import { registerPlugin, Capacitor } from '@capacitor/core';
import type { VideoInfo, VideoFormat } from '../types/ytdl';
import { logger } from './loggerService';

interface YtDlpNativePlugin {
  getVideoInfo(options: { url: string }): Promise<{ info: VideoInfo }>;
  downloadVideo(options: { url: string; formatId: string; title: string; downloadLocation?: string; downloadId?: string }): Promise<{ downloadId: string; filePath?: string }>;
  cancelDownload(options: { downloadId: string }): Promise<{ success: boolean }>;
  getDownloadedFiles(): Promise<{ files: string[] }>;
  addListener(eventName: 'downloadProgress', listenerFunc: (data: { downloadId: string; progress: number; speed: string; eta: string; status: string; filePath?: string; errorMsg?: string }) => void): Promise<{ remove: () => void }>;
  addListener(eventName: 'logMessage', listenerFunc: (data: { level: 'info' | 'success' | 'warn' | 'error'; message: string }) => void): Promise<{ remove: () => void }>;
}

const YtDlpNative = registerPlugin<YtDlpNativePlugin>('YtDlpPlugin');

try {
  YtDlpNative.addListener('logMessage', (data) => {
    if (data && data.message) {
      logger.addLog(data.level || 'info', `[Native] ${data.message}`);
    }
  });
} catch (e) {
  logger.addLog('warn', 'Could not register native log listener.');
}

export class YtDlpService {
  static async fetchVideoInfo(url: string): Promise<VideoInfo> {
    logger.addLog('info', `Fetching video details for URL: ${url}`);
    try {
      const result = await YtDlpNative.getVideoInfo({ url });
      if (result && result.info) {
        logger.addLog('success', `Video details fetched: ${result.info.title}`);
        return result.info;
      }
    } catch (err: any) {
      logger.addLog('warn', `Native video info fetch error: ${err?.message || err}`);
      if (Capacitor.isNativePlatform()) {
        throw new Error(err?.message || 'Native fetch failed');
      }
      return this.mockVideoInfo(url);
    }
    return this.mockVideoInfo(url);
  }

  static async startDownload(
    url: string,
    formatId: string,
    title: string,
    downloadId: string,
    downloadLocation: string,
    onProgress: (progress: number, speed: string, eta: string, status: string, filePath?: string, errorMsg?: string) => void
  ): Promise<string> {
    logger.addLog('info', `Starting download task. Format: ${formatId}, Location: ${downloadLocation}, Title: ${title}`);
    try {
      let removeListener: (() => void) | null = null;

      return new Promise(async (resolve, reject) => {
        const listener = await YtDlpNative.addListener('downloadProgress', (data) => {
          if (data.downloadId === downloadId) {
            let cleanEta = data.eta;
            if (!cleanEta || cleanEta === '-1' || cleanEta.includes('-') || cleanEta === '0') {
              cleanEta = 'Calculating...';
            }
            onProgress(data.progress, data.speed || '0 MB/s', cleanEta, data.status, data.filePath, data.errorMsg);

            if (data.status === 'completed') {
              if (removeListener) removeListener();
              logger.addLog('success', `Download complete! File saved at: ${data.filePath}`);
              resolve(data.filePath || title);
            } else if (data.status === 'error') {
              if (removeListener) removeListener();
              logger.addLog('error', `Download error: ${data.errorMsg || 'Failed'}`);
              reject(new Error(data.errorMsg || 'Download failed'));
            }
          }
        });

        removeListener = listener.remove;

        const result = await YtDlpNative.downloadVideo({ url, formatId, title, downloadLocation, downloadId });
        logger.addLog('info', `Native downloadVideo initialized. Target path: ${result.filePath}`);
      });
    } catch (err: any) {
      logger.addLog('warn', `Native download engine unavailable or failed: ${err?.message || err}`);
      if (Capacitor.isNativePlatform()) {
        throw new Error(err?.message || 'Native download failed');
      }
      return this.simulateBrowserDownload(title, downloadLocation, onProgress);
    }
  }

  static async cancelDownload(downloadId: string): Promise<boolean> {
    logger.addLog('info', `Cancelling download task ID: ${downloadId}`);
    try {
      const res = await YtDlpNative.cancelDownload({ downloadId });
      return res.success;
    } catch {
      return true;
    }
  }

  private static mockVideoInfo(url: string): VideoInfo {
    const videoIdMatch = url.match(/(?:v=|\/embed\/|\/1.1\/|\/v\/|https:\/\/youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
    const id = videoIdMatch ? videoIdMatch[1] : 'sample-id';
    
    const duration = 225;
    const sampleFormats: VideoFormat[] = [
      { formatId: '1080p', qualityLabel: '1080p Full HD', ext: 'mp4', resolution: '1920x1080', filesize: 78750000, isVideoOnly: false, isAudioOnly: false },
      { formatId: '720p', qualityLabel: '720p HD', ext: 'mp4', resolution: '1280x720', filesize: 45000000, isVideoOnly: false, isAudioOnly: false },
      { formatId: '480p', qualityLabel: '480p SD', ext: 'mp4', resolution: '854x480', filesize: 24750000, isVideoOnly: false, isAudioOnly: false },
      { formatId: '360p', qualityLabel: '360p Low', ext: 'mp4', resolution: '640x360', filesize: 15750000, isVideoOnly: false, isAudioOnly: false },
      { formatId: 'audio-mp3', qualityLabel: 'Audio Only (MP3)', ext: 'mp3', resolution: 'Audio', filesize: 3600000, isVideoOnly: false, isAudioOnly: true },
    ];

    return {
      id,
      url,
      title: 'YouTube Video (' + id + ')',
      description: 'Extracted video details',
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      duration: duration,
      durationFormatted: '03:45',
      uploader: 'YouTube Creator',
      viewCount: 1250000,
      formats: sampleFormats
    };
  }

  private static simulateBrowserDownload(
    title: string,
    downloadLocation: string,
    onProgress: (progress: number, speed: string, eta: string, status: string, filePath?: string) => void
  ): Promise<string> {
    return new Promise((resolve) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 5;
        const speed = '4.2 MB/s';
        const remainingSec = Math.ceil((100 - currentProgress) / 5);
        const eta = remainingSec > 0 ? `00:00:${remainingSec < 10 ? '0' : ''}${remainingSec}` : '00:00:00';
        onProgress(currentProgress, speed, eta, currentProgress >= 100 ? 'completed' : 'downloading');

        if (currentProgress >= 100) {
          clearInterval(interval);
          resolve(`${downloadLocation}/${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`);
        }
      }, 250);
    });
  }
}
