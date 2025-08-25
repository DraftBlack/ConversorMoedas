// src/app/app.config.ts

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http'; // Importe isso
import { FormsModule } from '@angular/forms'; // Importe isso

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // Adicione esta linha
    importProvidersFrom(FormsModule) // Adicione esta linha para usar o ngModel
  ]
};