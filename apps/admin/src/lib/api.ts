import axios from 'axios';
import type { ApiResponse } from '@yukti/types';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url, { params });
  if (!res.data.success) throw new Error(res.data.error.message);
  return res.data.data;
}
export async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await api.post<ApiResponse<T>>(url, body);
  if (!res.data.success) throw new Error(res.data.error.message);
  return res.data.data;
}
export async function put<T>(url: string, body: unknown): Promise<T> {
  const res = await api.put<ApiResponse<T>>(url, body);
  if (!res.data.success) throw new Error(res.data.error.message);
  return res.data.data;
}
export async function del<T>(url: string): Promise<T> {
  const res = await api.delete<ApiResponse<T>>(url);
  if (!res.data.success) throw new Error(res.data.error.message);
  return res.data.data;
}
