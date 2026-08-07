import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { VideoDetailsCard } from './components/VideoDetailsCard';
import { DownloadProgress } from './components/DownloadProgress';
import { DownloadsHistory } from './components/DownloadsHistory';
import { SettingsView } from './components/SettingsView';
import { BottomNav } from './components/BottomNav';
import type { VideoInfo, VideoFormat, DownloadItem, AppSettings } from './types/ytdl';
import { YtDlpService } from './services/ytdlpService';
import { Toast } from '@capacitor/toast';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState<boolean>(false);
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
          theme: 'dark'
        };
      }
    }
    return {
      defaultQuality: '720p',
      downloadLocation: 'Movies',
      autoPasteClipboard: true,
      maxSimultaneousDownloads: 2,
      theme: 'dark'
    };
  });

  useEffect(() => {
    localStorage.setItem('yt_downloads_history', JSON.stringify(downloads));
  }, [downloads]);

  useEffect(() => {
    localStorage.setItem('yt_app_settings', JSON.stringify(settings));
  }, [settings]);

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
      showToast('Video details loaded successfully!');
    } catch {
      showToast('Error fetching video information.');
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const handleStartDownload = async (format: VideoFormat) => {
    if (!videoInfo) return;

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
      speed: '0 KB/s',
      eta: 'Connecting...',
      status: 'downloading',
      timestamp: Date.now()
    };

    setDownloads((prev) => [newItem, ...prev]);
    showToast(`Starting download (${format.qualityLabel})...`);

    try {
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

      showToast('Download completed!');
    } catch {
      setDownloads((prev) =>
        prev.map((item) =>
          item.id === downloadId
            ? { ...item, status: 'error', errorMsg: 'Download failed' }
            : item
        )
      );
      showToast('Download failed.');
    }
  };

  const handleCancelDownload = async (id: string) => {
    await YtDlpService.cancelDownload(id);
    setDownloads((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'cancelled' } : item
      )
    );
    showToast('Download cancelled.');
  };

  const handleDeleteDownload = (id: string) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id));
    showToast('Media file removed from library.');
  };

  const activeDownload = downloads.find((d) => d.status === 'downloading');
  const completedCount = downloads.filter((d) => d.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20">
      <Header activeTab={activeTab} />

      <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">
        {activeTab === 'home' && (
          <>
            <UrlInput onFetchInfo={handleFetchInfo} isLoading={isFetchingInfo} />

            {videoInfo && (
              <VideoDetailsCard
                videoInfo={videoInfo}
                onStartDownload={handleStartDownload}
                isDownloading={!!activeDownload}
              />
            )}

            {downloads.map((item) => (
              <DownloadProgress
                key={item.id}
                item={item}
                onCancel={handleCancelDownload}
              />
            ))}
          </>
        )}

        {activeTab === 'downloads' && (
          <DownloadsHistory
            downloads={downloads}
            onDelete={handleDeleteDownload}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        downloadsCount={completedCount}
      />
    </div>
  );
};

export default App;
