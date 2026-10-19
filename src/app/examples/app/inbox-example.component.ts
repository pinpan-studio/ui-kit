import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ContextMenuDirective, ContextMenuItem, KbdComponent, ShortcutService } from '../../shared/components/interaction';
import { CommentComposerComponent } from '../../shared/components/content';
import { ME } from '../../data/static/content.data';
import { EX_MESSAGES, ExMessage } from '../../data/static/examples.data';
import { ExAppShellComponent } from './ex-app-shell.component';
import { hue, initials } from './ex-utils';

/**
 * /examples/app/inbox — maître / détail : dossiers, liste (clic droit = menu contextuel), lecture et réponse ;
 * raccourcis J / K / E / S ; une colonne à la fois sur mobile.
 */
@Component({
  selector: 'app-inbox-example',
  standalone: true,
  imports: [MaterialModule, StatusBadgeComponent, EmptyStateComponent, ContextMenuDirective, KbdComponent, CommentComposerComponent, ExAppShellComponent],
  template: `
    <ex-app-shell nav="rail" title="Messagerie" [flush]="true">
      <div class="split" [class.reading]="current()">
        <nav class="folders" aria-label="Dossiers">
          <button mat-flat-button color="primary" class="compose"><mat-icon>edit</mat-icon>Nouveau message</button>
          @for (f of folders; track f.id) {
            <button class="folder" [class.on]="folder() === f.id" (click)="folder.set(f.id)"><mat-icon>{{ f.icon }}</mat-icon><span>{{ f.label }}</span>@if (count(f.id)) { <b>{{ count(f.id) }}</b> }</button>
          }
          <span class="f-section">Libellés</span>
          @for (l of labels; track l.text) {
            <button class="folder"><i class="dot" [style.background]="'var(--' + l.color + '-color)'"></i><span>{{ l.text }}</span></button>
          }
        </nav>

        <section class="list" aria-label="Messages">
          <div class="list-head">
            <h1>{{ folderLabel() }}</h1>
            <label class="searchbox"><mat-icon>search</mat-icon><input type="search" placeholder="Rechercher" [value]="query()" (input)="query.set($any($event.target).value)" /></label>
            <mat-button-toggle-group class="seg" [value]="unreadOnly()" (change)="unreadOnly.set($event.value)" hideSingleSelectionIndicator>
              <mat-button-toggle [value]="false">Tous</mat-button-toggle>
              <mat-button-toggle [value]="true">Non lus · {{ unreadCount() }}</mat-button-toggle>
            </mat-button-toggle-group>
          </div>
          <div class="items">
            @for (m of messages(); track m.id) {
              <button type="button" class="item" [class.on]="current()?.id === m.id" [class.unread]="m.unread" (click)="open(m)"
                [appContextMenu]="menu" (itemSelected)="onMenu(m, $event)">
                <span class="ava" [style.background]="hue(m.from)">{{ initials(m.from) }}</span>
                <span class="i-body">
                  <span class="i-top"><strong>{{ m.from }}</strong><time>{{ m.at }}</time></span>
                  <span class="i-subject">{{ m.subject }}</span>
                  <span class="i-preview">{{ m.preview }}</span>
                  @if (m.label || m.attachments?.length || m.starred) {
                    <span class="i-tags">
                      @if (m.label) { <app-status-badge [label]="m.label.text" [color]="m.label.color" /> }
                      @if (m.attachments?.length) { <mat-icon matTooltip="Pièce jointe">attach_file</mat-icon> }
                      @if (m.starred) { <mat-icon class="star" matTooltip="Suivi">star</mat-icon> }
                    </span>
                  }
                </span>
              </button>
            } @empty {
              <app-empty-state icon="inbox" title="Rien ici" subtitle="Aucun message ne correspond." />
            }
          </div>
        </section>

        <article class="reader">
          @if (current(); as m) {
            <header class="r-bar">
              <button mat-icon-button class="r-back" (click)="current.set(null)" aria-label="Retour"><mat-icon>arrow_back</mat-icon></button>
              <button mat-icon-button (click)="archive(m)" matTooltip="Archiver (E)" aria-label="Archiver"><mat-icon>archive</mat-icon></button>
              <button mat-icon-button (click)="remove(m)" matTooltip="Supprimer" aria-label="Supprimer"><mat-icon>delete</mat-icon></button>
              <button mat-icon-button (click)="markUnread(m)" matTooltip="Marquer comme non lu" aria-label="Marquer comme non lu"><mat-icon>mark_email_unread</mat-icon></button>
              <button mat-icon-button (click)="star(m)" [matTooltip]="m.starred ? 'Ne plus suivre (S)' : 'Suivre (S)'" aria-label="Suivre"><mat-icon [class.star]="m.starred">{{ m.starred ? 'star' : 'star_border' }}</mat-icon></button>
              <span class="spacer"></span>
              <span class="pos">{{ index() + 1 }} sur {{ messages().length }}</span>
              <button mat-icon-button (click)="step(-1)" [disabled]="index() <= 0" matTooltip="Précédent (K)" aria-label="Message précédent"><mat-icon>chevron_left</mat-icon></button>
              <button mat-icon-button (click)="step(1)" [disabled]="index() >= messages().length - 1" matTooltip="Suivant (J)" aria-label="Message suivant"><mat-icon>chevron_right</mat-icon></button>
            </header>
            <div class="r-body">
              <h2>{{ m.subject }}</h2>
              <div class="r-from">
                <span class="ava" [style.background]="hue(m.from)">{{ initials(m.from) }}</span>
                <span class="grow"><strong>{{ m.from }}</strong><small>{{ m.email }} · à moi</small></span>
                <time>{{ m.at }}</time>
              </div>
              <div class="r-text">@for (p of m.body; track $index) { <p>{{ p }}</p> }</div>
              @if (m.attachments?.length) {
                <div class="files">
                  @for (a of m.attachments; track a) {
                    <a class="file" href="#" (click)="$event.preventDefault()"><img src="assets/icons-files/pdf.png" alt="" /><span><strong>{{ a }}</strong><small>PDF · 248 Ko</small></span><mat-icon>download</mat-icon></a>
                  }
                </div>
              }
            </div>
            <footer class="r-reply">
              <app-comment-composer [author]="me" [placeholder]="'Répondre à ' + m.from.split(' ')[0] + '…'" submitLabel="Envoyer" [maxLength]="2000" compact (submitted)="reply(m)" />
            </footer>
          } @else {
            <div class="r-empty">
              <app-empty-state icon="drafts" title="Aucun message sélectionné" subtitle="Choisissez une conversation dans la liste." />
              <p class="hint"><app-kbd keys="j" /> <app-kbd keys="k" /> pour naviguer · <app-kbd keys="shift+?" /> tous les raccourcis</p>
            </div>
          }
        </article>
      </div>
    </ex-app-shell>
  `,
  styleUrls: ['./inbox-example.component.scss'],
})
export class InboxExampleComponent {
  private snack = inject(MatSnackBar);

