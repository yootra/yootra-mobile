import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MoreVertical, Folder, Share2, Trash2, CheckCircle2, Plus, Play, Music, Film, Loader2, AlertCircle, XCircle } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import type { DownloadItem } from '../types/ytdl';
import { formatDuration, formatFileSize } from '../utils/formatters';

interface DownloadsHistoryProps {
  downloads: DownloadItem[];
  onDelete: (id: string) => void;
  onOpenHomeUrlInput?: () => void;
  onOpenDownloading?: () => void;
}

export const DownloadsHistory: React.FC<DownloadsHistoryProps> = ({
  downloads,
  onDelete,
  onOpenHomeUrlInput,
  onOpenDownloading
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'downloading' | 'video' | 'audio'>('all');
  const [selectedItem, setSelectedItem] = useState<DownloadItem | null>(null);

  const filtered = downloads.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'completed') return item.status === 'completed';
    if (activeFilter === 'downloading') return item.status === 'downloading';
    if (activeFilter === 'video') return item.ext !== 'mp3' && item.ext !== 'm4a';
    if (activeFilter === 'audio') return item.ext === 'mp3' || item.ext === 'm4a';
    return true;
  });

  const handleShare = async (item: DownloadItem) => {
    try {
      await Share.share({
        title: item.title,
        text: item.title,
        url: item.filePath ? Capacitor.convertFileSrc(item.filePath) : item.url,
        dialogTitle: 'Share Downloaded File'
      });
    } catch {
      if (navigator.share) {
        navigator.share({
          title: item.title,
          url: item.url
        }).catch(() => {});
      }
    }
  };

  const getPlayableSrc = (item: DownloadItem) => {
    if (!item.filePath) return 'https://www.w3schools.com/html/mov_bbb.mp4';
    if (item.filePath.startsWith('http://') || item.filePath.startsWith('https://')) {
      return item.filePath;
    }
    return Capacitor.convertFileSrc(item.filePath);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-12 relative">
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-2xl font-bold text-base-content tracking-tight">
          {t('downloads.title')}
        </h1>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('downloads.searchPlaceholder')}
          className="w-full bg-base-200 border border-base-300 rounded-2xl py-3 pl-10 pr-4 text-sm text-base-content placeholder-base-content/40 focus:outline-none focus:border-[#ba2c2c] rtl:pr-10 rtl:pl-4 transition shadow-xs"
        />
        <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5 rtl:right-3.5 rtl:left-auto" />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        {(['all', 'completed', 'downloading', 'video', 'audio'] as const).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full font-semibold capitalize whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#ba2c2c] text-white shadow-xs'
                  : 'bg-base-200 text-base-content/70 hover:bg-base-300'
              }`}
            >
              {t(`downloads.${filter}`)}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-base-200/50 rounded-2xl p-10 text-center space-y-2 border border-base-300/50">
          <p className="font-bold text-base text-base-content">
            {t('downloads.empty')}
          </p>
          <p className="text-xs text-base-content/60">
            {t('downloads.emptySub')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.status === 'downloading' && onOpenDownloading) {
                  onOpenDownloading();
                }
              }}
              className={`bg-base-200/60 border border-base-300 rounded-2xl p-3.5 space-y-3 shadow-xs ${
                item.status === 'downloading' ? 'cursor-pointer hover:border-[#ba2c2c]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-base-300 shrink-0">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.status === 'completed' && (
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-90 hover:opacity-100 transition"
                    >
                      <Play className="w-6 h-6 fill-white stroke-none" />
                    </button>
                  )}
                  {item.durationFormatted && (
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-semibold px-1 py-0.5 rounded font-mono">
                      {item.durationFormatted || formatDuration(item.duration)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-semibold text-xs text-base-content line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    {item.status === 'completed' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {item.status === 'downloading' && (
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    )}

                    {item.status === 'error' && (
                      <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {item.status === 'cancelled' && (
                      <div className="w-5 h-5 rounded-full bg-base-300 text-base-content/60 flex items-center justify-center shrink-0">
                        <XCircle className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-base-content/60 flex items-center gap-1.5 font-mono">
                    <span>{item.qualityLabel}</span>
                    <span>•</span>
                    <span>{formatFileSize(item.fileSize, item.qualityLabel, item.duration || 180)}</span>
                  </div>

                  {item.status === 'downloading' && (
                    <div className="space-y-1 pt-1">
                      <div className="w-full bg-base-300 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#ba2c2c] h-full transition-all duration-300"
                          style={{ width: `${Math.min(Math.max(item.progress || 0, 0), 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-base-content/60 font-mono flex items-center justify-between">
                        <span>{t('downloading.title')}... {item.progress}%</span>
                        <span>{item.speed}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-base-300/50 pt-2 text-base-content/60">
                <div className="flex items-center gap-1 text-[11px]">
                  {item.ext === 'mp3' ? <Music className="w-3.5 h-3.5 text-amber-500" /> : <Film className="w-3.5 h-3.5 text-blue-500" />}
                  <span className="uppercase font-semibold">{item.ext}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="p-1 hover:text-base-content"
                    title="Folder"
                  >
                    <Folder className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(item)}
                    className="p-1 hover:text-base-content"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="p-1 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1 hover:text-base-content"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {onOpenHomeUrlInput && (
        <button
          type="button"
          onClick={onOpenHomeUrlInput}
          className="fixed bottom-20 right-5 z-40 btn btn-circle bg-[#ba2c2c] hover:bg-[#a02424] text-white border-none shadow-xl"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-base-100 w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-base-content truncate pr-2">
                {selectedItem.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              <video
                controls
                autoPlay
                src={getPlayableSrc(selectedItem)}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
