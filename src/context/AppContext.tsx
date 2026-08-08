import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Toast } from '@capacitor/toast';
import type { VideoInfo, VideoFormat, DownloadItem, AppSettings } from '../types/ytdl';
import { YtDlpService } from '../services/ytdlpService';
import { NotificationService } from '../services/notificationService';
import { StatusBarService } from '../services/statusBarService';
import { parseFileSizeInBytes, formatFileSize, sanitizeEta } from '../utils/formatters';

interface AppContextType {
  videoInfo: VideoInfo | null;
  setVideoInfo: (info: VideoInfo | null) => void;
  isFetchingInfo: boolean;
  downloads: DownloadItem[];
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  isVpnModalOpen: boolean;
  setIsVpnModalOpen: (open: boolean) => void;
  isBottomSheetOpen: boolean;
  setIsBottomSheetOpen: (open: boolean) => void;
  selectedFormatToDownload: VideoFormat | null;
  handleFetchInfo: (url: string) => Promise<void>;
  handleRequestDownload: (format: VideoFormat) => void;
  handleConfirmDownload: () => Promise<void>;
  handleCancelDownload: (id: string) => Promise<void>;
  handleDeleteDownload: (id: string) => void;
  changeLanguage: (lang: string) => void;
  activeDownload: DownloadItem | undefined;
  inputUrl: string;
  setInputUrl: (url: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  // Using generic window routing since we can't safely use useNavigate outside RouterProvider in some setups,
  // but wait, AppProvider will be inside RouterProvider if we want it to, OR we just use a callback.
  // Actually, let's keep router out of AppContext to avoid circular deps. The components can handle navigation.
  
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState<boolean>(false);
  const [selectedFormatToDownload, setSelectedFormatToDownload] = useState<VideoFormat | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const [isVpnModalOpen, setIsVpnModalOpen] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');

  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    const saved = localStorage.getItem('yt_downloads_history');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('yt_app_settings');
    if (saved) {
      try { return JSON.parse(saved); } 
      catch {
        return { defaultQuality: '720p', downloadLocation: 'Movies', autoPasteClipboard: true, maxSimultaneousDownloads: 2, theme: 'light' as any };
      }
    }
    return { defaultQuality: '720p', downloadLocation: 'Movies', autoPasteClipboard: true, maxSimultaneousDownloads: 2, theme: 'light' as any };
  });

  useEffect(() => {
    localStorage.setItem('yt_downloads_history', JSON.stringify(downloads));
  }, [downloads]);

  useEffect(() => {
    localStorage.setItem('yt_app_settings', JSON.stringify(settings));
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    const lightThemes = ['light', 'retro', 'cyberpunk', 'valentine'];
    const isDark = !lightThemes.includes(settings.theme || 'light');

    const themeColors: Record<string, string> = {
      light: '#ffffff',
      dark: '#1d232a',
      dim: '#2a303c',
      synthwave: '#1a103c',
      retro: '#e4d8b4',
      cyberpunk: '#ffe000',
      valentine: '#e96d7b',
      aqua: '#345da7',
      black: '#000000'
    };
    const hexColor = themeColors[settings.theme || 'light'] || '#ffffff';

    StatusBarService.updateTheme(isDark, hexColor);
  }, [settings]);

  useEffect(() => {
    const lang = i18n.language || 'fa';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
  }, [i18n.language]);

  const showToast = async (text: string) => {
    try { await Toast.show({ text, duration: 'short' }); } 
    catch { console.log(text); }
  };

  const handleFetchInfo = async (url: string) => {
    setIsFetchingInfo(true);
    setVideoInfo(null);
    try {
      const info = await YtDlpService.fetchVideoInfo(url);
      setVideoInfo(info);
      return Promise.resolve();
    } catch (err: any) {
      showToast('Error fetching video details.');
      setIsVpnModalOpen(true);
      return Promise.reject(err);
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const handleRequestDownload = (format: VideoFormat) => {
    setSelectedFormatToDownload(format);
    setIsBottomSheetOpen(true);
  };

  const handleConfirmDownload = async () => {
    setIsBottomSheetOpen(false);
    if (!selectedFormatToDownload || !videoInfo) return;

    const format = selectedFormatToDownload;
    const downloadId = Date.now().toString();
    const computedSizeBytes = parseFileSizeInBytes(format.filesize, format.qualityLabel, videoInfo.duration);

    const newItem: DownloadItem = {
      id: downloadId,
      url: videoInfo.url,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      formatId: format.formatId,
      qualityLabel: format.qualityLabel,
      ext: format.ext,
      progress: 0,
      speed: '0 MB/s',
      eta: sanitizeEta('-1', i18n.language),
      status: 'downloading',
      fileSize: computedSizeBytes,
      duration: videoInfo.duration,
      durationFormatted: videoInfo.durationFormatted,
      timestamp: Date.now()
    };

    setDownloads((prev) => [newItem, ...prev]);

    try {
      await NotificationService.requestPermission();

      const filePath = await YtDlpService.startDownload(
        videoInfo.url,
        format.formatId,
        videoInfo.title,
        downloadId,
        settings.downloadLocation,
        format.ext,
        (progress, speed, eta, status, path, errorMsg) => {
          setDownloads((prev) =>
            prev.map((item) => {
              if (item.id === downloadId) {
                const nextStatus = status === 'completed' || status === 'error' || status === 'cancelled'
                  ? (status as DownloadItem['status'])
                  : item.status;

                return {
                  ...item,
                  progress,
                  speed: speed || item.speed,
                  eta: sanitizeEta(eta, i18n.language),
                  status: nextStatus,
                  filePath: path || item.filePath,
                  errorMsg: errorMsg || item.errorMsg
                };
              }
              return item;
            })
          );
        }
      );

      setDownloads((prev) =>
        prev.map((item) =>
          item.id === downloadId
            ? { ...item, status: 'completed', progress: 100, filePath: item.filePath || filePath }
            : item
        )
      );

      const readableSize = formatFileSize(computedSizeBytes, format.qualityLabel, videoInfo.duration);
      await NotificationService.sendDownloadCompletedNotification(
        videoInfo.title,
        format.qualityLabel,
        format.ext,
        readableSize
      );
    } catch (err: any) {
      setDownloads((prev) =>
        prev.map((item) =>
          item.id === downloadId
            ? { ...item, status: 'error', errorMsg: 'Download failed' }
            : item
        )
      );
      setIsVpnModalOpen(true);
    }
  };

  const handleCancelDownload = async (id: string) => {
    await YtDlpService.cancelDownload(id);
    setDownloads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item))
    );
  };

  const handleDeleteDownload = (id: string) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id));
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('yt_app_language', lang);
  };

  const activeDownload = downloads.find((d) => d.status === 'downloading');

  return (
    <AppContext.Provider value={{
      videoInfo, setVideoInfo,
      isFetchingInfo,
      downloads,
      settings, updateSettings: setSettings,
      isVpnModalOpen, setIsVpnModalOpen,
      isBottomSheetOpen, setIsBottomSheetOpen,
      selectedFormatToDownload,
      handleFetchInfo,
      handleRequestDownload,
      handleConfirmDownload,
      handleCancelDownload,
      handleDeleteDownload,
      changeLanguage,
      activeDownload,
      inputUrl, setInputUrl
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
