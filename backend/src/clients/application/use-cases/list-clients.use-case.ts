import { Inject, Injectable } from '@nestjs/common';
import { Client } from '../../domain/client.entity';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client.repository';

@Injectable()
export class ListClientsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
  ) {}

  async execute(): Promise<Client[]> {
    return this.clientRepository.findAll();
  }
}
