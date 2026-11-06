import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  variant?: 'modal' | 'bottom-sheet';
  maxWidthClassName?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  variant = 'modal',
  maxWidthClassName = 'max-w-3xl',
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (variant === 'bottom-sheet') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <div
          className="fixed inset-0 bg-ink/40 transition-opacity"
          onClick={onClose}
        />
        <div className="relative z-10 bg-paper border-t border-rule-emphasis p-5 max-h-[75vh] overflow-y-auto">
          {title && (
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-rule">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
                {title}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-ink-secondary hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20">
        <div
          className={`relative w-full ${maxWidthClassName} ui-dialog-panel overflow-hidden`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
