import { Component, HostListener, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { RatingComponent } from '../../shared/components/fields/rating.component';

type Q =
  | { id: string; kind: 'nps'; title: string; hint?: string }
  | { id: string; kind: 'rating'; title: string; hint?: string; items: string[] }
  | { id: string; kind: 'single' | 'multi'; title: string; hint?: string; options: { label: string; icon: string }[] }
  | { id: string; kind: 'text'; title: string; hint?: string; placeholder: string };

/** /examples/forms/survey — questionnaire plein écran, une question par écran, navigation au clavier. */
@Component({
  selector: 'app-survey-form',
  standalone: true,
  imports: [FormsModule, RouterLink, MaterialModule, RatingComponent],
  template: `
    <div class="survey">
      <header class="top">
        <a routerLink="/examples/app/modules" class="brand"><img src="assets/logo.png" alt="" />SC Storage</a>
        <div class="bar" role="progressbar" [attr.aria-valuenow]="progress()" aria-valuemin="0" aria-valuemax="100"><span [style.width.%]="progress()"></span></div>
        <span class="count">{{ min(i() + 1, questions.length) }} / {{ questions.length }}</span>
      </header>

      <main class="stage">
        @if (finished()) {
          <div class="q done">
            <span class="big-emoji" aria-hidden="true">🙏</span>
            <h1>Merci pour vos réponses !</h1>
            <p class="hint">Vos retours arrivent directement à l’équipe produit. Score NPS donné : <strong>{{ a['nps'] ?? '–' }}</strong>.</p>
            <div class="nav"><button mat-stroked-button (click)="restart()"><mat-icon>replay</mat-icon>Recommencer</button><a mat-flat-button color="primary" routerLink="/examples/app/dashboard">Retour à l’application</a></div>
          </div>
        } @else {
          @let q = current();
          <div class="q" [attr.data-k]="i()">
            <span class="qnum">Question {{ i() + 1 }}<mat-icon>arrow_forward</mat-icon></span>
            <h1>{{ q.title }}</h1>
            @if (q.hint) { <p class="hint">{{ q.hint }}</p> }

            @switch (q.kind) {
              @case ('nps') {
                <div class="nps" role="radiogroup" [attr.aria-label]="q.title">
                  @for (n of nps; track n) {
                    <button type="button" role="radio" [attr.aria-checked]="a['nps'] === n" [class.on]="a['nps'] === n" [class]="'n' + (n <= 6 ? ' det' : n <= 8 ? ' pas' : ' pro')" (click)="pick('nps', n)">{{ n }}</button>
                  }
                </div>
                <div class="nps-legend"><span>Pas du tout probable</span><span>Très probable</span></div>
              }
              @case ('rating') {
                <div class="ratings">
                  @for (it of $any(q).items; track it) {
                    <div class="r-row"><span>{{ it }}</span><app-rating [(ngModel)]="a[q.id + ':' + it]" size="large" /></div>
                  }
                </div>
              }
              @case ('single') {
                <div class="opts">
                  @for (o of $any(q).options; track o.label; let k = $index) {
                    <button type="button" class="opt" [class.on]="a[q.id] === o.label" (click)="pick(q.id, o.label)"><kbd>{{ letters[k] }}</kbd><mat-icon>{{ o.icon }}</mat-icon>{{ o.label }}</button>
                  }
                </div>
              }
              @case ('multi') {
                <div class="opts">
                  @for (o of $any(q).options; track o.label; let k = $index) {
                    <button type="button" class="opt" [class.on]="has(q.id, o.label)" [attr.aria-pressed]="has(q.id, o.label)" (click)="toggle(q.id, o.label)"><kbd>{{ letters[k] }}</kbd><mat-icon>{{ o.icon }}</mat-icon>{{ o.label }}@if (has(q.id, o.label)) { <mat-icon class="tick">check</mat-icon> }</button>
                  }
                </div>
              }
              @case ('text') {
                <div class="form-field"><div class="field-box textarea-box big"><textarea rows="4" [(ngModel)]="a[q.id]" [placeholder]="$any(q).placeholder"></textarea></div></div>
              }
            }

            <div class="nav">
              <button mat-flat-button color="primary" (click)="next()" [disabled]="!answered()">{{ i() === questions.length - 1 ? 'Envoyer' : 'Valider' }}<mat-icon iconPositionEnd>check</mat-icon></button>
              <span class="kbd-hint">ou appuyez sur <kbd>Entrée ↵</kbd></span>
              @if (q.kind === 'text' || q.kind === 'multi') { <button mat-button (click)="next(true)">Passer</button> }
            </div>
          </div>
        }
      </main>

      @if (!finished()) {
        <footer class="arrows">
          <button mat-icon-button (click)="prev()" [disabled]="i() === 0" aria-label="Question précédente"><mat-icon>keyboard_arrow_up</mat-icon></button>
          <button mat-icon-button (click)="next()" [disabled]="!answered()" aria-label="Question suivante"><mat-icon>keyboard_arrow_down</mat-icon></button>
        </footer>
      }
    </div>
  `,
  styles: [`
    @import 'app/examples/forms/form-page';
    :host { overflow: auto; background: var(--bg); }
    .survey { flex: 1 1 0%; min-width: 0; min-height: 100%; display: flex; flex-direction: column; font-family: var(--font-body); color: var(--text-primary); }
    .top { display: flex; align-items: center; gap: 16px; padding: 18px clamp(16px, 4vw, 40px);
      .brand { display: flex; align-items: center; gap: 8px; font: 700 15px var(--font-heading); color: var(--text-primary); text-decoration: none; img { width: 26px; } }
      .bar { flex: 1; height: 6px; border-radius: 3px; background: var(--hover-bg); overflow: hidden; span { display: block; height: 100%; background: var(--primary-color); border-radius: 3px; transition: width .4s cubic-bezier(.2, 0, 0, 1); } }
      .count { font: 600 13px var(--font-body); color: var(--text-muted); font-variant-numeric: tabular-nums; }
      @include sm { .brand { font-size: 0; gap: 0; } } }
    .stage { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px clamp(16px, 6vw, 64px) 80px; }
    .q { width: 100%; max-width: 680px; display: flex; flex-direction: column; gap: 18px; animation: rise .35s cubic-bezier(.2, 0, 0, 1);
      h1 { margin: 0; font-family: var(--font-heading) !important; font-size: clamp(24px, 4vw, 34px) !important; font-weight: 700 !important; letter-spacing: -0.025em !important; line-height: 1.2; text-wrap: balance; }
      .hint { margin: -8px 0 4px; font-size: 16px; color: var(--text-secondary); line-height: 1.5; }
      &.done { align-items: center; text-align: center; .nav { justify-content: center; } } }
    @keyframes rise { from { opacity: 0; transform: translateY(16px); } }
    .qnum { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; color: var(--primary-color); mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .big-emoji { font-size: 56px; line-height: 1; }
    .nps { display: grid; grid-template-columns: repeat(11, minmax(0, 1fr)); gap: 6px;
      button { aspect-ratio: 1; max-height: 56px; border-radius: 12px; border: 1.5px solid var(--border-color); background: var(--card-bg); font: 700 16px var(--font-heading); color: var(--text-primary); cursor: pointer; transition: transform .1s;
        &:hover { transform: translateY(-2px); border-color: var(--text-muted); }
        &.on.det { background: var(--error-color); border-color: var(--error-color); color: var(--mat-sys-on-error); }
        &.on.pas { background: var(--warning-color); border-color: var(--warning-color); color: #1f2937; }
        &.on.pro { background: var(--success-color); border-color: var(--success-color); color: #fff; } }
      @include sm { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
    .nps-legend { display: flex; justify-content: space-between; margin-top: -8px; font-size: 12.5px; color: var(--text-muted); }
    .ratings { display: flex; flex-direction: column; gap: 4px; }
    .r-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-radius: 14px; background: var(--card-bg); border: 1px solid var(--border-color); font-size: 15px; font-weight: 500; flex-wrap: wrap; }
    .opts { display: flex; flex-direction: column; gap: 8px; max-width: 460px; }
    .opt { display: flex; align-items: center; gap: 12px; height: 52px; padding: 0 16px 0 10px; border-radius: 14px; border: 1.5px solid var(--border-color); background: var(--card-bg);
      font: 500 15px var(--font-body); color: var(--text-primary); cursor: pointer; text-align: left;
      kbd { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); font: 700 12px var(--font-body); color: var(--text-secondary); }
      mat-icon { color: var(--text-secondary); } .tick { margin-left: auto; color: var(--primary-color); }
      &:hover { border-color: var(--primary-color); }
      &.on { border-color: var(--primary-color); background: var(--primary-color-light); kbd { background: var(--primary-color); border-color: var(--primary-color); color: #fff; } mat-icon { color: var(--primary-color); } } }
    .field-box.big textarea { font-size: 16px !important; }
    .nav { display: flex; align-items: center; gap: 14px; margin-top: 8px; flex-wrap: wrap; button { height: 46px; }
      .kbd-hint { font-size: 12.5px; color: var(--text-muted); kbd { font: 600 11px var(--font-body); padding: 2px 6px; border-radius: 5px; border: 1px solid var(--border-color); background: var(--card-bg); } }
      @include mobile { .kbd-hint { display: none; } } }
    .arrows { position: fixed; right: 20px; bottom: 20px; display: flex; gap: 2px; padding: 4px; border-radius: 14px; background: var(--card-bg); box-shadow: var(--elevation-2); }
  `],
})
export class SurveyFormComponent {
  readonly questions: Q[] = [
    { id: 'nps', kind: 'nps', title: 'Recommanderiez-vous SC Storage à un collègue ?', hint: 'De 0 (pas du tout) à 10 (sans hésiter).' },
    { id: 'use', kind: 'single', title: 'À quelle fréquence utilisez-vous l’application ?', options: [
      { label: 'Plusieurs fois par jour', icon: 'bolt' }, { label: 'Tous les jours', icon: 'today' }, { label: 'Chaque semaine', icon: 'date_range' }, { label: 'Rarement', icon: 'hourglass_empty' }] },
    { id: 'rate', kind: 'rating', title: 'Comment évaluez-vous ces aspects ?', hint: 'Une étoile = très insatisfait, cinq = très satisfait.', items: ['Rapidité', 'Facilité d’utilisation', 'Application mobile', 'Support client'] },
    { id: 'features', kind: 'multi', title: 'Quelles fonctionnalités aimeriez-vous voir arriver ?', hint: 'Plusieurs réponses possibles.', options: [
      { label: 'Mode hors ligne', icon: 'cloud_off' }, { label: 'Signature électronique', icon: 'draw' }, { label: 'Paiement Mobile Money intégré', icon: 'phone_iphone' }, { label: 'Rapports personnalisés', icon: 'insights' }, { label: 'API publique', icon: 'api' }] },
    { id: 'free', kind: 'text', title: 'Un dernier mot pour l’équipe ?', placeholder: 'Ce qui vous plaît, ce qui vous agace, vos idées…' },
  ];
  readonly nps = Array.from({ length: 11 }, (_, n) => n);
  readonly letters = 'ABCDEFGH';
  readonly min = Math.min;
  readonly i = signal(0);
  readonly finished = signal(false);
  readonly current = computed(() => this.questions[this.i()]);
  readonly progress = computed(() => ((this.i() + (this.finished() ? 1 : 0)) / this.questions.length) * 100);
  a: Record<string, any> = {};

  answered(): boolean {
    const q = this.current();
    if (q.kind === 'rating') return q.items.some((it) => this.a[q.id + ':' + it]);
    if (q.kind === 'multi') return (this.a[q.id] ?? []).length > 0;
    if (q.kind === 'text') return !!(this.a[q.id] ?? '').trim();
    return this.a[q.id] !== undefined;
  }

  pick(id: string, v: unknown): void {
    this.a[id] = v;
    // Choix unique : on avance automatiquement après un court instant.
    setTimeout(() => this.next(), 280);
  }
  has(id: string, v: string): boolean { return (this.a[id] ?? []).includes(v); }
  toggle(id: string, v: string): void {
    const l: string[] = this.a[id] ?? [];
    this.a[id] = l.includes(v) ? l.filter((x) => x !== v) : [...l, v];
  }

  next(skip = false): void {
    if (!skip && !this.answered()) return;
    if (this.i() < this.questions.length - 1) this.i.update((n) => n + 1);
    else this.finished.set(true);
  }
  prev(): void { this.i.update((n) => Math.max(0, n - 1)); }
  restart(): void { this.a = {}; this.i.set(0); this.finished.set(false); }

  /** Entrée valide, ↑ ↓ naviguent, A–H choisissent une option. */
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (this.finished() || (e.target as HTMLElement).closest('textarea, input')) return;
    const q = this.current();
    if (e.key === 'Enter') { e.preventDefault(); this.next(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); this.next(); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); this.prev(); return; }
    const k = this.letters.indexOf(e.key.toUpperCase());
    if ((q.kind === 'single' || q.kind === 'multi') && k >= 0 && k < q.options.length) {
      if (q.kind === 'single') this.pick(q.id, q.options[k].label); else this.toggle(q.id, q.options[k].label);
    }
    if (q.kind === 'nps' && /^\d$/.test(e.key)) this.pick('nps', +e.key);
  }
}
