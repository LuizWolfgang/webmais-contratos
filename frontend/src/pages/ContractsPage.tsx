import { useState } from 'react';
import { useContracts } from '../hooks/useContracts';
import { useClients } from '../hooks/useClients';
import { SummaryCards } from '../components/contracts/SummaryCards';
import { ContractsTable } from '../components/contracts/ContractsTable';
import { ContractFormModal } from '../components/contracts/ContractFormModal';
import type { Contract } from '../types/contract';

export function ContractsPage() {
  const { contracts, summary, isLoading, create, update, remove, close } = useContracts();
  const { clients } = useClients();
  const [editingContract, setEditingContract] = useState<Contract | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  function handleDelete(contract: Contract) {
    if (window.confirm(`Excluir o contrato ${contract.number}?`)) {
      remove(contract.id);
    }
  }

  function handleClose(contract: Contract) {
    if (window.confirm(`Encerrar o contrato ${contract.number}?`)) {
      close(contract.id);
    }
  }

  const showModal = isCreating || !!editingContract;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-navy">Contratos</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Novo contrato
        </button>
      </div>

      <SummaryCards summary={summary} />

      {isLoading ? (
        <p className="text-sm text-gray-500">Carregando contratos...</p>
      ) : (
        <ContractsTable
          contracts={contracts}
          onEdit={setEditingContract}
          onDelete={handleDelete}
          onClose={handleClose}
        />
      )}

      {showModal && (
        <ContractFormModal
          clients={clients}
          initialContract={editingContract}
          onClose={() => {
            setIsCreating(false);
            setEditingContract(undefined);
          }}
          onSubmit={(input) => (editingContract ? update(editingContract.id, input) : create(input))}
        />
      )}
    </div>
  );
}
