import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  isDestructive = true,
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50'
                : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3 py-2">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isDestructive ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          {isDestructive ? (
            <ShieldAlert className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>
        <div>
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
          {isDestructive && (
            <p className="text-xs text-rose-400/80 mt-2 font-mono">
              ⚠️ This operation will be permanently recorded into the immutable Sentinel cryptographic audit ledger.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
