import { api } from './api';
import type { Client, ClientInput } from '../types/client';

export async function listClients(): Promise<Client[]> {
  const response = await api.get('/clients');
  return response.data.data;
}

export async function createClient(input: ClientInput): Promise<Client> {
  const response = await api.post('/clients', input);
  return response.data.data;
}

export async function updateClient(id: string, input: ClientInput): Promise<Client> {
  const response = await api.put(`/clients/${id}`, input);
  return response.data.data;
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/clients/${id}`);
}
