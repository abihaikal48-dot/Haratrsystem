import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  detailText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  detailText,
  confirmLabel = 'Hapus Data',
  cancelLabel = 'Batal',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl shrink-0 ${
                isDestructive
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isDestructive ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-900">{title}</h3>
                <button
                  type="button"
                  onClick={onCancel}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                  aria-label="Tutup"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                {message}
              </p>

              {detailText && (
                <div className="mt-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-800 break-words">
                  {detailText}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-200/70 border border-neutral-300 rounded-xl transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                : 'bg-neutral-900 hover:bg-neutral-800'
            }`}
          >
            {isDestructive && <Trash2 size={14} />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
