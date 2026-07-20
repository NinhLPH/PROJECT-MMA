import { api, clearSession, saveSession } from './api';
import type { AdminSession, User } from '../types';

type LoginResponse = { token: string; user: User };

export async function loginAdmin(email: string, password: string): Promise<AdminSession> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  if (data.user.role !== 'admin') {
    throw new Error('Tài khoản này không có quyền quản trị.');
  }
  const session = { token: data.token, user: data.user };
  saveSession(session);
  return session;
}

export function logoutAdmin(): void {
  clearSession();
}
