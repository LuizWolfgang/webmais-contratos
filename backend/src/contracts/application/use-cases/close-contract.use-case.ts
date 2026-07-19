import { Inject, Injectable } from '@nestjs/common';
import { CONTRACT_REPOSITORY, ContractRepository } from '../../domain/contract.repository';
import { NotFoundError } from '../../../shared/domain-errors';
import { RedisCacheService } from '../../../redis/redis-cache.service';
import { CONTRACTS_CACHE_KEYS } from '../../contracts-cache-keys';
import { Contract } from '../../domain/contract.entity';

@Injectable()
export class CloseContractUseCase {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: ContractRepository,
    private readonly cache: RedisCacheService,
  ) {}

  async execute(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) throw new NotFoundError('Contrato', id);

    contract.close();
    const saved = await this.contractRepository.save(contract);
    await this.cache.del(...CONTRACTS_CACHE_KEYS);
    return saved;
  }
}
