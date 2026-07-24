import { useState } from 'react';
import { useContracts } from '../hooks/useContracts';
import { useClients } from '../hooks/useClients';
import { SummaryCards } from '../components/contracts/SummaryCards';
import { ContractsTable } from '../components/contracts/ContractsTable';
import { ContractFormModal } from '../components/contracts/ContractFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { Contract } from '../types/contract';

type PendingAction = { type: 'delete' | 'close'; contract: Contract };

export function ContractsPage() {
  const { contracts, summary, isLoading, create, update, remove, close } = useContracts();
  const { clients } = useClients();
  const [editingContract, setEditingContract] = useState<Contract | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);

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
          onDelete={(contract) => setPending({ type: 'delete', contract })}
          onClose={(contract) => setPending({ type: 'close', contract })}
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

      {pending?.type === 'delete' && (
        <ConfirmDialog
          title="Excluir contrato"
          message={`Tem certeza que deseja excluir o contrato ${pending.contract.number}? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={() => remove(pending.contract.id)}
          onCancel={() => setPending(null)}
        />
      )}

      {pending?.type === 'close' && (
        <ConfirmDialog
          title="Encerrar contrato"
          message={`Deseja encerrar o contrato ${pending.contract.number}? Ele deixará de ficar ativo.`}
          confirmLabel="Encerrar"
          variant="brand"
          onConfirm={() => close(pending.contract.id)}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
