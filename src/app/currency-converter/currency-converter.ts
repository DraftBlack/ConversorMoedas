// src/app/currency-converter/currency-converter.component.ts

import { Component, OnInit, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Currency } from '../services/currency';

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './currency-converter.html',
  styleUrls: ['./currency-converter.css']
})
export class CurrencyConverter implements OnInit {
  private currencyService = inject(Currency);
  // Injeta ElementRef para podermos detectar cliques fora do componente
  private elementRef = inject(ElementRef);

  amountFrom = 1;
  amountTo: number | null = null;
  currencyFrom = 'USD';
  currencyTo = 'BRL';
  currencies: [string, string][] = [];

  searchTermFrom = 'USD - Dólar Americano'; // NOVO: Inicia com o valor padrão
  searchTermTo = 'BRL - Real Brasileiro';   // NOVO: Inicia com o valor padrão
  filteredCurrenciesFrom: [string, string][] = [];
  filteredCurrenciesTo: [string, string][] = [];

  exchangeRate = '';
  lastUpdate = '';
  isLoading = false;
  errorMessage: string | null = null;

  // NOVO: Propriedades para controlar o estado dos dropdowns
  isFromDropdownOpen = false;
  isToDropdownOpen = false;

  // NOVO: Detecta cliques na página inteira
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Se o clique foi fora do nosso componente, fecha os dropdowns
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isFromDropdownOpen = false;
      this.isToDropdownOpen = false;
    }
  }

  ngOnInit(): void {
    this.loadCurrencies();
  }

  loadCurrencies(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.currencyService.getSupportedCurrencies().subscribe({
      next: (data) => {
        this.currencies = data.supported_codes;
        this.filteredCurrenciesFrom = [...this.currencies];
        this.filteredCurrenciesTo = [...this.currencies];
        // Atualiza os searchTerms iniciais com base nos códigos padrão
        this.updateSearchTermFrom();
        this.updateSearchTermTo();
        this.getRate();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar a lista de moedas.';
        this.isLoading = false;
      }
    });
  }

  // MÉTODOS NOVOS E ATUALIZADOS ABAIXO

  toggleFromDropdown(event: MouseEvent): void {
    event.stopPropagation(); // Impede que o clique se propague para o document
    this.isFromDropdownOpen = !this.isFromDropdownOpen;
    this.isToDropdownOpen = false; // Fecha o outro dropdown
    this.filteredCurrenciesFrom = [...this.currencies]; // Reseta o filtro ao abrir
  }

  toggleToDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isToDropdownOpen = !this.isToDropdownOpen;
    this.isFromDropdownOpen = false;
    this.filteredCurrenciesTo = [...this.currencies];
  }

  selectCurrencyFrom(currencyCode: string): void {
    this.currencyFrom = currencyCode;
    this.updateSearchTermFrom();
    this.isFromDropdownOpen = false;
    this.getRate();
  }

  selectCurrencyTo(currencyCode: string): void {
    this.currencyTo = currencyCode;
    this.updateSearchTermTo();
    this.isToDropdownOpen = false;
    this.getRate();
  }

  // Funções auxiliares para atualizar o texto do campo de busca/display
  private updateSearchTermFrom(): void {
    const found = this.currencies.find(c => c[0] === this.currencyFrom);
    if (found) {
      this.searchTermFrom = `${found[0]} - ${found[1]}`;
    }
  }

  private updateSearchTermTo(): void {
    const found = this.currencies.find(c => c[0] === this.currencyTo);
    if (found) {
      this.searchTermTo = `${found[0]} - ${found[1]}`;
    }
  }

  filterCurrenciesFrom(event: Event): void {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCurrenciesFrom = this.currencies.filter(
      (currency) =>
        currency[0].toLowerCase().includes(term) ||
        currency[1].toLowerCase().includes(term)
    );
  }

  filterCurrenciesTo(event: Event): void {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCurrenciesTo = this.currencies.filter(
      (currency) =>
        currency[0].toLowerCase().includes(term) ||
        currency[1].toLowerCase().includes(term)
    );
  }

  getRate(): void {
    // (O conteúdo deste método e dos outros abaixo permanece o mesmo)
    // ... getRate, convert, swapCurrencies, clearValues ...
    this.isLoading = true;
    this.errorMessage = null;
    this.currencyService.getExchangeRate(this.currencyFrom, this.currencyTo).subscribe({
      next: (data) => {
        const rate = data.conversion_rate;
        this.amountTo = this.amountFrom * rate;
        this.exchangeRate = `1 ${this.currencyFrom} = ${rate.toFixed(4)} ${this.currencyTo}`;
        this.lastUpdate = data.time_last_update_utc;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível obter a cotação.';
        this.isLoading = false;
      }
    });
  }

  convert(): void {
    if (this.amountFrom > 0) {
      this.getRate();
    } else {
        this.amountTo = null;
    }
  }

  swapCurrencies(): void {
    const tempCode = this.currencyFrom;
    this.currencyFrom = this.currencyTo;
    this.currencyTo = tempCode;
    this.updateSearchTermFrom();
    this.updateSearchTermTo();
    this.getRate();
  }

  clearValues(): void {
    this.amountFrom = 1;
    this.amountTo = null;
    this.getRate();
  }
}