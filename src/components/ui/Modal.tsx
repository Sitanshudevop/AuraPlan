import React, { useEffect } from 'react';
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`relative w-full ${widthClasses[maxWidth]} bg-[#FFFFFF] dark:bg-[#121215] border border-stone-200/90 dark:border-zinc-800 rounded-xl shadow-md p-6 overflow-hidden my-8`}
      >
        <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-zinc-800">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-[#18181B] dark:text-[#FAFAFA]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
