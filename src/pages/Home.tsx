import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clipboard, Download, MoreVertical, CheckCircle2, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { Clipboard as CapClipboard } from '@capacitor/clipboard';
import type { DownloadItem } from '../types/ytdl';
import { formatDuration, formatFileSize, sanitizeEta } from '../utils/formatters';

interface HomeViewProps {
  onFetchInfo: (url: string) => void;
  isLoading: boolean;
  recentDownloads: DownloadItem[];
  onViewAllDownloads: () => void;
  onSelectRecent: (item: DownloadItem) => void;
  onOpenActiveDownloading?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onFetchInfo,
  isLoading,
  recentDownloads,
  onViewAllDownloads,
  onSelectRecent,
  onOpenActiveDownloading
}) => {
  const { t, i18n } = useTranslation();
  const [urlInput, setUrlInput] = useState('');

  const activeDownload = recentDownloads.find((d) => d.status === 'downloading');

  const handlePaste = async () => {
    try {
      const { value } = await CapClipboard.read();
      if (value) {
        setUrlInput(value);
      }
    } catch {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrlInput(text);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onFetchInfo(urlInput.trim());
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">
            {t('home.title')}
          </h1>
          <p className="text-sm text-base-content/60 mt-0.5">
            {t('home.subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-base-content/40 rtl:right-4 rtl:left-auto">
            <Clipboard className="w-5 h-5" />
          </div>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={t('home.placeholder')}
            className="w-full bg-base-200 border border-base-300 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-base-content placeholder-base-content/40 focus:outline-none focus:border-primary rtl:pr-12 rtl:pl-12 transition shadow-xs"
            required
          />
          <button
            type="button"
            onClick={handlePaste}
            className="absolute right-3 text-base-content/60 hover:text-base-content p-1.5 rounded-xl hover:bg-base-300 rtl:left-3 rtl:right-auto"
          >
            <Clipboard className="w-5 h-5" />
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || !urlInput.trim()}
          className="w-full btn btn-primary py-3.5 rounded-2xl border-none shadow-md flex items-center justify-center gap-2 text-base disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-md"></span>
              {t('home.fetching')}
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              {t('home.downloadBtn')}
            </>
          )}
        </button>
      </form>

      {activeDownload && (
        <div
          onClick={onOpenActiveDownloading}
          className="bg-base-200/80 border border-primary/40 rounded-2xl p-4 space-y-3 cursor-pointer hover:border-primary transition shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('downloading.title')} ({activeDownload.progress || 0}%)
            </span>
            <span className="text-xs font-mono text-base-content/60">
              {sanitizeEta(activeDownload.eta, i18n.language)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={activeDownload.thumbnail}
              alt={activeDownload.title}
              className="w-16 h-12 rounded-xl object-cover bg-base-300 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xs text-base-content truncate">
                {activeDownload.title}
              </h3>
              <div className="text-[11px] text-base-content/60 font-mono mt-0.5">
                {activeDownload.qualityLabel} • {activeDownload.speed || '0 MB/s'}
              </div>
            </div>
          </div>

          <div className="w-full bg-base-300 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${Math.min(Math.max(activeDownload.progress || 0, 0), 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-base-content">
            {t('home.recentDownloads')}
          </h2>
          <button
            type="button"
            onClick={onViewAllDownloads}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {t('home.viewAll')}
          </button>
        </div>

        {recentDownloads.length === 0 ? (
          <div className="bg-base-200/50 rounded-2xl p-8 text-center text-sm text-base-content/50 border border-base-300/50">
            {t('home.noRecent')}
          </div>
        ) : (
          <div className="space-y-3">
            {recentDownloads.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectRecent(item)}
                className="flex items-center gap-3.5 bg-base-200/60 border border-base-300/60 hover:border-base-300 p-3 rounded-2xl cursor-pointer transition shadow-xs"
              >
                <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-base-300 shrink-0">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.durationFormatted && (
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded font-mono">
                      {item.durationFormatted || formatDuration(item.duration)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-semibold text-xs text-base-content line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-base-content/60 font-mono">
                    <span>{item.qualityLabel}</span>
                    <span>•</span>
                    <span>{formatFileSize(item.fileSize, item.qualityLabel, item.duration || 180)}</span>
                  </div>

                  {item.status === 'completed' && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('status.completed')}
                    </div>
                  )}

                  {item.status === 'downloading' && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {t('downloading.title')} ({item.progress}%)
                    </div>
                  )}

                  {item.status === 'error' && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      {t('status.failed')}
                    </div>
                  )}

                  {item.status === 'cancelled' && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-base-content/60 bg-base-300 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" />
                      {t('status.cancelled')}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-circle btn-sm text-base-content/50"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
