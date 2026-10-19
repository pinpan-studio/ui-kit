/**
 * Données statiques du module Harnais (interface conversationnelle façon assistant IA).
 * Aucune API : les réponses sont simulées côté client par `HarnaisStore`.
 */
import type { MapMarker, MapRoute, MapZone } from '../../shared/components/map/map.models';
import type { PlanningColumn, PlanningGroup, PlanningItem } from '../../shared/components/planning/planning.models';
import type { ArticleBlock, CommentItem } from '../../shared/components/content/content.models';
import type { AuditEntry } from '../../shared/components/data/audit-log.component';
import type { BannerTone } from '../../shared/components/feedback/banner.component';
import type { ResultStatus } from '../../shared/components/feedback/result.component';
import type { AudioPlayerVariant } from '../../shared/components/media/audio-player.component';
import type { GalleryImage, ImageGalleryLayout } from '../../shared/components/media/image-gallery.component';
import type { VideoItem } from '../../shared/components/media/video-gallery.component';

export type HarnaisToolKind = 'read' | 'search' | 'bash' | 'edit' | 'web';
export type HarnaisToolStatus = 'running' | 'done' | 'error';

// ─── Widgets : tout ce que l'agent peut afficher dans une réponse ──────────
export type HzTone = 'primary' | 'info' | 'success' | 'warning' | 'error' | 'purple' | 'neutral';

/** Indicateur clé (tuile KPI). */
export interface HzStat { label: string; value: string; delta?: string; trend?: 'up' | 'down' | 'flat'; tone?: HzTone; icon?: string; hint?: string; /** Mini-courbe de tendance. */ spark?: number[] }

export type HzChartKind = 'line' | 'area' | 'bar' | 'hbar' | 'stacked' | 'doughnut' | 'pie' | 'radar' | 'polar';
export interface HzSeries { label: string; data: number[]; color?: string }

export interface HzColumn {
  key: string;
  label: string;
  kind?: 'text' | 'number' | 'badge' | 'progress' | 'person' | 'mono';
  /** Teinte par valeur, pour `badge`. */
  tones?: Record<string, HzTone>;
  /** Suffixe d'unité, pour `number`. */
  unit?: string;
}
export type HzRow = Record<string, string | number>;

export type HzFieldKind =
  // Champs Material (/components/forms)
  | 'text' | 'email' | 'tel' | 'url' | 'search' | 'number' | 'textarea' | 'mask' | 'select' | 'multiselect' | 'autocomplete' | 'chips'
  | 'date' | 'daterange' | 'time' | 'radio' | 'segmented' | 'checkbox' | 'toggle' | 'slider' | 'rating' | 'file'
  // Champs avancés du kit (/components/fields)
  | 'otp' | 'stepper' | 'currency' | 'range' | 'color' | 'richtext' | 'markdown' | 'signature'
  | 'treeselect' | 'transfer' | 'tags' | 'address' | 'password' | 'copy';
export interface HzOption { value: string; label: string; icon?: string; description?: string; disabled?: boolean; /** Sous-options, pour `treeselect`. */ children?: HzOption[] }
export interface HzField {
  key: string;
  label: string;
  kind: HzFieldKind;
  placeholder?: string;
  hint?: string;
  icon?: string;
  required?: boolean;
  options?: HzOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  value?: unknown;
  /** Occupe toute la largeur de la grille (2 colonnes par défaut sur grand écran). */
  wide?: boolean;
  /** Motif de saisie, pour `mask` (`0` chiffre, `A` lettre, `*` alphanumérique). */
  mask?: string;
  /** Nombre de cases, pour `otp`. */
  length?: number;
  /** Code devise, pour `currency` (XOF par défaut). */
  currency?: string;
  /** Sélection multiple, pour `treeselect`. */
  multiple?: boolean;
  /** Types acceptés, pour `file`. */
  accept?: string;
  /** Histogramme de distribution, pour `range`. */
  histogram?: number[];
  /** Mini-carte de positionnement, pour `address`. */
  map?: boolean;
  /** Générateur de mot de passe, pour `password` ; valeur masquée, pour `copy`. */
  secret?: boolean;
}

export interface HzRecord { id: string; title: string; subtitle?: string; meta?: string; icon?: string; initials?: string; tone?: HzTone; badge?: { label: string; tone?: HzTone }; tags?: string[] }
export interface HzTimelineItem { time: string; title: string; text?: string; tone?: HzTone; icon?: string }

