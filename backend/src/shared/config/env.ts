import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('8h'),

  DATABASE_URL: z.string().min(1),

  REDIS_URL: z.string().min(1),
  CACHE_TTL_SECONDS: z.coerce.number().default(60),

  KAFKA_BROKERS: z.string().min(1),
  KAFKA_CLIENT_ID: z.string().default('webmais-contratos'),
  KAFKA_TOPIC_CONTRACTS_EXPIRED: z.string().default('contracts.expired'),
  KAFKA_CONSUMER_GROUP: z.string().default('contracts-expiration-worker'),
  EXPIRATION_SCHEDULER_INTERVAL_MS: z.coerce.number().default(15000),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(`Variáveis de ambiente inválidas: ${parsed.error.message}`);
  }
  return parsed.data;
}
