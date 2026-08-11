import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Folder, Sliders, Moon, Bell, DownloadCloud, Globe, Info, ChevronRight, ChevronLeft, Edit3, Check, Terminal, Code2, Coffee, ExternalLink, RefreshCw } from 'lucide-react';
import type { AppSettings } from '../types/ytdl';
import { Toast } from '@capacitor/toast';
import { LogViewerModal } from '../components/LogViewerModal';
import { useAppContext } from '../context/AppContext';
import { UpdateService, APP_VERSION } from '../services/updateService';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onLanguageChange: (lang: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onLanguageChange
}) => {
  const { t, i18n } = useTranslation();
  const { checkForUpdatesManually, isCheckingUpdates } = useAppContext();
  const isRtl = i18n.language === 'fa';
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [customPathInput, setCustomPathInput] = useState(settings.downloadLocation || 'Movies');
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
  const [appVersion, setAppVersion] = useState(APP_VERSION);

  useEffect(() => {
    UpdateService.getCurrentVersion().then(setAppVersion);
  }, []);

  const showToast = async (text: string) => {
    try {
      await Toast.show({ text, duration: 'short' });
    } catch { }
  };

  const handleSaveCustomPath = () => {
    if (customPathInput.trim()) {
      onUpdateSettings({ ...settings, downloadLocation: customPathInput.trim() });
      setIsEditingFolder(false);
      showToast(t('settings.locationSaved'));
    }
  };

  return (
    <div className="h-full flex flex-col pt-3 px-5 animate-in fade-in duration-300">
      <div className="pt-1 shrink-0">
        <h1 className="text-2xl font-bold text-base-content tracking-tight">
          {t('settings.title')}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pt-6 pb-24 pr-1 custom-scrollbar">
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider px-1">
            {t('settings.general')}
          </h2>

          <div className="bg-base-200/60 border border-base-300 rounded-2xl divide-y divide-base-300/60 overflow-hidden shadow-xs">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-base-content/60" />
                  <div>
                    <div className="text-sm font-semibold text-base-content">
                      {t('settings.downloadLocation')}
                    </div>
                    <div className="text-xs text-base-content/50 font-mono mt-0.5 dir-ltr text-left">
                      {settings.downloadLocation || 'Movies'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingFolder(!isEditingFolder)}
                  className="btn btn-xs btn-ghost gap-1 text-xs text-base-content/70 hover:text-base-content"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {t('settings.changeLocation')}
                </button>
              </div>

              {isEditingFolder && (
                <div className="pt-2 space-y-2.5 bg-base-300/40 p-3 rounded-xl">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-base-content/70">
                      {t('settings.selectFolder')}
                    </label>
                    <select
                      value={['Movies', 'Downloads', 'Music', 'DCIM'].includes(settings.downloadLocation) ? settings.downloadLocation : 'custom'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'custom') {
                          setCustomPathInput(val);
                          onUpdateSettings({ ...settings, downloadLocation: val });
                          showToast(t('settings.locationSaved'));
                        }
                      }}
                      className="select select-sm select-bordered w-full text-xs"
                    >
                      <option value="Movies">Movies (/storage/emulated/0/Movies)</option>
                      <option value="Downloads">Downloads (/storage/emulated/0/Download)</option>
                      <option value="Music">Music (/storage/emulated/0/Music)</option>
                      <option value="DCIM">DCIM (/storage/emulated/0/DCIM)</option>
                      <option value="custom">{t('settings.customFolder')}</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customPathInput}
                      onChange={(e) => setCustomPathInput(e.target.value)}
                      placeholder="/storage/emulated/0/YouTube Downloader"
                      className="input input-sm input-bordered w-full text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomPath}
                      className="btn btn-sm btn-primary shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-base-content/60" />
                <div>
                  <div className="text-sm font-semibold text-base-content">
                    {t('settings.defaultQuality')}
                  </div>
                  <div className="text-xs text-base-content/50 mt-0.5">
                    {settings.defaultQuality || '1080p'}
                  </div>
                </div>
              </div>
              <select
                value={settings.defaultQuality}
                onChange={(e) => onUpdateSettings({ ...settings, defaultQuality: e.target.value })}
                className="select select-ghost select-sm font-semibold text-xs text-base-content focus:outline-none"
              >
                <option value="1080p">1080p (Full HD)</option>
                <option value="720p">720p (HD)</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
                <option value="audio-mp3">Audio Only (MP3)</option>
              </select>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-base-content/60" />
                <div>
                  <div className="text-sm font-semibold text-base-content">
                    {t('settings.theme')}
                  </div>
                  <div className="text-xs text-base-content/50 mt-0.5 capitalize">
                    {settings.theme || 'light'}
                  </div>
                </div>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => onUpdateSettings({ ...settings, theme: e.target.value as any })}
                className="select select-ghost select-sm font-semibold text-xs text-base-content focus:outline-none"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="dim">Dim</option>
                <option value="emerald">Emerald</option>
                <option value="synthwave">Synthwave</option>
                <option value="cupcake">Cupcake</option>
              </select>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-base-content/60" />
                <div>
                  <div className="text-sm font-semibold text-base-content">
                    {t('settings.notifications')}
                  </div>
                  <div className="text-xs text-base-content/50 mt-0.5">
                    On
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="toggle toggle-primary"
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DownloadCloud className="w-5 h-5 text-base-content/60" />
                <div>
                  <div className="text-sm font-semibold text-base-content">
                    {t('settings.backgroundDownloads')}
                  </div>
                  <div className="text-xs text-base-content/50 mt-0.5">
                    On
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="toggle toggle-primary"
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-base-content/60" />
                <div>
                  <div className="text-sm font-semibold text-base-content">
                    {t('settings.language')}
                  </div>
                  <div className="text-xs text-base-content/50 mt-0.5">
                    {i18n.language === 'fa' ? t('languages.fa') : t('languages.en')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextLang = i18n.language === 'fa' ? 'en' : 'fa';
                  onLanguageChange(nextLang);
                }}
                className="btn btn-xs btn-outline border-base-300 font-semibold text-xs rounded-xl"
              >
                {i18n.language === 'fa' ? t('languages.en') : t('languages.fa')}
              </button>
            </div>

            <div
              onClick={() => setIsLogViewerOpen(true)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-base-200 transition"
            >
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-base-content/60" />
                <div>
                  <div className="text-sm font-semibold text-base-content">
                    {t('settings.systemLogs')}
                  </div>
                  <div className="text-xs text-base-content/50 mt-0.5">
                    {t('settings.systemLogsSub')}
                  </div>
                </div>
              </div>
              <ChevronIcon className="w-5 h-5 text-base-content/40" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider px-1">
            {t('settings.about')}
          </h2>

          <div className="bg-base-200/60 border border-base-300 rounded-2xl divide-y divide-base-300/60 overflow-hidden shadow-xs">
            <a
              href="https://github.com/yootra/yootra-mobile"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-base-200 transition"
            >
              <div className="flex items-center gap-3">
                <Code2 className="w-5 h-5 text-base-content/60" />
                <div className="text-sm font-semibold text-base-content">
                  {t('settings.githubRepo')}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-base-content/40" />
            </a>

            <a
              href="https://www.coffeete.ir/sajjadmrx"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-base-200 transition"
            >
              <div className="flex items-center gap-3">
                <Coffee className="w-5 h-5 text-base-content" />
                <div className="text-sm font-semibold text-base-content">
                  {t('settings.donate')}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-base-content/40" />
            </a>

            <div
            onClick={checkForUpdatesManually}
            className={`p-4 flex items-center justify-between cursor-pointer hover:bg-base-200 transition ${
              isCheckingUpdates ? 'pointer-events-none opacity-80' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-5 h-5 transition-colors ${
                isCheckingUpdates ? 'animate-spin text-primary' : 'text-base-content/60'
              }`} />
              <div>
                <div className="text-sm font-semibold text-base-content flex items-center gap-2">
                  {t('settings.checkUpdates')}
                </div>
                <div className={`text-xs mt-0.5 transition ${
                  isCheckingUpdates ? 'text-primary font-medium animate-pulse' : 'text-base-content/50'
                }`}>
                  {isCheckingUpdates ? t('settings.checkingUpdates') : t('settings.checkUpdatesSub', { version: appVersion })}
                </div>
              </div>
            </div>
            {isCheckingUpdates ? (
              <span className="loading loading-spinner loading-xs text-primary" />
            ) : (
              <ChevronIcon className="w-5 h-5 text-base-content/40" />
            )}
          </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-base-content/60" />
                <div className="text-sm font-semibold text-base-content">
                  {t('settings.version')}
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-base-content/60">
                {appVersion}
              </span>
            </div>
          </div>

          <div className="py-6 text-center text-xs text-base-content/50 font-medium">
            {t('settings.madeWithLove')}
          </div>
        </div>
      </div>

      <LogViewerModal
        isOpen={isLogViewerOpen}
        onClose={() => setIsLogViewerOpen(false)}
      />
    </div>
  );
};
