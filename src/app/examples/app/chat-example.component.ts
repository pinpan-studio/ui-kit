import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { FileViewerService } from '../../shared/components/media';
import { ExAppShellComponent } from './ex-app-shell.component';
import { ExChatListComponent } from './chat/ex-chat-list.component';
import { ExChatThreadComponent } from './chat/ex-chat-thread.component';
import { ChatAttachment, ExChatService, ME_ID } from './chat/ex-chat.service';
import { FM_KINDS, fmSize } from './files/ex-files.service';

/**
 * /examples/app/chat — messagerie plein écran : conversations (recherche, filtres, épinglées), discussion
 * (même fil que le panneau latéral), panneau de détails (membres, médias et fichiers partagés, réglages).
 * Mobile : une colonne à la fois (liste → discussion → détails).
 */
@Component({
  selector: 'app-chat-example',
  standalone: true,
  imports: [MaterialModule, ExAppShellComponent, ExChatListComponent, ExChatThreadComponent],
  template: `
    <ex-app-shell title="Messagerie instantanée" crumb="Communication" [flush]="true" [chatButton]="false">
      <div class="chat" [class.has-conv]="current()" [class.info-open]="info() && current()">
        <aside class="list">
          <header class="lh"><h1>Discussions</h1>
            <button mat-icon-button [matMenuTriggerFor]="newMenu" matTooltip="Nouvelle conversation" aria-label="Nouvelle conversation"><mat-icon>edit_square</mat-icon></button>
            <mat-menu #newMenu="matMenu" class="m3-dropdown-menu">
              @for (p of contacts; track p.id) { <button mat-menu-item (click)="select(chat.startDirect(p.id))"><mat-icon>person</mat-icon>{{ p.name }}</button> }
            </mat-menu>
          </header>
          <ex-chat-list [selected]="currentId()" (pick)="select($event)" />
        </aside>

        <section class="main">
          @if (current(); as c) {
            <header class="mh">
              <button mat-icon-button class="back" (click)="currentId.set(null)" aria-label="Retour"><mat-icon>arrow_back</mat-icon></button>
              <button type="button" class="who" (click)="info.set(!info())">
                @if (c.kind === 'direct') {
                  <span class="ava" [style.background]="chat.peer(c)!.color">{{ initials(chat.title(c)) }}@if (chat.peer(c)!.online) { <i></i> }</span>
                } @else { <span class="ava grp" [style.background]="c.color"><mat-icon>{{ c.icon }}</mat-icon></span> }
                <span class="txt"><strong>{{ c.kind === 'channel' ? '# ' : '' }}{{ chat.title(c) }}</strong>
                  <small [class.typing]="c.typing">{{ status() }}</small></span>
              </button>
              <span class="spacer"></span>
              <button mat-icon-button (click)="call('vocal')" matTooltip="Appel vocal" aria-label="Appel vocal"><mat-icon>call</mat-icon></button>
              <button mat-icon-button (click)="call('vidéo')" matTooltip="Appel vidéo" aria-label="Appel vidéo"><mat-icon>videocam</mat-icon></button>
              <button mat-icon-button [class.on]="info()" (click)="info.set(!info())" matTooltip="Détails" aria-label="Détails"><mat-icon>info</mat-icon></button>
            </header>
            <ex-chat-thread [convId]="c.id" />
          } @else {
            <div class="placeholder"><mat-icon>forum</mat-icon><h2>Vos discussions</h2><p>Sélectionnez une conversation ou démarrez-en une nouvelle.</p></div>
          }
        </section>

        @if (info() && current(); as c) {
          <aside class="info">
            <header class="ih"><button mat-icon-button class="back" (click)="info.set(false)" aria-label="Fermer les détails"><mat-icon>close</mat-icon></button><strong>Détails</strong></header>
            <div class="profile">
              @if (c.kind === 'direct') { <span class="ava xl" [style.background]="chat.peer(c)!.color">{{ initials(chat.title(c)) }}</span> }
              @else { <span class="ava xl grp" [style.background]="c.color"><mat-icon>{{ c.icon }}</mat-icon></span> }
              <h2>{{ c.kind === 'channel' ? '# ' : '' }}{{ chat.title(c) }}</h2>
              <small>{{ c.kind === 'direct' ? chat.peer(c)!.role + ' · ' + (chat.peer(c)!.online ? 'en ligne' : 'hors ligne') : c.members.length + ' membres' }}</small>
              @if (c.description) { <p>{{ c.description }}</p> }
              <div class="quick">
                <button type="button" (click)="call('vocal')"><mat-icon>call</mat-icon>Appeler</button>
                <button type="button" (click)="chat.toggleMute(c.id)"><mat-icon>{{ c.muted ? 'notifications_off' : 'notifications' }}</mat-icon>{{ c.muted ? 'Réactiver' : 'Sourdine' }}</button>
                <button type="button" (click)="chat.togglePin(c.id)"><mat-icon>push_pin</mat-icon>{{ c.pinned ? 'Désépingler' : 'Épingler' }}</button>
              </div>
            </div>
            @if (c.kind !== 'direct') {
              <section><h3>Membres · {{ c.members.length }}</h3>
                @for (m of c.members; track m) {
                  <div class="member"><span class="ava sm" [style.background]="chat.person(m).color">{{ initials(chat.person(m).name) }}@if (chat.person(m).online) { <i></i> }</span>
                    <span><strong>{{ m === me ? 'Vous' : chat.person(m).name }}</strong><small>{{ chat.person(m).role }}</small></span></div>
                }
              </section>
            }
            <section><h3>Médias · {{ media().length }}</h3>
              @if (media().length) {
                <div class="media">@for (a of media().slice(0, 9); track a.id) { <button type="button" (click)="open(media(), a)"><img [src]="a.url" [alt]="a.name" /></button> }</div>
              } @else { <p class="none">Aucun média partagé.</p> }
            </section>
            <section><h3>Fichiers · {{ docs().length }}</h3>
              @for (a of docs(); track a.id) {
                <button type="button" class="doc" (click)="open(docs(), a)"><img [src]="'assets/icons-files/' + kinds[a.kind].img" alt="" /><span><strong>{{ a.name }}</strong><small>{{ size(a.size) }}</small></span></button>
              } @empty { <p class="none">Aucun fichier partagé.</p> }
            </section>
          </aside>
        }
      </div>
    </ex-app-shell>
  `,
  styleUrls: ['./chat-example.component.scss'],
})
export class ChatExampleComponent {
  readonly chat = inject(ExChatService);
  private viewer = inject(FileViewerService);
  private snack = inject(MatSnackBar);
  readonly me = ME_ID;
  readonly kinds = FM_KINDS;
  readonly size = fmSize;
  readonly contacts = this.chat.people.filter((p) => p.id !== ME_ID);

