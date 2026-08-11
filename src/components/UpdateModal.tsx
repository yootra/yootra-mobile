import React from 'react';
import { useTranslation } from 'react-i18next';
import { DownloadCloud, Sparkles, X } from 'lucide-react';
import type { UpdateInfo } from '../services/updateService';
import { Modal } from './ui/Modal';

interface UpdateModalProps {
  isOpen: boolean;
  updateInfo: UpdateInfo | null;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  updateInfo,
  onClose
}) => {
  const { t } = useTranslation();

  if (!updateInfo) return null;

  const handleDownload = () => {
    if (updateInfo.downloadUrl) {
      window.open(updateInfo.downloadUrl, '_system');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" className="relative p-6 space-y-5">

      <div className="flex items-center gap-3">
        <div>
          <h3 className="font-bold text-lg text-base-content">
            {t('updateModal.title')}
          </h3>
          <p className="text-xs text-base-content/60">
            {t('updateModal.sub')}
          </p>
        </div>
      </div>

      <div className="bg-base-200/60 border border-base-300 rounded-2xl p-4 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base-content/70">
            {t('updateModal.newVersion')}
          </span>
          <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            v{updateInfo.latestVersion}
          </span>
        </div>

        {updateInfo.releaseNotes && (
          <div className="pt-2 border-t border-base-300/60 space-y-1">
            <span className="font-semibold text-base-content/70 block">
              {t('updateModal.changelog')}
            </span>
            <div className="text-base-content/80 max-h-32 overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
              {updateInfo.releaseNotes}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onClose}
          className="btn btn-ghost rounded-2xl flex-1 text-xs font-bold text-base-content/70"
        >
          {t('updateModal.laterBtn')}
        </button>

        <button
          onClick={handleDownload}
          className="btn btn-primary rounded-2xl flex-1 gap-2 text-xs font-bold text-primary-content"
        >
          <DownloadCloud className="w-4 h-4" />
          {t('updateModal.downloadBtn')}
        </button>
      </div>
    </Modal>
  );
};
