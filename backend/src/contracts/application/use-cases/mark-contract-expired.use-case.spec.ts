import { MarkContractExpiredUseCase } from './mark-contract-expired.use-case';
import { ContractRepository } from '../../domain/contract.repository';
import { RedisCacheService } from '../../../redis/redis-cache.service';
import { CONTRACTS_CACHE_KEYS } from '../../contracts-cache-keys';

describe('MarkContractExpiredUseCase', () => {
  function build(updateResult: boolean) {
    const contractRepository: Partial<ContractRepository> = {
      updateStatusIfCurrent: jest.fn().mockResolvedValue(updateResult),
    };
    const cache: Partial<RedisCacheService> = { del: jest.fn().mockResolvedValue(undefined) };
    const useCase = new MarkContractExpiredUseCase(
      contractRepository as ContractRepository,
      cache as RedisCacheService,
    );
    return { useCase, contractRepository, cache };
  }

  it('marca como VENCIDO e invalida o cache quando o contrato ainda está ATIVO', async () => {
    const { useCase, contractRepository, cache } = build(true);

    await useCase.execute('contract-1');

    expect(contractRepository.updateStatusIfCurrent).toHaveBeenCalledWith(
      'contract-1',
      'ATIVO',
      'VENCIDO',
    );
    expect(cache.del).toHaveBeenCalledWith(...CONTRACTS_CACHE_KEYS);
  });

  it('é idempotente: não invalida cache se o contrato já não estava ATIVO', async () => {
    const { useCase, cache } = build(false);

    await useCase.execute('contract-1');

    expect(cache.del).not.toHaveBeenCalled();
  });
});
