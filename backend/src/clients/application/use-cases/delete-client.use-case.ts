import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client.repository';
import { NotFoundError } from '../../../shared/domain-errors';

@Injectable()
export class DeleteClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.clientRepository.findById(id);
    if (!existing) throw new NotFoundError('Cliente', id);
    await this.clientRepository.delete(id);
  }
}
