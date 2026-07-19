import { Client } from './client.entity';

export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');

export interface ClientRepository {
  create(data: { name: string; document: string }): Promise<Client>;
  update(id: string, data: { name: string; document: string }): Promise<Client>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Client | null>;
  findAll(): Promise<Client[]>;
}
