import axios from 'axios';
import type { AdminSession } from '../types';

export const SESSION_KEY = 'flexfit.admin.session';
const fallbackBaseUrl = 'http://localhost:5000/api';

export function getSession(): AdminSession | null {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? (JSON.parse(value) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AdminSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/$/, '') || fallbackBaseUrl,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  const token = getSession()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || error.message || 'Không thể kết nối đến máy chủ.';
  }
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.';
}
