import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Client } from '../domain/client.entity';
import { ClientRepository } from '../domain/client.repository';
import { ConflictError } from '../../shared/domain-errors';

type ClientRecord = {
  id: string;
  name: string;
  document: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ClientPrismaRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; document: string }): Promise<Client> {
    try {
      const created = await this.prisma.client.create({ data });
      return this.toDomain(created);
    } catch (err) {
      throw this.translateError(err);
    }
  }

  async update(id: string, data: { name: string; document: string }): Promise<Client> {
    try {
      const updated = await this.prisma.client.update({ where: { id }, data });
      return this.toDomain(updated);
    } catch (err) {
      throw this.translateError(err);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.client.delete({ where: { id } });
    } catch (err) {
      throw this.translateError(err);
    }
  }

  async findById(id: string): Promise<Client | null> {
    const found = await this.prisma.client.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findAll(): Promise<Client[]> {
    const found = await this.prisma.client.findMany({ orderBy: { name: 'asc' } });
    return found.map((record) => this.toDomain(record));
  }

  private toDomain(record: ClientRecord): Client {
    return new Client(record.id, record.name, record.document, record.createdAt, record.updatedAt);
  }

  private translateError(err: unknown): unknown {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2003') {
        return new ConflictError('Não é possível excluir cliente com contratos vinculados');
      }
      if (err.code === 'P2002') {
        return new ConflictError('Já existe um cliente com este documento');
      }
    }
    return err;
  }
}
