import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScanOverdueContractsUseCase } from '../contracts/application/use-cases/scan-overdue-contracts.use-case';
import { Env } from '../shared/config/env';

@Injectable()
export class ExpirationSchedulerProvider implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExpirationSchedulerProvider.name);
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly scanOverdueContracts: ScanOverdueContractsUseCase,
    private readonly config: ConfigService<Env, true>,
  ) {}

  // dispara a varredura de contratos vencidos periodicamente, no lugar de um job agendado do BullMQ
  onModuleInit() {
    const intervalMs = this.config.get('EXPIRATION_SCHEDULER_INTERVAL_MS');
    this.timer = setInterval(() => {
      this.scanOverdueContracts.execute().catch((err) => {
        this.logger.error(`Falha ao varrer contratos vencidos: ${(err as Error).message}`);
      });
    }, intervalMs);
    this.logger.log(`Scheduler de expiração iniciado (intervalo de ${intervalMs}ms)`);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
