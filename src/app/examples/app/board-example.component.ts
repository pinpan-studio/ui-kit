import { Component, computed, signal } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { GanttTimelineComponent, GroupedBoardComponent, KanbanBoardComponent, KanbanMove, MonthCalendarComponent, PlanningColumn, PlanningFilter, PlanningItem } from '../../shared/components/planning';
import { ExAppShellComponent } from './ex-app-shell.component';
import { hue, initials } from './ex-utils';

const day = (d: number, h = 9) => new Date(2026, 9, 17 + d, h).toISOString();
type View = 'kanban' | 'gantt' | 'calendar' | 'list';

/** /examples/app/board — rail d'icônes compact, projet en quatre vues : kanban, chronologie, calendrier, liste par responsable. */
@Component({
  selector: 'app-board-example',
  standalone: true,
  imports: [MaterialModule, KanbanBoardComponent, GanttTimelineComponent, MonthCalendarComponent, GroupedBoardComponent, ExAppShellComponent],
  template: `
    <ex-app-shell nav="rail" title="Déploiement Sotra" crumb="Projets">
      <div class="page-head">
        <div class="titles">
          <span class="eyebrow">Sprint 14 · 13 – 24 octobre</span>
          <h1>Déploiement Sotra Logistique</h1>
          <p>{{ doneCount() }} tâches terminées sur {{ items().length }} · livraison prévue le 24 octobre</p>
        </div>
        <div class="actions">
          <span class="ava-stack" aria-label="Équipe">
            @for (p of team; track p) { <span class="ava sm" [style.background]="hue(p)" [matTooltip]="p">{{ initials(p) }}</span> }
          </span>
          <button mat-stroked-button><mat-icon>person_add</mat-icon>Partager</button>
          <button mat-flat-button color="primary"><mat-icon>add</mat-icon>Nouvelle tâche</button>
        </div>
      </div>

      <div class="progress" aria-label="Avancement du sprint">
        <mat-progress-bar mode="determinate" [value]="pct()" /><strong class="tabular">{{ pct() }} %</strong>
      </div>

      <mat-button-toggle-group class="views" [value]="view()" (change)="view.set($event.value)" hideSingleSelectionIndicator aria-label="Vue">
        @for (v of views; track v.id) { <mat-button-toggle [value]="v.id"><mat-icon>{{ v.icon }}</mat-icon><span>{{ v.label }}</span></mat-button-toggle> }
      </mat-button-toggle-group>

      @switch (view()) {
        @case ('kanban') { <app-kanban-board [columns]="columns" [items]="items()" [wipLimit]="4" [searchable]="true" [filters]="filters" [lateToggle]="true" (itemMoved)="move($event)" /> }
        @case ('gantt') { <div class="card pad"><app-gantt-timeline [items]="items()" rowLabel="Responsable" zoom="day" [searchable]="true" [filters]="filters" /></div> }
        @case ('calendar') { <div class="card pad"><app-month-calendar [items]="items()" [month]="month" [showDayPanel]="true" /></div> }
        @case ('list') { <app-grouped-board [items]="items()" layout="list" [searchable]="true" [lateToggle]="true" /> }
      }
    </ex-app-shell>
  `,
  styles: [`
    @import 'app/examples/app/ex-page';
    .progress { display: flex; align-items: center; gap: 12px; max-width: 420px; margin: -8px 0 20px;
      mat-progress-bar { flex: 1; border-radius: 4px; --mat-progress-bar-track-height: 6px; --mat-progress-bar-active-indicator-height: 6px; }
      strong { font-size: var(--fs-body-sm); font-weight: 600; } }
    .views { margin-bottom: 16px; border-radius: 8px; --mat-standard-button-toggle-height: 34px; --mat-standard-button-toggle-label-text-size: var(--fs-body-sm);
      mat-icon { font-size: 18px; width: 18px; height: 18px; margin-right: 6px; vertical-align: -4px; }
      @include sm { width: 100%; mat-button-toggle { flex: 1; } span { display: none; } mat-icon { margin: 0; } } }
    .pad { padding: 16px; }
    @include mobile { .ava-stack { display: none; } }
  `],
})
export class BoardExampleComponent {
  readonly hue = hue;
  readonly initials = initials;
  readonly team = ['Jean Kouassi', 'Aïcha Diallo', 'Marc Yao', 'Sarah Bamba'];
  readonly month = new Date(2026, 9, 1);
  readonly views: { id: View; label: string; icon: string }[] = [
    { id: 'kanban', label: 'Tableau', icon: 'view_kanban' },
    { id: 'gantt', label: 'Chronologie', icon: 'view_timeline' },
    { id: 'calendar', label: 'Calendrier', icon: 'calendar_month' },
    { id: 'list', label: 'Par responsable', icon: 'view_agenda' },
  ];
  readonly view = signal<View>('kanban');

