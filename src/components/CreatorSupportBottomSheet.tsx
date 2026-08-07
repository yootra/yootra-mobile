import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, CheckCircle, X } from 'lucide-react';
import { BottomSheet } from './ui/BottomSheet';

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

  return (
    <BottomSheet isOpen={isOpen} onClose={onCancel} size="lg" className="p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-base-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-red-600 stroke-red-600" />
          </div>
          <h3 className="font-bold text-base text-base-content">
            {t('creatorSupport.title')}
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
        {t('creatorSupport.message')}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 pb-1">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full btn rounded-xl bg-[#ba2c2c] hover:bg-[#a02424] btn-md text-white font-bold border-none shadow-md"
        >
          <CheckCircle className="w-5 h-5" />
          {t('creatorSupport.confirm')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full btn btn-ghost font-semibold text-base-content/70"
        >
          {t('creatorSupport.cancel')}
        </button>
      </div>
    </BottomSheet>
  );
};
