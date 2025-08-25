// src/app/app.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
// 1. IMPORTAMOS O NOSSO COMPONENTE AQUI
import { CurrencyConverterComponent } from './currency-converter/currency-converter';

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. ADICIONAMOS ELE AO ARRAY DE IMPORTS
  imports: [CommonModule, CurrencyConverterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'currency-converter';
}