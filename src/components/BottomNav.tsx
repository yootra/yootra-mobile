import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Home, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab
}) => {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-base-100/95 backdrop-blur-md border-t border-base-300 safe-bottom shadow-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-4">
        <button
          type="button"
          onClick={() => setActiveTab('downloads')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
            activeTab === 'downloads'
              ? 'text-[#ba2c2c] font-bold'
              : 'text-base-content/60 hover:text-base-content'
          }`}
        >
          <Download className={`w-6 h-6 ${activeTab === 'downloads' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] tracking-tight">{t('nav.downloads')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
            activeTab === 'home'
              ? 'text-[#ba2c2c] font-bold'
              : 'text-base-content/60 hover:text-base-content'
          }`}
        >
          <Home className={`w-6 h-6 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] tracking-tight">{t('nav.home')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
            activeTab === 'settings'
              ? 'text-[#ba2c2c] font-bold'
              : 'text-base-content/60 hover:text-base-content'
          }`}
        >
          <Settings className={`w-6 h-6 ${activeTab === 'settings' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] tracking-tight">{t('nav.settings')}</span>
        </button>
      </div>
    </nav>
  );
};
