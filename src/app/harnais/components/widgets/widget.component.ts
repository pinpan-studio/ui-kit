import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material.module';
import { MapComponent } from '../../../shared/components/map';
import { AgendaViewComponent, GanttTimelineComponent, KanbanBoardComponent, KanbanMove, MonthCalendarComponent, PlanningItem } from '../../../shared/components/planning';
import { HARNAIS_ATTACHABLE, type HarnaisWidget, type HzOption } from '../../../data/static/harnais.data';
import { HzChartComponent } from './chart-widget.component';
import { HzTableComponent } from './table-widget.component';
import { HzFormComponent } from './form-widget.component';
import { HzTreeComponent, jsonToNodes } from './tree-widget.component';
import { HzCarouselComponent } from './carousel-widget.component';
import { HzRichComponent } from './rich-widget.component';
import { HzModalDialogComponent } from './modal-dialog.component';
import { HzMediaComponent } from './media-widget.component';
import { HzContentComponent } from './content-widget.component';

/**
 * Rendu d'un widget de réponse. Les widgets « encadrés » (graphique, tableau, carte, formulaire…)
 * partagent une carte avec en-tête ; indicateurs, choix et encadrés s'affichent à nu.
 */
@Component({
  selector: 'app-hz-widget',
  standalone: true,
  imports: [
    MaterialModule, MapComponent, MonthCalendarComponent, KanbanBoardComponent, GanttTimelineComponent, AgendaViewComponent,
    HzChartComponent, HzTableComponent, HzFormComponent, HzTreeComponent, HzCarouselComponent, HzRichComponent,
    HzMediaComponent, HzContentComponent,
  ],
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})
export class HzWidgetComponent {
  readonly block = input.required<HarnaisWidget>();
  /** Interactions bloquées pendant la génération. */
  readonly busy = input(false);

  readonly formSubmit = output<Record<string, unknown>>();
  readonly choose = output<HzOption>();

  /** Kanban : copie locale pour que le glisser-déposer persiste. */
  private moved = signal<PlanningItem[] | null>(null);
  readonly kanbanItems = computed(() => {
    const b = this.block();
    return this.moved() ?? (b.type === 'kanban' ? b.items : []);
  });

  private dialog = inject(MatDialog);
  readonly samples = HARNAIS_ATTACHABLE;

  readonly framed = computed(() => !['stats', 'choices', 'callout', 'approval', 'paragraph', 'result', 'banner'].includes(this.block().type));
  readonly defaultIcon = computed(() => ({
    chart: 'insights', table: 'table_rows', map: 'map', form: 'edit_note', records: 'list_alt',
    timeline: 'history', calendar: 'calendar_month', kanban: 'view_kanban', gantt: 'timeline', agenda: 'today',
    tree: 'account_tree', json: 'data_object', carousel: 'view_carousel', modal: 'open_in_full', tabs: 'tab',
    accordion: 'view_agenda', steps: 'linear_scale', keyvalue: 'badge', checklist: 'checklist', progress: 'track_changes',
    diff: 'difference', sources: 'travel_explore', tags: 'sell', heatmap: 'grid_on', files: 'folder', cards: 'grid_view',
    compare: 'compare', upload: 'upload_file',
    typography: 'text_fields', article: 'article', comments: 'forum', video: 'smart_display', videos: 'video_library',
    audio: 'graphic_eq', pdf: 'picture_as_pdf', gallery: 'photo_library', image: 'image', qrcode: 'qr_code_2',
    textdiff: 'difference', audit: 'manage_history',
  } as Record<string, string>)[this.block().type] ?? 'widgets');

  readonly jsonNodes = computed(() => { const b = this.block(); return b.type === 'json' ? jsonToNodes(b.data, 'réponse') : []; });

  openModal(): void {
    const b = this.block();
    if (b.type !== 'modal') return;
    this.dialog.open(HzModalDialogComponent, {
      data: { title: b.dialogTitle, subtitle: b.dialogSubtitle, icon: b.icon, blocks: b.blocks },
      width: '760px', maxWidth: '94vw', autoFocus: false, panelClass: 'hz-modal-panel',
    });
  }

  onFile(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.choose.emit({ value: 'upload', label: `${file.name} (${formatSize(file.size)})` });
  }
  onDrop(e: DragEvent): void {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && !this.busy()) this.choose.emit({ value: 'upload', label: `${file.name} (${formatSize(file.size)})` });
  }

  /** Chemin SVG d'une mini-courbe (0–100 × 0–28), avec option aire remplie. */
  sparkPath(values: number[], area = false): string {
    const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
    const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${26 - ((v - min) / span) * 22}`);
    return 'M' + pts.join(' L') + (area ? ' L100,28 L0,28 Z' : '');
  }
  riskLabel = (r?: string) => ({ error: 'élevé', warning: 'modéré', success: 'faible', info: 'faible' } as Record<string, string>)[r ?? 'warning'] ?? 'modéré';

  readonly calendarMonth = computed(() => new Date());

  onMove(m: KanbanMove): void {
    this.moved.set(this.kanbanItems().map((i) => (i.id === m.item.id ? { ...i, status: m.to, done: m.to === 'done' } : i)));
  }

  trendIcon = (t?: string) => (t === 'down' ? 'south_east' : t === 'flat' ? 'east' : 'north_east');
  toneVar = (tone?: string) => (!tone || tone === 'neutral' ? 'var(--text-muted)' : tone === 'primary' ? 'var(--primary-color)' : `var(--${tone}-color)`);
  toneClass = (tone?: string) => (!tone || tone === 'primary' ? 'info' : tone);
}

const formatSize = (n: number) => (n < 1024 ? `${n} o` : n < 1048576 ? `${Math.round(n / 1024)} Ko` : `${(n / 1048576).toFixed(1).replace('.', ',')} Mo`);
