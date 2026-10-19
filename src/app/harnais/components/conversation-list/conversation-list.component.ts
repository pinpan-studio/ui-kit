import { Component, computed, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { HARNAIS_GROUPS, HarnaisConversation } from '../../../data/static/harnais.data';
import { CURRENT_USER } from '../../../data/static/session.data';

/** Colonne gauche : nouvelle conversation, recherche, épinglées, historique groupé par période, utilisateur. */
@Component({
  selector: 'app-harnais-conversation-list',
  standalone: true,
  imports: [NgTemplateOutlet, MaterialModule],
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.scss'],
})
export class HarnaisConversationListComponent {
  readonly conversations = input.required<HarnaisConversation[]>();
  readonly activeId = input<string | null>(null);

  readonly select = output<string>();
  readonly create = output<void>();
  readonly togglePin = output<string>();
  readonly remove = output<string>();
  readonly collapse = output<void>();

  readonly query = signal('');
  readonly user = CURRENT_USER;
  readonly initials = (CURRENT_USER.prenoms[0] + CURRENT_USER.nom[0]).toUpperCase();

  private readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.conversations().filter((c) => c.title.toLowerCase().includes(q)) : this.conversations();
  });

  readonly pinned = computed(() => this.filtered().filter((c) => c.pinned));
  readonly groups = computed(() =>
    HARNAIS_GROUPS
      .map((label) => ({ label, items: this.filtered().filter((c) => !c.pinned && c.group === label) }))
      .filter((g) => g.items.length > 0));
  readonly empty = computed(() => this.filtered().length === 0);
}
