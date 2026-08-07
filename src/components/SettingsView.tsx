import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../types/ytdl';
import { Settings, Folder, Cpu, Info, ShieldCheck, RefreshCw, Smartphone, Terminal, Trash2, Copy, AlertCircle, CheckCircle2, InfoIcon, AlertTriangle } from 'lucide-react';
import { logger } from '../services/loggerService';
import type { LogEntry } from '../services/loggerService';
import { Toast } from '@capacitor/toast';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<string>('all');

  useEffect(() => {
    const unsubscribe = logger.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return () => unsubscribe();
  }, []);

  const handleClearLogs = () => {
    logger.clearLogs();
    try {
      Toast.show({ text: 'Logs cleared.', duration: 'short' });
    } catch {}
  };

  const handleCopyLogs = () => {
    const logText = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(logText);
      try {
        Toast.show({ text: 'Logs copied to clipboard!', duration: 'short' });
      } catch {}
    }
  };

  const filteredLogs = logs.filter((l) => logFilter === 'all' || l.level === logFilter);

  return (
    <div className="space-y-4">
      <div className="flat-card p-4 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Settings className="w-5 h-5 text-blue-400" />
          <h2 className="font-bold text-sm text-white">App Preferences</h2>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Default Quality Preference
            </label>
            <select
              value={settings.defaultQuality}
              onChange={(e) =>
                onUpdateSettings({ ...settings, defaultQuality: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="1080p">1080p Full HD (Highest Quality)</option>
              <option value="720p">720p HD (Balanced Size)</option>
              <option value="480p">480p Standard (Fast Download)</option>
              <option value="360p">360p Compact</option>
              <option value="audio-mp3">Audio Only (MP3 320kbps)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-amber-400" />
              Storage Folder Location
            </label>
            <select
              value={settings.downloadLocation}
              onChange={(e) => {
                onUpdateSettings({ ...settings, downloadLocation: e.target.value });
                try {
                  Toast.show({ text: `Storage location changed to ${e.target.value}`, duration: 'short' });
                } catch {}
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="Movies">Public Movies Folder (External Storage / Movies)</option>
              <option value="Downloads">Public Downloads Folder (External Storage / Downloads)</option>
              <option value="AppStorage">Internal App Storage (Private / Data)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flat-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm text-white">System & Download Logger</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyLogs}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 border border-slate-700 active:bg-slate-700"
              title="Copy Logs"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClearLogs}
              className="px-2 py-1 text-xs text-red-400 hover:text-red-300 font-semibold rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1 active:bg-slate-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
          {['all', 'info', 'success', 'warn', 'error'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setLogFilter(f)}
              className={`px-2.5 py-1 rounded-lg uppercase font-bold transition ${
                logFilter === f
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-56 overflow-y-auto font-mono text-[11px] space-y-1.5">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 text-center pt-8">No log entries found.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-1.5 leading-relaxed border-b border-slate-900 pb-1">
                <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                {log.level === 'info' && <InfoIcon className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />}
                {log.level === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                {log.level === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                {log.level === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
                <span
                  className={`break-all ${
                    log.level === 'info' ? 'text-slate-300' : ''
                  } ${log.level === 'success' ? 'text-emerald-300' : ''} ${
                    log.level === 'warn' ? 'text-amber-300' : ''
                  } ${log.level === 'error' ? 'text-red-400 font-semibold' : ''}`}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flat-card p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Cpu className="w-5 h-5 text-red-500" />
          <h2 className="font-bold text-sm text-white">yt-dlp Engine Status</h2>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Execution Mode</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Offline Local Device
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Capacitor Platform</span>
            <span className="font-semibold text-blue-400 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              Android Native
            </span>
          </div>

          <button
            type="button"
            className="w-full flat-card-interactive py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            Check yt-dlp Core Updates
          </button>
        </div>
      </div>

      <div className="flat-card p-4 space-y-2 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-1 text-slate-300 font-semibold">
          <Info className="w-4 h-4 text-blue-400" />
          Personal Use YouTube Downloader
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Designed specifically for Android mobile devices. No remote server required. All processing and video downloading happens locally on your phone.
        </p>
      </div>
    </div>
  );
};
