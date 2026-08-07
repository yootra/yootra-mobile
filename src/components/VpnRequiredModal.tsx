import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Modal } from './ui/Modal';

interface VpnRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VpnRequiredModal: React.FC<VpnRequiredModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" className="p-0 overflow-hidden">
      {/* Header Graphic */}
      <div className="bg-error/10 pt-8 pb-6 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-error" />
        </div>
        <h2 className="text-xl font-bold text-base-content tracking-tight">
          {t('vpnModal.title')}
        </h2>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3 bg-base-200 p-4 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-base-content/80 leading-relaxed">
            {t('vpnModal.description')}
          </p>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary w-full rounded-2xl font-bold text-primary-content mt-4"
        >
          {t('vpnModal.confirm')}
        </button>
      </div>
    </Modal>
  );
};
