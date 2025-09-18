import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-xl relative flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          {title && (
            <h2 id="modal-title" className="text-xl font-bold">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="px-6 pb-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
