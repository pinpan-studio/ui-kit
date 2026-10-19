import { Component, HostListener, computed, inject, input, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DEVICE_SPECS, DeviceFrameComponent } from './device-frame.component';
import { DeviceKind, SHOWCASES, SHOWCASE_GROUPS, showcaseById } from './showcases.data';

/**
 * /showcases/:id — aperçu d'un écran dans un cadre d'appareil, avec bascule
 * ordinateur / tablette / mobile, rotation, zoom et suivi de l'URL affichée.
 * L'appareil et l'orientation sont dans l'URL (?device=phone&landscape=1) : le lien se partage tel quel.
 */
@Component({
  selector: 'app-showcase-viewer',
  standalone: true,
  imports: [RouterLink, MaterialModule, DeviceFrameComponent],
  templateUrl: './showcase-viewer.component.html',
  styleUrls: ['./showcase-viewer.component.scss'],
})
export class ShowcaseViewerComponent {
  private router = inject(Router);

  /** Paramètres de route et de requête (liaison des inputs du routeur). */
  id = input<string>('');
  device = input<string | undefined>(undefined);
  landscape = input<string | undefined>(undefined);

  readonly frame = viewChild(DeviceFrameComponent);
  readonly specs = DEVICE_SPECS;
  readonly devices = Object.keys(DEVICE_SPECS) as DeviceKind[];
  readonly groups = SHOWCASE_GROUPS.map((g) => ({ ...g, items: SHOWCASES.filter((s) => s.group === g.id) }));
  readonly zooms: { label: string; value: 'fit' | number }[] = [
    { label: 'Ajuster', value: 'fit' }, { label: '50 %', value: 0.5 }, { label: '75 %', value: 0.75 }, { label: '100 %', value: 1 },
  ];

  readonly zoom = signal<'fit' | number>('fit');
  readonly path = signal('');

  readonly showcase = computed(() => showcaseById(this.id()) ?? SHOWCASES[0]);
  readonly group = computed(() => this.groups.find((g) => g.id === this.showcase().group)!);
  readonly currentDevice = computed<DeviceKind>(() => {
    const d = this.device();
    return d && d in DEVICE_SPECS ? (d as DeviceKind) : this.showcase().device ?? 'desktop';
  });
  readonly isLandscape = computed(() => this.landscape() === '1' && this.currentDevice() !== 'desktop');
  readonly zoomLabel = computed(() => this.zooms.find((z) => z.value === this.zoom())?.label ?? 'Ajuster');

  private readonly index = computed(() => SHOWCASES.indexOf(this.showcase()));
  readonly prev = computed(() => SHOWCASES[(this.index() - 1 + SHOWCASES.length) % SHOWCASES.length]);
  readonly next = computed(() => SHOWCASES[(this.index() + 1) % SHOWCASES.length]);

  setDevice(d: DeviceKind): void {
    this.router.navigate([], { queryParams: { device: d, landscape: d === 'desktop' ? null : this.landscape() ?? null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  rotate(): void {
    if (this.currentDevice() === 'desktop') return;
    this.router.navigate([], { queryParams: { landscape: this.isLandscape() ? null : '1' }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  open(id: string): void {
    this.router.navigate(['/showcases', id], { queryParamsHandling: 'preserve' });
  }

  openInTab(): void {
    window.open(this.path() || this.showcase().path, '_blank', 'noopener');
  }

  /** Raccourcis : 1 / 2 / 3 appareil, R rotation, ← → écran précédent / suivant. */
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    const t = e.target as HTMLElement | null;
    if (e.metaKey || e.ctrlKey || e.altKey || t?.closest('input, textarea, [contenteditable], mat-select')) return;
    const map: Record<string, () => void> = {
      '1': () => this.setDevice('desktop'), '2': () => this.setDevice('tablet'), '3': () => this.setDevice('phone'),
      r: () => this.rotate(), ArrowLeft: () => this.open(this.prev().id), ArrowRight: () => this.open(this.next().id),
    };
    const fn = map[e.key];
    if (fn) { e.preventDefault(); fn(); }
  }
}
