import { Injectable, computed, inject, signal } from '@angular/core';
import { buildSampleWav } from '../../../data/static/media.data';
import { ExFilesService, FmItem } from '../files/ex-files.service';

export interface ChatPerson { id: string; name: string; color: string; role: string; online?: boolean; }

export interface ChatAttachment { id: string; kind: FmItem['kind']; name: string; size: number; url?: string; mime?: string; blob?: Blob; }

export interface ChatMessage {
  id: string;
  /** Identifiant de l'auteur (`me` pour l'utilisateur courant). */
  from: string;
  at: Date;
  text?: string;
  attachments?: ChatAttachment[];
  voice?: { src: string; blob?: Blob; duration: number };
  reactions?: { emoji: string; by: string[] }[];
  replyTo?: string;
  /** Accusé (messages envoyés). */
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  /** Message système (« Aya a rejoint le groupe »). */
  system?: boolean;
  edited?: boolean;
  deleted?: boolean;
}

export interface ChatConversation {
  id: string;
  kind: 'direct' | 'group' | 'channel';
  name: string;
  /** Pour un groupe / canal : icône et couleur ; pour un direct : l'interlocuteur. */
  icon?: string;
  color: string;
  members: string[];
  messages: ChatMessage[];
  unread: number;
  pinned?: boolean;
  muted?: boolean;
  /** Personne en train d'écrire. */
  typing?: string | null;
  description?: string;
}

export const ME_ID = 'me';

const PEOPLE: ChatPerson[] = [
  { id: ME_ID, name: 'Jean Kouassi', color: '#0ea5e9', role: 'Administrateur', online: true },
  { id: 'aya', name: 'Aya Koné', color: '#8b5cf6', role: 'Opérations', online: true },
  { id: 'marc', name: 'Marc Yao', color: '#10b981', role: 'Développeur', online: true },
  { id: 'grace', name: 'Grace Kouamé', color: '#f59e0b', role: 'Designer', online: false },
  { id: 'ibrahim', name: 'Ibrahim Sanogo', color: '#ef4444', role: 'Produit', online: true },
  { id: 'fatou', name: 'Fatou Diabaté', color: '#7c3aed', role: 'Juridique', online: false },
  { id: 'koffi', name: 'Koffi N’Guessan', color: '#0891b2', role: 'Technicien', online: true },
  { id: 'sarah', name: 'Sarah Bamba', color: '#db2777', role: 'Formation', online: false },
];

const REPLIES = [
  'Bien reçu, merci 🙏', 'Je regarde ça tout de suite.', 'Parfait, on fait comme ça !', 'Tu peux me renvoyer le fichier ?',
  'Ok pour moi 👍', 'Je te tiens au courant d’ici midi.', 'Super nouvelle !', 'On en parle à la réunion de 15 h ?',
];

/**
 * Messagerie d'exemple partagée par le panneau latéral (sidenav droite du shell) et la page plein écran :
 * conversations directes, groupes et canaux, pièces jointes, notes vocales, réactions, réponses, accusés
 * de lecture, indicateur « en train d'écrire » et réponses simulées. Tout est local.
 */
@Injectable({ providedIn: 'root' })
export class ExChatService {
  private files = inject(ExFilesService);
  readonly people = PEOPLE;
  readonly conversations = signal<ChatConversation[]>([]);
  /** Conversation ouverte dans le panneau latéral. */
  readonly panelOpen = signal(false);
  readonly panelConv = signal<string | null>(null);
  readonly totalUnread = computed(() => this.conversations().reduce((n, c) => n + (c.muted ? 0 : c.unread), 0));
  private seq = 0;
  private built = false;

  person(id: string): ChatPerson { return PEOPLE.find((p) => p.id === id) ?? { id, name: id, color: '#64748b', role: '' }; }
  conv(id: string | null): ChatConversation | undefined { return id ? this.conversations().find((c) => c.id === id) : undefined; }
  /** Interlocuteur d'une conversation directe. */
  peer(c: ChatConversation): ChatPerson | undefined { return c.kind === 'direct' ? this.person(c.members.find((m) => m !== ME_ID)!) : undefined; }
  title(c: ChatConversation): string { return c.kind === 'direct' ? this.peer(c)!.name : c.name; }
  last(c: ChatConversation): ChatMessage | undefined { return c.messages.at(-1); }
  preview(m: ChatMessage | undefined): string {
    if (!m) return '';
    if (m.deleted) return 'Message supprimé';
    if (m.voice) return '🎤 Note vocale';
    if (m.attachments?.length) return (m.attachments[0].kind === 'image' ? '📷 ' : '📎 ') + (m.text || m.attachments.map((a) => a.name).join(', '));
    return m.text ?? '';
  }

