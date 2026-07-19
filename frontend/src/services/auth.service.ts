import { api } from './api';

export interface LoginResult {
  token: string;
  user: { id: string; username: string };
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const response = await api.post('/auth/login', { username, password });
  return response.data.data;
}
