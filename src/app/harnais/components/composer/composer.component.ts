import { Component, ElementRef, computed, input, model, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MaterialModule } from '../../../shared/material.module';
import { HARNAIS_ATTACHABLE, HarnaisAttachment, HarnaisModel } from '../../../data/static/harnais.data';
import { HarnaisSendEvent } from '../../harnais.store';

/** Zone de saisie : texte auto-extensible, pièces jointes, outils, choix du modèle, envoi / arrêt. */
@Component({
  selector: 'app-harnais-composer',
  standalone: true,
  imports: [FormsModule, TextFieldModule, MaterialModule],
  templateUrl: './composer.component.html',
  styleUrls: ['./composer.component.scss'],
})
export class HarnaisComposerComponent {
  readonly models = input.required<HarnaisModel[]>();
  readonly modelId = model.required<string>();
  readonly generating = input(false);
  readonly placeholder = input('Écrivez votre message…');

  readonly send = output<HarnaisSendEvent>();
  readonly stop = output<void>();

  readonly attachable = HARNAIS_ATTACHABLE;
  readonly draft = signal('');
  readonly attachments = signal<HarnaisAttachment[]>([]);
  readonly extendedThinking = signal(true);
  readonly webSearch = signal(false);

  readonly currentModel = computed(() => this.models().find((m) => m.id === this.modelId()) ?? this.models()[0]);
  readonly canSend = computed(() => !this.generating() && (this.draft().trim().length > 0 || this.attachments().length > 0));

  private textarea = viewChild<ElementRef<HTMLTextAreaElement>>('field');

  /** Pré-remplit la saisie (suggestions) et place le curseur à la fin. */
  fill(text: string): void {
    this.draft.set(text);
    queueMicrotask(() => {
      const el = this.textarea()?.nativeElement;
      if (!el) return;
      el.focus();
      el.setSelectionRange(text.length, text.length);
    });
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      this.submit();
    }
  }

  submit(): void {
    if (!this.canSend()) return;
    this.send.emit({
      text: this.draft().trim(),
      attachments: this.attachments(),
      extendedThinking: this.extendedThinking(),
      webSearch: this.webSearch(),
    });
    this.draft.set('');
    this.attachments.set([]);
  }

  attach(file: HarnaisAttachment): void {
    if (this.attachments().some((a) => a.name === file.name)) return;
    this.attachments.update((list) => [...list, file]);
  }

  detach(name: string): void {
    this.attachments.update((list) => list.filter((a) => a.name !== name));
  }

  isAttached = (name: string) => this.attachments().some((a) => a.name === name);
  attachmentIcon = (kind: string) => ({ code: 'code', image: 'image', pdf: 'picture_as_pdf', sheet: 'table_chart' }[kind] ?? 'insert_drive_file');
}
