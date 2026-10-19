import { Component, computed, input, output, signal } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { HARNAIS_WIDGET_TYPES, HarnaisArtifact, HarnaisBlock, HarnaisMessage, HarnaisToolKind, HzOption } from '../../../data/static/harnais.data';
import { HzWidgetComponent } from '../widgets/widget.component';
import { inlineSegments } from '../../harnais.utils';

const TOOL_ICONS: Record<HarnaisToolKind, string> = {
  read: 'description', search: 'search', bash: 'terminal', edit: 'edit_note', web: 'travel_explore',
};

type ToolBlock = Extract<HarnaisBlock, { type: 'tool' }>;
type BlockGroup =
  | { kind: 'tools'; start: number; items: ToolBlock[] }
  | { kind: 'block'; index: number; block: HarnaisBlock };

/** Un message du fil : bulle pour l'utilisateur, blocs riches (réflexion, outils, code, artefact) pour l'assistant. */
@Component({
  selector: 'app-harnais-message',
  standalone: true,
  imports: [MaterialModule, HzWidgetComponent],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class HarnaisMessageComponent {
  readonly message = input.required<HarnaisMessage>();
  readonly artifacts = input<HarnaisArtifact[]>([]);
  /** Dernière réponse du fil : seule à proposer « Régénérer ». */
  readonly last = input(false);

  readonly openArtifact = output<string>();
  readonly feedback = output<'up' | 'down'>();
  readonly retry = output<void>();
  readonly copy = output<string>();
  /** Un widget interactif a été utilisé (formulaire envoyé, choix rapide). */
  readonly formSubmit = output<{ index: number; values: Record<string, unknown> }>();
  readonly choose = output<{ index: number; option: HzOption }>();
  /** L'agent génère : les widgets interactifs sont gelés. */
  readonly busy = input(false);

  readonly toolIcons = TOOL_ICONS;
  readonly segments = inlineSegments;
  /** Blocs dépliés (index de bloc). */
  readonly expanded = signal<Set<number>>(new Set());

  /** Outils consécutifs regroupés en une seule carte « étapes ». */
  readonly groups = computed(() => {
    const out: BlockGroup[] = [];
    this.message().blocks.forEach((block, i) => {
      const prev = out[out.length - 1];
      if (block.type === 'tool') {
        if (prev?.kind === 'tools') prev.items.push(block);
        else out.push({ kind: 'tools', start: i, items: [block] });
      } else {
        out.push({ kind: 'block', index: i, block });
      }
    });
    return out;
  });

  readonly plainText = computed(() =>
    this.message().blocks.map((b) => {
      switch (b.type) {
        case 'text': return b.text;
        case 'list': return b.items.map((i) => '• ' + i).join('\n');
        case 'code': return b.code;
        default: return '';
      }
    }).filter(Boolean).join('\n\n'));

  isOpen = (i: number) => this.expanded().has(i);
  toggle(i: number): void {
    this.expanded.update((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  isWidget = (b: HarnaisBlock) => HARNAIS_WIDGET_TYPES.has(b.type);
  artifact = (id: string) => this.artifacts().find((a) => a.id === id);
  runningTools = (items: { status: string }[]) => items.some((t) => t.status === 'running');

  attachmentIcon = (kind: string) => ({ code: 'code', image: 'image', pdf: 'picture_as_pdf', sheet: 'table_chart' }[kind] ?? 'insert_drive_file');
}
