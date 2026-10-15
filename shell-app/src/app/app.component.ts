import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MainLoaderComponent } from './loaders/main-loader.component';
import { UiLoaderComponent } from './loaders/ui-loader.component';
import { BackendLoaderComponent } from './loaders/backend-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    MainLoaderComponent,
    UiLoaderComponent,
    BackendLoaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'shell-app';

  constructor(public router: Router) {}
}
