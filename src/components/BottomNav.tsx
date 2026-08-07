import React from 'react';
import { Download, HardDrive, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  downloadsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  downloadsCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
            activeTab === 'home'
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Download className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px]">Downloader</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('downloads')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition relative ${
            activeTab === 'downloads'
              ? 'text-blue-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <HardDrive className={`w-5 h-5 ${activeTab === 'downloads' ? 'stroke-[2.5]' : ''}`} />
            {downloadsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                {downloadsCount}
              </span>
            )}
          </div>
          <span className="text-[11px]">Library</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
            activeTab === 'settings'
              ? 'text-blue-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px]">Settings</span>
        </button>
      </div>
    </nav>
  );
};