  ensure(): void {
    if (this.built) return;
    this.built = true;
    this.files.ensure();
    const all = this.files.items();
    const att = (i: FmItem): ChatAttachment => ({ id: i.id, kind: i.kind, name: i.name, size: i.size, url: i.url, mime: i.mime, blob: i.blob });
    const photos = all.filter((i) => i.kind === 'image').slice(0, 3).map(att);
    const contract = att(all.find((i) => i.name.startsWith('Contrat cadre'))!);
    const voiceBlob = buildSampleWav(7, 3);
    const voice = { src: URL.createObjectURL(voiceBlob), blob: voiceBlob, duration: 7 };
    const t = (minAgo: number) => new Date(Date.now() - minAgo * 60_000);
    const m = (from: string, minAgo: number, text: string, extra: Partial<ChatMessage> = {}): ChatMessage =>
      ({ id: 'm' + ++this.seq, from, at: t(minAgo), text, status: from === ME_ID ? 'read' : undefined, ...extra });

    const vridiPhotos = m('aya', 95, 'Les quais 2 et 3 sont prêts 📦', { attachments: photos });
    this.conversations.set([
      { id: 'c-aya', kind: 'direct', name: '', color: '', members: [ME_ID, 'aya'], unread: 2, pinned: true, messages: [
        m('aya', 60 * 26, 'Bonjour Jean, tu as pu valider le planning de jeudi ?'),
        m(ME_ID, 60 * 25.8, 'Oui, c’est validé. Le camion arrive à 8 h.'),
        m('aya', 120, 'Top. Je préviens l’équipe du quai.'),
        vridiPhotos,
        m('aya', 92, 'On a aussi reçu le bon de livraison signé.', { reactions: [{ emoji: '👍', by: [ME_ID] }] }),
        m(ME_ID, 40, 'Excellent travail, merci à toute l’équipe !', { replyTo: vridiPhotos.id }),
        m('aya', 6, 'Merci ! Petite question : on garde le créneau de 8 h pour le lot 15 ?'),
        m('aya', 5, 'Ou on décale à 9 h à cause de la marée ?'),
      ] },
      { id: 'c-ops', kind: 'group', name: 'Équipe opérations', icon: 'local_shipping', color: '#0f766e', members: [ME_ID, 'aya', 'koffi', 'sarah', 'marc'], unread: 5,
        description: 'Coordination terrain, livraisons et interventions.', messages: [
          m(ME_ID, 60 * 30, 'Jean a créé le groupe « Équipe opérations »', { system: true }),
          m('koffi', 180, 'Installation terminée chez Transports Yao, 12 balises posées.'),
          m('sarah', 150, 'Formation des chefs de quai : 8 personnes inscrites pour lundi.', { reactions: [{ emoji: '🎉', by: ['aya', 'marc'] }] }),
          m('koffi', 34, '', { voice }),
          m('aya', 20, 'Koffi, tu peux passer à Vridi après ?'),
          m('koffi', 18, 'Oui, j’y serai vers 14 h.'),
          m('marc', 3, 'La connexion API des balises est en recette, retours bienvenus 🙌'),
        ] },
      { id: 'c-marc', kind: 'direct', name: '', color: '', members: [ME_ID, 'marc'], unread: 0, messages: [
        m('marc', 60 * 3, 'Le client a validé la proposition à 12,4 M FCFA.'),
        m(ME_ID, 60 * 2.9, 'Génial 🎉 On prépare le contrat pour lundi ?'),
        m('marc', 60 * 2.8, 'Oui, je m’en occupe.'),
      ] },
      { id: 'c-general', kind: 'channel', name: 'général', icon: 'tag', color: '#475569', members: PEOPLE.map((p) => p.id), unread: 0, muted: true,
        description: 'Annonces et informations pour toute l’entreprise.', messages: [
          m('ibrahim', 60 * 20, 'La version 2.4 est en production : export PDF corrigé, nouveaux rapports.'),
          m('grace', 60 * 19, 'Les nouvelles illustrations du site sont en ligne ✨', { reactions: [{ emoji: '❤️', by: ['aya', 'sarah', ME_ID] }] }),
        ] },
      { id: 'c-fatou', kind: 'direct', name: '', color: '', members: [ME_ID, 'fatou'], unread: 0, messages: [
        m('fatou', 60 * 28, 'Voici la version signée du contrat cadre.', { attachments: [contract] }),
        m(ME_ID, 60 * 27, 'Merci Fatou, je classe ça dans le dossier Contrats.'),
      ] },
      { id: 'c-grace', kind: 'direct', name: '', color: '', members: [ME_ID, 'grace'], unread: 0, messages: [
        m('grace', 60 * 50, 'Tu as un moment pour revoir les maquettes du tableau de bord ?'),
        m(ME_ID, 60 * 49, 'Demain matin si ça te va.'),
      ] },
    ]);
  }

