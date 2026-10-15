import { ChangeDetectorRef, Component, OnInit, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/module-federation';

@Component({
  selector: 'app-ui-loader',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `@if (remoteComponent) {
    <ng-container [ngComponentOutlet]="remoteComponent" />
  }`,
})
export class UiLoaderComponent implements OnInit {
  remoteComponent: Type<unknown> | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    const m = await loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://localhost:4202/remoteEntry.js',
      exposedModule: './UiComponent',
    });
    this.remoteComponent = m.UiComponent as Type<unknown>;
    this.cdr.detectChanges();
  }
}
