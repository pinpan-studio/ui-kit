import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { ExChatListComponent } from './ex-chat-list.component';
import { ExChatThreadComponent } from './ex-chat-thread.component';
import { ExChatService } from './ex-chat.service';

/**
 * Messagerie dans la sidenav droite du shell : liste des conversations, puis conversation ouverte
 * (retour à la liste, appel, passage en plein écran) avec le même fil que la page /examples/app/chat.
 */
@Component({
  selector: 'ex-chat-panel',
  standalone: true,
  imports: [RouterLink, MaterialModule, ExChatListComponent, ExChatThreadComponent],
  template: `
    <div class="panel">
      @if (conv(); as c) {
        <header class="ph conv">
          <button mat-icon-button (click)="chat.panelConv.set(null)" aria-label="Retour aux conversations"><mat-icon>arrow_back</mat-icon></button>
          @if (c.kind === 'direct') {
            <span class="ava" [style.background]="chat.peer(c)!.color">{{ initials(chat.title(c)) }}@if (chat.peer(c)!.online) { <i></i> }</span>
          } @else { <span class="ava grp" [style.background]="c.color"><mat-icon>{{ c.icon }}</mat-icon></span> }
          <span class="who"><strong>{{ c.kind === 'channel' ? '# ' : '' }}{{ chat.title(c) }}</strong>
            <small>{{ c.typing ? chat.person(c.typing).name.split(' ')[0] + ' écrit…' : c.kind === 'direct' ? (chat.peer(c)!.online ? 'En ligne' : 'Hors ligne') : c.members.length + ' membres' }}</small></span>
          <button mat-icon-button matTooltip="Appel" aria-label="Appel"><mat-icon>call</mat-icon></button>
          <button mat-icon-button matTooltip="Ouvrir en plein écran" aria-label="Ouvrir en plein écran" (click)="full(c.id)"><mat-icon>open_in_full</mat-icon></button>
        </header>
        <ex-chat-thread [convId]="c.id" compact />
      } @else {
        <header class="ph">
          <strong>Messages</strong>@if (chat.totalUnread()) { <span class="n">{{ chat.totalUnread() }}</span> }
          <span class="spacer"></span>
          <button mat-icon-button [matMenuTriggerFor]="newMenu" matTooltip="Nouvelle conversation" aria-label="Nouvelle conversation"><mat-icon>edit_square</mat-icon></button>
          <mat-menu #newMenu="matMenu" class="m3-dropdown-menu">
            @for (p of contacts; track p.id) { <button mat-menu-item (click)="chat.panelConv.set(chat.startDirect(p.id))"><mat-icon>person</mat-icon>{{ p.name }}</button> }
          </mat-menu>
          <a mat-icon-button routerLink="/examples/app/chat" matTooltip="Ouvrir la messagerie" aria-label="Ouvrir la messagerie" (click)="chat.panelOpen.set(false)"><mat-icon>open_in_full</mat-icon></a>
          <button mat-icon-button (click)="chat.panelOpen.set(false)" aria-label="Fermer"><mat-icon>close</mat-icon></button>
        </header>
        <ex-chat-list compact [selected]="null" (pick)="chat.panelConv.set($event)" />
      }
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; min-height: 0; }
    .panel { flex: 1; min-height: 0; display: flex; flex-direction: column; }
    .ph { flex: 0 0 auto; display: flex; align-items: center; gap: 6px; min-height: 60px; padding: 8px 8px 8px 16px; box-sizing: border-box;
      > strong { font: 600 var(--fs-h4) var(--font-heading); }
      .n { min-width: 20px; padding: 0 6px; box-sizing: border-box; border-radius: 10px; background: var(--primary-color); color: var(--mat-sys-on-primary, #fff); font-size: 11px; font-weight: 700; line-height: 20px; text-align: center; }
      .spacer { flex: 1; }
      &.conv { padding-left: 4px; gap: 8px; } }
    .ava { position: relative; width: 36px; height: 36px; flex: 0 0 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; font: 600 12px var(--font-body);
      i { position: absolute; right: -1px; bottom: -1px; width: 10px; height: 10px; border-radius: 50%; background: var(--success-color); box-shadow: 0 0 0 2px var(--mat-sys-surface-container-low, var(--card-bg)); }
      &.grp { border-radius: 10px; mat-icon { font-size: 20px; width: 20px; height: 20px; } } }
    .who { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3;
      strong { font-size: var(--fs-body); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } small { font-size: var(--fs-caption); color: var(--text-muted); } }
  `],
})
export class ExChatPanelComponent {
  readonly chat = inject(ExChatService);
  private router = inject(Router);
  readonly conv = computed(() => this.chat.conv(this.chat.panelConv()));
  readonly contacts = this.chat.people.filter((p) => p.id !== 'me');

  constructor() { this.chat.ensure(); }

  initials(n: string): string { return n.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(); }
  full(id: string): void {
    this.chat.panelOpen.set(false);
    void this.router.navigate(['/examples/app/chat'], { queryParams: { c: id } });
  }
}
