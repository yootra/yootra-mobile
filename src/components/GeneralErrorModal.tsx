import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw, Terminal, X } from 'lucide-react';
import { Modal } from './ui/Modal';

interface GeneralErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  onViewLogs: () => void;
  errorMessage?: string;
}

export const GeneralErrorModal: React.FC<GeneralErrorModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  onViewLogs,
  errorMessage
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" className="p-0 overflow-hidden">
      {/* Header Graphic */}
      <div className="bg-error/10 pt-8 pb-6 px-6 flex flex-col items-center justify-center text-center relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 btn btn-sm btn-circle btn-ghost text-base-content/60"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-3">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        <h2 className="text-xl font-bold text-base-content tracking-tight">
          {t('generalErrorModal.title')}
        </h2>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="bg-base-200 p-3.5 rounded-2xl border border-base-300 max-h-36 overflow-y-auto custom-scrollbar">
          <p className="text-xs font-mono text-base-content/80 break-words whitespace-pre-wrap dir-ltr text-left">
            {errorMessage || t('generalErrorModal.defaultMsg')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewLogs();
            }}
            className="btn btn-outline border-base-300 gap-1.5 rounded-2xl text-xs font-bold"
          >
            <Terminal className="w-4 h-4" />
            {t('generalErrorModal.viewLog')}
          </button>

          {onRetry ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="btn btn-primary gap-1.5 rounded-2xl text-xs font-bold text-primary-content"
            >
              <RefreshCw className="w-4 h-4" />
              {t('generalErrorModal.retry')}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary rounded-2xl text-xs font-bold text-primary-content"
            >
              {t('generalErrorModal.ok')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
