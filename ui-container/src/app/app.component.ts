import { Component } from '@angular/core';
import { UiComponent } from './ui/ui.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UiComponent],
  template: `<app-ui />`,
})
export class AppComponent {}
