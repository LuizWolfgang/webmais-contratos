import { Inject, Injectable } from '@nestjs/common';
import { CONTRACT_REPOSITORY, ContractRepository, ContractSummary } from '../../domain/contract.repository';
import { RedisCacheService } from '../../../redis/redis-cache.service';
import { CONTRACTS_SUMMARY_CACHE_KEY } from '../../contracts-cache-keys';

@Injectable()
export class GetContractsSummaryUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: ContractRepository,
    private readonly cache: RedisCacheService,
  ) {}

  async execute(): Promise<ContractSummary> {
    const cached = await this.cache.get<ContractSummary>(CONTRACTS_SUMMARY_CACHE_KEY);
    if (cached) return cached;

    const summary = await this.contractRepository.countByStatus();
    await this.cache.set(CONTRACTS_SUMMARY_CACHE_KEY, summary);
    return summary;
  }
}
