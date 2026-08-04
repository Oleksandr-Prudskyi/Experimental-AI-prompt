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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative glass-card rounded-3xl p-6 max-w-md w-full shadow-xl animate-scale-in bg-white/85 dark:bg-slate-800/80 backdrop-blur-2xl">
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
