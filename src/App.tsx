import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HomeView } from './components/HomeView';
import { VideoPreviewView } from './components/VideoPreviewView';
import { DownloadingView } from './components/DownloadingView';
import { DownloadsHistory } from './components/DownloadsHistory';
import { SettingsView } from './components/SettingsView';
import { BottomNav } from './components/BottomNav';
import { CreatorSupportBottomSheet } from './components/CreatorSupportBottomSheet';
import type { VideoInfo, VideoFormat, DownloadItem, AppSettings } from './types/ytdl';
import { YtDlpService } from './services/ytdlpService';
import { NotificationService } from './services/notificationService';
import { StatusBarService } from './services/statusBarService';
import { Toast } from '@capacitor/toast';

export const App: React.FC = () => {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentView, setCurrentView] = useState<'home' | 'preview' | 'downloading'>('home');

  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState<boolean>(false);

  const [selectedFormatToDownload, setSelectedFormatToDownload] = useState<VideoFormat | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);

  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    const saved = localStorage.getItem('yt_downloads_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('yt_app_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          defaultQuality: '720p',
          downloadLocation: 'Movies',
          autoPasteClipboard: true,
          maxSimultaneousDownloads: 2,
          theme: 'light' as any
        };
      }
    }
    return {
      defaultQuality: '720p',
      downloadLocation: 'Movies',
      autoPasteClipboard: true,
      maxSimultaneousDownloads: 2,
      theme: 'light' as any
    };
  });

  useEffect(() => {
    localStorage.setItem('yt_downloads_history', JSON.stringify(downloads));
  }, [downloads]);

  useEffect(() => {
    localStorage.setItem('yt_app_settings', JSON.stringify(settings));
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    const isDark = settings.theme === 'dark' || settings.theme === 'dim' || settings.theme === 'synthwave';
    StatusBarService.updateTheme(isDark, isDark ? '#1d232a' : '#ffffff');
  }, [settings]);

  useEffect(() => {
    const lang = i18n.language || 'fa';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
  }, [i18n.language]);

  const showToast = async (text: string) => {
    try {
      await Toast.show({ text, duration: 'short' });
    } catch {
      console.log(text);
    }
  };

  const handleFetchInfo = async (url: string) => {
    setIsFetchingInfo(true);
    setVideoInfo(null);
    try {
      const info = await YtDlpService.fetchVideoInfo(url);
      setVideoInfo(info);
      setCurrentView('preview');
    } catch {
      showToast('Error fetching video details.');
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

    const newItem: DownloadItem = {
      id: downloadId,
      url: videoInfo.url,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      formatId: format.formatId,
      qualityLabel: format.qualityLabel,
      ext: format.ext,
      progress: 0,
      speed: '4.8 MB/s',
      eta: '00:01:24',
      status: 'downloading',
      timestamp: Date.now()
    };

    setDownloads((prev) => [newItem, ...prev]);
    setCurrentView('downloading');

    try {
      await NotificationService.requestPermission();

      const filePath = await YtDlpService.startDownload(
        videoInfo.url,
        format.formatId,
        videoInfo.title,
        downloadId,
        settings.downloadLocation,
        (progress, speed, eta, status, path, errorMsg) => {
          setDownloads((prev) =>
            prev.map((item) => {
              if (item.id === downloadId) {
                return {
                  ...item,
                  progress,
                  speed,
                  eta,
                  status: (status as DownloadItem['status']) || item.status,
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

      await NotificationService.sendDownloadCompletedNotification(
        videoInfo.title,
        format.qualityLabel,
        format.ext,
        '412 MB'
      );
    } catch {
      setDownloads((prev) =>
        prev.map((item) =>
          item.id === downloadId
            ? { ...item, status: 'error', errorMsg: 'Download failed' }
            : item
        )
      );
    }
  };

  const handleCancelDownload = async (id: string) => {
    await YtDlpService.cancelDownload(id);
    setDownloads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item))
    );
    setCurrentView('home');
  };

  const handleDeleteDownload = (id: string) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('yt_app_language', lang);
  };

  const activeDownload = downloads.find((d) => d.status === 'downloading');

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col pb-20 safe-top">
      <main className="flex-1 max-w-lg w-full mx-auto px-5 py-3">
        {activeTab === 'home' && (
          <>
            {currentView === 'home' && (
              <HomeView
                onFetchInfo={handleFetchInfo}
                isLoading={isFetchingInfo}
                recentDownloads={downloads}
                onOpenSettings={() => setActiveTab('settings')}
                onViewAllDownloads={() => setActiveTab('downloads')}
                onSelectRecent={() => setActiveTab('downloads')}
              />
            )}

            {currentView === 'preview' && videoInfo && (
              <VideoPreviewView
                videoInfo={videoInfo}
                onBack={() => setCurrentView('home')}
                onRequestDownload={handleRequestDownload}
                isDownloading={!!activeDownload}
              />
            )}

            {currentView === 'downloading' && (
              <DownloadingView
                item={activeDownload || downloads[0] || {
                  id: 'demo',
                  url: '',
                  title: videoInfo?.title || 'YouTube Video',
                  thumbnail: videoInfo?.thumbnail || '',
                  formatId: '1080p',
                  qualityLabel: '1080p (Full HD)',
                  ext: 'mp4',
                  progress: 72,
                  speed: '4.8 MB/s',
                  eta: '00:01:24',
                  status: 'downloading',
                  timestamp: Date.now()
                }}
                onBack={() => setCurrentView('home')}
                onCancel={handleCancelDownload}
              />
            )}
          </>
        )}

        {activeTab === 'downloads' && (
          <DownloadsHistory
            downloads={downloads}
            onDelete={handleDeleteDownload}
            onOpenHomeUrlInput={() => {
              setActiveTab('home');
              setCurrentView('home');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            onLanguageChange={handleLanguageChange}
          />
        )}
      </main>

      <CreatorSupportBottomSheet
        isOpen={isBottomSheetOpen}
        onConfirm={handleConfirmDownload}
        onCancel={() => setIsBottomSheetOpen(false)}
      />

      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'home' && currentView === 'downloading') {
            setCurrentView('home');
          }
        }}
      />
    </div>
  );
};

export default App;
