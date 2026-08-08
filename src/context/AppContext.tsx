import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Toast } from '@capacitor/toast';
import type { VideoInfo, VideoFormat, DownloadItem, AppSettings } from '../types/ytdl';
import { YtDlpService } from '../services/ytdlpService';
import { NotificationService } from '../services/notificationService';
import { StatusBarService } from '../services/statusBarService';
import { parseFileSizeInBytes, formatFileSize, sanitizeEta } from '../utils/formatters';
import { UpdateService, type UpdateInfo } from '../services/updateService';

export function isIpOrBotError(errorMsg?: string): boolean {
  if (!errorMsg) return false;
  const msg = errorMsg.toLowerCase();
  return (
    msg.includes('confirm you’re not a bot') ||
    msg.includes("confirm you're not a bot") ||
    msg.includes('bot') ||
    msg.includes('cookies') ||
    msg.includes('ip') ||
    msg.includes('429') ||
    msg.includes('403') ||
    msg.includes('forbidden') ||
    msg.includes('vpn')
  );
}

interface GeneralErrorState {
  isOpen: boolean;
  errorMsg: string;
  retryAction?: () => void;
}

interface AppContextType {
  videoInfo: VideoInfo | null;
  setVideoInfo: (info: VideoInfo | null) => void;
  isFetchingInfo: boolean;
  downloads: DownloadItem[];
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  isVpnModalOpen: boolean;
  setIsVpnModalOpen: (open: boolean) => void;
  generalErrorModal: GeneralErrorState;
  setGeneralErrorModal: React.Dispatch<React.SetStateAction<GeneralErrorState>>;
  isLogViewerOpen: boolean;
  setIsLogViewerOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  handleCompleteOnboarding: () => void;
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
  triggerErrorModal: (error: any, retryAction?: () => void) => void;
  updateInfo: UpdateInfo | null;
  isUpdateModalOpen: boolean;
  setIsUpdateModalOpen: (open: boolean) => void;
  checkForUpdatesManually: () => Promise<void>;
  isCheckingUpdates: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState<boolean>(false);
  const [selectedFormatToDownload, setSelectedFormatToDownload] = useState<VideoFormat | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const [isVpnModalOpen, setIsVpnModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('yt_app_onboarded');
  });

  const handleCompleteOnboarding = () => {
    localStorage.setItem('yt_app_onboarded', 'true');
    setIsOnboardingOpen(false);
  };
  const [generalErrorModal, setGeneralErrorModal] = useState<GeneralErrorState>({ isOpen: false, errorMsg: '' });
  const [isLogViewerOpen, setIsLogViewerOpen] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');

  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState<boolean>(false);

  useEffect(() => {
    UpdateService.checkForUpdates().then((info) => {
      if (info.updateAvailable) {
        setUpdateInfo(info);
        setIsUpdateModalOpen(true);
      }
    });
  }, []);

  const checkForUpdatesManually = async () => {
    if (isCheckingUpdates) return;
    setIsCheckingUpdates(true);
    try {
      const info = await UpdateService.checkForUpdates();
      setUpdateInfo(info);
      if (info.updateAvailable) {
        setIsUpdateModalOpen(true);
      } else {
        showToast(i18n.t('settings.noUpdate'));
      }
    } finally {
      setTimeout(() => {
        setIsCheckingUpdates(false);
      }, 750);
    }
  };

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

  const triggerErrorModal = (error: any, retryAction?: () => void) => {
    const msg = typeof error === 'string' ? error : (error?.message || String(error));
    if (isIpOrBotError(msg)) {
      setIsVpnModalOpen(true);
    } else {
      setGeneralErrorModal({
        isOpen: true,
        errorMsg: msg,
        retryAction
      });
    }
  };

  const handleFetchInfo = async (url: string) => {
    setIsFetchingInfo(true);
    setVideoInfo(null);
    try {
      const info = await YtDlpService.fetchVideoInfo(url);
      setVideoInfo(info);
      return Promise.resolve();
    } catch (err: any) {
      showToast(i18n.t('errors.fetchDetails'));
      triggerErrorModal(err, () => handleFetchInfo(url));
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

                if (status === 'error' && errorMsg) {
                  triggerErrorModal(errorMsg, () => handleConfirmDownload());
                }

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
      const errorMsgStr = err?.message || i18n.t('errors.downloadFailed');
      setDownloads((prev) =>
        prev.map((item) =>
          item.id === downloadId
            ? { ...item, status: 'error', errorMsg: errorMsgStr }
            : item
        )
      );
      triggerErrorModal(err, () => handleConfirmDownload());
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
      generalErrorModal, setGeneralErrorModal,
      isLogViewerOpen, setIsLogViewerOpen,
      isOnboardingOpen, setIsOnboardingOpen,
      handleCompleteOnboarding,
      isBottomSheetOpen, setIsBottomSheetOpen,
      selectedFormatToDownload,
      handleFetchInfo,
      handleRequestDownload,
      handleConfirmDownload,
      handleCancelDownload,
      handleDeleteDownload,
      changeLanguage,
      activeDownload,
      inputUrl, setInputUrl,
      triggerErrorModal,
      updateInfo,
      isUpdateModalOpen,
      setIsUpdateModalOpen,
      checkForUpdatesManually,
      isCheckingUpdates
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
