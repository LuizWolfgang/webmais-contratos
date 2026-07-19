import { Inject, Injectable } from '@nestjs/common';
import { Client } from '../../domain/client.entity';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client.repository';
import { NotFoundError } from '../../../shared/domain-errors';

@Injectable()
export class GetClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
  ) {}

  async execute(id: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) throw new NotFoundError('Cliente', id);
    return client;
  }
}
