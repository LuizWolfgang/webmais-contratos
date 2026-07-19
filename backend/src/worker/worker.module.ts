import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { validateEnv } from '../shared/config/env';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { ContractsModule } from '../contracts/contracts.module';
import { KafkaModule } from '../kafka/kafka.module';
import { ExpirationSchedulerProvider } from './expiration-scheduler.provider';
import { ContractExpiredConsumer } from './contract-expired.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    PrismaModule,
    RedisModule,
    ContractsModule,
    KafkaModule,
  ],
  providers: [ExpirationSchedulerProvider, ContractExpiredConsumer],
})
export class WorkerModule {}
