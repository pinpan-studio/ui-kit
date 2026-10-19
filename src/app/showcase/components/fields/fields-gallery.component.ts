import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../../shared/doc.components';
import {
  AddressFieldComponent, AddressValue, ColorPickerComponent, CopyFieldComponent, CurrencyInputComponent, MarkdownEditorComponent,
  NumberStepperComponent, OtpInputComponent, PasswordFieldComponent, RangeSliderComponent, RangeValue, RatingComponent,
  RichTextEditorComponent, SignaturePadComponent, TagInputComponent, TransferItem, TransferListComponent, TreeOption, TreeSelectComponent,
  amountInWords,
} from '../../../shared/components/fields';
import { DEMO_PLACES, searchPlaces } from '../../../data/static/address.data';
import { FIELDS_SNIPPETS } from './fields.snippets';

/** Galerie /components/fields — champs avancés (tous ControlValueAccessor). */
@Component({
  selector: 'app-fields-gallery',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MaterialModule, ...DOC_COMPONENTS,
    OtpInputComponent, NumberStepperComponent, CurrencyInputComponent, RangeSliderComponent, RatingComponent, ColorPickerComponent,
    RichTextEditorComponent, MarkdownEditorComponent, SignaturePadComponent, TreeSelectComponent, TransferListComponent, TagInputComponent,
    AddressFieldComponent, PasswordFieldComponent, CopyFieldComponent,
  ],
  templateUrl: './fields-gallery.component.html',
  styleUrls: ['./fields-gallery.component.scss'],
})
export class FieldsGalleryComponent {
  private snackBar = inject(MatSnackBar);
  readonly code = FIELDS_SNIPPETS;
  readonly words = amountInWords;

  readonly toc: TocItem[] = [
    { id: 'otp', label: 'OTP / PIN' }, { id: 'stepper', label: 'Nombre +/−' }, { id: 'currency', label: 'Montant' },
    { id: 'range', label: 'Intervalle' }, { id: 'rating', label: 'Notation' }, { id: 'color', label: 'Couleur' },
    { id: 'rich-text', label: 'Texte riche' }, { id: 'markdown', label: 'Markdown' }, { id: 'signature', label: 'Signature' },
    { id: 'tree-select', label: 'Tree-select' }, { id: 'transfer', label: 'Transfer list' }, { id: 'tags', label: 'Tags' },
    { id: 'address', label: 'Adresse' }, { id: 'password', label: 'Mot de passe' }, { id: 'copy', label: 'Copier' },
    { id: 'form', label: 'Formulaire complet' },
  ];

  // ── OTP ──────────────────────────────────────────────
  otp = '';
  otpState = signal<'idle' | 'checking' | 'ok' | 'bad'>('idle');
  pin = '';
  alnum = '';
  verify(code: string): void {
    this.otpState.set('checking');
    setTimeout(() => this.otpState.set(code === '246810' ? 'ok' : 'bad'), 700);
  }

  // ── Nombres / montants ───────────────────────────────
  vehicules = 12;
  quantite = 1;
  tauxRemise = 7.5;
  montant: number | null = 1_250_000;
  montantEur: number | null = 1990.5;
  montantVide: number | null = null;

  // ── Intervalle ───────────────────────────────────────
  prix: RangeValue = [50_000, 250_000];
  vitesse: RangeValue = [30, 90];
  readonly histo = [2, 4, 7, 12, 18, 26, 31, 28, 22, 19, 15, 12, 9, 7, 5, 4, 3, 2, 2, 1];
  readonly fcfa = (v: number) => `${v.toLocaleString('fr-FR')} F`;

  // ── Notation ─────────────────────────────────────────
  note = 4;
  noteDemi = 3.5;
  coeur = 3;
  satisfaction = 4;

