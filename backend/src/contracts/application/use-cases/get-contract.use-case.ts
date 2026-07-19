import { Inject, Injectable } from '@nestjs/common';
import { CONTRACT_REPOSITORY, ContractRepository } from '../../domain/contract.repository';
import { NotFoundError } from '../../../shared/domain-errors';
import { Contract } from '../../domain/contract.entity';

@Injectable()
export class GetContractUseCase {
  constructor(@Inject(CONTRACT_REPOSITORY) private readonly contractRepository: ContractRepository) {}

  async execute(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) throw new NotFoundError('Contrato', id);
    return contract;
  }
}
