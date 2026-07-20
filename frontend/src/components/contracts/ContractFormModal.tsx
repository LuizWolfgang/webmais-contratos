import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { extractErrorMessage } from '../../services/api';
import type { Client } from '../../types/client';
import type { Contract, ContractInput } from '../../types/contract';

const inputClasses =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

function toDateInputValue(value: string): string {
  return value ? value.slice(0, 10) : '';
}

interface ContractFormModalProps {
  clients: Client[];
  initialContract?: Contract;
  onClose: () => void;
  onSubmit: (input: ContractInput) => Promise<void>;
}

export function ContractFormModal({
  clients,
  initialContract,
  onClose,
  onSubmit,
}: ContractFormModalProps) {
  const [number, setNumber] = useState(initialContract?.number ?? '');
  const [clientId, setClientId] = useState(initialContract?.clientId ?? clients[0]?.id ?? '');
  const [value, setValue] = useState(initialContract ? String(initialContract.value) : '');
  const [dueDate, setDueDate] = useState(toDateInputValue(initialContract?.dueDate ?? ''));
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ number, clientId, value: Number(value), dueDate });
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={initialContract ? 'Editar contrato' : 'Novo contrato'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Número</label>
          <input
            className={inputClasses}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Cliente</label>
          <select
            className={inputClasses}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          >
            <option value="" disabled>
              Selecione um cliente
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className={inputClasses}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Vencimento</label>
          <input
            type="date"
            className={inputClasses}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
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
            disabled={isSubmitting || !clientId}
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}