  readonly columns: PlanningColumn[] = [
    { key: 'todo', label: 'À faire', color: 'var(--text-muted)' },
    { key: 'doing', label: 'En cours', color: 'var(--info-color)' },
    { key: 'review', label: 'En revue', color: 'var(--warning-color)' },
    { key: 'done', label: 'Terminé', color: 'var(--success-color)' },
  ];
  readonly filters: PlanningFilter[] = [
    { key: 'assignee', label: 'Responsable', options: this.team.map((v) => ({ value: v, label: v })), value: (i) => i.assignee },
  ];

  readonly items = signal<PlanningItem[]>([
    { id: 't1', ref: 'SOT-101', title: 'Audit des entrepôts de Vridi', status: 'todo', assignee: 'Marc Yao', start: day(1), end: day(3, 17), due: day(3), badge: { label: 'Terrain', tone: 'info' } },
    { id: 't2', ref: 'SOT-102', title: 'Import des 1 200 références articles', status: 'todo', assignee: 'Aïcha Diallo', start: day(3), end: day(5, 17), due: day(5), tags: ['data'] },
    { id: 't3', ref: 'SOT-103', title: 'Paramétrage des tarifs transport', status: 'todo', assignee: 'Jean Kouassi', start: day(-3), end: day(-1, 17), due: day(-1), badge: { label: 'Urgent', tone: 'error' } },
    { id: 't4', ref: 'SOT-097', title: 'Formation des chefs de quai', status: 'doing', assignee: 'Sarah Bamba', progress: 60, start: day(-2), end: day(2, 17), due: day(2) },
    { id: 't5', ref: 'SOT-098', title: 'Connexion API balises GPS', status: 'doing', assignee: 'Marc Yao', progress: 35, start: day(-1), end: day(4, 17), due: day(4), badge: { label: 'Technique', tone: 'purple' } },
    { id: 't6', ref: 'SOT-099', title: 'Modèles de bons de livraison', status: 'doing', assignee: 'Aïcha Diallo', progress: 80, start: day(-2), end: day(1, 17), due: day(1) },
    { id: 't7', ref: 'SOT-094', title: 'Recette du module facturation', status: 'review', assignee: 'Jean Kouassi', progress: 90, start: day(-4), end: day(0, 17), due: day(0) },
    { id: 't8', ref: 'SOT-095', title: 'Droits d’accès par site', status: 'review', assignee: 'Sarah Bamba', start: day(0), end: day(2, 17), due: day(2) },
    { id: 't9', ref: 'SOT-090', title: 'Atelier de cadrage', status: 'done', assignee: 'Jean Kouassi', done: true, progress: 100, start: day(-4), end: day(-4, 17) },
    { id: 't10', ref: 'SOT-091', title: 'Création des comptes utilisateurs', status: 'done', assignee: 'Aïcha Diallo', done: true, progress: 100, start: day(-3), end: day(-3, 17) },
  ].map((i) => ({ ...i, group: i.assignee }) as PlanningItem));

  readonly doneCount = computed(() => this.items().filter((i) => i.status === 'done').length);
  readonly pct = computed(() => Math.round((this.doneCount() / this.items().length) * 100));

  /** Changement de colonne : on répercute le statut sur la source (l'ordre interne reste géré par le kanban). */
  move(m: KanbanMove): void {
    if (m.from === m.to) return;
    const done = m.to === 'done';
    this.items.update((l) => l.map((i) => (i.id === m.item.id ? { ...i, status: m.to, done, progress: done ? 100 : i.progress } : i)));
  }
}
