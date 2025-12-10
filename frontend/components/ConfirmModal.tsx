'use client';

import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm cursor-pointer"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md rounded-lg shadow-xl bg-gray-3 border border-gray-4 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-4/10">
              <AlertTriangle className="w-5 h-5 text-red-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-10">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors text-gray-9 hover:bg-gray-4 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm leading-relaxed text-gray-9">{message}</p>
        </div>

        <div className="flex items-center gap-3 p-4 border-t border-gray-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-2 text-white-1 border border-gray-4 hover:bg-gray-3 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-red-4 text-white-1 hover:bg-red-3 cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
