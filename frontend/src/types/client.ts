export interface Client {
  id: string;
  name: string;
  document: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientInput {
  name: string;
  document: string;
}
