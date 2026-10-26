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
        <h2>Sign in</h2>

        <label for="username">Username</label>
        <input id="username" name="username" type="text" maxlength="100"
          autocomplete="username" [(ngModel)]="username" required />

        <label for="password">Password</label>
        <input id="password" name="password" type="password" maxlength="128"
          autocomplete="current-password" [(ngModel)]="password" required />

        @if (error()) {
          <p class="login-error" role="alert">{{ error() }}</p>
        }

        <button type="submit" [disabled]="busy()">Sign in</button>
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
    button:disabled { opacity: 0.6; cursor: default; }
    .login-error { color: #b91c1c; font-size: 0.85rem; margin: 0; }
  `],
})
export class LoginComponent {
  username = '';
  password = '';
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  constructor(private readonly auth: AuthService) {}

  async submit(): Promise<void> {
    this.error.set(null);
    this.busy.set(true);
    try {
      const ok = await this.auth.login(this.username, this.password);
      if (!ok) {
        this.error.set('Please enter your username and password.');
      }
    } catch {
      this.error.set('Sign in failed. Please try again.');
    } finally {
      this.password = '';
      this.busy.set(false);
    }
  }
}
