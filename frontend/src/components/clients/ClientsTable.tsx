import type { Client } from '../../types/client';

interface ClientsTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientsTable({ clients, onEdit, onDelete }: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm ring-1 ring-gray-100">
        Nenhum cliente cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-5 py-3">Nome</th>
            <th className="px-5 py-3">Documento</th>
            <th className="px-5 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="px-5 py-3 font-medium text-gray-900">{client.name}</td>
              <td className="px-5 py-3 text-gray-700">{client.document}</td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(client)}
                    className="rounded-full px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(client)}
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
