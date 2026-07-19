import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Env } from '../shared/config/env';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const redisClientProvider = {
  provide: REDIS_CLIENT,
  useFactory: (config: ConfigService<Env, true>) => new Redis(config.get('REDIS_URL')),
  inject: [ConfigService],
};

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly ttlSeconds: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly client: Redis,
    config: ConfigService<Env, true>,
  ) {
    this.ttlSeconds = config.get('CACHE_TTL_SECONDS');
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', this.ttlSeconds);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.del(...keys);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
