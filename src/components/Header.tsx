import React from 'react';
import { Download } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 safe-top">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white shadow">
            <Download className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white leading-none">
              YT Downloader
            </h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              {activeTab === 'home' && 'Local Downloader'}
              {activeTab === 'downloads' && 'Downloaded Media'}
              {activeTab === 'settings' && 'App Settings'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Offline Local
          </span>
        </div>
      </div>
    </header>
  );
};
