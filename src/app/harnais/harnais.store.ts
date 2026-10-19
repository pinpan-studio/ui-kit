import { Injectable, signal } from '@angular/core';
import {
  HARNAIS_ANSWERABLE, HARNAIS_CONVERSATIONS, HarnaisAttachment, HarnaisBlock, HarnaisConversation, HarnaisMessage, HzOption,
} from '../data/static/harnais.data';
import { DEMO_CONVERSATION, KIT_CONVERSATION, ScenarioReply, TOOLKIT_CONVERSATION, answerFollowUp, describeValue, detectIntent, formFollowUp, scenarioFor } from './harnais.scenarios';

export interface HarnaisSendEvent {
  text: string;
  attachments: HarnaisAttachment[];
  extendedThinking: boolean;
  webSearch: boolean;
}

type ToolBlock = Extract<HarnaisBlock, { type: 'tool' }>;

/**
 * État du module Harnais : conversations et génération simulée.
 * Singleton pour survivre aux changements de route (/harnais ↔ /harnais/:id recréent le composant).
 */
@Injectable({ providedIn: 'root' })
export class HarnaisStore {
  readonly conversations = signal<HarnaisConversation[]>(structuredClone([KIT_CONVERSATION, TOOLKIT_CONVERSATION, DEMO_CONVERSATION, ...HARNAIS_CONVERSATIONS]));
  /** Conversation en cours de génération (null = aucune). */
  readonly generatingId = signal<string | null>(null);
  /** Appelé à chaque étape de génération (défilement du fil). */
  onProgress: () => void = () => undefined;

  private timers: ReturnType<typeof setTimeout>[] = [];

  find = (id: string | null | undefined) => this.conversations().find((c) => c.id === id) ?? null;

  create(text: string, model: string): HarnaisConversation {
    const conv: HarnaisConversation = {
      id: 'c-' + Date.now().toString(36),
      title: text ? truncate(text, 42) : 'Conversation sans titre',
      group: "Aujourd'hui",
      model,
      messages: [],
    };
    this.conversations.update((list) => [conv, ...list]);
    return conv;
  }

  togglePin(id: string): void {
    this.patchConversation(id, (c) => ({ ...c, pinned: !c.pinned }));
  }

  remove(id: string): void {
    if (this.generatingId() === id) this.stop();
    this.conversations.update((list) => list.filter((c) => c.id !== id));
  }

  setModel(id: string, model: string): void {
    this.patchConversation(id, (c) => ({ ...c, model }));
  }

  feedback(convId: string, msgId: string, value: 'up' | 'down'): void {
    this.patchMessage(convId, msgId, (m) => ({ ...m, feedback: m.feedback === value ? null : value }));
  }

  send(convId: string, e: HarnaisSendEvent): void {
    const userMsg: HarnaisMessage = {
      id: 'u-' + Date.now().toString(36), role: 'user', time: now(),
      attachments: e.attachments.length ? e.attachments : undefined,
      blocks: [{ type: 'text', text: e.text || 'Voici les fichiers joints.' }],
    };
    this.patchConversation(convId, (c) => ({ ...c, messages: [...c.messages, userMsg] }));
    this.respond(convId, e);
  }

  /** Rejoue la dernière demande en remplaçant la dernière réponse. */
  retry(convId: string): void {
    const conv = this.find(convId);
    if (!conv || this.generatingId()) return;
    const idx = conv.messages.map((m) => m.role).lastIndexOf('user');
    if (idx < 0) return;
    const lastUser = conv.messages[idx];
    const text = lastUser.blocks.find((b) => b.type === 'text');
    this.patchConversation(convId, (c) => ({ ...c, messages: c.messages.slice(0, idx + 1) }));
    this.respond(convId, {
      text: text?.type === 'text' ? text.text : '', attachments: lastUser.attachments ?? [], extendedThinking: true, webSearch: false,
    });
  }

  stop(): void {
    const convId = this.generatingId();
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.generatingId.set(null);
    const conv = this.find(convId);
    const last = conv?.messages[conv.messages.length - 1];
    if (!conv || !last?.streaming) return;
    this.patchMessage(conv.id, last.id, (m) => ({
      ...m, streaming: false, stopped: true,
      blocks: m.blocks.map((b): HarnaisBlock =>
        b.type === 'thinking' ? { ...b, running: false, duration: b.duration ?? '—' }
        : b.type === 'tool' && b.status === 'running' ? { ...b, status: 'error', output: 'Interrompu' }
        : b),
    }));
  }

  // ─── Simulation : réflexion → outils → texte en flux → liste ──
  private respond(convId: string, e: HarnaisSendEvent): void {
    this.run(convId, scenarioFor(detectIntent(e.text)), e);
  }

  /** L'utilisateur a rempli un formulaire posé par l'agent : on le fige, on récapitule, l'agent enchaîne. */
  submitForm(convId: string, msgId: string, index: number, values: Record<string, unknown>): void {
    if (this.generatingId()) return;
    const block = this.find(convId)?.messages.find((m) => m.id === msgId)?.blocks[index];
    if (block?.type !== 'form') return;
    this.patchMessage(convId, msgId, (m) => ({ ...m, blocks: m.blocks.map((b, i) => (i === index ? { ...block, values } : b)) }));
    const recap = block.fields
      .filter((f) => values[f.key] !== null && values[f.key] !== '' && !(Array.isArray(values[f.key]) && !(values[f.key] as unknown[]).length))
      .map((f) => `${f.label} : ${describeValue(f, values[f.key])}`).join('\n');
    this.pushUser(convId, `${block.title ?? 'Formulaire'} — envoyé\n${recap}`);
    this.run(convId, formFollowUp(block.formId, values), { text: block.title ?? '', attachments: [], extendedThinking: false, webSearch: false });
  }