export interface HzTreeNode { id: string; label: string; icon?: string; meta?: string; badge?: { label: string; tone?: HzTone }; children?: HzTreeNode[] }
export interface HzSlide { title: string; text?: string; image?: string; icon?: string; tone?: HzTone; tag?: string; stats?: { label: string; value: string }[] }
export interface HzStep { label: string; text?: string; status: 'done' | 'current' | 'todo' | 'error' }
export interface HzPair { label: string; value: string; icon?: string; mono?: boolean; tone?: HzTone; copy?: boolean }
export interface HzFile { name: string; ext: string; size: string; date?: string; by?: string }
export interface HzCard { title: string; text?: string; icon?: string; image?: string; tone?: HzTone; price?: string; meta?: string; tags?: string[]; cta?: string }
export interface HzSource { title: string; site: string; snippet?: string; date?: string }
export interface HzMeter { label: string; value: number; target?: number; unit?: string; tone?: HzTone }

/** Styles de l'échelle typographique du kit (classes `.text-*`). */
export type HzTextVariant =
  | 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'page-title' | 'card-title'
  | 'body-lg' | 'body' | 'body-sm' | 'label' | 'caption' | 'overline' | 'mono' | 'brand' | 'quote';
/**
 * Piste audio. Sans `src`, un son d'exemple de `sample` secondes est généré localement.
 */
export interface HzAudioTrack { title: string; artist?: string; src?: string; sample?: number; icon?: string }
/**
 * Vidéo de galerie. Sans `src` ni `youtube`, une courte animation d'exemple est enregistrée localement.
 */
export type HzVideoItem = VideoItem & { sample?: boolean };

/** Champs communs à tous les widgets « encadrés » (carte avec en-tête). */
interface HzFrame { title?: string; subtitle?: string; icon?: string }

