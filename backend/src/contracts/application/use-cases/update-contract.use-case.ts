import { Inject, Injectable } from '@nestjs/common';
import { CONTRACT_REPOSITORY, ContractRepository } from '../../domain/contract.repository';
import { CLIENT_REPOSITORY, ClientRepository } from '../../../clients/domain/client.repository';
import { NotFoundError } from '../../../shared/domain-errors';
import { RedisCacheService } from '../../../redis/redis-cache.service';
import { CONTRACTS_CACHE_KEYS } from '../../contracts-cache-keys';
import { Contract } from '../../domain/contract.entity';

export interface UpdateContractInput {
  number: string;
  clientId: string;
  value: number;
  dueDate: Date;
}

@Injectable()
export class UpdateContractUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: ContractRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
    private readonly cache: RedisCacheService,
  ) {}

  async execute(id: string, input: UpdateContractInput): Promise<Contract> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) throw new NotFoundError('Contrato', id);

    const client = await this.clientRepository.findById(input.clientId);
    if (!client) throw new NotFoundError('Cliente', input.clientId);

    contract.updateDetails(input);
    const saved = await this.contractRepository.save(contract);
    await this.cache.del(...CONTRACTS_CACHE_KEYS);
    return saved;
  }
}
