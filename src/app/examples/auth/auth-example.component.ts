import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { OtpInputComponent } from '../../shared/components/fields/otp-input.component';
import { PasswordFieldComponent } from '../../shared/components/fields/password-field.component';
import { CURRENT_USER } from '../../data/static/session.data';
import { AuthProvider, PROVIDERS, ProviderIconComponent } from './provider-icon.component';

/** Disposition de la page : où se trouve le formulaire et ce qui l'entoure. */
type AuthLayout = 'centered' | 'split-right' | 'split-left' | 'image' | 'minimal';
/** Contenu du formulaire. */
type AuthScreen = 'login' | 'register' | 'forgot' | 'otp' | 'lock' | 'social' | 'accounts';
/**
 * Présentation des connexions sociales : grille de boutons, pile pleine largeur,
 * rangée d'icônes rondes, ou boutons aux couleurs des marques. `top` : avant le formulaire e-mail.
 */
interface SsoConfig { style: 'grid' | 'stack' | 'icons' | 'brand'; providers: AuthProvider[]; top?: boolean; verb?: string; }

const VARIANTS: Record<string, { layout: AuthLayout; screen: AuthScreen; sso?: SsoConfig }> = {
  centered: { layout: 'centered', screen: 'login', sso: { style: 'icons', providers: ['google', 'apple', 'microsoft', 'facebook', 'github', 'linkedin'] } },
  'split-right': { layout: 'split-right', screen: 'login', sso: { style: 'grid', providers: ['google', 'microsoft'] } },
  'split-left': { layout: 'split-left', screen: 'login', sso: { style: 'stack', providers: ['google', 'apple', 'microsoft'], top: true, verb: 'Continuer avec' } },
  image: { layout: 'image', screen: 'login', sso: { style: 'brand', providers: ['google', 'apple'], verb: 'Continuer avec' } },
  minimal: { layout: 'minimal', screen: 'login', sso: { style: 'stack', providers: ['google', 'microsoft', 'github'], top: true, verb: 'Se connecter avec' } },
  register: { layout: 'split-right', screen: 'register', sso: { style: 'grid', providers: ['google', 'linkedin'], top: true } },
  social: { layout: 'centered', screen: 'social', sso: { style: 'brand', providers: ['google', 'apple', 'microsoft', 'facebook', 'github', 'linkedin'], verb: 'Continuer avec' } },
  accounts: { layout: 'minimal', screen: 'accounts' },
  forgot: { layout: 'centered', screen: 'forgot' },
  otp: { layout: 'centered', screen: 'otp' },
  lock: { layout: 'image', screen: 'lock' },
};

/**
 * /examples/auth/:variant — écrans d'authentification d'exemple (aucune authentification réelle).
 * Une même page combine une disposition (carte centrée, split, image, minimale) et un écran
 * (connexion, inscription, oubli, code, verrouillage).
 */
@Component({
  selector: 'app-auth-example',
  standalone: true,
  imports: [NgTemplateOutlet, FormsModule, RouterLink, MaterialModule, OtpInputComponent, PasswordFieldComponent, ProviderIconComponent],
  templateUrl: './auth-example.component.html',
  styleUrls: ['./auth-example.component.scss'],
})
export class AuthExampleComponent {
  variant = input<string>('centered');

  readonly config = computed(() => VARIANTS[this.variant()] ?? VARIANTS['centered']);
  readonly layout = computed(() => this.config().layout);
  readonly screen = computed(() => this.config().screen);
  readonly sso = computed(() => this.config().sso);
  readonly providers = PROVIDERS;
  /** Fournisseur en cours de connexion (spinner dans son bouton), puis fournisseur utilisé. */
  readonly ssoBusy = signal<AuthProvider | null>(null);
  readonly ssoUsed = signal<AuthProvider | null>(null);
  /** Comptes proposés par le sélecteur de compte (écran « accounts »). */
  readonly accounts = [
    { name: CURRENT_USER.fullname, mail: 'jean.kouassi@gmail.com', color: '#0ea5e9' },
    { name: 'Jean Kouassi', mail: 'j.kouassi@scstorage.ci', color: '#8b5cf6', work: true },
  ];
  readonly user = CURRENT_USER;
  readonly initials = CURRENT_USER.fullname.split(' ').map((n) => n[0]).join('');
  readonly year = new Date().getFullYear();

  // Connexion
  email = 'jean.kouassi@example.com';
  password = '';
  remember = true;
  readonly showPassword = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly done = signal(false);

  // Inscription
  readonly step = signal(0);
  readonly steps = ['Compte', 'Sécurité', 'Organisation'];
  reg = { firstName: '', lastName: '', email: '', password: '', company: '', size: '11-50', terms: false };

  // Code de vérification
  code = '';
  readonly otpState = signal<'idle' | 'error' | 'success'>('idle');
  readonly resendIn = signal(30);

  constructor() {
    const t = setInterval(() => this.resendIn.update((s) => Math.max(0, s - 1)), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(t));
  }

  /** Simule un appel : 900 ms de chargement puis succès (ou l'erreur fournie). */
  submit(check?: () => string): void {
    this.error.set('');
    const err = check?.() ?? '';
    if (err) { this.error.set(err); return; }
    this.busy.set(true);
    setTimeout(() => { this.busy.set(false); this.done.set(true); }, 900);
  }

  login(): void {
    this.submit(() => (!this.email.includes('@') ? 'Adresse e-mail invalide.' : this.password.length < 4 ? 'Mot de passe incorrect. Essayez « demo ».' : ''));
  }

  unlock(): void {
    this.submit(() => (this.password.length < 4 ? 'Mot de passe incorrect.' : ''));
  }

  forgot(): void {
    this.submit(() => (!this.email.includes('@') ? 'Saisissez l’adresse e-mail de votre compte.' : ''));
  }

  nextStep(): void {
    const r = this.reg;
    const errs = [
      () => (!r.firstName || !r.lastName ? 'Indiquez votre prénom et votre nom.' : !r.email.includes('@') ? 'Adresse e-mail invalide.' : ''),
      () => (r.password.length < 8 ? 'Le mot de passe doit contenir au moins 8 caractères.' : ''),
      () => (!r.company ? 'Indiquez le nom de votre organisation.' : !r.terms ? 'Acceptez les conditions pour continuer.' : ''),
    ];
    const err = errs[this.step()]();
    this.error.set(err);
    if (err) return;
    if (this.step() < this.steps.length - 1) this.step.update((s) => s + 1);
    else this.submit();
  }

  verify(value = this.code): void {
    if (value.length < 6) return;
    this.busy.set(true);
    setTimeout(() => {
      this.busy.set(false);
      const ok = value === '123456';
      this.otpState.set(ok ? 'success' : 'error');
      if (ok) setTimeout(() => this.done.set(true), 500);
    }, 700);
  }

  resend(): void {
    this.resendIn.set(30);
    this.otpState.set('idle');
    this.code = '';
  }

  /** Simule l'aller-retour OAuth du fournisseur. */
  social(p: AuthProvider): void {
    if (this.ssoBusy()) return;
    this.ssoBusy.set(p);
    setTimeout(() => { this.ssoBusy.set(null); this.ssoUsed.set(p); this.done.set(true); }, 1100);
  }

  pickAccount(mail: string): void {
    this.email = mail;
    this.social('google');
  }

  reset(): void {
    this.ssoUsed.set(null);
    this.done.set(false);
    this.error.set('');
    this.step.set(0);
    this.password = '';
    this.otpState.set('idle');
    this.code = '';
  }
}
