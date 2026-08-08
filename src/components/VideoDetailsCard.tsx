import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { VideoInfo, VideoFormat } from '../types/ytdl';
import { Download, Film, Music, Clock, Eye, CheckCircle2, Sliders } from 'lucide-react';
import { formatViewCount } from '../utils/formatters';

interface VideoDetailsCardProps {
  videoInfo: VideoInfo;
  onStartDownload: (format: VideoFormat) => void;
  isDownloading: boolean;
}

export const VideoDetailsCard: React.FC<VideoDetailsCardProps> = ({
  videoInfo,
  onStartDownload,
  isDownloading
}) => {
  const { t, i18n } = useTranslation();
  const [selectedFormatId, setSelectedFormatId] = useState<string>(
    videoInfo.formats[0]?.formatId || '720p'
  );

  const selectedFormat =
    videoInfo.formats.find((f) => f.formatId === selectedFormatId) ||
    videoInfo.formats[0];

  const formatFileSize = (bytes: number) => {
    if (!bytes) return t('preview.unknownSize', { defaultValue: 'Unknown size' });
    const mb = bytes / (1024 * 1024);
    if (mb > 1000) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="flat-card p-4 space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
        <img
          src={videoInfo.thumbnail}
          alt={videoInfo.title}
          className="w-full aspect-video object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-slate-900/90 border border-slate-700 text-white text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {videoInfo.durationFormatted}
        </div>
      </div>

      <div className="space-y-1.5">
        <h2 className="font-bold text-base text-white line-clamp-2 leading-snug">
          {videoInfo.title}
        </h2>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">{videoInfo.uploader}</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatViewCount(videoInfo.viewCount, i18n.language)} {t('preview.views')}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            {t('preview.chooseQuality')}
          </label>
          <span className="text-[11px] text-blue-400 font-semibold bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
            {formatFileSize(selectedFormat.filesize)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
          {videoInfo.formats.map((fmt) => {
            const isSelected = fmt.formatId === selectedFormatId;
            return (
              <button
                key={fmt.formatId}
                type="button"
                onClick={() => setSelectedFormatId(fmt.formatId)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition ${
                  isSelected
                    ? 'bg-slate-800 border-red-500 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {fmt.isAudioOnly ? (
                    <div className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                      <Music className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                      <Film className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-white">
                      {fmt.qualityLabel}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">
                      {fmt.ext} • {fmt.resolution}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    {formatFileSize(fmt.filesize)}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        disabled={isDownloading}
        onClick={() => onStartDownload(selectedFormat)}
        className="w-full flat-btn-primary py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold shadow-lg disabled:opacity-50"
      >
        {isDownloading ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            {t('home.fetching')}
          </>
        ) : (
          <>
            <Download className="w-4 h-4 stroke-[2.5]" />
            {t('preview.downloadBtn')} ({selectedFormat.qualityLabel})
          </>
        )}
      </button>
    </div>
  );
};
