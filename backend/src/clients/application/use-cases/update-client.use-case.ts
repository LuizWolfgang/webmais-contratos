import { Inject, Injectable } from '@nestjs/common';
import { Client } from '../../domain/client.entity';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client.repository';
import { NotFoundError } from '../../../shared/domain-errors';

export interface UpdateClientInput {
  name: string;
  document: string;
}

@Injectable()
export class UpdateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
  ) {}

  async execute(id: string, input: UpdateClientInput): Promise<Client> {
    const existing = await this.clientRepository.findById(id);
    if (!existing) throw new NotFoundError('Cliente', id);
    return this.clientRepository.update(id, input);
  }
}