  /**
   * Réponse à un widget interactif (choix rapide, autorisation, fichier, sélection dans un arbre) :
   * le widget mémorise la réponse, elle devient un message de l'utilisateur et l'agent enchaîne.
   */
  choose(convId: string, msgId: string, index: number, option: HzOption): void {
    if (this.generatingId()) return;
    const block = this.find(convId)?.messages.find((m) => m.id === msgId)?.blocks[index];
    if (!block) return;
    // Pour les fichiers et les sélections, on garde le libellé lisible ; sinon la valeur.
    const selected = block.type === 'upload' || block.type === 'tree' ? option.label : option.value;
    if (HARNAIS_ANSWERABLE.has(block.type)) {
      this.patchMessage(convId, msgId, (m) => ({ ...m, blocks: m.blocks.map((b, i) => (i === index ? ({ ...b, selected } as HarnaisBlock) : b)) }));
    }
    this.pushUser(convId, option.label);
    this.run(convId, answerFollowUp(block.type, option), { text: option.label, attachments: [], extendedThinking: block.type === 'choices', webSearch: false });
  }

  private pushUser(convId: string, text: string): void {
    const msg: HarnaisMessage = { id: 'u-' + Date.now().toString(36), role: 'user', time: now(), blocks: [{ type: 'text', text }] };
    this.patchConversation(convId, (c) => ({ ...c, messages: [...c.messages, msg] }));
  }

  // ─── Simulation : réflexion → outils → texte en flux → widgets → conclusion ──
  private run(convId: string, reply: ScenarioReply, e: HarnaisSendEvent): void {
    const msgId = 'a-' + Date.now().toString(36);
    this.patchConversation(convId, (c) => ({
      ...c, messages: [...c.messages, { id: msgId, role: 'assistant', time: now(), streaming: true, blocks: [] }],
    }));
    this.generatingId.set(convId);

    const update = (fn: (blocks: HarnaisBlock[]) => HarnaisBlock[]) =>
      this.patchMessage(convId, msgId, (m) => ({ ...m, blocks: fn(m.blocks) }));
    const push = (block: HarnaisBlock) => update((bs) => [...bs, block]);
    const patchAt = (index: number, block: HarnaisBlock) => update((bs) => bs.map((b, i) => (i === index ? block : b)));

    let at = 300;
    let index = 0;
    const plan = (delay: number, fn: () => void) => {
      at += delay;
      this.timers.push(setTimeout(() => { fn(); this.onProgress(); }, at));
    };
    const stream = (text: string) => {
      const i = index++;
      plan(220, () => push({ type: 'text', text: '' }));
      for (let n = 4; n < text.length + 4; n += 4) {
        const slice = text.slice(0, n);
        plan(16, () => patchAt(i, { type: 'text', text: slice }));
      }
    };

    if (e.extendedThinking) {
      const i = index++;
      const text = thinkingFor(e.text || reply.tool);
      plan(0, () => push({ type: 'thinking', running: true, text }));
      plan(1200, () => patchAt(i, { type: 'thinking', running: false, duration: '1 s', text }));
    }

    const tools: ToolBlock[] = [
      ...(e.webSearch ? [tool('web', 'Recherche web', truncate(e.text, 32), '6 sources consultées')] : []),
      ...e.attachments.map((a) => tool('read', 'Lecture', a.name, a.size)),
      ...(reply.tools?.map((t) => tool(t.tool, t.label, t.target, t.output)) ?? [tool('search', 'Recherche', reply.tool, 'données à jour')]),
    ];
    for (const t of tools) {
      const i = index++;
      plan(180, () => push({ ...t, status: 'running', output: undefined }));
      plan(650, () => patchAt(i, t));
    }

    stream(reply.intro);
    // Les widgets arrivent un par un, comme s'ils étaient construits au fil de la réponse.
    for (const block of reply.blocks) {
      index++;
      plan(block.type === 'text' || block.type === 'list' ? 200 : 420, () => push(structuredClone(block)));
    }
    if (reply.outro) stream(reply.outro);

    plan(150, () => {
      this.patchMessage(convId, msgId, (m) => ({ ...m, streaming: false }));
      this.generatingId.set(null);
      this.timers = [];
    });
  }

  // ─── Mises à jour immuables (les composants enfants reposent sur des inputs signal) ──
  private patchConversation(id: string, fn: (c: HarnaisConversation) => HarnaisConversation): void {
    this.conversations.update((list) => list.map((c) => (c.id === id ? fn(c) : c)));
  }

  private patchMessage(convId: string, msgId: string, fn: (m: HarnaisMessage) => HarnaisMessage): void {
    this.patchConversation(convId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === msgId ? fn(m) : m)) }));
  }
}

const tool = (kind: ToolBlock['tool'], label: string, target: string, output: string): ToolBlock =>
  ({ type: 'tool', tool: kind, label, target, status: 'done', output });

const now = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

function thinkingFor(prompt: string): string {
  return `La demande porte sur « ${truncate(prompt, 60)} ». Je rassemble les données utiles, puis je choisis la forme la plus lisible : carte, graphique, tableau, planning ou formulaire si une information me manque.`;
}
