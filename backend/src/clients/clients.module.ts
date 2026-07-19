import { Module } from '@nestjs/common';
import { ClientsController } from './interfaces/clients.controller';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case';
import { UpdateClientUseCase } from './application/use-cases/update-client.use-case';
import { DeleteClientUseCase } from './application/use-cases/delete-client.use-case';
import { ListClientsUseCase } from './application/use-cases/list-clients.use-case';
import { GetClientUseCase } from './application/use-cases/get-client.use-case';
import { CLIENT_REPOSITORY } from './domain/client.repository';
import { ClientPrismaRepository } from './infrastructure/client.prisma-repository';

@Module({
  controllers: [ClientsController],
  providers: [
    { provide: CLIENT_REPOSITORY, useClass: ClientPrismaRepository },
    CreateClientUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
    ListClientsUseCase,
    GetClientUseCase,
  ],
  exports: [CLIENT_REPOSITORY],
})
export class ClientsModule {}
