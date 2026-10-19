import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../shared/material.module';
import { CommentAuthor, CommentComposerComponent, CommentItem, CommentThreadComponent } from '../../shared/components/content';
import { AudioPlayerComponent, AudioTrack, CarouselComponent, CarouselSlide, FileViewerService, VideoPlayerComponent, YoutubePlayerComponent } from '../../shared/components/media';
import { MapComponent, MapMarker } from '../../shared/components/map';
import { ARTICLES, FEED_COMMENTS, ME, PEOPLE } from '../../data/static/content.data';
import { markdownInline } from '../../shared/utils/markdown.util';
import { ExAppShellComponent } from './ex-app-shell.component';
import { ExFilesService, FM_KINDS, FmItem, fmSize } from './files/ex-files.service';
import { openFilePicker } from './files/ex-file-picker.dialog';
import { initials } from './ex-utils';

/** Bloc média d'une publication (une publication peut en cumuler plusieurs). */
type Media =
  | { kind: 'photos'; items: FmItem[] }
  | { kind: 'album'; title: string; slides: CarouselSlide[] }
  /** `ref` : vidéo du disque résolue à l'affichage (enregistrée en tâche de fond). */
  | { kind: 'video'; title: string; item?: FmItem; ref?: 'sample' }
  | { kind: 'youtube'; id: string; title: string; duration: string }
  | { kind: 'voice' | 'podcast'; tracks: AudioTrack[] }
  | { kind: 'document'; item: FmItem; pages?: number }
  | { kind: 'files'; items: FmItem[] }
  | { kind: 'link'; url: string; domain: string; title: string; description: string; icon: string; hue: number; internal?: boolean }
  | { kind: 'place'; name: string; address: string; markers: MapMarker[]; center: [number, number] }
  | { kind: 'poll'; question: string; options: { label: string; votes: number }[]; voted?: number };

type MediaFilter = 'all' | 'photos' | 'video' | 'audio' | 'docs' | 'links' | 'places';

interface Post {
  id: string; author: CommentAuthor; at: string; text: string; likes: number; liked?: boolean; saved?: boolean;
  media: Media[]; comments: CommentItem[]; open?: boolean;
}

/**
 * /examples/app/feed — fil d'équipe multimédia : photos (mosaïque + visionneuse), album (carrousel), vidéo,
 * YouTube, note vocale, podcast, PDF, pièces jointes, aperçu de lien, lieu (carte), sondage ; publication avec
 * pièces jointes depuis l'ordinateur ou le sélecteur de fichiers (modale) ; filtres par type de média.
 */
@Component({
  selector: 'app-feed-example',
  standalone: true,
  imports: [DecimalPipe, MaterialModule, CommentComposerComponent, CommentThreadComponent, AudioPlayerComponent, CarouselComponent,
    VideoPlayerComponent, YoutubePlayerComponent, MapComponent, ExAppShellComponent],
  templateUrl: './feed-example.component.html',
  styleUrls: ['./feed-example.component.scss'],
})
export class FeedExampleComponent {
  private store = inject(ExFilesService);
  private viewer = inject(FileViewerService);
  private dialog = inject(MatDialog);

