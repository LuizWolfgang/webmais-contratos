import { z } from 'zod';

const baseSchema = z.object({
  PORT: z.coerce.number().default(3001),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('8h'),

  DATABASE_URL: z.string().min(1),

  REDIS_URL: z.string().min(1),
  CACHE_TTL_SECONDS: z.coerce.number().default(60),

  // Kafka é usado só pelo processo worker; a API nunca conecta nele, por isso tem default aqui.
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: z.string().default('webmais-contratos'),
  KAFKA_TOPIC_CONTRACTS_EXPIRED: z.string().default('contracts.expired'),
  KAFKA_CONSUMER_GROUP: z.string().default('contracts-expiration-worker'),
  EXPIRATION_SCHEDULER_INTERVAL_MS: z.coerce.number().default(15000),
});

const workerSchema = baseSchema.extend({
  KAFKA_BROKERS: z.string().min(1, 'KAFKA_BROKERS é obrigatório no processo worker'),
});

export type Env = z.infer<typeof baseSchema>;

function parse(schema: z.ZodType<Env>, config: Record<string, unknown>): Env {
  const parsed = schema.safeParse(config);
  if (!parsed.success) {
    throw new Error(`Variáveis de ambiente inválidas: ${parsed.error.message}`);
  }
  return parsed.data;
}

export function validateEnv(config: Record<string, unknown>): Env {
  return parse(baseSchema, config);
}

export function validateWorkerEnv(config: Record<string, unknown>): Env {
  return parse(workerSchema, config);
}
