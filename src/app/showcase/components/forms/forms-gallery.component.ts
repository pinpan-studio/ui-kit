import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Observable, of } from 'rxjs';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../../shared/doc.components';
import { SearchableSelectComponent, SelectOption } from '../../../shared/components/searchable-select/searchable-select.component';
import { FilterDropdownComponent, FilterOption } from '../../../shared/components/filter-dropdown/filter-dropdown.component';
import { InputMaskDirective } from '../../../shared/directives/input-mask.directive';
import { EntityAutocompleteComponent } from '../../../shared/components/entity-autocomplete/entity-autocomplete.component';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';
import { CrudDialogComponent, CrudDialogConfig } from '../../../shared/components/crud-dialog/crud-dialog.component';
import { DEMO_CLIENTS, SECTEUR_OPTIONS, VILLE_OPTIONS } from '../../../data/static/showcase.data';
import { SNIPPETS } from './forms.snippets';

/** Galerie /components/forms — champs, sélecteurs, dates, choix, upload, recherche, validation. */
@Component({
  selector: 'app-forms-gallery',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MaterialModule, MatTimepickerModule, ...DOC_COMPONENTS,
    SearchableSelectComponent, FilterDropdownComponent, EntityAutocompleteComponent, FileUploadComponent, InputMaskDirective,
  ],
  templateUrl: './forms-gallery.component.html',
  styleUrls: ['./forms-gallery.component.scss'],
})
export class FormsGalleryComponent {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly code = SNIPPETS;

  readonly toc: TocItem[] = [
    { id: 'input', label: 'Input' }, { id: 'input-material', label: 'Input Material' }, { id: 'textarea', label: 'Textarea' },
    { id: 'mask', label: 'Masque de saisie' },
    { id: 'select', label: 'Select' }, { id: 'multi-select', label: 'Multi-select' }, { id: 'autocomplete', label: 'Autocomplete' },
    { id: 'date', label: 'Date picker' }, { id: 'date-range', label: 'Date range' }, { id: 'time', label: 'Time picker' },
    { id: 'checkbox', label: 'Checkbox' }, { id: 'radio', label: 'Radio' }, { id: 'toggle', label: 'Toggle' },
    { id: 'slider', label: 'Slider' }, { id: 'upload', label: 'File upload' }, { id: 'search', label: 'Search' },
    { id: 'validation', label: 'Form validation' }, { id: 'crud-dialog', label: 'Formulaire en modale' },
  ];

  // ── Inputs ───────────────────────────────────────────
  filled = 'Transports Yao & Fils';
  readonlyValue = 'CLI-1043';
  errorValue = 'jean.kouassi@';
  successValue = 'jean.kouassi@example.com';
  matOutline = 'Marie Yao';
  matError = new FormControl('abc', [Validators.email]);
  constructor() { this.matError.markAsTouched(); }

  // ── Selects ──────────────────────────────────────────
  villeOptions: SelectOption[] = VILLE_OPTIONS;
  secteurOptions = SECTEUR_OPTIONS;
  priorityOptions: SelectOption[] = [
    { value: 'BASSE', label: 'Basse', icon: 'arrow_downward', color: '#64748b', description: 'Traitement sous 5 jours' },
    { value: 'NORMALE', label: 'Normale', icon: 'remove', color: '#3b82f6', description: 'Traitement sous 48 h' },
    { value: 'HAUTE', label: 'Haute', icon: 'arrow_upward', color: '#f59e0b', description: 'Traitement sous 24 h' },
    { value: 'CRITIQUE', label: 'Critique', icon: 'priority_high', color: '#ef4444', description: 'Intervention immédiate' },
  ];
  matSelectValue = 'Abidjan';
  nativeSelect = 'Transport';
  searchableValue: string | null = 'NORMALE';
  searchableEmpty: string | null = null;
  multiValue: string[] = ['Abidjan', 'Bouaké'];
  chipsValue: string[] = ['Transport', 'Logistique'];