  readonly me = ME;
  readonly people = PEOPLE;
  readonly initials = initials;
  readonly md = markdownInline;
  readonly kinds = FM_KINDS;
  readonly size = fmSize;
  readonly tab = signal<'all' | 'team' | 'saved'>('all');
  readonly filter = signal<MediaFilter>('all');
  readonly filters: { id: MediaFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'Tout', icon: 'dynamic_feed' }, { id: 'photos', label: 'Photos', icon: 'photo_library' },
    { id: 'video', label: 'Vidéos', icon: 'smart_display' }, { id: 'audio', label: 'Audio', icon: 'graphic_eq' },
    { id: 'docs', label: 'Documents', icon: 'description' }, { id: 'links', label: 'Liens', icon: 'link' }, { id: 'places', label: 'Lieux', icon: 'place' },
  ];

  /** Pièces jointes du brouillon de publication. */
  readonly pending = signal<FmItem[]>([]);
  readonly pendingPlace = signal(false);
  /** Vidéo d'exemple du disque (disponible quelques secondes après l'ouverture). */
  readonly sampleVideo = computed(() => this.store.items().find((i) => i.kind === 'video' && i.name.startsWith('Trajet')));

  readonly posts = signal<Post[]>([]);

  readonly visible = computed(() => {
    const f = this.filter();
    const match: Record<MediaFilter, (m: Media) => boolean> = {
      all: () => true, photos: (m) => m.kind === 'photos' || m.kind === 'album', video: (m) => m.kind === 'video' || m.kind === 'youtube',
      audio: (m) => m.kind === 'voice' || m.kind === 'podcast', docs: (m) => m.kind === 'document' || m.kind === 'files',
      links: (m) => m.kind === 'link', places: (m) => m.kind === 'place',
    };
    return this.posts().filter((p) => (this.tab() !== 'saved' || p.saved) && (f === 'all' || p.media.some(match[f])));
  });

  constructor() {
    this.store.ensure();
    const all = this.store.items();
    const by = (name: string) => all.find((i) => i.name === name)!;
    const photos = all.filter((i) => i.kind === 'image');
    const wav = all.filter((i) => i.kind === 'audio');
    const [, AYA, MARC, GRACE, IBRAHIM, NADIA] = PEOPLE;
    const article = ARTICLES[0];

    this.posts.set([
      { id: 'p1', author: AYA, at: 'il y a 2 h', likes: 18, open: true, comments: FEED_COMMENTS[0],
        text: 'Le nouvel entrepôt de **Vridi** est opérationnel ! Merci à toute l’équipe logistique pour ces trois semaines intenses. Les premières livraisons partent lundi.',
        media: [{ kind: 'photos', items: photos.filter((p) => p.parent === 'sotra').concat(photos.slice(0, 2)) }] },
      { id: 'p2', author: MARC, at: 'il y a 3 h', likes: 24, comments: [],
        text: 'Démo du **suivi en temps réel** sur l’axe Abidjan – Yamoussoukro : la trace se met à jour toutes les 5 secondes.',
        media: [{ kind: 'video', title: 'Trajet CI-4521-AB', ref: 'sample' }] },
      { id: 'p3', author: IBRAHIM, at: 'il y a 5 h', likes: 9, comments: FEED_COMMENTS[1],
        text: 'Petit sondage pour l’atelier produit de vendredi :',
        media: [{ kind: 'poll', question: 'Quel module voulez-vous améliorer en priorité ?', options: [{ label: 'Facturation', votes: 14 }, { label: 'Planning terrain', votes: 22 }, { label: 'Application mobile', votes: 9 }, { label: 'Rapports', votes: 5 }] }] },
      { id: 'p4', author: { name: 'Koffi N’Guessan', color: '#0891b2', role: 'Technicien' }, at: 'il y a 6 h', likes: 4, comments: [],
        text: 'Note vocale depuis le chantier de San-Pédro 👇',
        media: [{ kind: 'voice', tracks: [{ title: 'Note vocale', src: wav[0]?.url ?? '', blob: wav[0]?.blob }] }] },
      { id: 'p5', author: { name: 'Fatou Diabaté', color: '#7c3aed', role: 'Juridique' }, at: 'hier', likes: 11, comments: [],
        text: 'Le **contrat cadre 2026** est signé. Version finale ci-dessous, merci de vous y référer pour les nouvelles commandes.',
        media: [{ kind: 'document', item: by('Contrat cadre 2026.pdf'), pages: 4 }] },
      { id: 'p6', author: GRACE, at: 'hier', likes: 31, comments: FEED_COMMENTS[2],
        text: 'Nouvel article sur le blog. Vos commentaires sont les bienvenus 🙌',
        media: [{ kind: 'link', url: '/examples/app/blog/' + article.slug, domain: 'scstorage.ci/blog', title: article.title, description: article.dek, icon: article.icon, hue: article.hue, internal: true }] },
      { id: 'p7', author: NADIA, at: 'hier', likes: 15, comments: [],
        text: 'Pour la pause café : un court-métrage libre qui sert de référence pour nos tests vidéo.',
        media: [{ kind: 'youtube', id: 'aqz-KE-bpKQ', title: 'Big Buck Bunny', duration: '10:34' }] },
      { id: 'p8', author: AYA, at: 'il y a 2 j', likes: 7, comments: [],
        text: 'Nous sommes sur place pour l’inventaire annuel. Passez nous voir !',
        media: [{ kind: 'place', name: 'Port autonome de San-Pédro', address: 'Zone portuaire, San-Pédro', center: [4.7485, -6.6363],
          markers: [{ id: 'sp', lat: 4.7485, lng: -6.6363, title: 'Port de San-Pédro', icon: 'warehouse', tone: 'primary', pulse: true }] }] },
      { id: 'p9', author: IBRAHIM, at: 'il y a 2 j', likes: 6, comments: [],
        text: 'Documents de préparation de la revue trimestrielle (budget, support et archives 2025).',
        media: [{ kind: 'files', items: [by('Budget Sotra.xlsx'), by('Présentation T4.pptx'), by('Clients actifs.csv'), by('Archives 2025.zip')] }] },
      { id: 'p10', author: GRACE, at: 'il y a 3 j', likes: 42, comments: [],
        text: 'Album de la **journée d’intégration** — balayez pour tout voir.',
        media: [{ kind: 'album', title: 'Journée d’intégration', slides: photos.slice(0, 7).map((p, i) => ({ url: p.url, title: p.name.replace('.jpg', ''), caption: `Photo ${i + 1} sur 7` })) }] },
      { id: 'p11', author: NADIA, at: 'il y a 4 j', likes: 13, comments: [],
        text: 'Épisode 12 du podcast interne : comment le support a divisé par deux le temps de réponse.',
        media: [{ kind: 'podcast', tracks: wav.map((w, i) => ({ title: i ? 'Bonus — questions de l’équipe' : 'Épisode 12 — Le support en première ligne', artist: 'Podcast SC Storage', icon: 'podcasts', src: w.url!, blob: w.blob })) }] },
    ]);
  }

  // ─── Publication ───────────────────────────────────────────
  attachLocal(files: FileList | null): void {
    if (!files?.length) return;
    this.pending.update((l) => [...l, ...this.store.addFiles(files, null)]);
  }
  attachFromDrive(): void {
    openFilePicker(this.dialog, { title: 'Joindre depuis mes fichiers', confirmLabel: 'Joindre' }).subscribe((files) => {
      if (files?.length) this.pending.update((l) => [...l, ...files.filter((f) => !l.some((x) => x.id === f.id))]);
    });
  }
  unattach(f: FmItem): void { this.pending.update((l) => l.filter((x) => x.id !== f.id)); }

  publish(text: string): void {
    const files = this.pending();
    const media: Media[] = [];
    const imgs = files.filter((f) => f.kind === 'image');
    if (imgs.length) media.push({ kind: 'photos', items: imgs });
    files.filter((f) => f.kind === 'video').forEach((v) => media.push({ kind: 'video', title: v.name, item: v }));
    const audio = files.filter((f) => f.kind === 'audio');
    if (audio.length) media.push({ kind: 'podcast', tracks: audio.map((a) => ({ title: a.name, artist: ME.name, src: a.url!, blob: a.blob })) });
    files.filter((f) => f.kind === 'pdf').forEach((d) => media.push({ kind: 'document', item: d }));
    const others = files.filter((f) => !['image', 'video', 'audio', 'pdf'].includes(f.kind));
    if (others.length) media.push({ kind: 'files', items: others });
    if (this.pendingPlace()) media.push({ kind: 'place', name: 'Siège SC Storage', address: 'Immeuble Alpha 2000, Plateau, Abidjan', center: [5.3223, -4.0187],
      markers: [{ id: 'hq', lat: 5.3223, lng: -4.0187, title: 'Siège SC Storage', icon: 'business', tone: 'primary' }] });

    this.posts.update((l) => [{ id: 'p' + Date.now(), author: ME, at: 'À l’instant', text, likes: 0, comments: [], media }, ...l]);
    this.pending.set([]);
    this.pendingPlace.set(false);
    this.filter.set('all');
  }

  // ─── Interactions ──────────────────────────────────────────
  like(p: Post): void { this.update(p.id, (x) => ({ ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) })); }
  save(p: Post): void { this.update(p.id, (x) => ({ ...x, saved: !x.saved })); }
  toggleComments(p: Post): void { this.update(p.id, (x) => ({ ...x, open: !x.open })); }
  vote(p: Post, i: number): void {
    this.update(p.id, (x) => ({ ...x, media: x.media.map((m) => m.kind === 'poll' && m.voted === undefined
      ? { ...m, voted: i, options: m.options.map((o, j) => (j === i ? { ...o, votes: o.votes + 1 } : o)) } : m) }));
  }
  total(m: Media): number { return m.kind === 'poll' ? m.options.reduce((n, o) => n + o.votes, 0) : 0; }

  /** Ouvre la visionneuse plein écran sur une série de fichiers. */
  view(items: FmItem[], index: number): void {
    const ok = items.filter((i) => i.url);
    const target = items[index];
    if (!target?.url) return;
    this.viewer.open(this.store.toViewer(ok), ok.indexOf(target));
  }
  videoOf(m: Extract<Media, { kind: 'video' }>): FmItem | undefined { return m.item ?? (m.ref ? this.sampleVideo() : undefined); }

  private update(id: string, fn: (p: Post) => Post): void { this.posts.update((l) => l.map((p) => (p.id === id ? fn(p) : p))); }
}
