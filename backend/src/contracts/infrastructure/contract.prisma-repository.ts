import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Contract } from '../domain/contract.entity';
import { ContractStatus } from '../domain/contract-status';
import { ContractListItem, ContractRepository, ContractSummary } from '../domain/contract.repository';
import { ConflictError, NotFoundError } from '../../shared/domain-errors';

type ContractRecord = {
  id: string;
  number: string;
  clientId: string;
  value: Prisma.Decimal;
  dueDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ContractPrismaRepository implements ContractRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    number: string;
    clientId: string;
    value: number;
    dueDate: Date;
  }): Promise<Contract> {
    try {
      const created = await this.prisma.contract.create({ data });
      return this.toDomain(created);
    } catch (err) {
      throw this.translateError(err);
    }
  }

  async save(contract: Contract): Promise<Contract> {
    try {
      const updated = await this.prisma.contract.update({
        where: { id: contract.id },
        data: {
          number: contract.number,
          clientId: contract.clientId,
          value: contract.value,
          dueDate: contract.dueDate,
          status: contract.status,
        },
      });
      return this.toDomain(updated);
    } catch (err) {
      throw this.translateError(err);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.contract.delete({ where: { id } });
    } catch (err) {
      throw this.translateError(err);
    }
  }

  async findById(id: string): Promise<Contract | null> {
    const found = await this.prisma.contract.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findAllWithClient(): Promise<ContractListItem[]> {
    const found = await this.prisma.contract.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
    return found.map((record) => ({
      id: record.id,
      number: record.number,
      clientId: record.clientId,
      clientName: record.client.name,
      value: Number(record.value),
      dueDate: record.dueDate,
      status: record.status as ContractStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));
  }

  async countByStatus(): Promise<ContractSummary> {
    const grouped = await this.prisma.contract.groupBy({ by: ['status'], _count: true });
    const summary: ContractSummary = { ATIVO: 0, VENCIDO: 0, ENCERRADO: 0, total: 0 };
    for (const group of grouped) {
      summary[group.status as ContractStatus] = group._count;
      summary.total += group._count;
    }
    return summary;
  }

  async findOverdueActive(referenceDate: Date): Promise<Contract[]> {
    const found = await this.prisma.contract.findMany({
      where: { status: ContractStatus.ATIVO, dueDate: { lt: referenceDate } },
    });
    return found.map((record) => this.toDomain(record));
  }

  async updateStatusIfCurrent(
    id: string,
    expectedStatus: ContractStatus,
    newStatus: ContractStatus,
  ): Promise<boolean> {
    const result = await this.prisma.contract.updateMany({
      where: { id, status: expectedStatus },
      data: { status: newStatus },
    });
    return result.count > 0;
  }

  private toDomain(record: ContractRecord): Contract {
    return new Contract(
      record.id,
      record.number,
      record.clientId,
      Number(record.value),
      record.dueDate,
      record.status as ContractStatus,
      record.createdAt,
      record.updatedAt,
    );
  }

  private translateError(err: unknown): unknown {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') return new ConflictError('Já existe um contrato com este número');
      if (err.code === 'P2003') return new NotFoundError('Cliente', 'informado');
      if (err.code === 'P2025') return new NotFoundError('Contrato', 'informado');
    }
    return err;
  }
}
