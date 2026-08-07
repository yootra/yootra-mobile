import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Clipboard, Download, MoreVertical, CheckCircle2 } from 'lucide-react';
import { Clipboard as CapClipboard } from '@capacitor/clipboard';
import type { DownloadItem } from '../types/ytdl';

interface HomeViewProps {
  onFetchInfo: (url: string) => void;
  isLoading: boolean;
  recentDownloads: DownloadItem[];
  onOpenSettings: () => void;
  onViewAllDownloads: () => void;
  onSelectRecent: (item: DownloadItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onFetchInfo,
  isLoading,
  recentDownloads,
  onOpenSettings,
  onViewAllDownloads,
  onSelectRecent
}) => {
  const { t } = useTranslation();
  const [urlInput, setUrlInput] = useState('');

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
        <button
          type="button"
          onClick={onOpenSettings}
          className="btn btn-circle btn-ghost text-base-content/70 hover:text-base-content"
        >
          <Settings className="w-6 h-6" />
        </button>
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
            className="w-full bg-base-200 border border-base-300 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-base-content placeholder-base-content/40 focus:outline-none focus:border-[#ba2c2c] rtl:pr-12 rtl:pl-12 transition shadow-xs"
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
          className="w-full btn bg-[#ba2c2c] hover:bg-[#a02424] text-white font-bold py-3.5 rounded-2xl border-none shadow-md flex items-center justify-center gap-2 text-base disabled:opacity-50"
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

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-base-content">
            {t('home.recentDownloads')}
          </h2>
          <button
            type="button"
            onClick={onViewAllDownloads}
            className="text-xs font-semibold text-[#ba2c2c] hover:underline"
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
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                    12:45
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-semibold text-xs text-base-content line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-base-content/60">
                    <span>{item.qualityLabel}</span>
                    <span>•</span>
                    <span>1.2 GB</span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('status.completed')}
                  </div>
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
