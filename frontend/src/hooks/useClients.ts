import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as clientsService from '../services/clients.service';
import { extractErrorMessage } from '../services/api';
import type { Client, ClientInput } from '../types/client';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setClients(await clientsService.listClients());
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(input: ClientInput) {
    await clientsService.createClient(input);
    toast.success('Cliente cadastrado com sucesso');
    await refresh();
  }

  async function update(id: string, input: ClientInput) {
    await clientsService.updateClient(id, input);
    toast.success('Cliente atualizado com sucesso');
    await refresh();
  }

  async function remove(id: string) {
    try {
      await clientsService.deleteClient(id);
      toast.success('Cliente excluído com sucesso');
      await refresh();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return { clients, isLoading, create, update, remove, refresh };
}
