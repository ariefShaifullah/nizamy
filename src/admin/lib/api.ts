import { API_BASE } from '../../lib/config';

// Auth helpers
export function getToken(): string | null {
  return localStorage.getItem('nizamy_admin_token');
}

export function setToken(t: string) {
  localStorage.setItem('nizamy_admin_token', t);
}

export function clearToken() {
  localStorage.removeItem('nizamy_admin_token');
}

// API caller
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    window.location.reload();
  }
  return res.json();
}
