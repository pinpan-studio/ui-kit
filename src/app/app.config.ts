import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { APP_ROUTES } from './app.routes';

// Pipes date / number / currency en français (14 octobre 2026, 60 000).
registerLocaleData(localeFr);

/**
 * Configuration globale du UI Kit.
 * Aucun provider HTTP, aucun intercepteur, aucun socket : l'application est 100 % statique.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: { dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' }, timeInput: { hour: '2-digit', minute: '2-digit' } },
        display: {
          dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
          timeInput: { hour: '2-digit', minute: '2-digit' },
          timeOptionLabel: { hour: '2-digit', minute: '2-digit' },
          monthYearLabel: { month: 'short', year: 'numeric' },
          dateA11yLabel: { day: 'numeric', month: 'long', year: 'numeric' },
          monthYearA11yLabel: { month: 'long', year: 'numeric' },
        },
      },
    },
  ],
};
