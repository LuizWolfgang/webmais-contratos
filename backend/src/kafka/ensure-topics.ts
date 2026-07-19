import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { KAFKA_CLIENT } from './kafka-client.provider';
import { Env } from '../shared/config/env';

@Injectable()
export class EnsureTopicsService implements OnModuleInit {
  private readonly logger = new Logger(EnsureTopicsService.name);

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafka: KafkaJS.Kafka,
    private readonly config: ConfigService<Env, true>,
  ) {}

  // cria o tópico de expiração de forma idempotente, para o projeto rodar sem setup manual do Kafka
  async onModuleInit() {
    const topic = this.config.get('KAFKA_TOPIC_CONTRACTS_EXPIRED');
    const admin = this.kafka.admin();
    await admin.connect();
    try {
      await admin.createTopics({ topics: [{ topic, numPartitions: 1, replicationFactor: 1 }] });
      this.logger.log(`Tópico "${topic}" garantido`);
    } catch (err) {
      this.logger.warn(`Falha ao garantir tópico "${topic}": ${(err as Error).message}`);
    } finally {
      await admin.disconnect();
    }
  }
}
