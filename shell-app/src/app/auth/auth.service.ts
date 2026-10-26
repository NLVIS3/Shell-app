import { Injectable, signal } from '@angular/core';

const SESSION_KEY = 'rlg_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal(sessionStorage.getItem(SESSION_KEY) === '1');

  /**
   * TEMPORARY DEV STUB - no real authentication happens here.
   * It accepts any non-empty username and password and stores no credentials.
   * Replace the body of this method with a call to the InsuranceApi
   * authentication endpoint once it exists (HTTPS only), and keep the
   * returned token out of source code and logs.
   */
  async login(username: string, password: string): Promise<boolean> {
    if (!username.trim() || !password) {
      return false;
    }
    sessionStorage.setItem(SESSION_KEY, '1');
    this.isAuthenticated.set(true);
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.isAuthenticated.set(false);
  }
}
