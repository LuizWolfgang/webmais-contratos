import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONTRACT_REPOSITORY, ContractRepository } from '../../domain/contract.repository';
import { EVENT_PUBLISHER, EventPublisher } from '../../../kafka/event-publisher.port';
import { Env } from '../../../shared/config/env';

@Injectable()
export class ScanOverdueContractsUseCase {
  private readonly logger = new Logger(ScanOverdueContractsUseCase.name);

  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepository: ContractRepository,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: EventPublisher,
    private readonly config: ConfigService<Env, true>,
  ) {}

  // varre contratos ativos vencidos e publica um evento por contrato no tópico do Kafka
  async execute(): Promise<void> {
    const overdue = await this.contractRepository.findOverdueActive(new Date());
    if (overdue.length === 0) return;

    const topic = this.config.get('KAFKA_TOPIC_CONTRACTS_EXPIRED');
    for (const contract of overdue) {
      await this.eventPublisher.publish(topic, {
        key: contract.id,
        value: {
          eventType: 'contract.expired',
          contractId: contract.id,
          contractNumber: contract.number,
          dueDate: contract.dueDate.toISOString(),
          detectedAt: new Date().toISOString(),
          version: 1,
        },
      });
    }
    this.logger.log(`${overdue.length} contrato(s) vencido(s) detectado(s) e publicado(s) no Kafka`);
  }
}