  readonly hue = hue;
  readonly initials = initials;
  readonly me = ME;
  readonly folders = [
    { id: 'inbox', label: 'Boîte de réception', icon: 'inbox' },
    { id: 'starred', label: 'Suivis', icon: 'star_border' },
    { id: 'sent', label: 'Envoyés', icon: 'send' },
    { id: 'drafts', label: 'Brouillons', icon: 'drafts' },
    { id: 'archive', label: 'Archives', icon: 'archive' },
  ];
  readonly labels = [...new Map(EX_MESSAGES.filter((m) => m.label).map((m) => [m.label!.text, m.label!])).values()];
  readonly menu: ContextMenuItem[] = [
    { id: 'read', label: 'Marquer comme lu / non lu', icon: 'mark_email_unread' },
    { id: 'star', label: 'Suivre', icon: 'star_border', shortcut: 's' },
    { id: 'archive', label: 'Archiver', icon: 'archive', shortcut: 'e' },
    { divider: true },
    { id: 'delete', label: 'Supprimer', icon: 'delete', danger: true },
  ];

  readonly folder = signal('inbox');
  readonly query = signal('');
  readonly unreadOnly = signal(false);
  readonly all = signal<(ExMessage & { archived?: boolean })[]>(EX_MESSAGES.map((m) => ({ ...m })));
  /** Sur desktop, le premier message est ouvert d'emblée ; sur mobile, on commence par la liste. */
  readonly current = signal<ExMessage | null>(window.innerWidth >= 768 ? this.all()[0] : null);

