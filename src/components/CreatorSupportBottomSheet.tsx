import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, CheckCircle, X } from 'lucide-react';

interface CreatorSupportBottomSheetProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CreatorSupportBottomSheet: React.FC<CreatorSupportBottomSheetProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-base-100 rounded-t-3xl p-6 space-y-5 shadow-2xl border-t border-base-300 animate-in slide-in-from-bottom duration-300 safe-bottom">
        <div className="flex items-center justify-between border-b border-base-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-red-600 stroke-red-600" />
            </div>
            <h3 className="font-bold text-base text-base-content">
              {t('bottomSheet.title')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-sm btn-ghost btn-circle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-base-content/80 leading-relaxed font-medium">
          {t('bottomSheet.message')}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full btn bg-[#ba2c2c] hover:bg-[#a02424] text-white font-bold border-none shadow-md"
          >
            <CheckCircle className="w-5 h-5" />
            {t('bottomSheet.confirm')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full btn btn-ghost font-semibold text-base-content/70"
          >
            {t('bottomSheet.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
