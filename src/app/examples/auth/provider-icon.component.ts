import { Component, input } from '@angular/core';

export type AuthProvider = 'google' | 'apple' | 'microsoft' | 'facebook' | 'github' | 'linkedin';

export const PROVIDERS: Record<AuthProvider, { label: string; brand: string }> = {
  google: { label: 'Google', brand: '#ffffff' },
  apple: { label: 'Apple', brand: '#000000' },
  microsoft: { label: 'Microsoft', brand: '#2f2f2f' },
  facebook: { label: 'Facebook', brand: '#1877f2' },
  github: { label: 'GitHub', brand: '#24292f' },
  linkedin: { label: 'LinkedIn', brand: '#0a66c2' },
};

/** Logo d'un fournisseur d'identité (SVG inline, sans dépendance réseau). `mono` : logo en couleur courante. */
@Component({
  selector: 'ex-provider-icon',
  standalone: true,
  host: { class: 'provider-icon' },
  template: `
    @switch (provider()) {
      @case ('google') {
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h6a5.1 5.1 0 0 1-2.2 3.4v2.8h3.6c2.1-2 3.2-4.8 3.2-8.2Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.3-.4-2s.2-1.4.4-2V7.1H2A11 11 0 0 0 1 12c0 1.8.4 3.4 1.2 4.9l3.5-2.9Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2 7.1L5.7 10c.9-2.6 3.4-4.6 6.3-4.6Z"/></svg>
      }
      @case ('apple') {
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8a4.6 4.6 0 0 0-3.6-2c-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.2-.8A4.8 4.8 0 0 0 4 9.4c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8 2.1-1.2 2.9-2.4a10 10 0 0 0 1.3-2.7 4.2 4.2 0 0 1-2.4-3.9ZM14 5.2A4.3 4.3 0 0 0 15 2a4.4 4.4 0 0 0-2.9 1.5 4 4 0 0 0-1 3.1c1.1 0 2.2-.6 2.9-1.4Z"/></svg>
      }
      @case ('microsoft') {
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#F25022" d="M2 2h9.5v9.5H2z"/><path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z"/><path fill="#00A4EF" d="M2 12.5h9.5V22H2z"/><path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z"/></svg>
      }
      @case ('facebook') {
        <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.fill]="mono() ? 'currentColor' : '#1877F2'" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z"/></svg>
      }
      @case ('github') {
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z"/></svg>
      }
      @case ('linkedin') {
        <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.fill]="mono() ? 'currentColor' : '#0A66C2'" d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2ZM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM7.1 20.5H3.5V9h3.6v11.5ZM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0Z"/></svg>
      }
    }
  `,
  styles: [`:host { display: inline-flex; width: 20px; height: 20px; flex-shrink: 0; } svg { width: 100%; height: 100%; }`],
})
export class ProviderIconComponent {
  provider = input.required<AuthProvider>();
  mono = input(false);
}
