import { Inject, Injectable, Logger } from '@nestjs/common';
import { CONTRACT_REPOSITORY, ContractRepository } from '../../domain/contract.repository';
import { ContractStatus } from '../../domain/contract-status';
import { RedisCacheService } from '../../../redis/redis-cache.service';
import { CONTRACTS_CACHE_KEYS } from '../../contracts-cache-keys';

@Injectable()
export class MarkContractExpiredUseCase {
  private readonly logger = new Logger(MarkContractExpiredUseCase.name);

  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: ContractRepository,
    private readonly cache: RedisCacheService,
  ) {}

  // update condicional (só se ainda ATIVO): reprocessar a mesma mensagem do Kafka vira um no-op seguro
  async execute(contractId: string): Promise<void> {
    const updated = await this.contractRepository.updateStatusIfCurrent(
      contractId,
      ContractStatus.ATIVO,
      ContractStatus.VENCIDO,
    );
    if (!updated) {
      this.logger.debug(`Contrato ${contractId} já não estava mais ATIVO, ignorando`);
      return;
    }
    await this.cache.del(...CONTRACTS_CACHE_KEYS);
    this.logger.log(`Contrato ${contractId} marcado como VENCIDO`);
  }
}
