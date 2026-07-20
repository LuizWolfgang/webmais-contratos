import { Module } from '@nestjs/common';
import { ContractsController } from './interfaces/contracts.controller';
import { CreateContractUseCase } from './application/use-cases/create-contract.use-case';
import { UpdateContractUseCase } from './application/use-cases/update-contract.use-case';
import { DeleteContractUseCase } from './application/use-cases/delete-contract.use-case';
import { CloseContractUseCase } from './application/use-cases/close-contract.use-case';
import { ListContractsUseCase } from './application/use-cases/list-contracts.use-case';
import { GetContractsSummaryUseCase } from './application/use-cases/get-contracts-summary.use-case';
import { GetContractUseCase } from './application/use-cases/get-contract.use-case';
import { CONTRACT_REPOSITORY } from './domain/contract.repository';
import { ContractPrismaRepository } from './infrastructure/contract.prisma-repository';
import { ClientsModule } from '../clients/clients.module';

// Módulo da API REST: só depende de Postgres, Redis e Clients — sem Kafka.
// Os casos de uso assíncronos (scan/mark de vencimento) vivem no WorkerModule.
@Module({
  imports: [ClientsModule],
  controllers: [ContractsController],
  providers: [
    { provide: CONTRACT_REPOSITORY, useClass: ContractPrismaRepository },
    CreateContractUseCase,
    UpdateContractUseCase,
    DeleteContractUseCase,
    CloseContractUseCase,
    ListContractsUseCase,
    GetContractsSummaryUseCase,
    GetContractUseCase,
  ],
  exports: [CONTRACT_REPOSITORY],
})
export class ContractsModule {}
