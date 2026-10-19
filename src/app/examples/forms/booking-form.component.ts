import { Component, computed, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResultComponent } from '../../shared/components/feedback';
import { MaterialModule } from '../../shared/material.module';
import { NumberStepperComponent } from '../../shared/components/fields/number-stepper.component';
import { ExAppShellComponent } from '../app/ex-app-shell.component';

/** /examples/forms/booking — réservation : prestation, calendrier, créneaux, participants, récapitulatif. */
@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [ResultComponent, DatePipe, DecimalPipe, FormsModule, MaterialModule, NumberStepperComponent, ExAppShellComponent],
  template: `
    <ex-app-shell nav="topnav" title="Réservation">
      <div class="form-head">
        <span class="text-overline">Salle de formation · Plateau</span>
        <h1>Réserver une session</h1>
        <p>Choisissez une prestation, une date et un créneau. La confirmation est immédiate.</p>
      </div>

      @if (confirmed()) {
        <section class="card done">
          <app-result status="success" icon="event_available" title="Réservation confirmée">
            <p class="result-text">{{ service().label }} le <strong>{{ date() | date: 'EEEE d MMMM' }}</strong> à <strong>{{ slot() }}</strong> pour {{ people }} personne(s). Une invitation calendrier a été envoyée.</p>
            <div actions><button mat-stroked-button><mat-icon>calendar_add_on</mat-icon>Ajouter à l’agenda</button><button mat-flat-button color="primary" (click)="confirmed.set(false)">Nouvelle réservation</button></div>
          </app-result>
        </section>
      } @else {
        <div class="layout">
          <div class="main">
            <section class="card section">
              <h2><span class="num">1</span>Prestation</h2>
              <div class="choices">
                @for (s of services; track s.id) {
                  <button type="button" class="choice" [class.on]="serviceId() === s.id" (click)="serviceId.set(s.id)">
                    <span class="c-ic"><mat-icon>{{ s.icon }}</mat-icon></span>
                    <span class="c-txt"><strong>{{ s.label }}</strong><small>{{ s.duration }} · {{ s.price ? (s.price | number: '1.0-0') + ' F / pers.' : 'Gratuit' }}</small></span><span class="mark"></span>
                  </button>
                }
              </div>
            </section>

            <section class="card section">
              <h2><span class="num">2</span>Date et heure</h2>
              <div class="when">
                <mat-calendar class="cal" [selected]="date()" (selectedChange)="pickDate($event)" [minDate]="today" [dateFilter]="open" />
                <div class="slots">
                  <strong class="cap">{{ date() | date: 'EEEE d MMMM' }}</strong>
                  @for (p of periods; track p.label) {
                    <span class="period"><mat-icon>{{ p.icon }}</mat-icon>{{ p.label }}</span>
                    <div class="slot-grid">
                      @for (t of p.slots; track t) {
                        <button type="button" [class.on]="slot() === t" [disabled]="isFull(t)" (click)="slot.set(t)">{{ t }}@if (isFull(t)) { <small>Complet</small> }</button>
                      }
                    </div>
                  }
                </div>
              </div>
            </section>

            <section class="card section">
              <h2><span class="num">3</span>Participants</h2>
              <div class="row-2">
                <div class="form-field"><label class="field-label">Nombre de personnes</label><app-number-stepper [(ngModel)]="people" [min]="1" [max]="12" unit="pers." /><span class="help">12 places maximum par session.</span></div>
                <div class="form-field"><label class="field-label">Responsable</label><div class="field-box"><mat-icon>person</mat-icon><input [(ngModel)]="contact" autocomplete="name" /></div></div>
              </div>
              <div class="form-field"><label class="field-label">Besoins particuliers <span class="help">(facultatif)</span></label>
                <div class="chips-choice">@for (n of needs; track n) { <button type="button" [class.on]="picked.has(n)" (click)="toggleNeed(n)">{{ n }}</button> }</div></div>
            </section>
          </div>

          <aside class="card summary">
            <h2>Votre réservation</h2>
            <div class="sum-line"><mat-icon>{{ service().icon }}</mat-icon><span><strong>{{ service().label }}</strong><small>{{ service().duration }}</small></span></div>
            <div class="sum-line"><mat-icon>event</mat-icon><span><strong class="cap">{{ date() | date: 'EEEE d MMMM yyyy' }}</strong><small>{{ slot() ?? 'Choisissez un créneau' }}</small></span></div>
            <div class="sum-line"><mat-icon>group</mat-icon><span><strong>{{ people }} participant(s)</strong><small>{{ contact }}</small></span></div>
            <dl><dt>{{ service().price | number: '1.0-0' }} F × {{ people }}</dt><dd>{{ total() | number: '1.0-0' }} F</dd><dt class="tot">Total</dt><dd class="tot">{{ total() | number: '1.0-0' }} FCFA</dd></dl>
            <button mat-flat-button color="primary" class="go" [disabled]="!slot()" (click)="confirmed.set(true)">Confirmer la réservation</button>
            <p class="help center"><mat-icon>info</mat-icon>Annulation gratuite jusqu’à 24 h avant.</p>
          </aside>
        </div>
      }
    </ex-app-shell>
  `,
  styles: [`
    @import 'app/examples/forms/form-page';
    .layout { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 20px; align-items: start; @include lg { grid-template-columns: minmax(0, 1fr); } }
    .main { display: flex; flex-direction: column; gap: 16px; }
    .when { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 20px; @include mobile { grid-template-columns: minmax(0, 1fr); } }
    .cal { border-radius: 18px; border: 1px solid var(--border-color); }
    .slots { display: flex; flex-direction: column; gap: 10px; > strong { font-family: var(--font-heading); font-size: 16px; } }
    .period { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted); mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .slot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 8px;
      button { height: 42px; border-radius: 12px; border: 1.5px solid var(--border-color); background: var(--card-bg); font: 600 14px var(--font-body); color: var(--text-primary); cursor: pointer; font-variant-numeric: tabular-nums;
        display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.1;
        small { font-size: 10px; font-weight: 500; }
        &:hover:not(:disabled) { border-color: var(--primary-color); }
        &.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--mat-sys-on-primary, #fff); }
        &:disabled { opacity: .45; text-decoration: line-through; cursor: not-allowed; } } }
    .summary { position: sticky; top: 0; padding: 20px; display: flex; flex-direction: column; gap: 14px;
      h2 { margin: 0; font-family: var(--font-heading) !important; font-size: 18px !important; font-weight: 700 !important; }
      @include lg { position: static; } }
    .sum-line { display: flex; gap: 12px; align-items: flex-start; mat-icon { color: var(--primary-color); } span { display: flex; flex-direction: column; } strong { font-size: 14px; } small { font-size: 12.5px; color: var(--text-muted); } }
    dl { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin: 0; padding-top: 14px; border-top: 1px solid var(--border-color); font-size: 14px; font-variant-numeric: tabular-nums;
      dt { color: var(--text-secondary); } dd { margin: 0; font-weight: 600; text-align: right; }
      .tot { font-family: var(--font-heading); font-size: var(--fs-h4); font-weight: 700; font-variant-numeric: tabular-nums; color: var(--text-primary); } }
    .go { height: 48px; }
    // Majuscule initiale seule (« Mercredi 21 octobre ») : les mois restent en minuscules en français.
    .cap { display: inline-block; &::first-letter { text-transform: uppercase; } }
    .center { display: flex; align-items: center; justify-content: center; gap: 4px; margin: 0; mat-icon { font-size: 15px; width: 15px; height: 15px; } }
    .done { max-width: 640px; margin: 0 auto; .actions-bar { justify-content: center; } }
  `],
})
export class BookingFormComponent {
  readonly services = [
    { id: 'form', label: 'Formation utilisateurs', duration: '3 h', price: 25000, icon: 'school' },
    { id: 'demo', label: 'Démonstration produit', duration: '1 h', price: 0, icon: 'co_present' },
    { id: 'atelier', label: 'Atelier paramétrage', duration: '2 h', price: 40000, icon: 'build' },
  ];
  readonly periods = [
    { label: 'Matin', icon: 'wb_twilight', slots: ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00'] },
    { label: 'Après-midi', icon: 'wb_sunny', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
  ];
  readonly needs = ['Projecteur', 'Accès PMR', 'Pause café', 'Interprète', 'Ordinateurs fournis'];
  readonly today = new Date(2026, 9, 17);
  readonly serviceId = signal('form');
  readonly date = signal(new Date(2026, 9, 21));
  readonly slot = signal<string | null>(null);
  readonly confirmed = signal(false);
  people = 4;
  contact = 'Jean Kouassi';
  picked = new Set<string>(['Pause café']);

  readonly service = computed(() => this.services.find((s) => s.id === this.serviceId())!);
  total(): number { return this.service().price * this.people; }
  /** Fermé le week-end. */
  readonly open = (d: Date | null) => !!d && d.getDay() !== 0 && d.getDay() !== 6;
  /** Créneaux complets pseudo-aléatoires (stables pour une date donnée). */
  isFull(t: string): boolean { return (this.date().getDate() * 7 + parseInt(t, 10) + +t.slice(3)) % 5 === 0; }

  pickDate(d: Date | null): void { if (d) { this.date.set(d); this.slot.set(null); } }
  toggleNeed(n: string): void { const s = new Set(this.picked); if (s.has(n)) s.delete(n); else s.add(n); this.picked = s; }
}
