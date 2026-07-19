import type { Contract } from '../../types/contract';
import { StatusBadge } from './StatusBadge';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR');

interface ContractsTableProps {
  contracts: Contract[];
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
  onClose: (contract: Contract) => void;
}

export function ContractsTable({ contracts, onEdit, onDelete, onClose }: ContractsTableProps) {
  if (contracts.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm ring-1 ring-gray-100">
        Nenhum contrato cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-5 py-3">Número</th>
            <th className="px-5 py-3">Cliente</th>
            <th className="px-5 py-3">Valor</th>
            <th className="px-5 py-3">Vencimento</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {contracts.map((contract) => (
            <tr key={contract.id}>
              <td className="px-5 py-3 font-medium text-gray-900">{contract.number}</td>
              <td className="px-5 py-3 text-gray-700">{contract.clientName}</td>
              <td className="px-5 py-3 text-gray-700">{currencyFormatter.format(contract.value)}</td>
              <td className="px-5 py-3 text-gray-700">
                {dateFormatter.format(new Date(contract.dueDate))}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={contract.status} />
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(contract)}
                    className="rounded-full px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Editar
                  </button>
                  {contract.status !== 'ENCERRADO' && (
                    <button
                      onClick={() => onClose(contract)}
                      className="rounded-full px-3 py-1 text-xs font-medium text-brand hover:bg-brand/10"
                    >
                      Encerrar
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(contract)}
                    className="rounded-full px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
