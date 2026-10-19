import { Component, computed, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../../shared/doc.components';
import { KanbanMove, PLANNING_COMPONENTS, PlanningFilter, PlanningItem } from '../../../shared/components/planning';
import {
  INTERVENTIONS, INTERVENTION_COLUMNS, INTERVENTION_FILTERS, MOTIF_FILTER, PHASES, RDV_KIND_FILTER,
  RENDEZ_VOUS, RESERVATIONS, TECHNICIENS, VEHICULES,
} from '../../../data/static/planning.data';

/** Galerie /components/planning — vues de planification génériques (modèle PlanningItem, filtres optionnels). */
@Component({
  selector: 'app-planning-gallery',
  standalone: true,
  imports: [MaterialModule, ...DOC_COMPONENTS, ...PLANNING_COMPONENTS],
  templateUrl: './planning-gallery.component.html',
  styleUrls: ['./planning-gallery.component.scss'],
})
export class PlanningGalleryComponent {
  private snackBar = inject(MatSnackBar);

  readonly toc: TocItem[] = [
    { id: 'model', label: 'Modèle & options' }, { id: 'kanban', label: 'Kanban' }, { id: 'timeline', label: 'Timeline / Gantt' },
    { id: 'notes', label: 'Grille de notes' }, { id: 'grouped', label: 'Vue groupée' }, { id: 'calendar', label: 'Calendrier' }, { id: 'agenda', label: 'Agenda' },
  ];

  // Options globales de démonstration (appliquées à toutes les vues)
  optSearch = signal(true);
  optFilters = signal(true);
  optLate = signal(true);
  readonlyKanban = signal(false);

  readonly interventions = INTERVENTIONS;
  readonly columns = INTERVENTION_COLUMNS;
  readonly techniciens = TECHNICIENS;
  readonly reservations = RESERVATIONS;
  readonly vehicules = VEHICULES;
  readonly phases = PHASES;
  readonly rdv = RENDEZ_VOUS;

  private when = (f: PlanningFilter[]) => computed(() => (this.optFilters() ? f : []));
  interventionFilters = this.when([INTERVENTION_FILTERS.type, INTERVENTION_FILTERS.zone]);
  kanbanFilters = this.when([INTERVENTION_FILTERS.type, INTERVENTION_FILTERS.technicien]);
  reservationFilters = this.when([MOTIF_FILTER]);
  rdvFilters = this.when([RDV_KIND_FILTER]);

  clicked(i: PlanningItem): void {
    this.snackBar.open(`${i.ref ? i.ref + ' · ' : ''}${i.title}`, 'Fermer', { duration: 2000 });
  }
  moved(e: KanbanMove): void {
    const col = this.columns.find((c) => c.key === e.to)?.label;
    this.snackBar.open(`« ${e.item.title} » → ${col} (local)`, 'Fermer', { duration: 2000 });
  }

  readonly code = {
    model: `
import { PlanningItem, PlanningFilter, PLANNING_COMPONENTS } from 'shared/components/planning';

// 1. Projeter n'importe quel objet métier sur PlanningItem
const items: PlanningItem[] = interventions.map(i => ({
  id: i._id, ref: i.code, title: i.libelle,
  status: i.etape,            // kanban
  group: i.technicien_id,     // gantt / vue groupée
  start: i.debut, end: i.fin, due: i.echeance,
  done: i.cloturee, progress: i.avancement,
  tone: 'info',               // neutral | primary | info | success | warning | error | purple
  assignee: i.technicien, badge: { label: i.type },
  fields: { type: i.type, zone: i.zone },   // valeurs filtrables
  data: i,                    // objet d'origine renvoyé dans les événements
}));

// 2. (Optionnel) déclarer des filtres : lus dans item.fields[key], ou via value(item)
const filters: PlanningFilter[] = [
  { key: 'type', label: 'Type', options: [{ value: 'installation', label: 'Installation' }, …] },
  { key: 'client', label: 'Client', options: […], value: (it) => (it.data as Intervention).client_id },
];`,
    toolbar: `
<!-- Toutes les vues acceptent les mêmes entrées optionnelles -->
<app-kanban-board [columns]="cols" [items]="items"
  [searchable]="true"            <!-- champ de recherche (titre, réf., description, assigné, tags) -->
  [filters]="filters"            <!-- filtres déclaratifs -->
  [lateToggle]="true"            <!-- bascule « En retard » (due dépassée et non terminé) -->
  [(filterState)]="state" />     <!-- état des filtres, partageable entre vues -->`,
    kanban: `
<app-kanban-board [columns]="columns" [items]="items" [readonly]="false" [wipLimit]="5"
  (itemClick)="open($event)" (itemMoved)="save($event)" />

<!-- carte personnalisée -->
<ng-template #card let-item><strong>{{ item.title }}</strong></ng-template>
<app-kanban-board [columns]="columns" [items]="items" [cardTemplate]="card" />`,
    timeline: `
<app-gantt-timeline [items]="reservations" [groups]="vehicules" rowLabel="Véhicule"
  [(zoom)]="zoom" (itemClick)="open($event)" />

<!-- sans groupes : une ligne par élément -->
<app-gantt-timeline [items]="phases" rowLabel="Phase" [showZoom]="false" />`,
    notes: `<app-note-grid [items]="items" [minWidth]="220" [descriptionLines]="3" (itemClick)="open($event)" />`,
    grouped: `
<app-grouped-board [items]="items" [groups]="techniciens" layout="notes" (itemClick)="open($event)" />
<app-grouped-board [items]="items" layout="list" [showProgress]="false" />`,
    calendar: `<app-month-calendar [items]="items" [(month)]="month" [showDayPanel]="true" (itemClick)="open($event)" (dayClick)="create($event)" />`,
    agenda: `<app-agenda-view [items]="rdv" [(view)]="view" [views]="['day','week','month']" [startHour]="7" [endHour]="19" [workWeek]="false" />`,
  };
}
