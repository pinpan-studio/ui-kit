import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../shared/doc.components';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { PAGE_REGISTRY } from '../../core/models/page-registry';
import { COMPONENT_CATEGORIES, SHOWCASE_SECTIONS } from '../kit-nav';
import { MATERIAL_ICONS } from '../../data/static/showcase.data';
import { ThemeService } from '../../core/services/theme.service';
import { ThemeSettingsComponent } from '../../shared/components/theme-picker/theme-picker.component';

interface Swatch { name: string; token: string; note?: string; }

/** /ui-showcase — vue d'ensemble du catalogue : couleurs, typographie, icônes, accès à tout le kit. */
@Component({
  selector: 'app-ui-showcase',
  standalone: true,
  imports: [RouterLink, MaterialModule, StatusBadgeComponent, ThemeSettingsComponent, ...DOC_COMPONENTS],
  templateUrl: './ui-showcase.component.html',
  styleUrls: ['./ui-showcase.component.scss'],
})
export class UiShowcaseComponent {
  private clipboard = inject(Clipboard);
  private snackBar = inject(MatSnackBar);
  readonly theme = inject(ThemeService);

  readonly sections = SHOWCASE_SECTIONS;
  readonly categories = COMPONENT_CATEGORIES;
  readonly groups = PAGE_REGISTRY;
  readonly totalPages = computed(() => this.groups.reduce((n, g) => n + g.pages.length, 0));
  readonly totalVariants = computed(() => this.groups.reduce((n, g) => n + g.pages.reduce((m, p) => m + (p.variants?.length ?? 0), 0), 0));

  readonly toc: TocItem[] = [
    { id: 'overview', label: 'Vue d’ensemble' }, { id: 'themes', label: 'Thèmes' }, { id: 'colors', label: 'Colors' }, { id: 'typography', label: 'Typography' },
    { id: 'spacing', label: 'Espacements & rayons' }, { id: 'icons', label: 'Icons' }, { id: 'catalog', label: 'Catalogue' }, { id: 'modules', label: 'Pages par module' },
  ];

  readonly brand: Swatch[] = [
    { name: 'Primary', token: '--primary-color', note: 'M3 primary (thème courant)' },
    { name: 'Primary light', token: '--primary-color-light' },
    { name: 'Tertiary', token: '--tertiary-color', note: 'M3 tertiary (thème courant)' },
    { name: 'Tertiary light', token: '--tertiary-color-light' },
  ];
  readonly semantic: Swatch[] = [
    { name: 'Success', token: '--success-color' }, { name: 'Success light', token: '--success-color-light' }, { name: 'Success text', token: '--success-color-text' },
    { name: 'Warning', token: '--warning-color' }, { name: 'Warning light', token: '--warning-color-light' }, { name: 'Warning text', token: '--warning-color-text' },
    { name: 'Error', token: '--error-color' }, { name: 'Error light', token: '--error-color-light' }, { name: 'Error text', token: '--error-color-text' },
    { name: 'Info', token: '--info-color' }, { name: 'Purple', token: '--purple-color' }, { name: 'Cyan', token: '--cyan-color' },
  ];
  readonly surfaces: Swatch[] = [
    { name: 'Background', token: '--bg' }, { name: 'Card', token: '--card-bg' }, { name: 'Hover', token: '--hover-bg' },
    { name: 'Table header', token: '--table-header-bg' }, { name: 'Border', token: '--border-color' },
    { name: 'Text primary', token: '--text-primary' }, { name: 'Text secondary', token: '--text-secondary' }, { name: 'Text muted', token: '--text-muted' },
  ];
  /** Rôles de couleur M3, présentés par paires « rôle / on-rôle » comme dans la documentation Material. */
  readonly roles: { label: string; role: string; on: string; bordered?: boolean }[] = [
    { label: 'Primary', role: 'primary', on: 'on-primary' },
    { label: 'Primary container', role: 'primary-container', on: 'on-primary-container' },
    { label: 'Secondary', role: 'secondary', on: 'on-secondary' },
    { label: 'Secondary container', role: 'secondary-container', on: 'on-secondary-container' },
    { label: 'Tertiary', role: 'tertiary', on: 'on-tertiary' },
    { label: 'Tertiary container', role: 'tertiary-container', on: 'on-tertiary-container' },
    { label: 'Error', role: 'error', on: 'on-error' },
    { label: 'Error container', role: 'error-container', on: 'on-error-container' },
    { label: 'Surface', role: 'surface', on: 'on-surface', bordered: true },
    { label: 'Surface container', role: 'surface-container', on: 'on-surface', bordered: true },
    { label: 'Surface container highest', role: 'surface-container-highest', on: 'on-surface-variant', bordered: true },
    { label: 'Inverse surface', role: 'inverse-surface', on: 'inverse-on-surface' },
  ];
  readonly spaces = [['--space-xs', '4px'], ['--space-s', '8px'], ['--space-m', '16px'], ['--space-l', '24px'], ['--space-xl', '32px'], ['--space-xxl', '48px']];
  readonly radii = [['--r-s', '4px'], ['--r-m', '12px'], ['--r-l', '24px'], ['--r-full', '9999px']];

  iconQuery = signal('');
  readonly icons = computed(() => {
    const q = this.iconQuery().toLowerCase().trim();
    return q ? MATERIAL_ICONS.filter((i) => i.includes(q)) : MATERIAL_ICONS;
  });

  copy(text: string, label = text): void {
    this.clipboard.copy(text);
    this.snackBar.open(`« ${label} » copié`, 'Fermer', { duration: 1500 });
  }
}
