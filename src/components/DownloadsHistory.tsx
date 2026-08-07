import React, { useState } from 'react';
import type { DownloadItem } from '../types/ytdl';
import { Play, Share2, Trash2, HardDrive, FileVideo, Music, Search, FolderDown } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

interface DownloadsHistoryProps {
  downloads: DownloadItem[];
  onDelete: (id: string) => void;
}

export const DownloadsHistory: React.FC<DownloadsHistoryProps> = ({
  downloads,
  onDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<DownloadItem | null>(null);

  const completedDownloads = downloads.filter((d) => d.status === 'completed');

  const filteredDownloads = completedDownloads.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = async (item: DownloadItem) => {
    try {
      await Share.share({
        title: item.title,
        text: `Downloaded using YT Downloader: ${item.title}`,
        url: item.filePath ? Capacitor.convertFileSrc(item.filePath) : item.url,
        dialogTitle: 'Share Downloaded File'
      });
    } catch {
      if (navigator.share) {
        navigator.share({
          title: item.title,
          text: item.title,
          url: window.location.href
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
    <div className="space-y-4">
      <div className="flat-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-sm text-white">Media Library</h2>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2.5 py-0.5 rounded-full border border-slate-700">
            {completedDownloads.length} Files
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search downloaded files..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {filteredDownloads.length === 0 ? (
        <div className="flat-card p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <FolderDown className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-sm text-white">No Downloads Found</p>
            <p className="text-xs text-slate-400">
              Downloaded videos and audio files will appear here for local playback.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredDownloads.map((item) => (
            <div
              key={item.id}
              className="flat-card p-3 flex items-center justify-between gap-3"
            >
              <div className="relative w-16 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white hover:bg-slate-900/40 transition"
                >
                  <Play className="w-5 h-5 fill-white stroke-none" />
                </button>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-semibold text-xs text-white truncate">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    {item.ext === 'mp3' || item.ext === 'm4a' ? (
                      <Music className="w-3 h-3 text-amber-400" />
                    ) : (
                      <FileVideo className="w-3 h-3 text-blue-400" />
                    )}
                    {item.qualityLabel}
                  </span>
                  <span>•</span>
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleShare(item)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg active:bg-slate-800"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-red-400 rounded-lg active:bg-slate-800"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="flat-card w-full max-w-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white truncate pr-2">
                {selectedItem.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded"
              >
                Close
              </button>
            </div>
            <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
              <video
                controls
                autoPlay
                src={getPlayableSrc(selectedItem)}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="truncate max-w-[240px]">Path: {selectedItem.filePath}</span>
              <button
                type="button"
                onClick={() => handleShare(selectedItem)}
                className="text-blue-400 hover:underline flex items-center gap-1 font-semibold shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
