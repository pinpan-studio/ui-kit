import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ResultComponent } from '../../shared/components/feedback';
import { MaterialModule } from '../../shared/material.module';
import { ColorPickerComponent } from '../../shared/components/fields/color-picker.component';
import { TagInputComponent } from '../../shared/components/fields/tag-input.component';
import { EX_MODULES } from '../../data/static/examples.data';

/** /examples/forms/onboarding — assistant plein écran : étapes verticales à gauche, une intention par écran à droite. */
@Component({
  selector: 'app-onboarding-form',
  standalone: true,
  imports: [ResultComponent, FormsModule, RouterLink, MaterialModule, ColorPickerComponent, TagInputComponent],
  templateUrl: './onboarding-form.component.html',
  styleUrls: ['./onboarding-form.component.scss'],
})
export class OnboardingFormComponent {
  readonly steps = [
    { label: 'Votre profil', hint: 'Nom, rôle, photo', icon: 'person' },
    { label: 'Votre organisation', hint: 'Secteur et taille', icon: 'business' },
    { label: 'Vos modules', hint: 'Ce que vous allez utiliser', icon: 'apps' },
    { label: 'Votre équipe', hint: 'Invitez vos collègues', icon: 'group_add' },
  ];
  readonly step = signal(0);
  readonly done = signal(false);
  readonly progress = computed(() => ((this.step() + (this.done() ? 1 : 0)) / this.steps.length) * 100);

  readonly roles = ['Direction', 'Opérations', 'Finance', 'Commercial', 'Technique', 'Autre'];
  readonly sectors = [
    { id: 'transport', label: 'Transport & logistique', icon: 'local_shipping' }, { id: 'agro', label: 'Agro-industrie', icon: 'agriculture' },
    { id: 'retail', label: 'Commerce & distribution', icon: 'storefront' }, { id: 'services', label: 'Services', icon: 'handshake' },
    { id: 'health', label: 'Santé', icon: 'local_hospital' }, { id: 'other', label: 'Autre', icon: 'more_horiz' },
  ];
  readonly sizes = ['1 – 10', '11 – 50', '51 – 200', '201 – 1 000', '1 000 +'];
  readonly modules = EX_MODULES.slice(0, 8);
  readonly suggestions = ['aya.kone@sotra.ci', 'marc.yao@exemple.ci', 'grace@digitalbaobab.ci'];
  readonly emailValidator = (t: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);

  m = { first: 'Jean', last: 'Kouassi', role: 'Direction', color: '#0ea5e9', company: '', sector: 'transport', size: '11 – 50',
    modules: new Set<string>(['crm', 'billing']), invites: [] as string[], inviteRole: 'Membre' };
  readonly error = signal('');

  toggleModule(id: string): void {
    const s = new Set(this.m.modules);
    if (s.has(id)) s.delete(id); else s.add(id);
    this.m.modules = s;
  }

  next(): void {
    const checks = [
      () => (!this.m.first || !this.m.last ? 'Indiquez votre prénom et votre nom.' : ''),
      () => (!this.m.company ? 'Indiquez le nom de votre organisation.' : ''),
      () => (!this.m.modules.size ? 'Choisissez au moins un module.' : ''),
      () => '',
    ];
    const err = checks[this.step()]();
    this.error.set(err);
    if (err) return;
    if (this.step() < this.steps.length - 1) this.step.update((s) => s + 1);
    else this.done.set(true);
  }

  back(): void { this.error.set(''); this.step.update((s) => Math.max(0, s - 1)); }
  goTo(i: number): void { if (i < this.step()) { this.error.set(''); this.step.set(i); } }
  restart(): void { this.done.set(false); this.step.set(0); }
  initials(): string { return ((this.m.first[0] ?? '') + (this.m.last[0] ?? '')).toUpperCase() || '?'; }
}
