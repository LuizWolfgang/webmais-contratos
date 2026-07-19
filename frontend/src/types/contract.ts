export type ContractStatus = 'ATIVO' | 'VENCIDO' | 'ENCERRADO';

export interface Contract {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  value: number;
  dueDate: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContractInput {
  number: string;
  clientId: string;
  value: number;
  dueDate: string;
}

export interface ContractsSummary {
  ATIVO: number;
  VENCIDO: number;
  ENCERRADO: number;
  total: number;
}
