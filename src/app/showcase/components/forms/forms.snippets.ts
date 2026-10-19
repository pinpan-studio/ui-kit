/** Extraits de code affichés dans la galerie Formulaires (bouton « </> »). */
export const SNIPPETS = {
  fieldBox: `
<div class="form-field">
  <label class="field-label">Raison sociale</label>
  <div class="field-box">
    <mat-icon>business</mat-icon>
    <input [(ngModel)]="raison" placeholder="Ex : Transports Yao & Fils" />
  </div>
  <span class="field-hint">Nom légal tel qu'il figure au RCCM.</span>
</div>`,
  fieldError: `
<div class="form-field">
  <label class="field-label">Email *</label>
  <div class="field-box field-invalid">
    <mat-icon>alternate_email</mat-icon>
    <input [(ngModel)]="email" />
  </div>
  <span class="field-error">Adresse email invalide</span>
</div>`,
  matOutline: `
<mat-form-field appearance="outline">
  <mat-label>Nom complet</mat-label>
  <mat-icon matSuffix>person</mat-icon>
  <input matInput placeholder="Prénom(s) Nom" [(ngModel)]="nom">
  <mat-hint>Affiché sur les documents</mat-hint>
</mat-form-field>`,
  textarea: `
<div class="form-field">
  <label class="field-label">Description</label>
  <div class="field-box textarea-box">
    <textarea rows="3" placeholder="Décrivez la demande…"></textarea>
  </div>
</div>`,
  matSelect: `
<div class="form-field">
  <label class="field-label">Ville</label>
  <div class="field-box select-box">
    <mat-icon>location_on</mat-icon>
    <mat-select [(ngModel)]="ville" panelClass="m3-dropdown-menu">
      @for (o of villeOptions; track o.value) {
        <mat-option [value]="o.value">{{ o.label }}</mat-option>
      }
    </mat-select>
  </div>
</div>`,
  searchable: `
<app-searchable-select
  [options]="priorityOptions"      <!-- { value, label, icon?, color?, description? }[] -->
  [(ngModel)]="priorite"
  placeholder="Priorité…"
  icon="flag"
  [clearable]="true" />`,
  multi: `
<div class="field-box select-box">
  <mat-icon>checklist</mat-icon>
  <mat-select [(ngModel)]="villes" multiple panelClass="m3-dropdown-menu">
    @for (o of villeOptions; track o.value) {
      <mat-option [value]="o.value">{{ o.label }}</mat-option>
    }
  </mat-select>
</div>`,
  autocomplete: `
<app-entity-autocomplete
  placeholder="Rechercher un client…"
  icon="business"
  [searchFn]="clientSearch"        <!-- (term) => Observable<any[]> : filtrage local via of() -->
  [displayFn]="clientLabel"
  (itemSelected)="client = $event" />`,
  date: `
<div class="field-box">
  <mat-icon>event</mat-icon>
  <input [matDatepicker]="picker" [(ngModel)]="date" placeholder="JJ/MM/AAAA">
  <button mat-icon-button type="button" (click)="picker.open()"><mat-icon>calendar_month</mat-icon></button>
  <mat-datepicker #picker></mat-datepicker>
</div>`,
  range: `
<div class="field-box">
  <mat-icon>date_range</mat-icon>
  <mat-date-range-input [rangePicker]="rp">
    <input matStartDate [(ngModel)]="debut" placeholder="Début">
    <input matEndDate [(ngModel)]="fin" placeholder="Fin">
  </mat-date-range-input>
  <button mat-icon-button type="button" (click)="rp.open()"><mat-icon>calendar_month</mat-icon></button>
  <mat-date-range-picker #rp></mat-date-range-picker>
</div>`,
  time: `
<div class="field-box">
  <mat-icon>schedule</mat-icon>
  <input [matTimepicker]="tp" [(ngModel)]="heure" placeholder="HH:MM">
  <button mat-icon-button type="button" (click)="tp.open()"><mat-icon>expand_more</mat-icon></button>
  <mat-timepicker #tp interval="15min"/>
</div>`,
  checkbox: `
<mat-checkbox color="primary" [(ngModel)]="sms">SMS</mat-checkbox>
<mat-checkbox [checked]="all" [indeterminate]="some" (change)="setAll($event.checked)">Tous</mat-checkbox>`,
  radio: `
<mat-radio-group [(ngModel)]="periodicite" color="primary">
  <mat-radio-button value="MENSUEL">Mensuel</mat-radio-button>
  <mat-radio-button value="TRIMESTRIEL">Trimestriel</mat-radio-button>
</mat-radio-group>`,
  toggle: `<mat-slide-toggle color="primary" [(ngModel)]="actif">Client actif</mat-slide-toggle>`,
  mask: `
<!-- Jetons : 0 chiffre · A lettre (majuscule) · * lettre ou chiffre · autres caractères = littéraux -->
<div class="field-box">
  <mat-icon>call</mat-icon>
  <input appInputMask="+225 00 00 00 00 00" [(ngModel)]="telephone" placeholder="+225 07 00 00 00 00">
</div>
<!-- import { InputMaskDirective } from 'shared/directives/input-mask.directive' -->`,
  upload: `
<!-- mode champ -->
<app-file-upload placeholder="Joindre un document" accept="application/pdf" (onUpload)="doc = $event" />
<!-- mode photo -->
<app-file-upload mode="photo" placeholder="Photo" accept="image/*" (onUpload)="photo = $event" />`,
  search: `
<div class="toolbar-search-filters">
  <div class="m3-search-bar-unified">
    <div class="search-input-wrapper">
      <mat-icon class="search-icon">search</mat-icon>
      <input type="text" [(ngModel)]="search" placeholder="Rechercher…" />
      @if (search) {
        <button class="clear-btn" (click)="search = ''"><mat-icon>close</mat-icon></button>
      }
    </div>
    <div class="divider"></div>
    <app-filter-dropdown [options]="statutOptions" [(value)]="statut" labelPrefix="Statut" />
  </div>
</div>`,
  validation: `
form = new FormGroup({
  raison_sociale: new FormControl('', [Validators.required, Validators.minLength(3)]),
  email: new FormControl('', [Validators.required, Validators.email]),
});
showError(name: string) {
  const c = this.form.get(name);
  return !!c && c.invalid && (c.touched || this.submitted());
}

<!-- template -->
<div class="field-box" [class.field-invalid]="showError('email')">…</div>
@if (showError('email')) { <span class="field-error">Adresse email invalide</span> }`,
  crud: `
const config: CrudDialogConfig = {
  title: 'Nouveau client', mode: 'create',
  fields: [
    { key: 'code', label: 'Code', type: 'text', validators: [Validators.required] },
    { key: 'ville', label: 'Ville', type: 'select', options: VILLE_OPTIONS },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
};
this.dialog.open(CrudDialogComponent, { data: config, width: '700px', panelClass: 'assac-dialog-panel' })
  .afterClosed().subscribe(result => { /* mise à jour locale */ });`,
};
