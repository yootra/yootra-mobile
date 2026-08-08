import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Home, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'downloads', icon: Download, label: 'nav.downloads' },
  { id: 'home', icon: Home, label: 'nav.home' },
  { id: 'settings', icon: Settings, label: 'nav.settings' }
];
export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab
}) => {
  const { t } = useTranslation();


  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-[340px] px-4 pointer-events-none">
      <div className="flex items-center justify-between p-2 bg-base-100/80 backdrop-blur-2xl border border-base-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[32px] pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                relative flex items-center justify-center gap-2 h-12 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isActive 
                  ? 'bg-base-content text-base-100 px-6 shadow-md' 
                  : 'bg-transparent text-base-content/50 hover:text-base-content hover:bg-base-200/50 px-4'
                }
              `}
            >
              <Icon 
                className={`
                  w-5 h-5 transition-all duration-500
                  ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-[2] scale-100'}
                `} 
              />
              <div 
                className={`
                  grid transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${isActive ? 'grid-cols-[1fr] opacity-100' : 'grid-cols-[0fr] opacity-0'}
                `}
              >
                <span className="overflow-hidden text-[13px] font-bold tracking-wide whitespace-nowrap">
                  {t(item.label)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
