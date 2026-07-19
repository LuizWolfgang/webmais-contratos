export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

export interface EventMessage {
  key: string;
  value: Record<string, unknown>;
}

export interface EventPublisher {
  publish(topic: string, message: EventMessage): Promise<void>;
}
