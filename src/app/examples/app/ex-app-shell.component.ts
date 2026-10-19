import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { ThemePickerComponent } from '../../shared/components/theme-picker/theme-picker.component';
import { AppNotification, CommandPaletteService, KbdComponent, NotificationCenterComponent } from '../../shared/components/interaction';
import { ThemeService } from '../../core/services/theme.service';
import { CURRENT_USER } from '../../data/static/session.data';
import { ExChatPanelComponent } from './chat/ex-chat-panel.component';
import { ExChatService } from './chat/ex-chat.service';

/** Conservé pour compatibilité : toutes les variantes utilisent désormais la sidenav du catalogue (route `/`). */
export type ExNavStyle = 'sidebar' | 'rail' | 'topnav';

export interface ExNavItem { label: string; icon: string; path: string; badge?: number; }
export interface ExNavGroup { label: string; icon: string; items: ExNavItem[]; collapsible?: boolean; }

/** Entrées de premier niveau (style « top » du catalogue). */
export const EX_NAV_TOP: ExNavItem[] = [
  { label: 'Tableau de bord', icon: 'space_dashboard', path: '/examples/app/dashboard' },
  { label: 'Supervision', icon: 'monitor_heart', path: '/examples/app/monitoring' },
  { label: 'Modules', icon: 'apps', path: '/examples/app/modules' },
];

export const EX_NAV_GROUPS: ExNavGroup[] = [
  { label: 'Pilotage', icon: 'insights', items: [
    { label: 'Clients', icon: 'group', path: '/examples/app/clients' },
    { label: 'Catalogue', icon: 'inventory_2', path: '/examples/app/catalog' },
    { label: 'Planning', icon: 'view_kanban', path: '/examples/app/board' },
  ] },
  { label: 'Communication', icon: 'forum', items: [
    { label: 'Messagerie', icon: 'inbox', path: '/examples/app/inbox', badge: 2 },
    { label: 'Messagerie instantanée', icon: 'chat', path: '/examples/app/chat' },
    { label: 'Fil d’équipe', icon: 'dynamic_feed', path: '/examples/app/feed' },
  ] },
  { label: 'Ressources', icon: 'local_library', items: [
    { label: 'Blog', icon: 'newspaper', path: '/examples/app/blog' },
    { label: 'Documentation', icon: 'menu_book', path: '/examples/app/docs' },
    { label: 'Fichiers', icon: 'folder', path: '/examples/app/files' },
  ] },
  { label: 'Formulaires', icon: 'dynamic_form', collapsible: true, items: [
    { label: 'Contact', icon: 'contact_mail', path: '/examples/forms/contact' },
    { label: 'Commande', icon: 'shopping_cart_checkout', path: '/examples/forms/checkout' },
    { label: 'Réservation', icon: 'event_available', path: '/examples/forms/booking' },
    { label: 'Candidature', icon: 'assignment_ind', path: '/examples/forms/application' },
    { label: 'Assistant d’accueil', icon: 'rocket_launch', path: '/examples/forms/onboarding' },
    { label: 'Questionnaire', icon: 'quiz', path: '/examples/forms/survey' },
  ] },
  { label: 'Compte', icon: 'manage_accounts', items: [
    { label: 'Paramètres', icon: 'settings', path: '/examples/app/settings' },
  ] },
];
export const EX_NAV: ExNavItem[] = [...EX_NAV_TOP, ...EX_NAV_GROUPS.flatMap((g) => g.items)];

const EX_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'Paiement reçu', message: 'Cacao Plus a réglé la facture FAC-2026-0981 (4,2 M FCFA).', at: new Date(Date.now() - 12 * 60e3), icon: 'payments', tone: 'success', category: 'Finance' },
  { id: 'n2', title: 'Aya Koné vous a mentionné', message: '« @Jean peux-tu valider le créneau de jeudi ? »', at: new Date(Date.now() - 2 * 3600e3), avatar: 'AK', category: 'Équipe',
    actions: [{ id: 'reply', label: 'Répondre', primary: true }, { id: 'later', label: 'Plus tard' }] },
  { id: 'n3', title: '3 factures en retard', message: 'Relance automatique programmée demain à 9 h.', at: new Date(Date.now() - 5 * 3600e3), icon: 'schedule', tone: 'warning', category: 'Finance' },
  { id: 'n4', title: 'Version 2.4 disponible', message: 'Export PDF corrigé, nouveaux rapports.', at: new Date(Date.now() - 26 * 3600e3), icon: 'new_releases', tone: 'info', category: 'Système', read: true },
];

/**
 * Shell des écrans d'exemple (/examples/app/**) : reprend à l'identique la sidenav et la barre d'outils
 * du catalogue (layouts/kit-layout, route `/`) — carte flottante, en-tête logo + titre, recherche,
 * entrées de premier niveau, sections titrées, section repliable ; tiroir superposé sous 960 px.
 */
