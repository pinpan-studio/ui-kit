import { Component, computed, input, model, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import {
  HARNAIS_CONTEXT, HARNAIS_CONTEXT_LIMIT, HARNAIS_TASKS, HarnaisArtifact,
} from '../../../data/static/harnais.data';

export type HarnaisPanelTab = 'artifact' | 'context' | 'tasks';

/** Colonne droite : artefact (code / aperçu), contexte chargé, plan de tâches de l'agent. */
@Component({
  selector: 'app-harnais-side-panel',
  standalone: true,
  imports: [DecimalPipe, MaterialModule],
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
})
export class HarnaisSidePanelComponent {
  readonly artifacts = input<HarnaisArtifact[]>([]);
  readonly artifactId = model<string | null>(null);
  readonly tab = model<HarnaisPanelTab>('artifact');

  readonly close = output<void>();
  readonly copy = output<string>();

  readonly view = signal<'code' | 'preview'>('code');
  readonly context = HARNAIS_CONTEXT;
  readonly tasks = HARNAIS_TASKS;
  readonly limit = HARNAIS_CONTEXT_LIMIT;

  readonly artifact = computed(() =>
    this.artifacts().find((a) => a.id === this.artifactId()) ?? this.artifacts()[0] ?? null);
  readonly lines = computed(() => this.artifact()?.content.split('\n') ?? []);

  /** Tokens : fichiers chargés + conversation (valeur indicative). */
  readonly usedTokens = computed(() => this.context.reduce((sum, f) => sum + f.tokens, 0) + 18_400);
  readonly usage = computed(() => Math.round((this.usedTokens() / this.limit) * 100));
  readonly doneCount = computed(() => this.tasks.filter((t) => t.status === 'done').length);

  readonly previewRail = ['dashboard', 'people', 'inventory_2', 'support_agent', 'build', 'savings'];

  /** Téléchargement local (Blob) — aucun appel réseau. */
  download(art: HarnaisArtifact): void {
    const name = art.kind === 'code' ? art.title : art.title.replace(/\W+/g, '-').toLowerCase() + '.md';
    const url = URL.createObjectURL(new Blob([art.content], { type: 'text/plain' }));
    Object.assign(document.createElement('a'), { href: url, download: name }).click();
    URL.revokeObjectURL(url);
  }

  kindIcon = (kind: string) => ({ code: 'code', image: 'image', pdf: 'picture_as_pdf', sheet: 'table_chart' }[kind] ?? 'insert_drive_file');
  taskIcon = (s: string) => (s === 'done' ? 'check_circle' : s === 'running' ? 'pending' : 'radio_button_unchecked');
}
