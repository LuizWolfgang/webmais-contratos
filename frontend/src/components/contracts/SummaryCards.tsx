import type { ContractsSummary } from '../../types/contract';

const CARDS: { key: keyof Omit<ContractsSummary, 'total'>; label: string; accent: string }[] = [
  { key: 'ATIVO', label: 'Ativos', accent: 'text-emerald-600' },
  { key: 'VENCIDO', label: 'Vencidos', accent: 'text-amber-600' },
  { key: 'ENCERRADO', label: 'Encerrados', accent: 'text-gray-500' },
];

export function SummaryCards({ summary }: { summary: ContractsSummary | null }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {CARDS.map((card) => (
        <div key={card.key} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`mt-1 text-3xl font-bold ${card.accent}`}>{summary?.[card.key] ?? '-'}</p>
        </div>
      ))}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm text-gray-500">Total</p>
        <p className="mt-1 text-3xl font-bold text-navy">{summary?.total ?? '-'}</p>
      </div>
    </div>
  );
}
