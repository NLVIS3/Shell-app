import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';

interface UiRemoteModule {
  mountUi: (container: HTMLElement) => () => void;
}

@Component({
  selector: 'app-ui-loader',
  standalone: true,
  template: `<div #reactRoot></div>
    @if (errorMessage) {
      <p role="alert">{{ errorMessage }}</p>
    }`,
})
export class UiLoaderComponent implements OnInit, OnDestroy {
  @ViewChild('reactRoot', { static: true })
  private reactRoot!: ElementRef<HTMLDivElement>;

  errorMessage: string | null = null;
  private destroyReactRoot: (() => void) | null = null;
  private destroyed = false;

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    try {
      const remote = (await loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4202/remoteEntry.js',
        exposedModule: './UiComponent',
      })) as UiRemoteModule;

      if (this.destroyed) {
        return;
      }
      if (typeof remote.mountUi !== 'function') {
        throw new Error('The UI remote does not export mountUi().');
      }

      this.destroyReactRoot = remote.mountUi(this.reactRoot.nativeElement);
    } catch (error) {
      console.error('Failed to load the React UI remote.', error);
      if (this.destroyed) {
        return;
      }
      this.errorMessage = 'The UI could not be loaded. Please try again later.';
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.destroyReactRoot?.();
  }
}