@Component({
  selector: 'ex-app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MaterialModule, ThemePickerComponent, NotificationCenterComponent, KbdComponent, ExChatPanelComponent],
  template: `
    <mat-sidenav-container class="kit-container">
      <mat-sidenav #sidenav class="kit-sidenav" [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()">
        <div class="sidenav-inner">
          <div class="sidenav-header">
            <img src="assets/logo.png" class="brand-logo" alt="SC Storage" />
            <div class="header-text">
              <span class="app-title">SC Storage</span>
              <span class="app-subtitle">Espace de travail</span>
            </div>
            @if (isMobile()) {
              <button mat-icon-button (click)="sidenav.close()" class="close-drawer-btn" aria-label="Fermer le menu"><mat-icon>chevron_left</mat-icon></button>
            }
          </div>

          <div class="nav-search">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Rechercher une page…" [value]="search()" (input)="search.set($any($event.target).value)" />
            @if (search()) {
              <button type="button" class="clear" (click)="search.set('')" aria-label="Effacer"><mat-icon>close</mat-icon></button>
            }
          </div>

          <div class="sidenav-menu-wrapper" (click)="isMobile() && $any($event.target).closest('a') && sidenav.close()">
            <div class="menu-section">
              @for (n of top; track n.path) {
                @if (matches(n.label)) {
                  <a class="menu-item top" [routerLink]="n.path" routerLinkActive="active">
                    <mat-icon class="item-icon">{{ n.icon }}</mat-icon>
                    <span class="item-label">{{ n.label }}</span>
                  </a>
                }
              }
            </div>

            @for (g of groups; track g.label) {
              @if (groupVisible(g)) {
                <div class="menu-section">
                  @if (g.collapsible) {
                    <button type="button" class="section-header clickable" (click)="toggle(g.label)">
                      <mat-icon class="section-icon">{{ g.icon }}</mat-icon>
                      <span class="section-title">{{ g.label }}</span>
                      <span class="spacer"></span>
                      <mat-icon class="chevron" [class.open]="isOpen(g.label)">expand_more</mat-icon>
                    </button>
                  } @else {
                    <div class="section-header">
                      <mat-icon class="section-icon">{{ g.icon }}</mat-icon>
                      <span class="section-title">{{ g.label }}</span>
                    </div>
                  }
                  @if (!g.collapsible || isOpen(g.label) || search()) {
                    <div class="section-items">
                      @for (n of g.items; track n.path) {
                        @if (matches(n.label) || matches(g.label)) {
                          <a class="menu-item" [routerLink]="n.path" routerLinkActive="active">
                            <mat-icon class="item-icon">{{ n.icon }}</mat-icon>
                            <span class="item-label">{{ n.label }}</span>
                            @if (n.badge) { <span class="count">{{ n.badge }}</span> }
                          </a>
                        }
                      }
                    </div>
                  }
                </div>
              }
            }
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="kit-main">
        <mat-toolbar class="kit-toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" [attr.aria-label]="sidenav.opened ? 'Masquer le menu' : 'Afficher le menu'">
            <mat-icon>{{ sidenav.opened ? 'menu_open' : 'menu' }}</mat-icon>
          </button>
          <span class="toolbar-title">
            @if (crumb()) { <span class="crumb">{{ crumb() }}</span><mat-icon class="sep">chevron_right</mat-icon> }<span class="cur">{{ title() }}</span>
          </span>
          <span class="spacer"></span>
          <button type="button" class="palette-btn" (click)="palette.open()" aria-label="Rechercher (⌘K)">
            <mat-icon>search</mat-icon><span class="pb-label">Rechercher…</span><app-kbd keys="mod+k" class="pb-kbd" />
          </button>
          <button mat-icon-button class="hide-sm" (click)="theme.toggle()" matTooltip="Changer de thème">
            <mat-icon>{{ theme.mode() === 'light' ? 'dark_mode' : 'light_mode' }}</mat-icon>
          </button>
          <app-theme-picker class="hide-sm" />
          @if (chatButton()) {
            <button mat-icon-button class="chat-btn" [class.on]="chat.panelOpen()" (click)="chat.panelOpen.set(!chat.panelOpen())" matTooltip="Messages" aria-label="Messages">
              <mat-icon>{{ chat.panelOpen() ? 'chat_bubble' : 'chat_bubble_outline' }}</mat-icon>
              @if (chat.totalUnread()) { <span class="chat-n">{{ chat.totalUnread() }}</span> }
            </button>
          }
          <app-notification-center [notifications]="notifications" />
          <button type="button" class="avatar-btn" [matMenuTriggerFor]="me" aria-label="Mon compte"><span class="avatar">{{ initials }}</span></button>
          <mat-menu #me="matMenu" xPosition="before" class="m3-dropdown-menu">
            <div class="menu-me"><strong>{{ user.fullname }}</strong><small>{{ user.mail }}</small></div>
            <mat-divider />
            <a mat-menu-item routerLink="/examples/app/settings"><mat-icon>person</mat-icon>Mon profil</a>
            <a mat-menu-item routerLink="/examples/app/settings"><mat-icon>settings</mat-icon>Paramètres</a>
            <button mat-menu-item (click)="palette.open()"><mat-icon>keyboard_command_key</mat-icon>Commandes<app-kbd class="menu-kbd" keys="mod+k" /></button>
            <mat-divider />
            <a mat-menu-item routerLink="/examples/auth/lock"><mat-icon>lock</mat-icon>Verrouiller</a>
            <a mat-menu-item routerLink="/examples/auth/centered"><mat-icon>logout</mat-icon>Se déconnecter</a>
          </mat-menu>
        </mat-toolbar>

        <main class="content" [class.flush]="flush()">
          <ng-content />
        </main>
      </mat-sidenav-content>

      <!-- Messagerie : sidenav droite (carte flottante, même style que la gauche) -->
      <mat-sidenav class="chat-drawer" position="end" [mode]="isWide() ? 'side' : 'over'" [opened]="chat.panelOpen()" (closedStart)="chat.panelOpen.set(false)" autoFocus="false">
        <div class="chat-inner">@if (chat.panelOpen()) { <ex-chat-panel /> }</div>
      </mat-sidenav>
    </mat-sidenav-container>
  `,
  styleUrls: ['./ex-app-shell.component.scss'],
})
export class ExAppShellComponent {
  readonly palette = inject(CommandPaletteService);
  readonly theme = inject(ThemeService);

