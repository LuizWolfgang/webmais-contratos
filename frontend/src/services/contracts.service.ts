import { api } from './api';
import type { Contract, ContractInput, ContractsSummary } from '../types/contract';

export async function listContracts(): Promise<Contract[]> {
  const response = await api.get('/contracts');
  return response.data.data;
}

export async function getContractsSummary(): Promise<ContractsSummary> {
  const response = await api.get('/contracts/summary');
  return response.data.data;
}

export async function createContract(input: ContractInput): Promise<Contract> {
  const response = await api.post('/contracts', input);
  return response.data.data;
}

export async function updateContract(id: string, input: ContractInput): Promise<Contract> {
  const response = await api.put(`/contracts/${id}`, input);
  return response.data.data;
}

export async function deleteContract(id: string): Promise<void> {
  await api.delete(`/contracts/${id}`);
}

export async function closeContract(id: string): Promise<Contract> {
  const response = await api.patch(`/contracts/${id}/close`);
  return response.data.data;
}
