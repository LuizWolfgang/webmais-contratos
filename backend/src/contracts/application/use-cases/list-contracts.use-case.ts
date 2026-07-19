import { Inject, Injectable } from '@nestjs/common';
import { CONTRACT_REPOSITORY, ContractListItem, ContractRepository } from '../../domain/contract.repository';
import { RedisCacheService } from '../../../redis/redis-cache.service';
import { CONTRACTS_LIST_CACHE_KEY } from '../../contracts-cache-keys';

@Injectable()
export class ListContractsUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: ContractRepository,
    private readonly cache: RedisCacheService,
  ) {}

  async execute(): Promise<ContractListItem[]> {
    const cached = await this.cache.get<ContractListItem[]>(CONTRACTS_LIST_CACHE_KEY);
    if (cached) return cached;

    const contracts = await this.contractRepository.findAllWithClient();
    await this.cache.set(CONTRACTS_LIST_CACHE_KEY, contracts);
    return contracts;
  }
}
