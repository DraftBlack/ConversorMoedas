// src/app/services/currency.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importa o HttpClient para fazer requisições HTTP
import { Observable } from 'rxjs'; // Importa o Observable para lidar com programação assíncrona

// Interface para tipar a resposta da API de cotações
export interface ExchangeRateResponse {
  result: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
  time_last_update_utc: string;
}

// Interface para tipar a resposta da API de moedas suportadas
export interface SupportedCodesResponse {
  result: string;
  supported_codes: [string, string][];
}

@Injectable({
  providedIn: 'root' // Torna o serviço disponível em toda a aplicação
})
export class Currency {
  // Injeta o HttpClient para que possamos usá-lo na classe
  private http = inject(HttpClient);

  // ATENÇÃO: Substitua 'SUA_CHAVE_API' pela chave que você obteve no site ExchangeRate-API
  private apiKey = '428deb9be3c9501fd4d123cb';
  private baseUrl = `https://v6.exchangerate-api.com/v6/${this.apiKey}`;

  constructor() { }

  /**
   * Busca a lista de moedas suportadas pela API.
   * @returns Um Observable contendo a resposta da API.
   */
  getSupportedCurrencies(): Observable<SupportedCodesResponse> {
    return this.http.get<SupportedCodesResponse>(`${this.baseUrl}/codes`);
  }

  /**
   * Busca a taxa de conversão entre duas moedas.
   * @param baseCurrency - O código da moeda de origem (ex: 'USD').
   * @param targetCurrency - O código da moeda de destino (ex: 'BRL').
   * @returns Um Observable contendo a resposta da API com a taxa.
   */
  getExchangeRate(baseCurrency: string, targetCurrency: string): Observable<ExchangeRateResponse> {
    return this.http.get<ExchangeRateResponse>(`${this.baseUrl}/pair/${baseCurrency}/${targetCurrency}`);
  }
}