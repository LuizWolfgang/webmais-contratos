import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { KAFKA_CLIENT } from '../kafka/kafka-client.provider';
import { MarkContractExpiredUseCase } from '../contracts/application/use-cases/mark-contract-expired.use-case';
import { Env } from '../shared/config/env';

interface ContractExpiredEvent {
  contractId: string;
}

@Injectable()
export class ContractExpiredConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ContractExpiredConsumer.name);
  private readonly consumer: KafkaJS.Consumer;

  constructor(
    @Inject(KAFKA_CLIENT) kafka: KafkaJS.Kafka,
    private readonly markContractExpired: MarkContractExpiredUseCase,
    private readonly config: ConfigService<Env, true>,
  ) {
    this.consumer = kafka.consumer({
      kafkaJS: { groupId: this.config.get('KAFKA_CONSUMER_GROUP') },
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.config.get('KAFKA_TOPIC_CONTRACTS_EXPIRED') });
    // consome o evento de vencimento e delega ao use-case idempotente de marcação
    await this.consumer.run({ eachMessage: (payload) => this.handleMessage(payload) });
    this.logger.log('Consumer do tópico de contratos vencidos conectado');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  private async handleMessage({ message }: { message: { value: Buffer | null } }): Promise<void> {
    let event: ContractExpiredEvent;
    try {
      event = JSON.parse(message.value?.toString() ?? '{}');
      if (!event.contractId) throw new Error('contractId ausente no payload');
    } catch (err) {
      this.logger.warn(`Mensagem malformada descartada: ${(err as Error).message}`);
      return;
    }

    await this.markContractExpired.execute(event.contractId);
  }
}