export type HarnaisWidget =
  | ({ type: 'stats'; items: HzStat[] } & HzFrame)
  | ({ type: 'chart'; chart: HzChartKind; labels: string[]; series: HzSeries[]; unit?: string; height?: number } & HzFrame)
  | ({ type: 'table'; columns: HzColumn[]; rows: HzRow[]; searchable?: boolean; pageSize?: number } & HzFrame)
  | ({ type: 'map'; markers: MapMarker[]; routes?: MapRoute[]; zones?: MapZone[]; height?: number; legend?: { label: string; tone: HzTone }[] } & HzFrame)
  | ({ type: 'form'; formId: string; description?: string; fields: HzField[]; submitLabel?: string; values?: Record<string, unknown> } & HzFrame)
  | { type: 'choices'; question?: string; options: HzOption[]; selected?: string }
  | ({ type: 'records'; items: HzRecord[] } & HzFrame)
  | ({ type: 'timeline'; items: HzTimelineItem[] } & HzFrame)
  | { type: 'callout'; tone: HzTone; title: string; text: string; icon?: string }
  | ({ type: 'calendar'; items: PlanningItem[]; month?: string } & HzFrame)
  | ({ type: 'kanban'; columns: PlanningColumn[]; items: PlanningItem[] } & HzFrame)
  | ({ type: 'gantt'; items: PlanningItem[]; groups?: PlanningGroup[] } & HzFrame)
  | ({ type: 'agenda'; items: PlanningItem[] } & HzFrame)
  // Navigation dans l'information
  | ({ type: 'tree'; nodes: HzTreeNode[]; selectable?: boolean; submitLabel?: string; selected?: string } & HzFrame)
  | ({ type: 'carousel'; slides: HzSlide[] } & HzFrame)
  | ({ type: 'modal'; summary: string; button?: string; dialogTitle: string; dialogSubtitle?: string; blocks: HarnaisWidget[] } & HzFrame)
  | ({ type: 'tabs'; tabs: { label: string; icon?: string; badge?: string; blocks: HarnaisWidget[] }[] } & HzFrame)
  | ({ type: 'accordion'; items: { title: string; subtitle?: string; icon?: string; open?: boolean; blocks: HarnaisWidget[] }[] } & HzFrame)
  // Précision
  | ({ type: 'steps'; steps: HzStep[] } & HzFrame)
  | ({ type: 'keyvalue'; items: HzPair[] } & HzFrame)
  | ({ type: 'checklist'; items: { label: string; done?: boolean; hint?: string }[] } & HzFrame)
  | ({ type: 'progress'; items: HzMeter[] } & HzFrame)
  | ({ type: 'diff'; file: string; patch: string } & HzFrame)
  | ({ type: 'json'; data: unknown } & HzFrame)
  | ({ type: 'sources'; items: HzSource[] } & HzFrame)
  | ({ type: 'tags'; items: { label: string; count?: number; tone?: HzTone }[] } & HzFrame)
  | ({ type: 'heatmap'; rows: string[]; cols: string[]; values: number[][]; unit?: string } & HzFrame)
  | ({ type: 'files'; items: HzFile[] } & HzFrame)
  | ({ type: 'cards'; items: HzCard[] } & HzFrame)
  | ({ type: 'compare'; plans: { name: string; price?: string; note?: string; recommended?: boolean }[]; features: { label: string; values: (boolean | string)[] }[] } & HzFrame)
  // Interaction
  | { type: 'approval'; title: string; text: string; command?: string; risk?: HzTone; selected?: string }
  | ({ type: 'upload'; accept?: string; hint?: string; selected?: string } & HzFrame)
  | { type: 'paragraph'; text: string }
  // Contenu et typographie
  | ({ type: 'typography'; items: { variant: HzTextVariant; text: string; tone?: HzTone }[] } & HzFrame)
  | ({ type: 'article'; blocks: ArticleBlock[]; serif?: boolean } & HzFrame)
  | ({ type: 'comments'; comments: CommentItem[] } & HzFrame)
  // Médias (sans source, un exemple est généré localement : rien n'est téléchargé)
  | ({ type: 'video'; src?: string; youtube?: string; poster?: string; caption?: string; duration?: string; seconds?: number } & HzFrame)
  | ({ type: 'videos'; videos: HzVideoItem[]; layout?: 'grid' | 'theater' } & HzFrame)
  | ({ type: 'audio'; tracks: HzAudioTrack[]; variant?: AudioPlayerVariant } & HzFrame)
  | ({ type: 'pdf'; src?: string; name?: string; pages?: number; height?: number } & HzFrame)
  | ({ type: 'gallery'; images?: GalleryImage[]; sample?: number; layout?: ImageGalleryLayout } & HzFrame)
  | ({ type: 'image'; src: string; alt?: string; caption?: string } & HzFrame)
  // Précision (suite)
  | ({ type: 'qrcode'; value: string; caption?: string; barcode?: string } & HzFrame)
  | ({ type: 'textdiff'; before: string; after: string; mode?: 'unified' | 'split' } & HzFrame)
  | ({ type: 'audit'; entries: AuditEntry[] } & HzFrame)
  | { type: 'result'; status: ResultStatus; title?: string; text?: string }
  | { type: 'banner'; tone: BannerTone; title?: string; text: string; icon?: string };

export const HARNAIS_WIDGET_TYPES: ReadonlySet<string> = new Set([
  'stats', 'chart', 'table', 'map', 'form', 'choices', 'records', 'timeline', 'callout', 'calendar', 'kanban', 'gantt', 'agenda',
  'tree', 'carousel', 'modal', 'tabs', 'accordion', 'steps', 'keyvalue', 'checklist', 'progress', 'diff', 'json', 'sources',
  'tags', 'heatmap', 'files', 'cards', 'compare', 'approval', 'upload', 'paragraph',
  'typography', 'article', 'comments', 'video', 'videos', 'audio', 'pdf', 'gallery', 'image',
  'qrcode', 'textdiff', 'audit', 'result', 'banner',
]);

/** Widgets dont la réponse de l'utilisateur est mémorisée dans `selected`. */
export const HARNAIS_ANSWERABLE: ReadonlySet<string> = new Set(['choices', 'approval', 'upload', 'tree']);

export type HarnaisBlock =
  | { type: 'thinking'; text: string; duration?: string; running?: boolean }
  | { type: 'text'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; lang: string; code: string; file?: string }
  | { type: 'tool'; tool: HarnaisToolKind; label: string; target: string; status: HarnaisToolStatus; output?: string }
  | { type: 'artifact'; artifactId: string }
  | HarnaisWidget;

export interface HarnaisAttachment {
  name: string;
  kind: 'code' | 'image' | 'pdf' | 'sheet';
  size: string;
}

