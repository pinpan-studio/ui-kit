/** Extraits de code affichés dans la galerie Interactions (bouton « </> »). */
export const INTERACTION_SNIPPETS = {
  palette: `
private palette = inject(CommandPaletteService);

constructor() {
  this.palette.enableHotkey();                          // ⌘K / Ctrl+K
  inject(DestroyRef).onDestroy(this.palette.register([  // retiré à la destruction de l'écran
    { id: 'new-client', label: 'Créer un client', group: 'Actions', icon: 'person_add',
      keywords: ['nouveau', 'ajouter'], shortcut: 'c', action: () => this.create() },
    { id: 'go-fleet', label: 'Flotte en temps réel', group: 'Navigation', icon: 'map', route: '/main/flotte' },
  ]));
}

<button (click)="palette.open()">Rechercher <app-kbd keys="mod+k" /></button>`,
  shortcuts: `
private shortcuts = inject(ShortcutService);

constructor() {
  this.shortcuts.registerFor(inject(DestroyRef),
    { keys: 'c', description: 'Créer un client', group: 'Clients', action: () => this.create() },
    { keys: 'g c', description: 'Aller aux clients', group: 'Navigation', action: () => this.router.navigate(['/clients']) },
    { keys: 'mod+s', description: 'Enregistrer', allowInInput: true, action: (e) => this.save() },
  );
}

<app-kbd keys="mod+shift+e" />   <!-- ⌘ ⇧ E sur macOS, Ctrl Maj E ailleurs -->`,
  popover: `
<a [appPopover]="carte" [popoverContext]="client" popoverTrigger="hover" popoverPosition="bottom-start">
  {{ client.raison_sociale }}
</a>

<ng-template #carte let-c let-close="close">
  <div class="kit-popover">… {{ c.contact }} … <button (click)="close()">Fermer</button></div>
</ng-template>`,
  tour: `
private tour = inject(TourService);

start() {
  this.tour.start([
    { title: 'Bienvenue', content: 'Une courte visite…', icon: 'waving_hand' },          // carte centrée
    { target: '#search', title: 'Recherche', content: '⌘K partout.', placement: 'bottom' },
    { target: '#kpis', title: 'Indicateurs', content: '…', before: () => this.tab.set(0) },
  ], { onFinish: (completed) => localStorage.setItem('tour-done', '1') });
}`,
  notifications: `
<app-notification-center
  [notifications]="notifications"     <!-- AppNotification[] -->
  (open)="goTo($event)"
  (action)="onAction($event)"          <!-- { notification, action } -->
  (readChange)="api.markRead($event.ids)"
  (removed)="api.delete($event.id)"
  footer="Voir toutes les notifications" />`,
  contextMenu: `
menu: ContextMenuItem[] = [
  { header: 'Contrat-2026.pdf' },
  { label: 'Ouvrir', icon: 'open_in_new', shortcut: 'enter', action: () => this.open() },
  { label: 'Renommer', icon: 'edit', shortcut: 'f2', action: () => this.rename() },
  { divider: true },
  { label: 'Supprimer', icon: 'delete', danger: true, action: () => this.remove() },
];

<div [appContextMenu]="menu" (contextMenuOpen)="select(file)">…</div>`,
};
