import { Contract } from './contract.entity';
import { ContractStatus } from './contract-status';

export const CONTRACT_REPOSITORY = Symbol('CONTRACT_REPOSITORY');

export interface ContractListItem {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  value: number;
  dueDate: Date;
  status: ContractStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractSummary {
  ATIVO: number;
  VENCIDO: number;
  ENCERRADO: number;
  total: number;
}

export interface ContractRepository {
  create(data: { number: string; clientId: string; value: number; dueDate: Date }): Promise<Contract>;
  save(contract: Contract): Promise<Contract>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Contract | null>;
  findAllWithClient(): Promise<ContractListItem[]>;
  countByStatus(): Promise<ContractSummary>;
  findOverdueActive(referenceDate: Date): Promise<Contract[]>;
  updateStatusIfCurrent(
    id: string,
    expectedStatus: ContractStatus,
    newStatus: ContractStatus,
  ): Promise<boolean>;
}
