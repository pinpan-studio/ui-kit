import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { filter } from 'rxjs';
import { MaterialModule } from '../../shared/material.module';
import { ThemeService } from '../../core/services/theme.service';
import { ThemePickerComponent } from '../../shared/components/theme-picker/theme-picker.component';
import { PAGE_REGISTRY } from '../../core/models/page-registry';
import { COMPONENT_CATEGORIES, SHOWCASE_SECTIONS } from '../../showcase/kit-nav';
import { SHOWCASES } from '../../showcase/showcases/showcases.data';
import { CommandPaletteService, KbdComponent } from '../../shared/components/interaction';

/**
 * Layout du catalogue UI Kit : sidebar arborescente (Showcase, Pages, Components, Layouts),
 * barre supérieure (titre, thème, accès à l'application statique) et contenu routé.
 */
@Component({
  selector: 'app-kit-layout',
  standalone: true,
  imports: [RouterModule, MaterialModule, KbdComponent, ThemePickerComponent],
  templateUrl: './kit-layout.component.html',
  styleUrls: ['./kit-layout.component.scss'],
})
export class KitLayoutComponent {
  readonly theme = inject(ThemeService);
  readonly palette = inject(CommandPaletteService);
  private router = inject(Router);

  readonly groups = PAGE_REGISTRY;
  readonly categories = COMPONENT_CATEGORIES;
  readonly isMobile = signal(false);
  readonly expanded = signal<Record<string, boolean>>({});
  readonly pagesOpen = signal(true);
  readonly search = signal('');

  constructor() {
    inject(BreakpointObserver).observe('(max-width: 959.98px)').subscribe((r) => this.isMobile.set(r.matches));
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      document.querySelector('.kit-content')?.scrollTo({ top: 0 });
    });
    this.registerCommands();
  }

  /** Palette ⌘K : navigation vers tout le catalogue + actions globales. */
  private registerCommands(): void {
    this.palette.register([
      { id: 'nav-showcase', label: 'UI Showcase', group: 'Navigation', icon: 'auto_awesome_mosaic', route: '/ui-showcase' },
      { id: 'nav-theme-studio', label: 'Studio de thème', group: 'Navigation', icon: 'tune', route: '/theme-studio', keywords: ['thème', 'couleur', 'palette', 'nuances', 'custom', 'personnalisé'] },
      { id: 'nav-components', label: 'Tous les composants', group: 'Navigation', icon: 'widgets', route: '/components' },
      ...COMPONENT_CATEGORIES.map((c) => ({ id: 'nav-' + c.path, label: c.label, group: 'Composants', icon: c.icon, route: c.path, hint: c.description, keywords: (c.description ?? '').split(/[,.]\s*/) })),
      ...SHOWCASE_SECTIONS.filter((s) => s.fragment).map((s) => ({ id: `sec-${s.path}-${s.fragment}`, label: s.label, group: 'Sections', icon: s.icon, hint: s.path, action: () => void this.router.navigate([s.path], { fragment: s.fragment }) })),
      { id: 'nav-showcases', label: 'Showcases', group: 'Navigation', icon: 'devices', route: '/showcases', keywords: ['aperçu', 'iframe', 'mobile', 'tablette', 'appareil'] },
      ...SHOWCASES.map((s) => ({ id: 'sc-' + s.id, label: s.label, group: 'Showcases', icon: s.icon, route: '/showcases/' + s.id, hint: s.description })),
      { id: 'nav-layouts', label: 'Galerie des layouts', group: 'Navigation', icon: 'view_compact', route: '/layouts' },
      { id: 'nav-pages', label: 'Toutes les pages', group: 'Navigation', icon: 'grid_view', route: '/pages' },
      ...this.groups.flatMap((g) => g.pages.map((p) => ({ id: 'page-' + p.path, label: p.label, group: 'Pages · ' + g.label, icon: p.icon ?? g.icon, route: p.path, hint: p.description }))),
      { id: 'act-theme', label: 'Basculer le thème clair / sombre', group: 'Actions', icon: 'dark_mode', keywords: ['sombre', 'clair', 'dark', 'light'], action: () => this.theme.toggle() },
      { id: 'act-mode-system', label: 'Thème : suivre le système', group: 'Actions', icon: 'brightness_auto', keywords: ['système', 'auto', 'thème'], action: () => this.theme.setMode('system') },
      ...this.theme.palettes.map((p) => ({ id: 'act-palette-' + p.id, label: 'Couleur du thème : ' + p.label, group: 'Thèmes', icon: 'palette', keywords: ['thème', 'couleur', 'palette', p.id], action: () => this.theme.setPalette(p.id) })),
      { id: 'act-app', label: 'Ouvrir l’application', group: 'Actions', icon: 'open_in_new', route: '/main' },
    ]);
    this.palette.enableHotkey();
  }

  toggleGroup(id: string): void {
    this.expanded.update((e) => ({ ...e, [id]: !e[id] }));
  }

  matches(label: string): boolean {
    const q = this.search().trim().toLowerCase();
    return !q || label.toLowerCase().includes(q);
  }

  groupVisible(g: { label: string; pages: { label: string }[] }): boolean {
    return this.matches(g.label) || g.pages.some((p) => this.matches(p.label));
  }

  isOpen(id: string): boolean {
    return !!this.expanded()[id] || !!this.search().trim();
  }
}
