import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, MoreVertical, Play, Music, Film, Download } from 'lucide-react';
import type { VideoInfo, VideoFormat } from '../types/ytdl';
import { formatDuration, formatFileSize, formatViewCount } from '../utils/formatters';

interface VideoPreviewViewProps {
  videoInfo: VideoInfo;
  onBack: () => void;
  onRequestDownload: (format: VideoFormat) => void;
  isDownloading: boolean;
}

export const VideoPreviewView: React.FC<VideoPreviewViewProps> = ({
  videoInfo,
  onBack,
  onRequestDownload,
  isDownloading
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [selectedFormatId, setSelectedFormatId] = useState<string>(
    videoInfo.formats[0]?.formatId || '720p'
  );

  const selectedFormat =
    videoInfo.formats.find((f) => f.formatId === selectedFormatId) ||
    videoInfo.formats[0];

  return (
    <div className="h-full flex flex-col px-5 py-3 space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-circle btn-ghost text-base-content/80"
        >
          {isRtl ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
        </button>
        <button
          type="button"
          className="btn btn-circle btn-ghost text-base-content/60"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-md border border-base-300">
        <img
          src={videoInfo.thumbnail}
          alt={videoInfo.title}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs">
            <Play className="w-6 h-6 fill-white stroke-none ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-2 py-0.5 rounded-md font-mono">
          {videoInfo.durationFormatted || formatDuration(videoInfo.duration)}
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-lg font-bold text-base-content leading-snug">
          {videoInfo.title}
        </h1>
        <div className="flex items-center gap-2 text-xs text-base-content/60">
          <span className="font-semibold">{videoInfo.uploader}</span>
          <span>•</span>
          <span>{formatViewCount(videoInfo.viewCount, i18n.language)} {isRtl ? 'بازدید' : 'views'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col pt-2">
        <h2 className="text-sm font-bold text-base-content uppercase tracking-wider mb-3">
          {t('preview.chooseQuality')}
        </h2>

        <div className="flex-1 overflow-y-auto space-y-2.5 pb-2 pr-1 custom-scrollbar">
          {videoInfo.formats.map((fmt) => {
            const isSelected = fmt.formatId === selectedFormatId;
            return (
              <div
                key={fmt.formatId}
                onClick={() => setSelectedFormatId(fmt.formatId)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-base-200 border-primary shadow-xs'
                    : 'bg-base-200/40 border-base-300 hover:border-base-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="quality"
                      checked={isSelected}
                      onChange={() => setSelectedFormatId(fmt.formatId)}
                      className="radio radio-primary border-2"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {fmt.isAudioOnly ? (
                      <Music className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Film className="w-4 h-4 text-base-content/60" />
                    )}
                    <span className="text-sm font-semibold text-base-content">
                      {fmt.isAudioOnly ? t('preview.audioOnly') : fmt.qualityLabel}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono text-base-content/60">
                  {formatFileSize(fmt.filesize, fmt.qualityLabel, videoInfo.duration)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        disabled={isDownloading}
        onClick={() => onRequestDownload(selectedFormat)}
        className="w-full btn btn-primary py-3.5 rounded-2xl border-none shadow-lg flex items-center justify-center gap-2 text-base disabled:opacity-50 mt-4"
      >
        {isDownloading ? (
          <>
            <span className="loading loading-spinner loading-md"></span>
            {t('home.fetching')}
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            {t('preview.downloadBtn')}
          </>
        )}
      </button>
    </div>
  );
};
