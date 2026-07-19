import { ConfigService } from '@nestjs/config';
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { Env } from '../shared/config/env';

export const KAFKA_CLIENT = Symbol('KAFKA_CLIENT');

export const kafkaClientProvider = {
  provide: KAFKA_CLIENT,
  useFactory: (config: ConfigService<Env, true>) =>
    new KafkaJS.Kafka({
      kafkaJS: {
        brokers: config.get('KAFKA_BROKERS').split(','),
        clientId: config.get('KAFKA_CLIENT_ID'),
      },
    }),
  inject: [ConfigService],
};
