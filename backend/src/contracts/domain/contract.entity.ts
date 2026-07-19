import { ContractStatus } from './contract-status';
import { ConflictError } from '../../shared/domain-errors';

export interface ContractDetails {
  number: string;
  clientId: string;
  value: number;
  dueDate: Date;
}

export class Contract {
  constructor(
    public readonly id: string,
    public number: string,
    public clientId: string,
    public value: number,
    public dueDate: Date,
    public status: ContractStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  close(): void {
    if (this.status === ContractStatus.ENCERRADO) {
      throw new ConflictError('Contrato já está encerrado');
    }
    this.status = ContractStatus.ENCERRADO;
  }

  updateDetails(data: ContractDetails): void {
    this.number = data.number;
    this.clientId = data.clientId;
    this.value = data.value;
    this.dueDate = data.dueDate;

    if (this.status === ContractStatus.VENCIDO && this.dueDate.getTime() > Date.now()) {
      this.status = ContractStatus.ATIVO;
    }
  }
}