  // ── Autocomplete ─────────────────────────────────────
  clientSearch = (term: string): Observable<any[]> => {
    const q = term.toLowerCase();
    return of(DEMO_CLIENTS.filter((c) => c.raison_sociale.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)).slice(0, 8));
  };
  clientLabel = (c: any) => (c ? `${c.code} — ${c.raison_sociale}` : '');
  selectedClient: any = null;
  matAutoCtrl = new FormControl('');
  filteredVilles = signal(VILLE_OPTIONS.map((v) => v.label));
  onMatAutoInput(v: string) {
    const q = (v || '').toLowerCase();
    this.filteredVilles.set(VILLE_OPTIONS.map((o) => o.label).filter((l) => l.toLowerCase().includes(q)));
  }

  // ── Dates ────────────────────────────────────────────
  dateValue = new Date(2026, 9, 13);
  rangeStart = new Date(2026, 9, 1);
  rangeEnd = new Date(2026, 9, 31);
  timeValue = new Date(2026, 9, 13, 8, 30);
  minDate = new Date(2026, 0, 1);
  maxDate = new Date(2026, 11, 31);

  // ── Choix ────────────────────────────────────────────
  checks = { sms: true, mail: false, push: true };
  get allChecked() { return this.checks.sms && this.checks.mail && this.checks.push; }
  get someChecked() { return !this.allChecked && (this.checks.sms || this.checks.mail || this.checks.push); }
  setAll(v: boolean) { this.checks = { sms: v, mail: v, push: v }; }
  radioValue = 'MENSUEL';
  toggleA = true;
  toggleB = false;
  sliderValue = 40;
  rangeLow = 25;
  rangeHigh = 75;

  // ── Masques de saisie ────────────────────────────────
  maskTel = '';
  maskPlaque = '';
  maskDate = '';
  maskCode = '';

  // ── Upload ───────────────────────────────────────────
  uploaded: any = null;
  photo: any = null;
  uploadedDoc = { _id: 'doc-1', nom: 'contrat-cadre-2026.pdf', taille: 1_245_000, url: '' };

  // ── Recherche ────────────────────────────────────────
  search = '';
  statutFilter = '';
  villeFilter = '';
  statutOptions: FilterOption[] = [
    { value: '', label: 'Tous', icon: 'list', count: 40 },
    { value: 'ACTIF', label: 'Actifs', icon: 'check_circle', color: '#22c55e', count: 22 },
    { value: 'SUSPENDU', label: 'Suspendus', icon: 'pause_circle', color: '#eab308', count: 5 },
    { value: 'INACTIF', label: 'Inactifs', icon: 'remove_circle_outline', count: 8 },
    { value: 'RESILIE', label: 'Résiliés', icon: 'cancel', color: '#ef4444', count: 5 },
  ];
  villeFilterOptions: FilterOption[] = [{ value: '', label: 'Toutes', icon: 'public' }, ...VILLE_OPTIONS.map((v) => ({ ...v, icon: 'location_on' }))];
  get searchResults() {
    const q = this.search.toLowerCase().trim();
    return DEMO_CLIENTS.filter((c) =>
      (!q || c.raison_sociale.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) &&
      (!this.statutFilter || c.statut === this.statutFilter) &&
      (!this.villeFilter || c.ville === this.villeFilter));
  }

  // ── Validation ───────────────────────────────────────
  submitted = signal(false);
  form = new FormGroup({
    raison_sociale: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telephone: new FormControl('', [Validators.required, Validators.pattern(/^\+225 ?\d{2}( ?\d{2}){4}$/)]),
    ville: new FormControl<string | null>(null, [Validators.required]),
    vehicules: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.max(500)]),
    cgu: new FormControl(false, [Validators.requiredTrue]),
  });
  showError(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || this.submitted());
  }
  submit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.valid) this.snackBar.open('Formulaire valide — aucune donnée envoyée (démo statique)', 'Fermer', { duration: 3000, panelClass: 'snackbar-success' });
  }
  resetForm() { this.form.reset({ cgu: false }); this.submitted.set(false); }

  // ── Dialog CRUD ──────────────────────────────────────
  openCrud(mode: 'create' | 'edit' | 'view') {
    const c = DEMO_CLIENTS[0];
    const config: CrudDialogConfig = {
      title: mode === 'create' ? 'Nouveau client' : mode === 'edit' ? 'Modifier le client' : 'Fiche client',
      subtitle: mode === 'create' ? 'Ajouter un client au référentiel' : `${c.code} — ${c.raison_sociale}`,
      mode,
      data: mode === 'create' ? { statut: 'ACTIF', actif: true } : { ...c, actif: c.statut === 'ACTIF', date_debut: c.created_at },
      fields: [
        { key: 'code', label: 'Code', type: 'text', validators: [Validators.required], placeholder: 'Ex : CLI-1040' },
        { key: 'raison_sociale', label: 'Raison sociale', type: 'text', validators: [Validators.required], icon: 'business' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'contact@societe.ci' },
        { key: 'vehicules', label: 'Véhicules', type: 'number', placeholder: '0' },
        { key: 'ville', label: 'Ville', type: 'select', options: VILLE_OPTIONS },
        { key: 'secteurs', label: 'Secteurs', type: 'multiselect', options: SECTEUR_OPTIONS },
        { key: 'date_debut', label: 'Date de début', type: 'date' },
        { key: 'gestionnaire', label: 'Gestionnaire', type: 'autocomplete', options: [
          { value: 'u-1', label: 'Aminata Diallo' }, { value: 'u-2', label: 'Koffi N’Guessan' }, { value: 'u-3', label: 'Serge Kouamé' }] },
        { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Informations complémentaires…' },
        { key: 'actif', label: 'Statut', type: 'checkbox', placeholder: 'Client actif' },
      ],
    };
    this.dialog.open(CrudDialogComponent, { data: config, width: '700px', panelClass: 'assac-dialog-panel' }).afterClosed().subscribe((r) => {
      if (r) this.snackBar.open('Enregistré localement (démo statique)', 'Fermer', { duration: 2500 });
    });
  }
}
