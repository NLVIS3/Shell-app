import { Injectable, signal } from '@angular/core';

/** Shared with the backend-container remote, which runs in the same page/origin. */
export const TOKEN_KEY = 'rlg_access_token';
const EXPIRES_KEY = 'rlg_access_token_expires';
const LOGIN_URL = 'https://localhost:53344/api/Auth/login';
const USERS_URL = 'https://localhost:53344/api/Users';
const LOGIN_TIMEOUT_MS = 15000;

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
}

export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  createdAt: string;
  lastLoginAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal(false);
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const expiresAt = Date.parse(sessionStorage.getItem(EXPIRES_KEY) ?? '');
    if (sessionStorage.getItem(TOKEN_KEY) && expiresAt > Date.now()) {
      this.startSession(expiresAt);
    } else {
      this.clearSession();
    }
  }

  /** Returns true on success, false for bad credentials. Throws on network/server failure. */
  async login(username: string, password: string): Promise<boolean> {
    if (!username.trim() || !password) {
      return false;
    }

    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ userName: username, password }),
      signal: AbortSignal.timeout(LOGIN_TIMEOUT_MS),
    });

    if (response.status === 401) {
      return false;
    }
    if (!response.ok) {
      throw new Error(`Login failed with status ${response.status}`);
    }

    const result = (await response.json()) as LoginResponse;
    const expiresAt = Date.parse(result.expiresAt);
    sessionStorage.setItem(TOKEN_KEY, result.accessToken);
    sessionStorage.setItem(EXPIRES_KEY, result.expiresAt);
    this.startSession(expiresAt);
    return true;
  }

  /** Creates a user. Returns null on success, otherwise a message safe to show the user. */
  async register(username: string, email: string, password: string): Promise<string | null> {
    const response = await fetch(USERS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ username: username.trim(), email: email.trim(), password, isActive: true }),
      signal: AbortSignal.timeout(LOGIN_TIMEOUT_MS),
    });

    if (response.ok) {
      return null;
    }
    if (response.status === 409) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      return body?.message ?? 'Username or email already exists.';
    }
    if (response.status === 400) {
      return 'Please check the details you entered.';
    }
    throw new Error(`Registration failed with status ${response.status}`);
  }

  /** Loads the signed-in user's profile. Returns null if it cannot be loaded. */
  async getProfile(): Promise<UserProfile | null> {
    const response = await fetch(`${USERS_URL}/me`, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${sessionStorage.getItem(TOKEN_KEY) ?? ''}`,
      },
      signal: AbortSignal.timeout(LOGIN_TIMEOUT_MS),
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as UserProfile;
  }

  /** Changes the signed-in user's password. Returns null on success, otherwise a user-safe message. */
  async changePassword(currentPassword: string, newPassword: string): Promise<string | null> {
    const response = await fetch(`${USERS_URL}/me/password`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        authorization: `Bearer ${sessionStorage.getItem(TOKEN_KEY) ?? ''}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
      signal: AbortSignal.timeout(LOGIN_TIMEOUT_MS),
    });

    if (response.ok) {
      return null;
    }
    if (response.status === 401) {
      return 'Your session has expired. Please sign in again.';
    }
    if (response.status === 400) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      return body?.message ?? 'Please check the details you entered.';
    }
    throw new Error(`Change password failed with status ${response.status}`);
  }

  logout(): void {
    this.clearSession();
  }

  private startSession(expiresAt: number): void {
    this.isAuthenticated.set(true);
    this.stopTimer();
    // Sign the user out automatically when the token expires.
    this.expiryTimer = setTimeout(() => this.clearSession(), Math.max(expiresAt - Date.now(), 0));
  }

  private clearSession(): void {
    this.stopTimer();
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
    this.isAuthenticated.set(false);
  }

  private stopTimer(): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }
}
