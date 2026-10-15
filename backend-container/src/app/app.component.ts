import { Component } from '@angular/core';
import { BackendComponent } from './backend/backend.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BackendComponent],
  template: `<app-backend />`,
})
export class AppComponent {}
