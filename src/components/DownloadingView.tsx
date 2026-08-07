import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, MoreVertical, Pause, X } from 'lucide-react';
import type { DownloadItem } from '../types/ytdl';
import { formatFileSize, parseFileSizeInBytes, sanitizeEta } from '../utils/formatters';

interface DownloadingViewProps {
  item: DownloadItem;
  onBack: () => void;
  onCancel: (id: string) => void;
}

export const DownloadingView: React.FC<DownloadingViewProps> = ({
  item,
  onBack,
  onCancel
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const isCompleted = item.status === 'completed';
  const progress = isCompleted ? 100 : Math.min(Math.max(item.progress || 0, 0), 100);

  const strokeDashoffset = 440 - (440 * progress) / 100;

  const totalBytes = parseFileSizeInBytes(item.fileSize, item.qualityLabel, item.duration || 180);
  const downloadedBytes = (totalBytes * progress) / 100;

  const formattedTotal = formatFileSize(totalBytes, item.qualityLabel, item.duration || 180);
  const formattedDownloaded = formatFileSize(downloadedBytes, item.qualityLabel, item.duration || 180);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-circle btn-ghost text-base-content/80"
          >
            {isRtl ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
          </button>
          <h1 className="text-xl font-bold text-base-content">
            {t('downloading.title')}
          </h1>
        </div>
 
      </div>

      <div className="flex flex-col items-center justify-center py-6 space-y-4">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-base-200"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-[#ba2c2c] transition-all duration-300 ease-out"
              strokeWidth="10"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-base-content tracking-tight">
              {progress}%
            </span>
            <span className="text-xs font-semibold text-base-content/60 mt-1">
              {isCompleted ? t('status.completed') : t('downloading.downloadingText')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 w-full pt-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-base-content/60 font-medium">
              {t('downloading.speed')}
            </span>
            <span className="text-sm font-bold text-base-content font-mono mt-0.5">
              {isCompleted ? '-' : (item.speed || '0 MB/s')}
            </span>
          </div>

          <div className="w-px h-8 bg-base-300"></div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-base-content/60 font-medium">
              {t('downloading.remaining')}
            </span>
            <span className="text-sm font-bold text-base-content font-mono mt-0.5">
              {isCompleted ? '-' : sanitizeEta(item.eta, i18n.language)}
            </span>
          </div>
        </div>

        {isCompleted ? (
          <div className="flex items-center justify-center w-full pt-4">
            <button
              onClick={onBack}
              className="btn bg-success/10 text-success hover:bg-success/20 border-transparent font-bold rounded-2xl w-full text-base"
            >
              {t('status.completed')} - {t('nav.home')}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full pt-4">
            <button
              type="button"
              className="flex-1 btn btn-outline border-base-300 hover:bg-base-200 text-base-content font-bold rounded-2xl gap-2"
            >
              <Pause className="w-4 h-4" />
              {t('downloading.pause')}
            </button>
            <button
              type="button"
              onClick={() => onCancel(item.id)}
              className="flex-1 btn btn-outline border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold rounded-2xl gap-2"
            >
              <X className="w-4 h-4" />
              {t('downloading.cancel')}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
          {t('downloading.currentFile')}
        </h2>

        <div className="bg-base-200/60 border border-base-300 p-4 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-20 h-14 rounded-xl object-cover bg-base-300 shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-bold text-xs text-base-content truncate">
                {item.title}
              </h3>
              <div className="text-[11px] text-base-content/60 font-mono">
                {item.qualityLabel} • {formattedTotal}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-base-300 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#ba2c2c] h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-base-content/60">
              <span>{formattedDownloaded} / {formattedTotal}</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
