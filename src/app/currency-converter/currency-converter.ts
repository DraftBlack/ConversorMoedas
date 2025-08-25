// src/app/currency-converter/currency-converter.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Currency } from '../services/currency'; // Importa nosso serviço

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importa módulos necessários para o template
  templateUrl: './currency-converter.html',
  styleUrls: ['./currency-converter.css']
})
export class CurrencyConverterComponent implements OnInit {
  // Injeta o serviço de moeda para usá-lo no componente
  private currency = inject(Currency);

  // Propriedades (variáveis) do nosso componente
  amountFrom = 1;
  amountTo: number | null = null;
  currencyFrom = 'USD'; // Moeda padrão de origem
  currencyTo = 'BRL';   // Moeda padrão de destino
  currencies: [string, string][] = []; // Armazenará a lista de moedas
  exchangeRate = ''; // Armazenará a taxa de câmbio para exibição
  lastUpdate = '';   // Armazenará a data da última atualização
  isLoading = false;   // Controle para o feedback de carregamento
  errorMessage: string | null = null; // Para mensagens de erro

  // ngOnInit é um "gancho de ciclo de vida" do Angular.
  // O código aqui dentro é executado uma vez quando o componente é inicializado.
  ngOnInit(): void {
    this.loadCurrencies();
  }

  // Carrega a lista de moedas da API
  loadCurrencies(): void {
    this.isLoading = true; // Ativa o "loading"
    this.errorMessage = null; // Limpa erros anteriores
    this.currency.getSupportedCurrencies().subscribe({
      next: (data) => {
        this.currencies = data.supported_codes;
        // Após carregar as moedas, busca a cotação inicial
        this.getRate();
        this.isLoading = false; // Desativa o "loading"
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar a lista de moedas. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  // Busca a cotação entre as moedas selecionadas
  getRate(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.currency.getExchangeRate(this.currencyFrom, this.currencyTo).subscribe({
      next: (data) => {
        const rate = data.conversion_rate;
        this.amountTo = this.amountFrom * rate; // Calcula a conversão inicial
        this.exchangeRate = `1 ${this.currencyFrom} = ${rate} ${this.currencyTo}`;
        this.lastUpdate = data.time_last_update_utc;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível obter a cotação. Verifique as moedas selecionadas.';
        this.isLoading = false;
      }
    });
  }

  // Converte o valor de 'origem' para 'destino'
  convert(): void {
    if (this.amountFrom > 0) {
      this.getRate(); // Sempre busca a taxa mais recente ao converter
    } else {
        this.amountTo = null;
    }
  }

  // Converte o valor de 'destino' para 'origem' (RF04.3)
  convertReverse(): void {
    if (this.amountTo && this.amountTo > 0) {
        this.isLoading = true;
        this.errorMessage = null;
        // Para a conversão reversa, precisamos da taxa inversa (ex: BRL para USD)
        this.currency.getExchangeRate(this.currencyTo, this.currencyFrom).subscribe({
            next: (data) => {
                const rate = data.conversion_rate;
                this.amountFrom = this.amountTo! * rate;
                this.exchangeRate = `1 ${this.currencyFrom} = ${1 / rate} ${this.currencyTo}`;
                this.lastUpdate = data.time_last_update_utc;
                this.isLoading = false;
            },
            error: () => {
                this.errorMessage = 'Não foi possível realizar a conversão reversa.';
                this.isLoading = false;
            }
        });
    } else {
        this.amountFrom = 1;
    }
  }

  // Inverte as moedas selecionadas (RF04.1)
  swapCurrencies(): void {
    // Usa uma variável temporária para a troca
    const temp = this.currencyFrom;
    this.currencyFrom = this.currencyTo;
    this.currencyTo = temp;

    // Após a troca, recalcula a conversão
    this.getRate();
  }

  // Limpa os valores dos campos (RF02.4)
  clearValues(): void {
    this.amountFrom = 1;
    this.amountTo = null;
    this.getRate(); // Recalcula com o valor padrão
  }
}