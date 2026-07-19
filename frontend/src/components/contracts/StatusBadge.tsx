import type { ContractStatus } from '../../types/contract';

const STYLES: Record<ContractStatus, string> = {
  ATIVO: 'bg-emerald-100 text-emerald-700',
  VENCIDO: 'bg-amber-100 text-amber-700',
  ENCERRADO: 'bg-gray-200 text-gray-600',
};

const LABELS: Record<ContractStatus, string> = {
  ATIVO: 'Ativo',
  VENCIDO: 'Vencido',
  ENCERRADO: 'Encerrado',
};

export function StatusBadge({ status }: { status: ContractStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
