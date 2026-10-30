import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const widthClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-5xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`relative w-full ${widthClasses[maxWidth]} bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-white/[0.08] rounded-xl shadow-lg p-5 sm:p-6 overflow-hidden my-8`}
      >
        <div className="flex items-start justify-between pb-3.5 border-b border-stone-200/80 dark:border-white/[0.08]">
          <div className="space-y-0.5">
            <h2 id="modal-title" className="text-base font-semibold tracking-tight text-[#111113] dark:text-[#EDEDEF]">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-stone-500 dark:text-[#8B8B93]">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-[#EDEDEF] rounded-md hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors relative before:absolute before:-inset-2 sm:before:hidden"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
