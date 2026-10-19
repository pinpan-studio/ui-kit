/** Extraits de code affichés dans la galerie Champs avancés (bouton « </> »). */
export const FIELDS_SNIPPETS = {
  otp: `
<app-otp-input
  [(ngModel)]="code"
  [length]="6"              <!-- nombre de cases -->
  [numeric]="true"          <!-- false : alphanumérique -->
  [invalid]="erreur"
  (completed)="verify($event)" />`,
  stepper: `
<div class="form-field">
  <label class="field-label">Véhicules à équiper</label>
  <app-number-stepper [(ngModel)]="vehicules" [min]="1" [max]="500" [step]="1" unit="véh." />
</div>

<app-number-stepper [(ngModel)]="qte" [min]="0" compact />   <!-- pilule -->`,
  currency: `
<app-currency-input [(ngModel)]="montant" currency="XOF" [inWords]="true" />
<app-currency-input [(ngModel)]="prix" currency="EUR" [currencies]="['XOF', 'EUR', 'USD']" />

import { amountInWords } from 'shared/components/fields';
amountInWords(1250000); // « Un million deux-cent-cinquante-mille »`,
  range: `
<app-range-slider
  [(ngModel)]="prix"              <!-- [min, max] -->
  [min]="0" [max]="500000" [step]="5000"
  [minGap]="10000"
  [histogram]="distribution"      <!-- effectifs par tranche égale -->
  unit="FCFA"
  [inputs]="true" />`,
  rating: `
<app-rating [(ngModel)]="note" [half]="true" showValue />
<app-rating [(ngModel)]="satisfaction" variant="emoji" size="large" />
<app-rating [value]="4.3" readonly half size="small" />`,
  color: `
<app-color-picker [(ngModel)]="couleur" />                       <!-- '#rrggbb' -->
<app-color-picker [(ngModel)]="couleur" [swatches]="brand" inline />`,
  rich: `
<app-rich-text-editor
  [(ngModel)]="html"
  placeholder="Compte rendu d'intervention…"
  [maxLength]="1000"
  minHeight="140px" />`,
  markdown: `
<app-markdown-editor [(ngModel)]="markdown" mode="split" />

import { markdownToHtml } from 'shared/utils/markdown.util';
<div class="kit-markdown" [innerHTML]="markdownToHtml(texte)"></div>`,
  signature: `
<div class="form-field">
  <label class="field-label">Signature du client *</label>
  <app-signature-pad formControlName="signature" height="180px" [invalid]="erreur" />
</div>
<!-- valeur : 'data:image/png;base64,…' ou null -->`,
  tree: `
zones: TreeOption[] = [
  { value: 'abj', label: 'Abidjan', children: [
    { value: 'cocody', label: 'Cocody' }, { value: 'plateau', label: 'Plateau' } ] },
];

<app-tree-select [options]="zones" [(ngModel)]="quartier" leafOnly />
<app-tree-select [options]="zones" [(ngModel)]="quartiers" multiple />   <!-- string[] (feuilles) -->`,
  transfer: `
items: TransferItem[] = [{ value: 'CI-4521-AB', label: 'CI-4521-AB', description: 'Toyota Hilux', icon: 'local_shipping' }];

<app-transfer-list [items]="items" [(ngModel)]="affectes"
  sourceTitle="Parc disponible" targetTitle="Groupe Nord" />`,
  tags: `
<app-tag-input [(ngModel)]="tags" [suggestions]="motsCles" [max]="6" />
<app-tag-input [(ngModel)]="emails" [validator]="isEmail" [transform]="lower" icon="mail" />
<app-tag-input [(ngModel)]="categories" [suggestions]="liste" [allowCustom]="false" />`,
  address: `
// Recherche fournie par l'hôte : liste locale, ou géocodeur côté serveur en production.
search = (q: string): Promise<PlaceOption[]> => this.geo.search(q);

<app-address-field [search]="search" [(ngModel)]="adresse" [map]="true" />
<!-- valeur : { id, label, detail, city, lat, lng, kind } -->`,
  password: `
<app-password-field [(ngModel)]="pwd" [generator]="true" showRulesEmpty />

import { DEFAULT_PASSWORD_RULES, passwordScore } from 'shared/components/fields';
rules = [...DEFAULT_PASSWORD_RULES, { label: '12 caractères', test: (v) => v.length >= 12 }];`,
  copy: `
<app-copy-field [value]="apiKey" secret regenerable icon="key" (regenerate)="rotate()" />
<app-copy-field value="https://suivi.example.com/p/7f3a9c" icon="link" />
<app-copy-field [value]="embedCode" multiline />`,
  form: `
form = new FormGroup({
  quartier: new FormControl<string | null>(null, Validators.required),
  balises: new FormControl(1, Validators.min(1)),
  montant: new FormControl<number | null>(null, Validators.min(10000)),
  code: new FormControl('', Validators.minLength(4)),
  signature: new FormControl<string | null>(null, Validators.required),
});

<form [formGroup]="form">
  <app-tree-select formControlName="quartier" [options]="zones" />
  <app-number-stepper formControlName="balises" [min]="0" />
  <app-currency-input formControlName="montant" />
  <app-otp-input formControlName="code" [length]="4" />
  <app-signature-pad formControlName="signature" />
</form>`,
};
