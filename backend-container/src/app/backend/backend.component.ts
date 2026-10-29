import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

export interface Pension {
  id: string;
  policyNumber: string;
  holderName: string;
  startDate: string;
  monthlyAmount: number;
}

export interface Agent {
  id: string;
  name: string;
  licenseNumber: string;
  email?: string | null;
  phone?: string | null;
  region?: string | null;
}

type Tab = 'agents' | 'pensions';

// Must match TOKEN_KEY in shell-app's AuthService (same page, same sessionStorage).
const TOKEN_KEY = 'rlg_access_token';
const REQUEST_TIMEOUT_MS = 15000;

@Component({
  selector: 'app-backend',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './backend.component.html',
  styleUrls: ['./backend.component.css'],
})
export class BackendComponent implements OnInit {
  private readonly baseUrl = 'https://localhost:53344/api';

  readonly pensions = signal<Pension[]>([]);
  readonly agents = signal<Agent[]>([]);
  readonly loading = signal(true);
  readonly pensionsError = signal<string | null>(null);
  readonly agentsError = signal<string | null>(null);
  readonly popupOpen = signal(false);
  readonly activeTab = signal<Tab>('agents');

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.load<Agent>('Agents', this.agents, this.agentsError),
      this.load<Pension>('Pensions', this.pensions, this.pensionsError),
    ]);
    this.loading.set(false);
  }

  openPopup(): void {
    this.popupOpen.set(true);
  }

  closePopup(): void {
    this.popupOpen.set(false);
  }

  selectTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  private async load<T>(
    resource: string,
    data: { set(value: T[]): void },
    error: { set(value: string | null): void },
  ): Promise<void> {
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (!token) {
        error.set('Please sign in to view this data.');
        return;
      }
      const response = await fetch(`${this.baseUrl}/${resource}`, {
        method: 'GET',
        headers: { accept: 'application/json', authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (response.status === 401) {
        error.set('Your session has expired. Please sign in again.');
        return;
      }
      if (!response.ok) {
        console.error(`${resource} API request failed with status`, response.status);
        error.set(`Unable to load ${resource.toLowerCase()}.`);
        return;
      }
      data.set((await response.json()) as T[]);
    } catch (err) {
      console.error(`${resource} API request failed`, err);
      error.set(`Unable to load ${resource.toLowerCase()}.`);
    }
  }
}
