import { useState } from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'brand';
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

const variantClasses: Record<'danger' | 'brand', string> = {
  danger: 'bg-red-600 hover:bg-red-700',
  brand: 'bg-brand hover:bg-brand-dark',
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  variant = 'brand',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onCancel();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-gray-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={`rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${variantClasses[variant]}`}
        >
          {isSubmitting ? 'Processando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
