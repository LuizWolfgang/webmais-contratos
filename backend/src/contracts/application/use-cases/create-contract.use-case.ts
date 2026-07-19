import { Inject, Injectable } from '@nestjs/common';
import { CONTRACT_REPOSITORY, ContractRepository } from '../../domain/contract.repository';
import { CLIENT_REPOSITORY, ClientRepository } from '../../../clients/domain/client.repository';
import { NotFoundError } from '../../../shared/domain-errors';
import { RedisCacheService } from '../../../redis/redis-cache.service';
import { CONTRACTS_CACHE_KEYS } from '../../contracts-cache-keys';
import { Contract } from '../../domain/contract.entity';

export interface CreateContractInput {
  number: string;
  clientId: string;
  value: number;
  dueDate: Date;
}

@Injectable()
export class CreateContractUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: ContractRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
    private readonly cache: RedisCacheService,
  ) {}

  async execute(input: CreateContractInput): Promise<Contract> {
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) throw new NotFoundError('Cliente', input.clientId);

    const contract = await this.contractRepository.create(input);
    await this.cache.del(...CONTRACTS_CACHE_KEYS);
    return contract;
  }
}