export interface HarnaisMessage {
  id: string;
  role: 'user' | 'assistant';
  blocks: HarnaisBlock[];
  attachments?: HarnaisAttachment[];
  time: string;
  /** Réponse en cours de génération. */
  streaming?: boolean;
  /** Génération interrompue par l'utilisateur. */
  stopped?: boolean;
  feedback?: 'up' | 'down' | null;
}

export type HarnaisGroup = "Aujourd'hui" | 'Hier' | '7 derniers jours' | '30 derniers jours';

export interface HarnaisConversation {
  id: string;
  title: string;
  group: HarnaisGroup;
  pinned?: boolean;
  project?: string;
  model: string;
  messages: HarnaisMessage[];
}

export interface HarnaisModel {
  id: string;
  label: string;
  description: string;
  badge?: string;
}

export interface HarnaisArtifact {
  id: string;
  title: string;
  kind: 'code' | 'document';
  lang: string;
  version: number;
  content: string;
}

export interface HarnaisTask {
  label: string;
  status: 'done' | 'running' | 'todo';
}

export interface HarnaisContextFile {
  name: string;
  path: string;
  tokens: number;
  kind: HarnaisAttachment['kind'];
}

export const HARNAIS_GROUPS: HarnaisGroup[] = ["Aujourd'hui", 'Hier', '7 derniers jours', '30 derniers jours'];

export const HARNAIS_MODELS: HarnaisModel[] = [
  { id: 'opus', label: 'Opus 5.5', description: 'Le plus capable pour les tâches complexes', badge: 'Pro' },
  { id: 'sonnet', label: 'Sonnet 5.5', description: 'Équilibre idéal pour le quotidien' },
  { id: 'haiku', label: 'Haiku 5.5', description: 'Le plus rapide pour les réponses courtes' },
];

export const HARNAIS_SUGGESTIONS: { icon: string; label: string; prompt: string }[] = [
  { icon: 'space_dashboard', label: 'Synthèse', prompt: 'Fais-moi un tableau de bord complet de l’activité.' },
  { icon: 'map', label: 'Carte', prompt: 'Montre-moi la flotte sur une carte.' },
  { icon: 'show_chart', label: 'Graphique', prompt: 'Analyse l’évolution des ventes cette année.' },
  { icon: 'table_rows', label: 'Tableau', prompt: 'Liste des clients à relancer.' },
  { icon: 'edit_note', label: 'Formulaire', prompt: 'Je veux créer une demande d’intervention.' },
  { icon: 'calendar_month', label: 'Calendrier', prompt: 'Affiche le calendrier des interventions.' },
  { icon: 'view_kanban', label: 'Kanban', prompt: 'Montre l’avancement des tâches de l’équipe.' },
  { icon: 'timeline', label: 'Gantt', prompt: 'Montre la feuille de route du déploiement.' },
  { icon: 'account_tree', label: 'Arborescence', prompt: 'Explore les documents du dossier client.' },
  { icon: 'difference', label: 'Corriger un bug', prompt: 'Corrige le bug des alertes de zone en double.' },
  { icon: 'dynamic_form', label: 'Tous les champs', prompt: 'Montre-moi tous les champs de formulaire.' },
  { icon: 'perm_media', label: 'Médias', prompt: 'Montre-moi les médias : vidéos, audio, PDF et photos.' },
  { icon: 'text_fields', label: 'Typographie', prompt: 'Montre-moi l’échelle typographique.' },
  { icon: 'apps', label: 'Tous les outils', prompt: 'Quels outils peux-tu utiliser ?' },
];

export const HARNAIS_ATTACHABLE: HarnaisAttachment[] = [
  { name: 'app-shell.component.ts', kind: 'code', size: '4 Ko' },
  { name: 'maquette-sidecar.png', kind: 'image', size: '312 Ko' },
  { name: 'cahier-des-charges.pdf', kind: 'pdf', size: '1,2 Mo' },
  { name: 'ventes-T3.xlsx', kind: 'sheet', size: '86 Ko' },
];

const SIDECAR_CODE = `import { Component, computed, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MenuItem } from './menu.data';

@Component({
  selector: 'app-sidecar',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './sidecar.component.html',
  styleUrl: './sidecar.component.scss',
  host: { '[class.open]': '!!openModule()' },
})
export class SidecarComponent {
  readonly items = input.required<MenuItem[]>();

  /** Module dont la sous-navigation est déployée (null = rail seul). */
  readonly openId = signal<string | null>(null);
  readonly openModule = computed(() =>
    this.items().find((m) => m._id === this.openId()) ?? null,
  );

  toggle(id: string): void {
    this.openId.update((current) => (current === id ? null : id));
  }
}`;

