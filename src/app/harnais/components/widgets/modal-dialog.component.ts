import { Component, forwardRef, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material.module';
import type { HarnaisWidget } from '../../../data/static/harnais.data';
import { HzWidgetComponent } from './widget.component';

export interface HzModalData { title: string; subtitle?: string; icon?: string; blocks: HarnaisWidget[] }

/** Modale de détail ouverte depuis une réponse : peut contenir n'importe quels widgets. */
@Component({
  selector: 'app-hz-modal-dialog',
  standalone: true,
  // forwardRef : le widget ouvre cette modale et la modale affiche des widgets (dépendance circulaire).
  imports: [MaterialModule, forwardRef(() => HzWidgetComponent)],
  template: `
    <header class="head">
      <span class="icon"><mat-icon>{{ data.icon ?? 'open_in_full' }}</mat-icon></span>
      <div class="text">
        <h2>{{ data.title }}</h2>
        @if (data.subtitle) { <span>{{ data.subtitle }}</span> }
      </div>
      <button mat-icon-button mat-dialog-close aria-label="Fermer"><mat-icon>close</mat-icon></button>
    </header>
    <mat-dialog-content class="body">
      @for (b of data.blocks; track $index) { <app-hz-widget [block]="b" /> }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="actions">
      <button mat-button mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./modal-dialog.component.scss'],
})
export class HzModalDialogComponent {
  readonly data = inject<HzModalData>(MAT_DIALOG_DATA);
}
