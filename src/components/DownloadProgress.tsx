import React from 'react';
import type { DownloadItem } from '../types/ytdl';
import { Download, XCircle, CheckCircle, AlertTriangle, Zap, Clock } from 'lucide-react';

interface DownloadProgressProps {
  item: DownloadItem;
  onCancel: (id: string) => void;
}

export const DownloadProgress: React.FC<DownloadProgressProps> = ({
  item,
  onCancel
}) => {
  return (
    <div className="flat-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-16 h-12 object-cover rounded-lg bg-slate-950 border border-slate-800 shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-semibold text-xs text-white truncate">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">
              {item.qualityLabel}
            </span>
            <span className="uppercase">{item.ext}</span>
          </div>
        </div>
        {item.status === 'downloading' && (
          <button
            type="button"
            onClick={() => onCancel(item.id)}
            className="p-1 text-slate-400 hover:text-red-400 rounded-lg active:bg-slate-800"
            title="Cancel Download"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {item.status === 'downloading' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-red-500 animate-bounce" />
              Downloading... {item.progress}%
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                {item.speed}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" />
                {item.eta}
              </span>
            </div>
          </div>

          <div className="progress-flat">
            <div
              className="progress-flat-bar"
              style={{ width: `${item.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {item.status === 'completed' && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            Download Complete & Saved to Storage!
          </span>
        </div>
      )}

      {item.status === 'error' && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            {item.errorMsg || 'Download failed'}
          </span>
        </div>
      )}
    </div>
  );
};
