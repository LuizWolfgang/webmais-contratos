import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import type { Client, ClientInput } from '../../types/client';

const inputClasses =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

interface ClientFormModalProps {
  initialClient?: Client;
  onClose: () => void;
  onSubmit: (input: ClientInput) => Promise<void>;
}

export function ClientFormModal({ initialClient, onClose, onSubmit }: ClientFormModalProps) {
  const [name, setName] = useState(initialClient?.name ?? '');
  const [document, setDocument] = useState(initialClient?.document ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ name, document });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={initialClient ? 'Editar cliente' : 'Novo cliente'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
          <input
            className={inputClasses}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Documento</label>
          <input
            className={inputClasses}
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}
