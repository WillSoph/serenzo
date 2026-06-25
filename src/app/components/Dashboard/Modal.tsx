import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative
          w-full
          max-w-xl
          max-h-[85vh]
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
          flex
          flex-col
        "
      >
        <div className="px-6 pt-6 pb-3 border-b border-slate-100">
          {title && (
            <h2
              id="modal-title"
              className="text-xl font-semibold text-slate-900"
            >
              {title}
            </h2>
          )}

          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="
              absolute
              right-4
              top-4
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
            "
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
