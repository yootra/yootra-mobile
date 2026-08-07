import React from 'react';

type BottomSheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: BottomSheetSize;
}

const sizeClasses: Record<BottomSheetSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full'
};

export const BottomSheet: React.FC<BottomSheetProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '', 
  size = 'lg' 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className={`w-full ${sizeClasses[size]} bg-base-100 rounded-t-3xl shadow-2xl border-t border-base-300 animate-in slide-in-from-bottom duration-300 safe-bottom ${className}`} 
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
