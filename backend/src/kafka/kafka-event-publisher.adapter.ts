import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { KafkaJS } from '@confluentinc/kafka-javascript';
import { KAFKA_CLIENT } from './kafka-client.provider';
import { EventMessage, EventPublisher } from './event-publisher.port';

@Injectable()
export class KafkaEventPublisherAdapter implements EventPublisher, OnModuleInit, OnModuleDestroy {
  private readonly producer: KafkaJS.Producer;

  constructor(@Inject(KAFKA_CLIENT) kafka: KafkaJS.Kafka) {
    this.producer = kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  // publica o evento de domínio no tópico Kafka informado, usado pelo scan de contratos vencidos
  async publish(topic: string, message: EventMessage): Promise<void> {
    await this.producer.send({
      topic,
      messages: [{ key: message.key, value: JSON.stringify(message.value) }],
    });
  }
}
