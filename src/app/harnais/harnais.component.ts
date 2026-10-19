import { Component, ElementRef, OnDestroy, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../shared/material.module';
import { CURRENT_USER } from '../data/static/session.data';
import { ThemeService } from '../core/services/theme.service';
import { ThemePickerComponent } from '../shared/components/theme-picker/theme-picker.component';
import { HARNAIS_ARTIFACTS, HARNAIS_MODELS, HARNAIS_SUGGESTIONS } from '../data/static/harnais.data';
import { HarnaisMessageComponent } from './components/message/message.component';
import { HarnaisComposerComponent } from './components/composer/composer.component';
import { HarnaisConversationListComponent } from './components/conversation-list/conversation-list.component';
import { HarnaisPanelTab, HarnaisSidePanelComponent } from './components/side-panel/side-panel.component';
import { HarnaisSendEvent, HarnaisStore } from './harnais.store';
import { copyText } from './harnais.utils';

/**
 * Harnais : module autonome (route racine /harnais, hors du shell /main) — interface conversationnelle façon assistant IA.
 * Trois colonnes — historique · fil + saisie · panneau (artefact / contexte / tâches).
 * Les réponses sont simulées localement par `HarnaisStore`, sans aucun appel réseau.
 */
@Component({
  selector: 'app-harnais',
  standalone: true,
  imports: [RouterLink, MaterialModule, HarnaisMessageComponent, HarnaisComposerComponent, HarnaisConversationListComponent, HarnaisSidePanelComponent, ThemePickerComponent],
  templateUrl: './harnais.component.html',
  styleUrls: ['./harnais.component.scss'],
  host: { '(document:keydown)': 'onShortcut($event)' },
})
export class HarnaisComponent implements OnDestroy {
  /** Identifiant de conversation issu de l'URL (/harnais/:id). */
  readonly id = input<string>();

  readonly store = inject(HarnaisStore);
  readonly theme = inject(ThemeService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private breakpoints = inject(BreakpointObserver);

  readonly models = HARNAIS_MODELS;
  readonly suggestions = HARNAIS_SUGGESTIONS;
  readonly firstName = CURRENT_USER.prenoms;
  readonly greeting = new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir';

  /** Modèle de la prochaine conversation (une conversation existante garde le sien). */
  readonly draftModel = signal('opus');

  readonly compact = toSignal(this.breakpoints.observe('(max-width: 959.98px)').pipe(map((r) => r.matches)), { initialValue: false });
  readonly narrow = toSignal(this.breakpoints.observe('(max-width: 1279.98px)').pipe(map((r) => r.matches)), { initialValue: false });

  readonly leftOpen = signal(true);
  readonly rightOpen = signal(false);
  readonly panelTab = signal<HarnaisPanelTab>('artifact');
  readonly artifactId = signal<string | null>(null);

  readonly active = computed(() => this.store.find(this.id()));
  readonly messages = computed(() => this.active()?.messages ?? []);
  readonly modelId = computed(() => this.active()?.model ?? this.draftModel());
  readonly generating = computed(() => this.store.generatingId() !== null);
  readonly lastAssistantId = computed(() => [...this.messages()].reverse().find((m) => m.role === 'assistant')?.id);

  /** Artefacts cités dans la conversation active. */
  readonly artifacts = computed(() => {
    const ids = new Set(this.messages().flatMap((m) => m.blocks.flatMap((b) => (b.type === 'artifact' ? [b.artifactId] : []))));
    return HARNAIS_ARTIFACTS.filter((a) => ids.has(a.id));
  });

  private thread = viewChild<ElementRef<HTMLElement>>('thread');
  private composer = viewChild(HarnaisComposerComponent);

  constructor() {
    // Volets en superposition sur petits écrans : fermés par défaut.
    effect(() => { const compact = this.compact(); untracked(() => this.leftOpen.set(!compact)); });
    effect(() => { if (this.narrow()) untracked(() => this.rightOpen.set(false)); });

    // Changement de conversation : on repart en bas du fil, panneau sur le premier artefact.
    effect(() => {
      this.id();
      untracked(() => { this.artifactId.set(null); this.scrollToBottom(false); });
    });

    this.store.onProgress = () => this.scrollToBottom();
  }

  ngOnDestroy(): void { this.store.onProgress = () => undefined; }

  // ─── Navigation ─────────────────────────────────────────────
  open(id: string): void {
    this.router.navigate(['/harnais', id]);
    if (this.compact()) this.leftOpen.set(false);
  }

  newConversation(): void {
    this.router.navigate(['/harnais']);
    if (this.compact()) this.leftOpen.set(false);
  }

  remove(id: string): void {
    this.store.remove(id);
    if (this.id() === id) this.router.navigate(['/harnais']);
    this.snack.open('Conversation supprimée', undefined, { duration: 2000 });
  }

  onShortcut(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.newConversation();
    }
  }

  setModel(model: string): void {
    const conv = this.active();
    if (conv) this.store.setModel(conv.id, model);
    else this.draftModel.set(model);
  }

  suggest(prompt: string): void { this.composer()?.fill(prompt); }

  // ─── Panneau droit ──────────────────────────────────────────
  openArtifact(id: string): void {
    this.artifactId.set(id);
    this.panelTab.set('artifact');
    this.rightOpen.set(true);
  }

  copy(text: string): void {
    copyText(text);
    this.snack.open('Copié dans le presse-papiers', undefined, { duration: 1600 });
  }

  // ─── Échanges ───────────────────────────────────────────────
  send(e: HarnaisSendEvent): void {
    let conv = this.active();
    if (!conv) {
      conv = this.store.create(e.text, this.draftModel());
      this.router.navigate(['/harnais', conv.id]);
    }
    this.store.send(conv.id, e);
    this.scrollToBottom(false);
  }

  /** Défile en bas du fil — seulement si l'utilisateur y était déjà, pour ne pas le déranger s'il relit. */
  private scrollToBottom(onlyIfNear = true): void {
    requestAnimationFrame(() => {
      const el = this.thread()?.nativeElement;
      if (!el) return;
      const near = el.scrollHeight - el.scrollTop - el.clientHeight < 180;
      if (!onlyIfNear || near) el.scrollTo({ top: el.scrollHeight, behavior: onlyIfNear ? 'smooth' : 'auto' });
    });
  }
}