export const HARNAIS_ARTIFACTS: HarnaisArtifact[] = [
  { id: 'art-sidecar', title: 'sidecar.component.ts', kind: 'code', lang: 'typescript', version: 2, content: SIDECAR_CODE },
  {
    id: 'art-palette', title: 'Palette sombre — notes', kind: 'document', lang: 'markdown', version: 1,
    content: `# Palette sombre accessible

Fond      #111827   (contraste texte 15,8:1)
Surface   #1f2937
Bordure   #374151
Texte     #f9fafb
Primaire  #4fd8d8   (AA sur surface)

Règle : chaque couleur d'état garde un ratio ≥ 4,5:1 sur la surface.`,
  },
];

export const HARNAIS_TASKS: HarnaisTask[] = [
  { label: 'Lire le shell et la galerie de navigation', status: 'done' },
  { label: 'Fusionner rail et sous-navigation', status: 'done' },
  { label: 'Animer l’ouverture de la colonne', status: 'done' },
  { label: 'Extraire un composant réutilisable', status: 'running' },
  { label: 'Brancher le Sidecar dans le shell', status: 'todo' },
];

export const HARNAIS_CONTEXT: HarnaisContextFile[] = [
  { name: 'navigation-gallery.component.html', path: 'showcase/components/navigation', tokens: 4200, kind: 'code' },
  { name: 'navigation-gallery.component.scss', path: 'showcase/components/navigation', tokens: 3100, kind: 'code' },
  { name: 'menu.data.ts', path: 'layouts/app-shell', tokens: 900, kind: 'code' },
  { name: 'maquette-sidecar.png', path: 'pièce jointe', tokens: 1600, kind: 'image' },
];

export const HARNAIS_CONTEXT_LIMIT = 200_000;

const reply = (id: string, time: string, text: string): HarnaisMessage =>
  ({ id, role: 'assistant', time, blocks: [{ type: 'text', text }] });
const ask = (id: string, time: string, text: string): HarnaisMessage =>
  ({ id, role: 'user', time, blocks: [{ type: 'text', text }] });

