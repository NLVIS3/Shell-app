import { ChangeDetectorRef, Component, OnInit, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/module-federation';

@Component({
  selector: 'app-backend-loader',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `@if (remoteComponent) {
    <ng-container [ngComponentOutlet]="remoteComponent" />
  }`,
})
export class BackendLoaderComponent implements OnInit {
  remoteComponent: Type<unknown> | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    const m = await loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://localhost:4203/remoteEntry.js',
      exposedModule: './BackendComponent',
    });
    this.remoteComponent = m.BackendComponent as Type<unknown>;
    this.cdr.detectChanges();
  }
}
