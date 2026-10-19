import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MaterialModule } from '../../../shared/material.module';
import { InputMaskDirective } from '../../../shared/directives/input-mask.directive';
import { FileUploadComponent, type LocalFile } from '../../../shared/components/file-upload/file-upload.component';
import {
  AddressFieldComponent, ColorPickerComponent, CopyFieldComponent, CurrencyInputComponent, MarkdownEditorComponent, NumberStepperComponent,
  OtpInputComponent, PasswordFieldComponent, RangeSliderComponent, RichTextEditorComponent, SignaturePadComponent, TagInputComponent,
  TransferListComponent, TreeSelectComponent,
} from '../../../shared/components/fields';
import { searchPlaces } from '../../../data/static/address.data';
import type { HarnaisWidget, HzField } from '../../../data/static/harnais.data';
import { describeValue } from '../../harnais.scenarios';

type FormBlock = Extract<HarnaisWidget, { type: 'form' }>;

/** Champs du kit rendus sans `mat-form-field` : libellé, aide et erreur sont posés autour par le formulaire. */
const KIT_FIELDS = new Set(['otp', 'stepper', 'currency', 'range', 'color', 'richtext', 'markdown', 'signature', 'treeselect', 'transfer', 'tags', 'address', 'password', 'copy', 'file']);
/** Champs qui prennent toute la largeur de la grille par défaut. */
const WIDE_FIELDS = new Set(['textarea', 'richtext', 'markdown', 'signature', 'transfer', 'range', 'address', 'otp']);

/**
 * Formulaire demandé par l'agent : tous les types de champs du kit — champs Material de /components/forms
 * (texte, masque, liste, autocomplete, date, plage, heure, fichier…) et champs avancés de /components/fields
 * (OTP, montant, intervalle, couleur, éditeurs, signature, arbre, transfert, tags, adresse…).
 * Une fois envoyé, il se fige en récapitulatif.
 */
@Component({
  selector: 'app-hz-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MaterialModule, MatTimepickerModule, InputMaskDirective, FileUploadComponent,
    AddressFieldComponent, ColorPickerComponent, CopyFieldComponent, CurrencyInputComponent, MarkdownEditorComponent, NumberStepperComponent,
    OtpInputComponent, PasswordFieldComponent, RangeSliderComponent, RichTextEditorComponent, SignaturePadComponent, TagInputComponent,
    TransferListComponent, TreeSelectComponent,
  ],
  templateUrl: './form-widget.component.html',
  styleUrls: ['./form-widget.component.scss'],
})
export class HzFormComponent {
  readonly block = input.required<FormBlock>();
  /** Désactivé pendant que l'agent génère une réponse. */
  readonly disabled = input(false);
  readonly submitted = output<Record<string, unknown>>();

  readonly form = signal(new FormGroup<Record<string, FormControl<unknown>>>({}));
  readonly done = computed(() => !!this.block().values);
  readonly summary = computed(() => {
    const values = this.block().values ?? {};
    return this.block().fields.map((f) => ({ label: f.label, value: describeValue(f, values[f.key]) }));
  });
  readonly stars = [1, 2, 3, 4, 5];
  readonly searchPlaces = searchPlaces;

  constructor() {
    // (Re)construit le FormGroup quand le bloc change de définition.
    effect(() => {
      const controls: Record<string, FormControl<unknown>> = {};
      for (const f of this.block().fields) {
        controls[f.key] = new FormControl<unknown>(initial(f), validator(f));
      }
      this.form.set(new FormGroup(controls));
    });
  }

  ctrl = (key: string) => this.form().controls[key];
  value = (key: string) => this.form().controls[key]?.value;
  invalid = (key: string) => { const c = this.ctrl(key); return !!c && c.invalid && c.touched; };

  toggleChip(key: string, v: string): void {
    const current = (this.value(key) as string[] | null) ?? [];
    this.ctrl(key).setValue(current.includes(v) ? current.filter((x) => x !== v) : [...current, v]);
  }
  isChipOn = (key: string, v: string) => ((this.value(key) as string[] | null) ?? []).includes(v);
  setRating(key: string, n: number): void { this.ctrl(key).setValue(n); }

  isKit = (f: HzField) => KIT_FIELDS.has(f.kind);
  isWide = (f: HzField) => !!f.wide || WIDE_FIELDS.has(f.kind);
  /** Libellés des options, pour les suggestions de `tags` et le filtre d'`autocomplete`. */
  labels = (f: HzField) => (f.options ?? []).map((o) => o.label);
  suggest(f: HzField): string[] {
    const q = String(this.value(f.key) ?? '').toLowerCase();
    return this.labels(f).filter((l) => l.toLowerCase().includes(q));
  }

  range = (key: string) => (this.value(key) as { start: Date | null; end: Date | null } | null) ?? { start: null, end: null };
  setRange(key: string, part: 'start' | 'end', d: Date | null): void {
    this.ctrl(key).setValue({ ...this.range(key), [part]: d });
    this.ctrl(key).markAsTouched();
  }

  setFile(key: string, file: LocalFile | null): void {
    this.ctrl(key).setValue(file);
    this.ctrl(key).markAsTouched();
  }

  reset(): void { this.form().reset(Object.fromEntries(this.block().fields.map((f) => [f.key, initial(f)]))); }

  submit(): void {
    const form = this.form();
    if (form.invalid) { form.markAllAsTouched(); return; }
    this.submitted.emit({ ...form.getRawValue() });
  }
}

function validator(f: HzField): ValidatorFn | null {
  const format = f.kind === 'email' ? Validators.email : null;
  if (!f.required) return format;
  if (f.kind === 'checkbox' || f.kind === 'toggle') return Validators.requiredTrue;
  if (f.kind === 'daterange') return (c) => (c.value?.start && c.value?.end ? null : { required: true });
  if (f.kind === 'otp') return (c) => (String(c.value ?? '').length >= (f.length ?? 6) ? null : { required: true });
  return format ? Validators.compose([Validators.required, format]) : Validators.required;
}

function initial(f: HzField): unknown {
  if (f.value !== undefined) return Array.isArray(f.value) ? [...f.value] : f.value;
  switch (f.kind) {
    case 'chips': case 'multiselect': case 'tags': case 'transfer': return [];
    case 'treeselect': return f.multiple ? [] : null;
    case 'checkbox': case 'toggle': return false;
    case 'slider': case 'stepper': return f.min ?? 0;
    case 'range': return [f.min ?? 0, f.max ?? 100];
    case 'daterange': return { start: null, end: null };
    case 'color': return '#4f6bed';
    case 'rating': return 0;
    default: return null;
  }
}
