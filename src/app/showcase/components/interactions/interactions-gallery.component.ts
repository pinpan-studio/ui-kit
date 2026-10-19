import { Component, DestroyRef, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../../shared/doc.components';
import {
  AppNotification, CommandPaletteService, ContextMenuDirective, ContextMenuItem, KbdComponent, NotificationCenterComponent,
  PopoverDirective, ShortcutService, TourService, TourStep,
} from '../../../shared/components/interaction';
import { DEMO_CLIENTS, DemoClient, STATUT_COLOR } from '../../../data/static/showcase.data';
import { INTERACTION_SNIPPETS } from './interactions.snippets';

/** Galerie /components/interactions — palette ⌘K, raccourcis, popover, visite guidée, notifications, menu contextuel. */
@Component({
  selector: 'app-interactions-gallery',
  standalone: true,
  imports: [MaterialModule, ...DOC_COMPONENTS, KbdComponent, PopoverDirective, ContextMenuDirective, NotificationCenterComponent],
  templateUrl: './interactions-gallery.component.html',
  styleUrls: ['./interactions-gallery.component.scss'],
})
export class InteractionsGalleryComponent {
  private snack = inject(MatSnackBar);
  readonly palette = inject(CommandPaletteService);
  readonly shortcuts = inject(ShortcutService);
  private tour = inject(TourService);
  readonly code = INTERACTION_SNIPPETS;
  readonly statutColor = STATUT_COLOR;

  readonly toc: TocItem[] = [
    { id: 'palette', label: 'Palette ⌘K' }, { id: 'shortcuts', label: 'Raccourcis clavier' }, { id: 'popover', label: 'Popover' },
    { id: 'tour', label: 'Visite guidée' }, { id: 'notifications', label: 'Notifications' }, { id: 'context-menu', label: 'Menu contextuel' },
  ];

  // ── Palette ──────────────────────────────────────────
  lastCommand = signal<string | null>(null);

  // ── Raccourcis ───────────────────────────────────────
  log = signal<string[]>([]);
  private push(s: string): void { this.log.update((l) => [`${new Date().toLocaleTimeString('fr-FR')} — ${s}`, ...l].slice(0, 5)); }

  // ── Popover ──────────────────────────────────────────
  readonly clients = DEMO_CLIENTS.slice(0, 5);

  // ── Notifications ────────────────────────────────────
  private ago(min: number): Date { return new Date(Date.now() - min * 60_000); }
  notifs = signal<AppNotification[]>([
    { id: 'n1', title: 'Sortie de zone — CI-9902-NP', message: 'Le véhicule a quitté la géofence « Port-Bouët » à 11:42.', at: this.ago(3), icon: 'wrong_location', tone: 'error', category: 'Alertes',
      actions: [{ id: 'locate', label: 'Localiser', primary: true }, { id: 'ack', label: 'Acquitter' }] },
    { id: 'n2', title: 'Aminata Diallo vous a mentionné', message: '« @vous peux-tu valider le PV d’installation de Transports Yao ? »', at: this.ago(25), avatar: 'AD', category: 'Mentions' },
    { id: 'n3', title: 'Facture FAC-2026-0981 payée', message: '1 250 000 FCFA reçus de Transports Yao & Fils via mobile money.', at: this.ago(90), icon: 'payments', tone: 'success', category: 'Facturation' },
    { id: 'n4', title: 'Batterie faible — CI-0418-GH', message: 'Tension de 11,2 V détectée sur la balise.', at: this.ago(60 * 5), icon: 'battery_alert', tone: 'warning', category: 'Alertes', read: true },
    { id: 'n5', title: 'Rapport mensuel disponible', message: 'Le rapport de septembre est prêt à être téléchargé.', at: this.ago(60 * 26), icon: 'description', tone: 'info', category: 'Système', read: true },
    { id: 'n6', title: 'Maintenance planifiée', message: 'La plateforme sera indisponible dimanche de 2 h à 4 h.', at: this.ago(60 * 50), icon: 'engineering', tone: 'purple', category: 'Système', read: true },
  ]);
  private n = 7;
  simulate(): void {
    const samples: Partial<AppNotification>[] = [
      { title: 'Excès de vitesse — CI-4521-AB', message: '94 km/h sur l’autoroute du Nord (limite 70).', icon: 'speed', tone: 'error', category: 'Alertes' },
      { title: 'Nouveau ticket #4530', message: 'Bolloré Logistics CI signale une balise hors ligne.', icon: 'support_agent', tone: 'info', category: 'Système' },
      { title: 'Koffi N’Guessan a terminé une intervention', message: 'Installation de 3 balises chez SOTRA Abidjan.', avatar: 'KN', category: 'Mentions' },
    ];
    const s = samples[this.n % samples.length];
    this.notifs.update((l) => [{ id: 'n' + this.n++, at: new Date(), title: '', ...s } as AppNotification, ...l]);
  }
  onNotifAction(e: { notification: AppNotification; action: string }): void {
    this.snack.open(`${e.action === 'locate' ? 'Localisation de' : 'Alerte acquittée :'} ${e.notification.title.split('—')[1]?.trim() ?? ''}`, 'Fermer', { duration: 2500 });
  }

  // ── Menu contextuel ──────────────────────────────────
  readonly files = [
    { name: 'Contrat-2026.pdf', icon: 'picture_as_pdf', meta: '412 Ko · modifié hier' },
    { name: 'Photos installation', icon: 'folder', meta: '24 éléments' },
    { name: 'Export-balises.xlsx', icon: 'table_chart', meta: '86 Ko · 12 oct.' },
    { name: 'PV-installation.pdf', icon: 'picture_as_pdf', meta: '1,2 Mo · 10 oct.' },
  ];
  selectedFile = signal<string | null>(null);
  fileMenu = (name: string): ContextMenuItem[] => [
    { header: name },
    { label: 'Ouvrir', icon: 'open_in_new', shortcut: 'enter', action: () => this.done(`Ouvrir « ${name} »`) },
    { label: 'Renommer', icon: 'edit', shortcut: 'f2', action: () => this.done(`Renommer « ${name} »`) },
    { label: 'Dupliquer', icon: 'content_copy', shortcut: 'mod+d', action: () => this.done(`Dupliquer « ${name} »`) },
    { label: 'Partager…', icon: 'share', action: () => this.done(`Partager « ${name} »`) },
    { divider: true },
    { label: 'Télécharger', icon: 'download', action: () => this.done(`Télécharger « ${name} »`) },
    { label: 'Déplacer vers la corbeille', icon: 'delete', danger: true, shortcut: 'backspace', action: () => this.done(`Supprimer « ${name} »`) },
  ];
  rowMenu = (c: DemoClient): ContextMenuItem[] => [
    { header: c.code },
    { label: 'Voir la fiche', icon: 'visibility', action: () => this.done(`Fiche ${c.raison_sociale}`) },
    { label: 'Appeler ' + c.contact.split(' ')[0], icon: 'call', action: () => this.done(`Appel ${c.telephone}`) },
    { label: 'Envoyer un email', icon: 'mail', action: () => this.done(`Email ${c.email}`) },
    { divider: true },
    { label: 'Suspendre le contrat', icon: 'pause_circle', disabled: c.statut !== 'ACTIF' },
    { label: 'Résilier', icon: 'block', danger: true, action: () => this.done(`Résilier ${c.code}`) },
  ];
  private done(s: string): void { this.snack.open(s + ' — démo statique', 'Fermer', { duration: 2000 }); }

  constructor() {
    const ref = inject(DestroyRef);
    this.palette.enableHotkey();
    ref.onDestroy(this.palette.register([
      { id: 'demo-new-client', label: 'Créer un client', group: 'Actions (démo)', icon: 'person_add', shortcut: 'c', keywords: ['nouveau', 'ajouter'], action: () => this.ran('Créer un client') },
      { id: 'demo-new-ticket', label: 'Ouvrir un ticket de support', group: 'Actions (démo)', icon: 'support_agent', keywords: ['incident', 'panne'], action: () => this.ran('Ouvrir un ticket') },
      { id: 'demo-export', label: 'Exporter les trajets du mois', group: 'Actions (démo)', icon: 'download', hint: 'XLSX · septembre 2026', action: () => this.ran('Exporter les trajets') },
      { id: 'demo-cut', label: 'Couper le moteur à distance…', group: 'Actions (démo)', icon: 'power_settings_new', hint: 'Action sensible — confirmation requise', action: () => this.ran('Couper le moteur') },
      { id: 'demo-tour', label: 'Lancer la visite guidée', group: 'Aide', icon: 'tour', action: () => this.startTour() },
      { id: 'demo-help', label: 'Afficher les raccourcis clavier', group: 'Aide', icon: 'keyboard', shortcut: 'shift+?', action: () => this.shortcuts.openHelp() },
    ]));
    this.shortcuts.registerFor(ref,
      { keys: 'c', description: 'Créer un client (démo)', group: 'Galerie Interactions', action: () => this.push('C → Créer un client') },
      { keys: 'g c', description: 'Aller aux clients (séquence)', group: 'Galerie Interactions', action: () => this.push('G puis C → Aller aux clients') },
      { keys: 'g n', description: 'Ouvrir les notifications (séquence)', group: 'Galerie Interactions', action: () => this.push('G puis N → Notifications') },
      { keys: 'mod+shift+e', description: 'Exporter (démo)', group: 'Galerie Interactions', action: () => this.push('⌘/Ctrl+Maj+E → Exporter') },
      { keys: 't', description: 'Lancer la visite guidée', group: 'Galerie Interactions', action: () => this.startTour() },
    );
  }
  private ran(s: string): void { this.lastCommand.set(s); this.snack.open(`Commande : ${s}`, 'Fermer', { duration: 2000 }); }

  // ── Visite guidée ────────────────────────────────────
  tourDone = signal<string | null>(null);
  startTour(): void {
    const steps: TourStep[] = [
      { title: 'Bienvenue dans le tableau de bord', content: 'Cette courte visite présente les éléments essentiels. Utilisez ← / → ou les boutons ; Échap pour quitter.', icon: 'waving_hand' },
      { target: '#tour-search', title: 'Recherche globale', content: 'Retrouvez un client, un véhicule ou une page. Raccourci : ⌘K / Ctrl+K partout dans l’application.', icon: 'search', placement: 'bottom' },
      { target: '#tour-kpis', title: 'Indicateurs clés', content: 'Vos chiffres du jour. Cliquez sur une carte pour accéder au détail.', icon: 'insights' },
      { target: '#tour-alerts', title: 'Alertes en direct', content: 'Les alertes critiques apparaissent ici en temps réel : sorties de zone, excès de vitesse, batteries faibles.', icon: 'notifications_active', placement: 'left' },
      { target: '#tour-create', title: 'Créer rapidement', content: 'Ajoutez un client, un véhicule ou une intervention en un clic. Raccourci : touche C.', icon: 'add_circle', placement: 'top' },
    ];
    this.tour.start(steps, { onFinish: (ok) => this.tourDone.set(ok ? 'Visite terminée ✔' : 'Visite interrompue') });
  }
}