  /** Sans effet visuel : toutes les pages partagent la sidenav du catalogue. */
  nav = input<ExNavStyle>('sidebar');
  title = input('');
  crumb = input('');
  /** Contenu sans marges (tableaux pleine hauteur, maître / détail). */
  flush = input(false);
  /** Bouton « Messages » (masqué sur la page de messagerie elle-même). */
  chatButton = input(true);
  readonly chat = inject(ExChatService);
  readonly isWide = signal(false);

  readonly top = EX_NAV_TOP;
  readonly groups = EX_NAV_GROUPS;
  readonly notifications = EX_NOTIFICATIONS;
  readonly user = CURRENT_USER;
  readonly initials = CURRENT_USER.fullname.split(' ').map((n) => n[0]).join('').slice(0, 2);
  readonly isMobile = signal(false);
  readonly search = signal('');
  private readonly opened = signal<Record<string, boolean>>({});

  constructor() {
    inject(BreakpointObserver).observe('(max-width: 959.98px)').subscribe((r) => this.isMobile.set(r.matches));
    inject(BreakpointObserver).observe('(min-width: 1600px)').subscribe((r) => this.isWide.set(r.matches));
    this.chat.ensure();
    // Lien direct : ?chat=1 ouvre le panneau, ?chat=<id de conversation> ouvre directement la conversation.
    const q = inject(ActivatedRoute).snapshot.queryParamMap.get('chat');
    if (q) { this.chat.panelOpen.set(true); if (q !== '1') this.chat.panelConv.set(q); }
    const unregister = this.palette.register([
      ...EX_NAV.map((n) => ({ id: 'ex-nav-' + n.path, label: n.label, group: 'Aller à', icon: n.icon, route: n.path })),
      { id: 'ex-new-client', label: 'Nouveau client', group: 'Actions', icon: 'person_add', hint: 'CRM', route: '/examples/app/clients' },
      { id: 'ex-new-invoice', label: 'Nouvelle facture', group: 'Actions', icon: 'receipt_long', hint: 'Facturation', route: '/examples/app/dashboard' },
      { id: 'ex-new-task', label: 'Nouvelle tâche', group: 'Actions', icon: 'add_task', hint: 'Planning', route: '/examples/app/board' },
      { id: 'ex-compose', label: 'Rédiger un message', group: 'Actions', icon: 'edit', hint: 'Messagerie', route: '/examples/app/inbox' },
      { id: 'ex-lock', label: 'Verrouiller la session', group: 'Compte', icon: 'lock', route: '/examples/auth/lock' },
      { id: 'ex-logout', label: 'Se déconnecter', group: 'Compte', icon: 'logout', route: '/examples/auth/centered' },
    ]);
    this.palette.enableHotkey();
    inject(DestroyRef).onDestroy(unregister);
  }

  matches(label: string): boolean {
    const q = this.search().trim().toLowerCase();
    return !q || label.toLowerCase().includes(q);
  }
  groupVisible(g: ExNavGroup): boolean { return this.matches(g.label) || g.items.some((n) => this.matches(n.label)); }
  isOpen(label: string): boolean { return !!this.opened()[label]; }
  toggle(label: string): void { this.opened.update((o) => ({ ...o, [label]: !o[label] })); }
}
