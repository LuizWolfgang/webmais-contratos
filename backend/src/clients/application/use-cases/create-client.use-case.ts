import { Inject, Injectable } from '@nestjs/common';
import { Client } from '../../domain/client.entity';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client.repository';

export interface CreateClientInput {
  name: string;
  document: string;
}

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: CreateClientInput): Promise<Client> {
    return this.clientRepository.create(input);
  }
}