  readonly currentId = signal<string | null>(null);
  readonly info = signal(window.innerWidth >= 1500);
  readonly current = computed(() => this.chat.conv(this.currentId()));
  readonly status = computed(() => {
    const c = this.current();
    if (!c) return '';
    if (c.typing) return this.chat.person(c.typing).name.split(' ')[0] + ' est en train d’écrire…';
    if (c.kind === 'direct') return this.chat.peer(c)!.online ? 'En ligne' : 'Vu aujourd’hui à 09:12';
    const online = c.members.filter((m) => this.chat.person(m).online).length;
    return `${c.members.length} membres · ${online} en ligne`;
  });
  private readonly shared = computed(() => (this.current()?.messages ?? []).flatMap((m) => m.attachments ?? []));
  readonly media = computed(() => this.shared().filter((a) => a.kind === 'image' && a.url));
  readonly docs = computed(() => this.shared().filter((a) => !(a.kind === 'image' && a.url)));

  constructor() {
    this.chat.ensure();
    const q = inject(ActivatedRoute).snapshot.queryParamMap.get('c');
    this.currentId.set(q && this.chat.conv(q) ? q : window.innerWidth >= 768 ? 'c-aya' : null);
    // La page visible ne doit pas accumuler de non-lus sur la conversation ouverte.
    effect(() => { this.chat.activePage = this.currentId(); });
    inject(DestroyRef).onDestroy(() => (this.chat.activePage = null));
  }

  select(id: string): void { this.currentId.set(id); }
  initials(n: string): string { return n.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(); }
  call(kind: string): void { this.snack.open(`Appel ${kind} avec ${this.chat.title(this.current()!)} (exemple statique)`, 'Raccrocher', { duration: 3000 }); }
  open(list: ChatAttachment[], a: ChatAttachment): void {
    const ok = list.filter((x) => x.url);
    if (!a.url) return;
    this.viewer.open(ok.map((x) => ({ name: x.name, url: x.url!, type: x.mime, size: x.size, blob: x.blob })), ok.indexOf(a));
  }
}
