import { Module } from '@nestjs/common';
import { kafkaClientProvider, KAFKA_CLIENT } from './kafka-client.provider';
import { EnsureTopicsService } from './ensure-topics';
import { EVENT_PUBLISHER } from './event-publisher.port';
import { KafkaEventPublisherAdapter } from './kafka-event-publisher.adapter';

@Module({
  providers: [
    kafkaClientProvider,
    EnsureTopicsService,
    { provide: EVENT_PUBLISHER, useClass: KafkaEventPublisherAdapter },
  ],
  exports: [KAFKA_CLIENT, EVENT_PUBLISHER],
})
export class KafkaModule {}
