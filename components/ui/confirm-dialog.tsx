"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const dialog = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              variant === 'danger'
                ? 'bg-red-500/10'
                : 'bg-yellow-500/10'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                variant === 'danger'
                  ? 'text-red-500'
                  : 'text-yellow-500'
              }`} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-muted-foreground">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg transition-colors ${
              variant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
