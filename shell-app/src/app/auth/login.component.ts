import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <form class="login-card" (ngSubmit)="submit()" autocomplete="off">
        <img src="assets/royal-london-logo.png" alt="Royal London" class="login-logo" />
        <h2>{{ mode() === 'login' ? 'Sign in' : 'Create account' }}</h2>

        <label for="username">Username</label>
        <input id="username" name="username" type="text" maxlength="100"
          autocomplete="username" [(ngModel)]="username" required />

        @if (mode() === 'register') {
          <label for="email">Email</label>
          <input id="email" name="email" type="email" maxlength="255"
            autocomplete="email" [(ngModel)]="email" required />
        }

        <label for="password">Password</label>
        <input id="password" name="password" type="password" maxlength="128"
          [attr.autocomplete]="mode() === 'login' ? 'current-password' : 'new-password'"
          [(ngModel)]="password" required />

        @if (error()) {
          <p class="login-error" role="alert">{{ error() }}</p>
        }
        @if (info()) {
          <p class="login-info" role="status">{{ info() }}</p>
        }

        <button type="submit" [disabled]="busy()">
          {{ mode() === 'login' ? 'Sign in' : 'Create account' }}
        </button>
        <button type="button" class="link" [disabled]="busy()" (click)="toggleMode()">
          {{ mode() === 'login' ? 'Create a new account' : 'Back to sign in' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f3eefb; padding: 1rem; }
    .login-card { background: #fff; border: 2px solid #470054; border-radius: 12px; padding: 2rem; width: min(380px, 100%); display: flex; flex-direction: column; gap: 0.5rem; }
    .login-logo { background: #470054; padding: 0.5rem 1rem; border-radius: 8px; height: 40px; width: auto; align-self: center; object-fit: contain; }
    h2 { margin: 0.5rem 0; color: #470054; text-align: center; }
    label { font-size: 0.85rem; font-weight: 600; color: #470054; }
    input { padding: 0.55rem 0.7rem; border: 1px solid #b9a6c7; border-radius: 6px; font-size: 0.95rem; }
    button { margin-top: 0.75rem; padding: 0.6rem; background: #470054; color: #fff; border: 0; border-radius: 6px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
    button.link { margin-top: 0; background: none; color: #470054; text-decoration: underline; }
    button:disabled { opacity: 0.6; cursor: default; }
    .login-error { color: #b91c1c; font-size: 0.85rem; margin: 0; }
    .login-info { color: #15803d; font-size: 0.85rem; margin: 0; }
  `],
})
export class LoginComponent {
  username = '';
  email = '';
  password = '';
  readonly mode = signal<'login' | 'register'>('login');
  readonly error = signal<string | null>(null);
  readonly info = signal<string | null>(null);
  readonly busy = signal(false);

  constructor(private readonly auth: AuthService) {}

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.error.set(null);
    this.info.set(null);
    this.password = '';
  }

  async submit(): Promise<void> {
    this.error.set(null);
    this.info.set(null);
    this.busy.set(true);
    try {
      if (this.mode() === 'register') {
        await this.register();
      } else {
        const ok = await this.auth.login(this.username, this.password);
        if (!ok) {
          this.error.set('Invalid username or password.');
        }
      }
    } catch (err) {
      console.error('Auth request failed', err);
      this.error.set('Unable to complete the request right now. Please try again.');
    } finally {
      this.password = '';
      this.busy.set(false);
    }
  }

  private async register(): Promise<void> {
    if (!this.username.trim() || !this.email.trim() || !this.password) {
      this.error.set('Username, email and password are required.');
      return;
    }
    const failure = await this.auth.register(this.username, this.email, this.password);
    if (failure) {
      this.error.set(failure);
      return;
    }
    this.email = '';
    this.mode.set('login');
    this.info.set('Account created. You can now sign in.');
  }
}
