import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  readonly profile = signal<UserProfile | null>(null);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  readonly dialogOpen = signal(false);
  readonly showPassword = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  constructor(private router: Router, private auth: AuthService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.profile.set(await this.auth.getProfile());
    } catch (err) {
      console.error('Profile request failed', err);
    }
  }

  navigateHome() {
    this.router.navigate(['/']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  openChangePassword() {
    this.resetDialog();
    this.dialogOpen.set(true);
  }

  closeDialog() {
    this.dialogOpen.set(false);
    this.resetDialog();
  }

  async submitChangePassword(): Promise<void> {
    this.error.set(null);
    this.success.set(null);

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.error.set('All fields are required.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('New password and confirmation do not match.');
      return;
    }
    if (this.newPassword === this.currentPassword) {
      this.error.set('New password must be different from the current password.');
      return;
    }

    this.busy.set(true);
    try {
      const failure = await this.auth.changePassword(this.currentPassword, this.newPassword);
      if (failure) {
        this.error.set(failure);
        return;
      }
      this.currentPassword = this.newPassword = this.confirmPassword = '';
      this.success.set('Password changed successfully.');
    } catch (err) {
      console.error('Change password request failed', err);
      this.error.set('Unable to change password right now. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }

  private resetDialog(): void {
    this.currentPassword = this.newPassword = this.confirmPassword = '';
    this.showPassword.set(false);
    this.error.set(null);
    this.success.set(null);
  }
}
