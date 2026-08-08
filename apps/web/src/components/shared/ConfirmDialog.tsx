import { useEffect, useRef } from 'react';
import { GradientButton } from './GradientButton';
import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  variant?: 'primary' | 'danger';
}

export function ConfirmDialog({ open, onClose, onConfirm, title, children, confirmLabel = 'Potvrdit', variant = 'danger' }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl p-6 max-w-md w-full shadow-lg animate-scale-in"
      >
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h2>
        <div className="text-sm text-slate-600 dark:text-slate-300 mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <GradientButton variant="ghost" onClick={onClose}>Zrušit</GradientButton>
          <GradientButton variant={variant} onClick={onConfirm}>{confirmLabel}</GradientButton>
        </div>
      </div>
    </div>
  );
}
