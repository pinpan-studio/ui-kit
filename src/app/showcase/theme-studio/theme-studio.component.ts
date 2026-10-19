import { Component, computed, effect, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../shared/doc.components';
import { ThemeService } from '../../core/services/theme.service';
import { ColorPickerComponent, CurrencyInputComponent, NumberStepperComponent, RatingComponent } from '../../shared/components/fields';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { FilterDropdownComponent, FilterOption } from '../../shared/components/filter-dropdown/filter-dropdown.component';
import { SearchableSelectComponent, SelectOption } from '../../shared/components/searchable-select/searchable-select.component';
import { ViewMode, ViewModeToggleComponent } from '../../shared/components/view-mode-toggle/view-mode-toggle.component';
import { BannerComponent } from '../../shared/components/feedback/banner.component';
import { TrendComponent } from '../../shared/components/data/stat-counter.component';
import {
  CONTRAST_LEVELS, CustomThemeConfig, OVERRIDABLE_ROLES, OverridableRole, SCHEME_STYLES, SchemeStyle,
  contrastRatio, cssVariablesFor, derivedKeyColors, exportCss, isHexColor, normalizeConfig, paletteStrips, schemeColors,
} from '../../core/theme/custom-theme';

interface RolePair { label: string; role: string; on: string; }

/**
 * /theme-studio — compose un thème M3 : couleur rapide, style de schéma, contraste, couleurs
 * imposées par rôle ; aperçu d'une application en clair et en sombre, nuanciers et rôles.
 */
@Component({
  selector: 'app-theme-studio',
  standalone: true,
  imports: [
    NgTemplateOutlet, FormsModule, MaterialModule, ...DOC_COMPONENTS,
    ColorPickerComponent, CurrencyInputComponent, NumberStepperComponent, RatingComponent, StatusBadgeComponent,
    FilterDropdownComponent, SearchableSelectComponent, ViewModeToggleComponent, BannerComponent, TrendComponent,
  ],
  templateUrl: './theme-studio.component.html',
  styleUrls: ['./theme-studio.component.scss'],
})
export class ThemeStudioComponent {
  readonly theme = inject(ThemeService);
  private clipboard = inject(Clipboard);
  private snackBar = inject(MatSnackBar);

  readonly styles = SCHEME_STYLES;
  readonly contrasts = CONTRAST_LEVELS;
  readonly roles = OVERRIDABLE_ROLES;
  /** Pastilles du color picker : couleurs sources des thèmes prédéfinis. */
  readonly seeds = this.theme.palettes.map((p) => p.seed);

  // État des composants de la maquette (purement démonstratif).
  readonly statusOptions: FilterOption[] = [
    { value: 'actif', label: 'Actif', color: 'success' },
    { value: 'suspendu', label: 'Suspendu', color: 'warning' },
    { value: 'resilie', label: 'Résilié', color: 'error' },
  ];
  readonly typeOptions: SelectOption[] = [
    { value: 'install', label: 'Installation balise', icon: 'build' },
    { value: 'maintenance', label: 'Maintenance', icon: 'handyman' },
    { value: 'retrait', label: 'Retrait', icon: 'remove_circle_outline' },
  ];
  readonly previewStatus = signal<string | null>('actif');
  readonly previewView = signal<ViewMode>('card');
  readonly previewType = signal('install');
  readonly previewAmount = signal(250000);
  readonly previewQty = signal(6);

  readonly toc: TocItem[] = [
    { id: 'compose', label: 'Composer' }, { id: 'tones', label: 'Nuances' }, { id: 'roles', label: 'Rôles & contrastes' },
  ];

  /** Brouillon édité dans le studio (appliqué au kit sur demande ou en direct). */
  readonly draft = signal<CustomThemeConfig>(this.initialDraft());
  /** Applique chaque modification à tout le kit. */
  readonly live = signal(false);
  readonly rolesMode = signal<'light' | 'dark'>(this.theme.mode());

  readonly styleInfo = computed(() => SCHEME_STYLES.find((s) => s.id === this.draft().style)!);
  readonly previewVars = computed(() => ({ light: cssVariablesFor(this.draft(), false), dark: cssVariablesFor(this.draft(), true) }));
  readonly strips = computed(() => paletteStrips(this.draft()));
  readonly derived = computed(() => derivedKeyColors(this.draft()));

  readonly rolePairs: RolePair[] = [
    { label: 'Primary', role: 'primary', on: 'on-primary' },
    { label: 'Primary container', role: 'primary-container', on: 'on-primary-container' },
    { label: 'Secondary', role: 'secondary', on: 'on-secondary' },
    { label: 'Secondary container', role: 'secondary-container', on: 'on-secondary-container' },
    { label: 'Tertiary', role: 'tertiary', on: 'on-tertiary' },
    { label: 'Tertiary container', role: 'tertiary-container', on: 'on-tertiary-container' },
    { label: 'Error', role: 'error', on: 'on-error' },
    { label: 'Error container', role: 'error-container', on: 'on-error-container' },
    { label: 'Surface', role: 'surface', on: 'on-surface' },
    { label: 'Surface container low', role: 'surface-container-low', on: 'on-surface' },
    { label: 'Surface container', role: 'surface-container', on: 'on-surface' },
    { label: 'Surface container highest', role: 'surface-container-highest', on: 'on-surface-variant' },
    { label: 'Inverse surface', role: 'inverse-surface', on: 'inverse-on-surface' },
    { label: 'Primary fixed', role: 'primary-fixed', on: 'on-primary-fixed' },
    { label: 'Secondary fixed', role: 'secondary-fixed', on: 'on-secondary-fixed' },
    { label: 'Tertiary fixed', role: 'tertiary-fixed', on: 'on-tertiary-fixed' },
  ];

  readonly roleColors = computed(() => {
    const c = schemeColors(this.draft(), this.rolesMode() === 'dark');
    return this.rolePairs.map((p) => ({ ...p, bg: c[p.role], fg: c[p.on], ratio: contrastRatio(c[p.role], c[p.on]) }));
  });

  readonly extraRoles = computed(() => {
    const c = schemeColors(this.draft(), this.rolesMode() === 'dark');
    return ['outline', 'outline-variant', 'surface-dim', 'surface-bright', 'inverse-primary', 'surface-tint']
      .map((role) => ({ role, hex: c[role] }));
  });

  constructor() {
    effect(() => {
      if (this.live()) this.theme.applyCustom(this.draft());
    });
  }

  private initialDraft(): CustomThemeConfig {
    return this.theme.custom() ?? normalizeConfig({ source: this.theme.palette().seed }, this.theme.palette().seed);
  }

  private update(patch: Partial<CustomThemeConfig>): void {
    this.draft.update((d) => ({ ...d, ...patch }));
  }

  setSource(hex: string): void {
    const v = hex.trim().toLowerCase();
    const full = /^#?[0-9a-f]{6}$/.test(v) ? (v.startsWith('#') ? v : '#' + v) : null;
    if (full) this.update({ source: full });
  }

  setStyle(style: SchemeStyle): void {
    this.update({ style });
  }

  setContrast(contrast: number): void {
    this.update({ contrast });
  }

  isOverridden(role: OverridableRole): boolean {
    return !!this.draft().overrides[role];
  }

  roleColor(role: OverridableRole): string {
    return this.draft().overrides[role] ?? this.derived()[role];
  }

  /** Active / désactive la couleur imposée d'un rôle (démarre de la couleur dérivée). */
  toggleOverride(role: OverridableRole, on: boolean): void {
    const overrides = { ...this.draft().overrides };
    if (on) overrides[role] = this.derived()[role];
    else delete overrides[role];
    this.update({ overrides });
  }

  setOverride(role: OverridableRole, hex: string): void {
    const v = hex.trim().toLowerCase();
    const full = /^#?[0-9a-f]{6}$/.test(v) ? (v.startsWith('#') ? v : '#' + v) : null;
    if (!isHexColor(full)) return;
    this.update({ overrides: { ...this.draft().overrides, [role]: full } });
  }

  /** Couleur source au hasard (teinte libre, saturation et luminosité équilibrées). */
  randomize(): void {
    const h = Math.random() * 360, s = 0.55 + Math.random() * 0.35, l = 0.4 + Math.random() * 0.2;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(c * 255).toString(16).padStart(2, '0');
    };
    this.update({ source: `#${f(0)}${f(8)}${f(4)}` });
  }

  monochrome(): void {
    this.update({ style: 'monochrome', overrides: {} });
  }

  /** Repart de la palette prédéfinie active. */
  reset(): void {
    this.draft.set(normalizeConfig({ source: this.theme.palette().seed }, this.theme.palette().seed));
  }

  apply(): void {
    this.theme.applyCustom(this.draft());
    this.snackBar.open('Thème personnalisé appliqué à tout le kit', 'Fermer', { duration: 2000 });
  }

  copy(text: string, label = text): void {
    this.clipboard.copy(text);
    this.snackBar.open(`« ${label} » copié`, 'Fermer', { duration: 1500 });
  }

  copyCss(): void {
    this.copy(exportCss(this.draft()), 'CSS du thème');
  }

  copyConfig(): void {
    this.copy(JSON.stringify(this.draft(), null, 2), 'Configuration JSON');
  }

  toneInk(tone: number): string {
    return tone < 55 ? '#ffffff' : '#000000';
  }
}
