import { Global, Module } from '@nestjs/common';
import { RedisCacheService, redisClientProvider } from './redis-cache.service';

@Global()
@Module({
  providers: [redisClientProvider, RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisModule {}
