import { useState } from 'react';
import { useClients } from '../hooks/useClients';
import { ClientsTable } from '../components/clients/ClientsTable';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import type { Client } from '../types/client';

export function ClientsPage() {
  const { clients, isLoading, create, update, remove } = useClients();
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  function handleDelete(client: Client) {
    if (window.confirm(`Excluir o cliente ${client.name}?`)) {
      remove(client.id);
    }
  }

  const showModal = isCreating || !!editingClient;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-navy">Clientes</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Novo cliente
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Carregando clientes...</p>
      ) : (
        <ClientsTable clients={clients} onEdit={setEditingClient} onDelete={handleDelete} />
      )}

      {showModal && (
        <ClientFormModal
          initialClient={editingClient}
          onClose={() => {
            setIsCreating(false);
            setEditingClient(undefined);
          }}
          onSubmit={(input) => (editingClient ? update(editingClient.id, input) : create(input))}
        />
      )}
    </div>
  );
}
