import axios from 'axios';
import type { ApiResponse } from '@yukti/types';

// Single axios instance. Cookies (httpOnly JWT) are sent automatically.
export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Unwrap the standard { success, data } envelope; throw a friendly message on error.
export async function fetchData<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url, { params });
  if (!res.data.success) throw new Error(res.data.error.message);
  return res.data.data;
}

export async function postData<T>(url: string, body: unknown): Promise<T> {
  const res = await api.post<ApiResponse<T>>(url, body);
  if (!res.data.success) throw new Error(res.data.error.message);
  return res.data.data;
}
