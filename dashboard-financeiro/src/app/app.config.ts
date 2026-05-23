import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { routes } from './app.routes';

// Registra os dados do locale pt-BR para que os pipes Angular
// (CurrencyPipe, DatePipe, DecimalPipe) funcionem corretamente.
// Sem isso o Angular lança NG0701: Missing locale data for "pt-BR".
registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // Define pt-BR como locale padrão da aplicação inteira
    { provide: LOCALE_ID, useValue: 'pt-BR' },

    // Define BRL como moeda padrão para o CurrencyPipe
    // (permite usar {{ valor | currency }} sem precisar passar 'BRL' explicitamente)
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ],
};
