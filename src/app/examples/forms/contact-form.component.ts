import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResultComponent, UploadQueueComponent } from '../../shared/components/feedback';
import { MaterialModule } from '../../shared/material.module';
import { ExAppShellComponent } from '../app/ex-app-shell.component';

/** /examples/forms/contact — coordonnées + FAQ à gauche, formulaire validé à la soumission à droite. */
@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ResultComponent, UploadQueueComponent, FormsModule, MaterialModule, ExAppShellComponent],
  template: `
    <ex-app-shell nav="topnav" title="Contact">
      <div class="form-head">
        <span class="text-overline">Support & ventes</span>
        <h1>Parlons de votre projet</h1>
        <p>Une question, une démo, un devis ? Notre équipe répond en moins de 24 h ouvrées.</p>
      </div>

      <div class="layout">
        <aside class="info">
          <section class="card channels">
            @for (c of channels; track c.label) {
              <div class="ch"><span class="ic"><mat-icon>{{ c.icon }}</mat-icon></span><span><small>{{ c.label }}</small><strong>{{ c.value }}</strong><em>{{ c.hint }}</em></span></div>
            }
          </section>
          <section class="card faq">
            <h2>Questions fréquentes</h2>
            <mat-accordion displayMode="flat">
              @for (f of faq; track f.q) {
                <mat-expansion-panel><mat-expansion-panel-header><mat-panel-title>{{ f.q }}</mat-panel-title></mat-expansion-panel-header><p>{{ f.a }}</p></mat-expansion-panel>
              }
            </mat-accordion>
          </section>
        </aside>

        <section class="card section main">
          @if (sent()) {
            <app-result status="success" icon="mark_email_read" title="Message envoyé">
              <p class="result-text">Merci {{ m.name.split(' ')[0] }} ! Un accusé de réception a été envoyé à <strong>{{ m.email }}</strong>. Référence : <code>CT-2026-0418</code>.</p>
              <div actions><button mat-stroked-button (click)="reset()">Envoyer un autre message</button></div>
            </app-result>
          } @else {
            <form (ngSubmit)="submit()" novalidate class="fields">
              <div class="form-field">
                <label class="field-label">Objet de votre demande</label>
                <div class="chips-choice" role="radiogroup">
                  @for (s of subjects; track s) { <button type="button" role="radio" [attr.aria-checked]="m.subject === s" [class.on]="m.subject === s" (click)="m.subject = s">{{ s }}</button> }
                </div>
              </div>
              <div class="row-2">
                <div class="form-field" [class.invalid]="tried() && !m.name">
                  <label class="field-label" for="c-name">Nom complet<span class="req">*</span></label>
                  <div class="field-box"><mat-icon>person</mat-icon><input id="c-name" name="name" [(ngModel)]="m.name" autocomplete="name" placeholder="Jean Kouassi" /></div>
                  @if (tried() && !m.name) { <span class="err"><mat-icon>error</mat-icon>Indiquez votre nom.</span> }
                </div>
                <div class="form-field" [class.invalid]="tried() && !emailOk()">
                  <label class="field-label" for="c-mail">E-mail professionnel<span class="req">*</span></label>
                  <div class="field-box"><mat-icon>mail</mat-icon><input id="c-mail" name="email" type="email" [(ngModel)]="m.email" autocomplete="email" placeholder="nom@entreprise.ci" /></div>
                  @if (tried() && !emailOk()) { <span class="err"><mat-icon>error</mat-icon>Adresse e-mail invalide.</span> }
                </div>
              </div>
              <div class="row-2">
                <div class="form-field">
                  <label class="field-label" for="c-co">Entreprise</label>
                  <div class="field-box"><mat-icon>business</mat-icon><input id="c-co" name="company" [(ngModel)]="m.company" autocomplete="organization" /></div>
                </div>
                <div class="form-field">
                  <label class="field-label" for="c-tel">Téléphone</label>
                  <div class="field-box phone">
                    <mat-select name="cc" [(ngModel)]="m.cc" panelClass="m3-dropdown-menu" aria-label="Indicatif">
                      @for (c of codes; track c.code) { <mat-option [value]="c.code">{{ c.flag }} {{ c.code }}</mat-option> }
                    </mat-select>
                    <input id="c-tel" name="tel" type="tel" inputmode="tel" [(ngModel)]="m.phone" placeholder="07 07 12 34 56" autocomplete="tel-national" />
                  </div>
                </div>
              </div>
              <div class="form-field" [class.invalid]="tried() && m.message.length < 20">
                <div class="label-row"><label class="field-label" for="c-msg">Message<span class="req">*</span></label><span class="help" [class.warn]="m.message.length > 900">{{ m.message.length }} / 1000</span></div>
                <div class="field-box textarea-box"><textarea id="c-msg" name="message" rows="6" maxlength="1000" [(ngModel)]="m.message" placeholder="Décrivez votre besoin : contexte, volumes, délais…"></textarea></div>
                @if (tried() && m.message.length < 20) { <span class="err"><mat-icon>error</mat-icon>Au moins 20 caractères ({{ 20 - m.message.length }} restants).</span> }
              </div>
              <div class="form-field">
                <label class="field-label">Pièces jointes <span class="help">(facultatif)</span></label>
                <app-upload-queue accept=".pdf,image/*,.xlsx,.csv" [maxSize]="10 * 1024 * 1024" [maxFiles]="3" hint="PDF, image ou tableur · 10 Mo max. · 3 fichiers" />
              </div>
              <mat-checkbox name="consent" [(ngModel)]="m.consent" color="primary">J’accepte que mes données soient utilisées pour traiter ma demande.<span class="req">*</span></mat-checkbox>
              @if (tried() && !m.consent) { <span class="err"><mat-icon>error</mat-icon>Votre accord est nécessaire.</span> }
              <div class="actions-bar">
                <span class="help"><mat-icon class="lock">lock</mat-icon>Vos données restent en Côte d’Ivoire.</span>
                <span class="spacer"></span>
                <button mat-flat-button color="primary" type="submit" [disabled]="busy()">@if (busy()) { <mat-spinner diameter="18" /> } @else { <ng-container>Envoyer le message</ng-container> }</button>
              </div>
            </form>
          }
        </section>
      </div>
    </ex-app-shell>
  `,
  styles: [`
    @import 'app/examples/forms/form-page';
    .layout { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 20px; align-items: start;
      @include lg { grid-template-columns: minmax(0, 1fr); .info { order: 2; } } }
    .info { display: flex; flex-direction: column; gap: 16px; }
    .channels { padding: 8px 18px; .ch { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--border-color); &:last-child { border-bottom: 0; } }
      .ic { width: 40px; height: 40px; flex: 0 0 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: var(--primary-color-light); color: var(--primary-color); }
      span:last-child { display: flex; flex-direction: column; } small { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted); }
      strong { font-size: 15px; } em { font-style: normal; font-size: 12.5px; color: var(--text-muted); } }
    .faq { padding: 18px 10px 10px; h2 { margin: 0 8px 8px; font-family: var(--font-heading) !important; font-size: 17px !important; font-weight: 700 !important; }
      p { margin: 0; font-size: 13.5px; line-height: 1.55; color: var(--text-secondary); }
      mat-expansion-panel { background: transparent; box-shadow: none !important; }
      mat-panel-title { font: 500 var(--fs-body) / 1.4 var(--font-body); color: var(--text-primary); } }
    .fields { display: flex; flex-direction: column; gap: 18px; }
    .label-row { display: flex; justify-content: space-between; align-items: baseline; .warn { color: var(--warning-on-tint); font-weight: 600; } }
    .phone { padding-left: 4px; mat-select { width: 96px; flex: 0 0 96px; padding: 0 8px; border-right: 1px solid var(--border-color); } }
    .actions-bar .help { display: flex; align-items: center; gap: 4px; .lock { font-size: 14px; width: 14px; height: 14px; } }
    mat-spinner { margin: 0 auto; --mat-progress-spinner-active-indicator-color: currentColor; }
  `],
})
export class ContactFormComponent {
  readonly subjects = ['Demande de démo', 'Devis', 'Support technique', 'Partenariat', 'Autre'];
  readonly codes = [{ code: '+225', flag: '🇨🇮' }, { code: '+221', flag: '🇸🇳' }, { code: '+223', flag: '🇲🇱' }, { code: '+226', flag: '🇧🇫' }, { code: '+33', flag: '🇫🇷' }];
  readonly channels = [
    { icon: 'call', label: 'Téléphone', value: '+225 27 22 00 00 00', hint: 'Lun – ven, 8 h – 18 h' },
    { icon: 'mail', label: 'E-mail', value: 'contact@scstorage.ci', hint: 'Réponse sous 24 h ouvrées' },
    { icon: 'place', label: 'Bureaux', value: 'Plateau, Abidjan', hint: 'Immeuble Alpha 2000, 12ᵉ étage' },
  ];
  readonly faq = [
    { q: 'Proposez-vous un essai gratuit ?', a: 'Oui, 30 jours sans carte bancaire, avec toutes les fonctionnalités de l’offre Pro.' },
    { q: 'Mes données sont-elles hébergées localement ?', a: 'Les données sont hébergées à Abidjan et sauvegardées chaque nuit sur un second site.' },
    { q: 'Puis-je payer par Mobile Money ?', a: 'Orange Money, MTN MoMo et Wave sont acceptés, ainsi que la carte et le virement.' },
  ];
  m = { subject: 'Demande de démo', name: '', email: '', company: '', cc: '+225', phone: '', message: '', consent: false };
  readonly tried = signal(false);
  readonly busy = signal(false);
  readonly sent = signal(false);
  readonly emailOk = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.m.email);

  submit(): void {
    this.tried.set(true);
    if (!this.m.name || !this.emailOk() || this.m.message.length < 20 || !this.m.consent) return;
    this.busy.set(true);
    setTimeout(() => { this.busy.set(false); this.sent.set(true); }, 900);
  }

  reset(): void {
    this.m = { ...this.m, message: '', consent: false };
    this.tried.set(false);
    this.sent.set(false);
  }
}