export const HARNAIS_CONVERSATIONS: HarnaisConversation[] = [
  {
    id: 'c-sidecar', title: 'Sidecar de navigation Angular', group: "Aujourd'hui", pinned: true, project: 'UI Kit', model: 'opus',
    messages: [
      {
        id: 'm1', role: 'user', time: '09:12',
        attachments: [{ name: 'maquette-sidecar.png', kind: 'image', size: '312 Ko' }],
        blocks: [{ type: 'text', text: 'Combine le rail d’icônes et la sous-navigation de module en un seul Sidecar. Par défaut on ne voit que le rail ; au clic sur une icône, elle s’active et une seconde colonne s’ouvre avec les sous-menus.' }],
      },
      {
        id: 'm2', role: 'assistant', time: '09:13', feedback: 'up',
        blocks: [
          { type: 'thinking', duration: '6 s', text: 'Le rail et la sous-navigation partagent déjà les mêmes tokens (surface, rayon, couleurs actives). Le plus simple est un conteneur unique dont la largeur s’anime entre « rail seul » et « rail + panneau », avec un panneau à largeur fixe pour éviter que le contenu se recompose pendant la transition.' },
          { type: 'tool', tool: 'search', label: 'Recherche', target: 'components/navigation', status: 'done', output: '3 fichiers trouvés' },
          { type: 'tool', tool: 'read', label: 'Lecture', target: 'navigation-gallery.component.html', status: 'done', output: '308 lignes' },
          { type: 'tool', tool: 'edit', label: 'Modification', target: 'navigation-gallery.component.scss', status: 'done', output: '+62 −48' },
          { type: 'tool', tool: 'bash', label: 'Terminal', target: 'ng build --configuration development', status: 'done', output: 'Application bundle generation complete. [24.9 s]' },
          { type: 'text', text: 'C’est fait : le Sidecar remplace les deux démos. Voici le comportement :' },
          { type: 'list', items: [
            'Par défaut, seul le rail est visible (logo, icônes, avatar).',
            'Un clic sur une icône l’active et déploie une colonne de `248px` avec les sous-menus du module.',
            'Re-cliquer sur l’icône ou sur le chevron replie la colonne.',
          ] },
          { type: 'text', text: 'J’ai aussi extrait la logique dans un composant autonome, prêt à être branché dans le shell :' },
          { type: 'artifact', artifactId: 'art-sidecar' },
        ],
      },
      { id: 'm3', role: 'user', time: '09:20', blocks: [{ type: 'text', text: 'Parfait. Comment je l’utilise dans le shell ?' }] },
      {
        id: 'm4', role: 'assistant', time: '09:20',
        blocks: [
          { type: 'text', text: 'Remplace le bloc `.nav-rail` du shell par le composant et passe-lui le menu :' },
          { type: 'code', lang: 'html', file: 'app-shell.component.html', code: `<mat-sidenav class="shell-sidenav" [opened]="!isMobile()">\n  <app-sidecar [items]="menuItems" />\n</mat-sidenav>` },
          { type: 'text', text: 'Pense à mettre le sidenav en `autosize` sur le conteneur pour que le contenu suive l’ouverture de la colonne.' },
        ],
      },
    ],
  },
  {
    id: 'c-palette', title: 'Palette sombre accessible', group: "Aujourd'hui", project: 'UI Kit', model: 'sonnet',
    messages: [
      ask('p1', '08:02', 'Propose une palette sombre qui respecte le contraste AA avec notre couleur primaire teal.'),
      { id: 'p2', role: 'assistant', time: '08:03', blocks: [
        { type: 'text', text: 'Voici une base testée : chaque couleur garde un ratio d’au moins 4,5:1 sur la surface.' },
        { type: 'artifact', artifactId: 'art-palette' },
      ] },
    ],
  },
  {
    id: 'c-csv', title: 'Export CSV des factures', group: 'Hier', model: 'sonnet',
    messages: [
      ask('x1', '17:40', 'Comment exporter un tableau Material en CSV sans dépendance ?'),
      { id: 'x2', role: 'assistant', time: '17:41', blocks: [
        { type: 'text', text: 'Construis les lignes à partir de la source de données puis déclenche un téléchargement via un `Blob` :' },
        { type: 'code', lang: 'typescript', code: `const csv = [cols.join(';'), ...rows.map((r) => cols.map((c) => r[c]).join(';'))].join('\\n');\nconst url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));` },
      ] },
    ],
  },
  {
    id: 'c-reunion', title: 'Résumé réunion produit', group: 'Hier', model: 'haiku',
    messages: [
      ask('r1', '11:05', 'Résume les décisions de la réunion produit en cinq points.'),
      { id: 'r2', role: 'assistant', time: '11:05', blocks: [{ type: 'list', items: [
        'Le Sidecar devient la navigation par défaut.',
        'Les pages métiers sont retirées du kit.',
        'Le mode sombre est prioritaire pour la v2.',
        'Les démos restent 100 % statiques.',
        'Revue d’accessibilité avant la fin du mois.',
      ] }] },
    ],
  },
  {
    id: 'c-migration', title: 'Migration Angular 21', group: '7 derniers jours', project: 'UI Kit', model: 'opus',
    messages: [
      ask('g1', 'Lun.', 'Quelles sont les étapes pour migrer le kit vers Angular 21 ?'),
      reply('g2', 'Lun.', 'Lance `ng update @angular/core @angular/cli`, puis migre le contrôle de flux vers `@if` / `@for` et vérifie les modules Material dépréciés.'),
    ],
  },
  {
    id: 'c-sql', title: 'Requêtes SQL lentes', group: '7 derniers jours', model: 'sonnet',
    messages: [
      ask('s1', 'Mar.', 'Pourquoi ma requête avec un LIKE \'%abc%\' est-elle lente ?'),
      reply('s2', 'Mar.', 'Un joker en tête empêche l’usage d’un index B-tree. Utilise un index trigramme ou une recherche plein texte.'),
    ],
  },
  {
    id: 'c-e2e', title: 'Plan de tests e2e', group: '30 derniers jours', model: 'haiku',
    messages: [
      ask('e1', '2 oct.', 'Liste les parcours critiques à couvrir en e2e.'),
      reply('e2', '2 oct.', 'Connexion, navigation dans le shell, ouverture du drawer de compte et bascule du thème.'),
    ],
  },
];
