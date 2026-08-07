import React, { useState } from 'react';
import { Clipboard, X, Search, Video, Sparkles } from 'lucide-react';
import { Clipboard as CapClipboard } from '@capacitor/clipboard';

interface UrlInputProps {
  onFetchInfo: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onFetchInfo, isLoading }) => {
  const [url, setUrl] = useState('');

  const handlePaste = async () => {
    try {
      const { value } = await CapClipboard.read();
      if (value) {
        setUrl(value);
        if (value.includes('youtube.com') || value.includes('youtu.be')) {
          onFetchInfo(value);
        }
      }
    } catch {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text);
          if (text.includes('youtube.com') || text.includes('youtu.be')) {
            onFetchInfo(text);
          }
        }
      }
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onFetchInfo(url.trim());
    }
  };

  return (
    <div className="flat-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Video className="w-4 h-4 text-red-500" />
          YouTube URL
        </label>
        <button
          type="button"
          onClick={handlePaste}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 active:bg-slate-700 transition"
        >
          <Clipboard className="w-3.5 h-3.5" />
          Paste Link
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-3.5 pr-20 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
          required
        />
        <div className="absolute right-2 flex items-center gap-1">
          {url && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg active:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="flat-btn-primary px-3 py-1.5 text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            Fetch
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2 pt-1">
        <span className="text-[11px] text-slate-400">Quick test sample links:</span>
        <button
          type="button"
          onClick={() => {
            const sample = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            setUrl(sample);
            onFetchInfo(sample);
          }}
          className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          Sample Video
        </button>
      </div>
    </div>
  );
};