  readonly folderLabel = computed(() => this.folders.find((f) => f.id === this.folder())!.label);
  readonly unreadCount = computed(() => this.all().filter((m) => m.unread && !m.archived).length);
  readonly messages = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.folder();
    return this.all().filter((m) =>
      (f === 'archive' ? m.archived : !m.archived) && (f !== 'starred' || m.starred) && (f === 'inbox' || f === 'starred' || f === 'archive') &&
      (!this.unreadOnly() || m.unread) && (!q || (m.from + m.subject + m.preview).toLowerCase().includes(q)));
  });
  readonly index = computed(() => this.messages().findIndex((m) => m.id === this.current()?.id));

  constructor() {
    inject(ShortcutService).registerFor(inject(DestroyRef),
      { keys: 'j', description: 'Message suivant', group: 'Messagerie', action: () => this.step(1) },
      { keys: 'k', description: 'Message précédent', group: 'Messagerie', action: () => this.step(-1) },
      { keys: 'e', description: 'Archiver', group: 'Messagerie', action: () => this.current() && this.archive(this.current()!) },
      { keys: 's', description: 'Suivre / ne plus suivre', group: 'Messagerie', action: () => this.current() && this.star(this.current()!) },
    );
  }

  count(folder: string): number {
    if (folder === 'inbox') return this.unreadCount();
    if (folder === 'drafts') return 1;
    return 0;
  }

  open(m: ExMessage): void {
    this.patch(m.id, { unread: false });
    this.current.set({ ...m, unread: false });
  }
  step(d: number): void {
    const list = this.messages();
    const next = list[Math.min(list.length - 1, Math.max(0, this.index() + d))];
    if (next) this.open(next);
  }
  star(m: ExMessage): void { this.patch(m.id, { starred: !m.starred }); this.current.update((c) => (c?.id === m.id ? { ...c, starred: !m.starred } : c)); }
  markUnread(m: ExMessage): void { this.patch(m.id, { unread: true }); this.current.set(null); }
  archive(m: ExMessage): void { this.leave(m, { archived: true }, 'Conversation archivée'); }
  remove(m: ExMessage): void {
    this.all.update((l) => l.filter((x) => x.id !== m.id));
    this.current.set(null);
    this.snack.open('Conversation supprimée', 'OK', { duration: 2500 });
  }
  reply(m: ExMessage): void { this.snack.open(`Réponse envoyée à ${m.from}`, 'OK', { duration: 2500 }); }

  onMenu(m: ExMessage, item: ContextMenuItem): void {
    if (item.id === 'read') this.patch(m.id, { unread: !m.unread });
    if (item.id === 'star') this.star(m);
    if (item.id === 'archive') this.archive(m);
    if (item.id === 'delete') this.remove(m);
  }

  private leave(m: ExMessage, patch: object, msg: string): void {
    const i = this.index();
    this.patch(m.id, patch);
    const list = this.messages();
    this.current.set(list[Math.min(i, list.length - 1)] ?? null);
    this.snack.open(msg, 'OK', { duration: 2500 });
  }
  private patch(id: string, p: object): void { this.all.update((l) => l.map((x) => (x.id === id ? { ...x, ...p } : x))); }
}
