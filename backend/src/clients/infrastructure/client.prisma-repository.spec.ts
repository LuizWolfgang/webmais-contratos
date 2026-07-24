import { Prisma } from '@prisma/client';
import { ClientPrismaRepository } from './client.prisma-repository';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictError } from '../../shared/domain-errors';

function buildRepository(deleteError: unknown) {
  const prisma = {
    client: { delete: jest.fn().mockRejectedValue(deleteError) },
  } as unknown as PrismaService;
  return new ClientPrismaRepository(prisma);
}

describe('ClientPrismaRepository.delete', () => {
  it('traduz o P2003 (foreign key) em ConflictError', async () => {
    const err = new Prisma.PrismaClientKnownRequestError('FK', {
      code: 'P2003',
      clientVersion: '6.19.3',
    });
    await expect(buildRepository(err).delete('id')).rejects.toBeInstanceOf(ConflictError);
  });

  it('traduz o erro de RESTRICT vindo como unknown (Postgres 23001) em ConflictError', async () => {
    // onDelete: Restrict no Postgres levanta 23001, que o Prisma não mapeia para P2003.
    const err = new Prisma.PrismaClientUnknownRequestError(
      'update or delete on table "clients" violates RESTRICT setting of foreign key constraint "contracts_clientId_fkey"',
      { clientVersion: '6.19.3' },
    );
    await expect(buildRepository(err).delete('id')).rejects.toBeInstanceOf(ConflictError);
  });
});