  // ─── Actions ─────────────────────────────────────────────────
  send(convId: string, text: string, attachments: ChatAttachment[] = [], replyTo?: string, voice?: ChatMessage['voice']): void {
    const msg: ChatMessage = { id: 'm' + ++this.seq, from: ME_ID, at: new Date(), text: text.trim() || undefined, attachments: attachments.length ? attachments : undefined, replyTo, voice, status: 'sending' };
    this.patchConv(convId, (c) => ({ ...c, messages: [...c.messages, msg] }));
    const set = (status: ChatMessage['status'], ms: number) => setTimeout(() => this.patchMsg(convId, msg.id, { status }), ms);
    set('sent', 400); set('delivered', 1200);
    this.simulateReply(convId, msg.id);
  }
  markRead(convId: string): void { this.patchConv(convId, (c) => (c.unread ? { ...c, unread: 0 } : c)); }
  toggleReaction(convId: string, msgId: string, emoji: string): void {
    this.patchMsgFn(convId, msgId, (m) => {
      const list = [...(m.reactions ?? [])];
      const r = list.find((x) => x.emoji === emoji);
      if (!r) list.push({ emoji, by: [ME_ID] });
      else {
        const by = r.by.includes(ME_ID) ? r.by.filter((x) => x !== ME_ID) : [...r.by, ME_ID];
        list.splice(list.indexOf(r), 1, ...(by.length ? [{ emoji, by }] : []));
      }
      return { ...m, reactions: list };
    });
  }
  remove(convId: string, msgId: string): void { this.patchMsg(convId, msgId, { deleted: true, text: undefined, attachments: undefined, voice: undefined, reactions: [] }); }
  togglePin(convId: string): void { this.patchConv(convId, (c) => ({ ...c, pinned: !c.pinned })); }
  toggleMute(convId: string): void { this.patchConv(convId, (c) => ({ ...c, muted: !c.muted })); }

  /** Démarre (ou retrouve) une conversation directe avec une personne. */
  startDirect(personId: string): string {
    const existing = this.conversations().find((c) => c.kind === 'direct' && c.members.includes(personId));
    if (existing) return existing.id;
    const c: ChatConversation = { id: 'c-' + personId + '-' + ++this.seq, kind: 'direct', name: '', color: '', members: [ME_ID, personId], unread: 0, messages: [] };
    this.conversations.update((l) => [c, ...l]);
    return c.id;
  }

  /** Lecture, « en train d'écrire » puis réponse d'un membre de la conversation. */
  private simulateReply(convId: string, msgId: string): void {
    const c = this.conv(convId);
    const others = c?.members.filter((x) => x !== ME_ID && this.person(x).online) ?? [];
    if (!others.length) return;
    const who = others[Math.floor(Math.random() * others.length)];
    setTimeout(() => { this.patchMsg(convId, msgId, { status: 'read' }); this.patchConv(convId, (x) => ({ ...x, typing: who })); }, 1800);
    setTimeout(() => {
      const reply: ChatMessage = { id: 'm' + ++this.seq, from: who, at: new Date(), text: REPLIES[Math.floor(Math.random() * REPLIES.length)] };
      const visible = this.panelConv() === convId && this.panelOpen();
      this.patchConv(convId, (x) => ({ ...x, typing: null, messages: [...x.messages, reply], unread: visible || this.activePage === convId ? 0 : x.unread + 1 }));
    }, 4200);
  }
  /** Conversation affichée par la page plein écran (pour ne pas compter de non-lus). */
  activePage: string | null = null;

  private patchConv(id: string, fn: (c: ChatConversation) => ChatConversation): void {
    this.conversations.update((l) => l.map((c) => (c.id === id ? fn(c) : c)));
  }
  private patchMsgFn(convId: string, msgId: string, fn: (m: ChatMessage) => ChatMessage): void {
    this.patchConv(convId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === msgId ? fn(m) : m)) }));
  }
  private patchMsg(convId: string, msgId: string, p: Partial<ChatMessage>): void { this.patchMsgFn(convId, msgId, (m) => ({ ...m, ...p })); }
}
