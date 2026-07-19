import { Contract } from './contract.entity';
import { ContractStatus } from './contract-status';
import { ConflictError } from '../../shared/domain-errors';

function buildContract(status: ContractStatus, dueDate: Date): Contract {
  return new Contract('1', 'CTR-0001', 'client-1', 1000, dueDate, status, new Date(), new Date());
}

describe('Contract entity', () => {
  it('encerra um contrato ativo', () => {
    const contract = buildContract(ContractStatus.ATIVO, new Date());
    contract.close();
    expect(contract.status).toBe(ContractStatus.ENCERRADO);
  });

  it('não permite encerrar um contrato já encerrado', () => {
    const contract = buildContract(ContractStatus.ENCERRADO, new Date());
    expect(() => contract.close()).toThrow(ConflictError);
  });

  it('volta para ATIVO ao editar um contrato VENCIDO com vencimento futuro', () => {
    const past = new Date(Date.now() - 86_400_000);
    const future = new Date(Date.now() + 86_400_000);
    const contract = buildContract(ContractStatus.VENCIDO, past);

    contract.updateDetails({ number: 'CTR-0001', clientId: 'client-1', value: 2000, dueDate: future });

    expect(contract.status).toBe(ContractStatus.ATIVO);
    expect(contract.value).toBe(2000);
  });

  it('mantém ENCERRADO mesmo editando o vencimento para o futuro', () => {
    const future = new Date(Date.now() + 86_400_000);
    const contract = buildContract(ContractStatus.ENCERRADO, future);

    contract.updateDetails({ number: 'CTR-0001', clientId: 'client-1', value: 2000, dueDate: future });

    expect(contract.status).toBe(ContractStatus.ENCERRADO);
  });
});
