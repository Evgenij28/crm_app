import type { AuthResponse } from '../types';

const AUTH_KEY = 'crm_auth';

export function saveAuth(auth: AuthResponse): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function readAuth(): AuthResponse | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}
