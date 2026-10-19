import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DOC_COMPONENTS } from '../shared/doc.components';
import { DEVICE_SPECS, DeviceFrameComponent } from './device-frame.component';
import { DeviceKind, SHOWCASES, SHOWCASE_GROUPS } from './showcases.data';

/** /showcases — tous les écrans autonomes du kit, en vignettes vivantes (iframes chargées à la demande). */
@Component({
  selector: 'app-showcases-gallery',
  standalone: true,
  imports: [RouterLink, MaterialModule, DeviceFrameComponent, ...DOC_COMPONENTS],
  templateUrl: './showcases-gallery.component.html',
  styleUrls: ['./showcases-gallery.component.scss'],
})
export class ShowcasesGalleryComponent {
  readonly specs = DEVICE_SPECS;
  readonly devices = Object.keys(DEVICE_SPECS) as DeviceKind[];
  /** Appareil des vignettes (le visionneur s'ouvre sur le même). */
  readonly device = signal<DeviceKind>('desktop');
  readonly groupFilter = signal('');

  readonly groups = computed(() => SHOWCASE_GROUPS
    .filter((g) => !this.groupFilter() || g.id === this.groupFilter())
    .map((g) => ({ ...g, items: SHOWCASES.filter((s) => s.group === g.id) })));
  readonly allGroups = SHOWCASE_GROUPS;
  readonly total = SHOWCASES.length;
  readonly toc = computed(() => this.groups().map((g) => ({ id: g.id, label: `${g.label} (${g.items.length})` })));
}
