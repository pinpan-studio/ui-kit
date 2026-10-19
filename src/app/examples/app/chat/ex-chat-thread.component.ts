import { Component, DestroyRef, ElementRef, booleanAttribute, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material.module';
import { AudioPlayerComponent, FileViewerService } from '../../../shared/components/media';
import { buildSampleWav } from '../../../data/static/media.data';
import { markdownInline } from '../../../shared/utils/markdown.util';
import { ExFilesService, FM_KINDS, fmSize } from '../files/ex-files.service';
import { openFilePicker } from '../files/ex-file-picker.dialog';
import { ChatAttachment, ChatMessage, ExChatService, ME_ID } from './ex-chat.service';

interface Row { kind: 'day'; label: string; key: string }
interface MsgRow { kind: 'msg'; m: ChatMessage; key: string; first: boolean; last: boolean; mine: boolean }

const EMOJIS = ['👍', '❤️', '😂', '🎉', '😮', '🙏', '👏', '🔥', '✅', '👀', '😅', '🙌', '💯', '🚀', '😢', '🤝'];
const QUICK = ['👍', '❤️', '😂', '🎉', '🙏'];

/**
 * Fil de discussion + zone de saisie, partagé par le panneau latéral et la page plein écran :
 * séparateurs de jours, regroupement des messages consécutifs, réponses citées, réactions, pièces jointes
 * (images en mosaïque, fichiers), notes vocales, accusés de lecture, « en train d'écrire » ; saisie avec
 * emojis, pièces jointes (ordinateur ou sélecteur de fichiers), note vocale simulée, Entrée pour envoyer.
 */
@Component({
  selector: 'ex-chat-thread',
  standalone: true,
  imports: [DatePipe, MaterialModule, AudioPlayerComponent],
  templateUrl: './ex-chat-thread.component.html',
  styleUrls: ['./ex-chat-thread.component.scss'],
  host: { '[class.compact]': 'compact()' },
})
export class ExChatThreadComponent {
  readonly chat = inject(ExChatService);
  private files = inject(ExFilesService);
  private viewer = inject(FileViewerService);
  private dialog = inject(MatDialog);
  private scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private field = viewChild<ElementRef<HTMLTextAreaElement>>('field');

  convId = input.required<string>();
  /** Variante resserrée (panneau latéral). */
  compact = input(false, { transform: booleanAttribute });

  readonly me = ME_ID;
  readonly emojis = EMOJIS;
  readonly quick = QUICK;
  readonly kinds = FM_KINDS;
  readonly size = fmSize;
  readonly md = markdownInline;

  readonly draft = signal('');
  readonly pending = signal<ChatAttachment[]>([]);
  readonly replyTo = signal<ChatMessage | null>(null);
  readonly recording = signal(0);
  readonly recLabel = computed(() => { const s = Math.max(0, this.recording() - 1); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; });
  private recTimer?: ReturnType<typeof setInterval>;

  readonly conv = computed(() => this.chat.conv(this.convId()));
  readonly rows = computed<(Row | MsgRow)[]>(() => {
    const msgs = this.conv()?.messages ?? [];
    const out: (Row | MsgRow)[] = [];
    let day = '';
    msgs.forEach((m, i) => {
      const d = this.dayLabel(m.at);
      if (d !== day) { out.push({ kind: 'day', label: d, key: 'd' + m.id }); day = d; }
      const prev = msgs[i - 1], next = msgs[i + 1];
      const near = (a?: ChatMessage, b?: ChatMessage) => !!a && !!b && a.from === b.from && !a.system && !b.system && Math.abs(+a.at - +b.at) < 5 * 60_000 && this.dayLabel(a.at) === this.dayLabel(b.at);
      out.push({ kind: 'msg', m, key: m.id, first: !near(prev, m), last: !near(m, next), mine: m.from === ME_ID });
    });
    return out;
  });
  readonly typing = computed(() => (this.conv()?.typing ? this.chat.person(this.conv()!.typing!) : null));
  readonly canSend = computed(() => !!this.draft().trim() || this.pending().length > 0);

  constructor() {
    // Descend en bas à l'ouverture et à chaque nouveau message ; marque la conversation comme lue.
    effect(() => {
      const id = this.convId();
      this.rows(); this.typing();
      untracked(() => this.chat.markRead(id));
      queueMicrotask(() => { const el = this.scroller()?.nativeElement; if (el) el.scrollTop = el.scrollHeight; });
    });
    effect(() => { this.convId(); untracked(() => { this.draft.set(''); this.pending.set([]); this.replyTo.set(null); }); });
    inject(DestroyRef).onDestroy(() => clearInterval(this.recTimer));
  }

  // ─── Affichage ───────────────────────────────────────────────
  person(id: string) { return this.chat.person(id); }
  initials(name: string): string { return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(); }
  quoted(id?: string): ChatMessage | undefined { return id ? this.conv()?.messages.find((m) => m.id === id) : undefined; }
  images(m: ChatMessage): ChatAttachment[] { return m.attachments?.filter((a) => a.kind === 'image' && a.url) ?? []; }
  others(m: ChatMessage): ChatAttachment[] { return m.attachments?.filter((a) => !(a.kind === 'image' && a.url)) ?? []; }
  mine(r: { by: string[] }): boolean { return r.by.includes(ME_ID); }
  reactors(r: { by: string[] }): string { return r.by.map((b) => (b === ME_ID ? 'Vous' : this.person(b).name.split(' ')[0])).join(', '); }
  isGroup(): boolean { return this.conv()?.kind !== 'direct'; }

  private dayLabel(d: Date): string {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const x = new Date(d); x.setHours(0, 0, 0, 0);
    const diff = Math.round((+today - +x) / 86_400_000);
    return diff === 0 ? 'Aujourd’hui' : diff === 1 ? 'Hier' : d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  // ─── Actions sur un message ──────────────────────────────────
  react(m: ChatMessage, e: string): void { this.chat.toggleReaction(this.convId(), m.id, e); }
  reply(m: ChatMessage): void { this.replyTo.set(m); this.field()?.nativeElement.focus(); }
  copy(m: ChatMessage): void { void navigator.clipboard?.writeText(m.text ?? '').catch(() => undefined); }
  remove(m: ChatMessage): void { this.chat.remove(this.convId(), m.id); }
  open(list: ChatAttachment[], a: ChatAttachment): void {
    const ok = list.filter((x) => x.url);
    if (!a.url) return;
    this.viewer.open(ok.map((x) => ({ name: x.name, url: x.url!, type: x.mime, size: x.size, blob: x.blob })), ok.indexOf(a));
  }

  // ─── Saisie ──────────────────────────────────────────────────
  onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); this.send(); }
    if (e.key === 'Escape' && this.replyTo()) this.replyTo.set(null);
  }
  autosize(el: HTMLTextAreaElement): void { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 140) + 'px'; }
  insertEmoji(e: string): void {
    const el = this.field()?.nativeElement;
    const v = this.draft();
    const at = el?.selectionStart ?? v.length;
    this.draft.set(v.slice(0, at) + e + v.slice(el?.selectionEnd ?? at));
    queueMicrotask(() => { el?.focus(); el?.setSelectionRange(at + e.length, at + e.length); });
  }
  attachLocal(list: FileList | null): void {
    if (!list?.length) return;
    const added = this.files.addFiles(list, null).map((i) => ({ id: i.id, kind: i.kind, name: i.name, size: i.size, url: i.url, mime: i.mime, blob: i.blob }));
    this.pending.update((l) => [...l, ...added]);
  }
  attachFromDrive(): void {
    openFilePicker(this.dialog, { title: 'Envoyer des fichiers', confirmLabel: 'Joindre' }).subscribe((items) => {
      if (items?.length) this.pending.update((l) => [...l, ...items.filter((i) => !l.some((x) => x.id === i.id)).map((i) => ({ id: i.id, kind: i.kind, name: i.name, size: i.size, url: i.url, mime: i.mime, blob: i.blob }))]);
    });
  }
  unattach(a: ChatAttachment): void { this.pending.update((l) => l.filter((x) => x.id !== a.id)); }

  send(): void {
    if (!this.canSend()) return;
    this.chat.send(this.convId(), this.draft(), this.pending(), this.replyTo()?.id);
    this.draft.set(''); this.pending.set([]); this.replyTo.set(null);
    const el = this.field()?.nativeElement; if (el) { el.style.height = 'auto'; el.focus(); }
  }

  /** Note vocale simulée : chronomètre, puis envoi d'un son généré localement. */
  toggleRecord(): void {
    if (!this.recording()) {
      this.recording.set(1);
      this.recTimer = setInterval(() => this.recording.update((s) => s + 1), 1000);
      return;
    }
    clearInterval(this.recTimer);
    const secs = Math.max(2, this.recording());
    this.recording.set(0);
    const blob = buildSampleWav(secs, secs);
    this.chat.send(this.convId(), '', [], this.replyTo()?.id, { src: URL.createObjectURL(blob), blob, duration: secs });
    this.replyTo.set(null);
  }
  cancelRecord(): void { clearInterval(this.recTimer); this.recording.set(0); }
}
