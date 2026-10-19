import { Component, booleanAttribute, computed, inject, input, output, signal } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { ExChatService, ME_ID } from './ex-chat.service';

type Filter = 'all' | 'unread' | 'groups';

/** Liste des conversations : recherche, filtres, épinglées en tête, présence, aperçu, heure, non-lus, « écrit… ». */
@Component({
  selector: 'ex-chat-list',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './ex-chat-list.component.html',
  styleUrls: ['./ex-chat-list.component.scss'],
  host: { '[class.compact]': 'compact()' },
})
export class ExChatListComponent {
  readonly chat = inject(ExChatService);
  selected = input<string | null>(null);
  compact = input(false, { transform: booleanAttribute });
  pick = output<string>();

  readonly me = ME_ID;
  readonly q = signal('');
  readonly filter = signal<Filter>('all');
  readonly filters: { id: Filter; label: string }[] = [{ id: 'all', label: 'Tous' }, { id: 'unread', label: 'Non lus' }, { id: 'groups', label: 'Groupes' }];

  private readonly list = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.chat.conversations()
      .filter((c) => (this.filter() !== 'unread' || c.unread) && (this.filter() !== 'groups' || c.kind !== 'direct'))
      .filter((c) => !q || this.chat.title(c).toLowerCase().includes(q) || c.messages.some((m) => m.text?.toLowerCase().includes(q)))
      .sort((a, b) => +(this.chat.last(b)?.at ?? 0) - +(this.chat.last(a)?.at ?? 0));
  });
  readonly groups = computed(() => [
    { label: 'Épinglées', items: this.list().filter((c) => c.pinned) },
    { label: 'Conversations', items: this.list().filter((c) => !c.pinned) },
  ]);
  readonly count = computed(() => this.list().length);

  initials(n: string): string { return n.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(); }
  when(d?: Date): string {
    if (!d) return '';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (d >= today) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const y = new Date(today); y.setDate(y.getDate() - 1);
    if (d >= y) return 'Hier';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