  // ── Couleur ──────────────────────────────────────────
  couleur = '#4f6bed';
  couleurTag = '#10b981';
  readonly brand = ['#4f6bed', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#64748b', '#0f172a'];

  // ── Éditeurs ─────────────────────────────────────────
  rich = `<h3>Compte rendu d’intervention</h3><p>Installation de la balise <b>GT06</b> sur le véhicule <i>CI-4521-AB</i>.</p><ul><li>Alimentation raccordée au +APC</li><li>Coupe-moteur testé</li></ul><blockquote>Client satisfait, PV signé sur place.</blockquote>`;
  richEmpty = '';
  md = `## Procédure d’installation

1. Couper le contact et débrancher la batterie
2. Raccorder la balise au **+APC** et à la masse
3. Tester le *coupe-moteur* depuis la plateforme

- [x] Photos avant / après
- [ ] PV signé par le client

> Toujours vérifier la remontée GPS avant de quitter le site.

Documentation : [guide technique](https://example.com/guide) · code \`GT06-N\``;

  // ── Signature ────────────────────────────────────────
  signature: string | null = null;

  // ── Tree-select ──────────────────────────────────────
  readonly zones: TreeOption[] = [
    { value: 'abj', label: 'Abidjan', icon: 'location_city', children: [
      { value: 'abj-nord', label: 'Abidjan Nord', children: [
        { value: 'abobo', label: 'Abobo' }, { value: 'adjame', label: 'Adjamé' }, { value: 'yopougon', label: 'Yopougon' }, { value: 'attecoube', label: 'Attécoubé' }] },
      { value: 'abj-sud', label: 'Abidjan Sud', children: [
        { value: 'treichville', label: 'Treichville' }, { value: 'marcory', label: 'Marcory' }, { value: 'koumassi', label: 'Koumassi' }, { value: 'port-bouet', label: 'Port-Bouët' }] },
      { value: 'cocody', label: 'Cocody' }, { value: 'plateau', label: 'Plateau' }] },
    { value: 'centre', label: 'Centre', icon: 'landscape', children: [
      { value: 'yakro', label: 'Yamoussoukro' }, { value: 'bouake', label: 'Bouaké' }, { value: 'dimbokro', label: 'Dimbokro', disabled: true }] },
    { value: 'ouest', label: 'Ouest', icon: 'forest', children: [{ value: 'daloa', label: 'Daloa' }, { value: 'man', label: 'Man' }, { value: 'sanpedro', label: 'San-Pédro' }] },
    { value: 'nord', label: 'Nord', icon: 'wb_sunny', children: [{ value: 'korhogo', label: 'Korhogo' }, { value: 'odienne', label: 'Odienné' }] },
  ];
  zoneSimple: string | null = 'marcory';
  zonesMulti: string[] = ['abobo', 'adjame', 'bouake'];

  // ── Transfer ─────────────────────────────────────────
  readonly vehiculesListe: TransferItem[] = [
    ['CI-4521-AB', 'Toyota Hilux', 'local_shipping'], ['CI-2210-CD', 'Renault Kangoo', 'airport_shuttle'], ['CI-3307-EF', 'Suzuki Swift', 'directions_car'],
    ['CI-0418-GH', 'Yamaha Crux', 'two_wheeler'], ['CI-7781-JK', 'Mercedes Actros', 'local_shipping'], ['CI-1150-LM', 'Toyota Coaster', 'directions_bus'],
    ['CI-9902-NP', 'Isuzu D-Max', 'local_shipping'], ['CI-6630-QR', 'Peugeot Partner', 'airport_shuttle'], ['CI-5512-ST', 'Hyundai H100', 'airport_shuttle'],
    ['CI-8843-UV', 'Nissan Navara', 'local_shipping'],
  ].map(([value, d, icon], i) => ({ value, label: value, description: d, icon, disabled: i === 7 }));
  affectes = ['CI-2210-CD', 'CI-1150-LM'];
  readonly permissions: TransferItem[] = [
    'Voir les véhicules', 'Modifier les véhicules', 'Voir les trajets', 'Exporter les rapports', 'Gérer les alertes', 'Couper le moteur à distance',
    'Gérer les utilisateurs', 'Facturation', 'Paramètres du compte',
  ].map((label, i) => ({ value: 'p' + i, label, icon: i === 5 ? 'warning' : 'key' }));
  perms = ['p0', 'p2'];

  // ── Tags ─────────────────────────────────────────────
  readonly motsCles = ['Urgent', 'Maintenance', 'Installation', 'Désinstallation', 'Garantie', 'Client VIP', 'Flotte', 'Balise', 'Carburant', 'Batterie', 'Réclamation'];
  tags = ['Installation', 'Flotte'];
  emails = ['aminata.diallo@example.com', 'koffi@'];
  readonly isEmail = (t: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
  readonly lower = (t: string) => t.toLowerCase();
  get hasBadEmail(): boolean { return this.emails.some((e) => !this.isEmail(e)); }
  fixedTags = ['Garantie'];

  // ── Adresse ──────────────────────────────────────────
  readonly searchPlaces = searchPlaces;
  adresse: AddressValue | null = null;
  adresseMap: AddressValue | null = DEMO_PLACES[0];

  // ── Mot de passe / copie ─────────────────────────────
  pwd = '';
  pwd2 = 'Abidjan2026';
  apiKey = 'sk_demo_51HqLyjA7cE2kd8Rw0qxPvT3mN9bZfY4u';
  regen(): void {
    const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    this.apiKey = 'sk_demo_' + Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => c[b % c.length]).join('');
    this.snackBar.open('Nouvelle clé générée (démo statique)', 'Fermer', { duration: 2000 });
  }
  readonly embed = `<iframe src="https://suivi.example.com/partage/7f3a9c" width="600" height="400" frameborder="0"></iframe>`;

  // ── Formulaire complet ───────────────────────────────
  submitted = signal(false);
  form = new FormGroup({
    quartier: new FormControl<string | null>(null, Validators.required),
    adresse: new FormControl<AddressValue | null>(null, Validators.required),
    balises: new FormControl(1, [Validators.required, Validators.min(1)]),
    montant: new FormControl<number | null>(null, [Validators.required, Validators.min(10_000)]),
    etiquettes: new FormControl<string[]>([]),
    note: new FormControl(0, Validators.min(1)),
    code: new FormControl('', [Validators.required, Validators.minLength(4)]),
    signature: new FormControl<string | null>(null, Validators.required),
  });
  err(name: string): boolean { const c = this.form.get(name); return !!c && c.invalid && (c.touched || this.submitted()); }
  submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.valid) this.snackBar.open('PV d’installation valide — aucune donnée envoyée (démo statique)', 'Fermer', { duration: 3000, panelClass: 'snackbar-success' });
  }
  reset(): void { this.form.reset({ balises: 1, etiquettes: [], note: 0, code: '' }); this.submitted.set(false); }
  get formJson(): string {
    const v = { ...this.form.value, signature: this.form.value.signature ? 'data:image/png;base64,…' : null };
    return JSON.stringify(v, null, 2);
  }
}
