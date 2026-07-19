export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} com id "${id}" não encontrado`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
