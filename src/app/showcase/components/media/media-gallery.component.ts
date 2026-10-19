import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../../shared/doc.components';
import {
  AudioPlayerComponent, AudioTrack, CarouselComponent, CarouselSlide, FileViewerService, GalleryImage, ImageCropperComponent, ImageGalleryComponent,
  MasonryGridComponent, MEDIA_ICON, VideoGalleryComponent, VideoItem,
  PdfViewerComponent, VideoPlayerComponent, VideoTrack, ViewerFile, YoutubePlayerComponent, mediaKind, youtubeId,
} from '../../../shared/components/media';
import { buildSampleImageSet, buildSampleImages, buildSamplePdf, buildSampleWav, formatBytes, recordSampleVideo } from '../../../data/static/media.data';
import { MEDIA_SNIPPETS } from './media.snippets';

/** Galerie /components/media — vidéo, YouTube, audio, PDF, visionneuse, carrousel, recadrage. */
@Component({
  selector: 'app-media-gallery',
  standalone: true,
  imports: [
    FormsModule, MaterialModule, ...DOC_COMPONENTS,
    VideoPlayerComponent, YoutubePlayerComponent, AudioPlayerComponent, PdfViewerComponent, CarouselComponent, ImageCropperComponent,
    ImageGalleryComponent, VideoGalleryComponent, MasonryGridComponent,
  ],
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.scss'],
})
export class MediaGalleryComponent implements OnDestroy {
  private viewer = inject(FileViewerService);
  private dialog = inject(MatDialog);
  readonly code = MEDIA_SNIPPETS;
  readonly fmtBytes = formatBytes;
  readonly icon = (f: ViewerFile) => MEDIA_ICON[mediaKind(f.name, f.type)];

  readonly toc: TocItem[] = [
    { id: 'video', label: 'Lecteur vidéo' }, { id: 'youtube', label: 'YouTube' }, { id: 'audio', label: 'Lecteur audio' },
    { id: 'pdf', label: 'Lecteur PDF' }, { id: 'viewer', label: 'Visionneuse' }, { id: 'carousel', label: 'Carrousel' },
    { id: 'image-gallery', label: 'Galerie d’images' }, { id: 'video-gallery', label: 'Galerie vidéo' }, { id: 'masonry', label: 'Masonry' },
    { id: 'cropper', label: 'Recadrage' },
  ];

  // ── Galerie d'images ─────────────────────────────────
  private readonly titles = ['Flotte du Plateau', 'Dépôt de Yopougon', 'Axe Abidjan – Yamoussoukro', 'Port de San-Pédro', 'Atelier balises',
    'Livraison matinale', 'Contrôle technique', 'Parc de Bouaké', 'Quai de chargement', 'Station Treichville', 'Convoi nord', 'Entrepôt Koumassi',
    'Pont HKB', 'Atelier Marcory'];
  readonly gallery: GalleryImage[] = buildSampleImageSet(14).map((img, i) => ({
    url: img.url, width: img.width, height: img.height, category: img.category, name: `photo-${i + 1}.jpg`,
    title: this.titles[i], caption: `${img.width} × ${img.height} · ${img.category}`,
  }));
  selectedImages = signal<GalleryImage[]>([]);

  // ── Galerie vidéo ────────────────────────────────────
  videoItems = signal<VideoItem[]>([
    { id: 'yt1', title: 'Big Buck Bunny', youtube: 'aqz-KE-bpKQ', duration: '10:34', category: 'Tutoriels', author: 'Blender Foundation', meta: 'YouTube · court-métrage libre' },
    { id: 'yt2', title: 'Sintel', youtube: 'eRsGyueVLvQ', duration: '14:48', category: 'Tutoriels', author: 'Blender Foundation', meta: 'YouTube · court-métrage libre' },
  ]);
  videoGenerating = signal(true);
  masonryNotes = [
    { t: 'Sortie de zone', d: 'CI-9902-NP a quitté la géofence « Port-Bouët » à 11:42.', icon: 'wrong_location', tone: 'error', tags: ['Alerte'] },
    { t: 'PV signé', d: 'Installation validée chez Transports Yao & Fils.', icon: 'task_alt', tone: 'success', tags: [] },
    { t: 'Rapport de septembre', d: '1 248 véhicules suivis, 97,4 % de disponibilité, 23 alertes résolues sur 25. Consommation moyenne en baisse de 6 % par rapport à août grâce à la réduction des ralentis moteur.', icon: 'insights', tone: 'primary', tags: ['Rapport', 'Mensuel'] },
    { t: 'Maintenance', d: 'Vidange CI-6630-QR prévue lundi.', icon: 'build', tone: 'warning', tags: ['Atelier'] },
    { t: 'Nouveau client', d: 'Bolloré Logistics CI rejoint la plateforme avec 36 véhicules.', icon: 'person_add', tone: 'info', tags: ['Commercial'] },
    { t: 'Note du technicien', d: 'Le connecteur OBD du véhicule CI-0418-GH est oxydé : prévoir un remplacement lors du prochain passage. Le client a été prévenu par téléphone et accepte le devis.', icon: 'engineering', tone: 'purple', tags: ['Intervention', 'Devis'] },
    { t: 'Batterie faible', d: 'CI-0418-GH : 11,2 V.', icon: 'battery_alert', tone: 'warning', tags: [] },
    { t: 'Objectif atteint', d: '100 % des balises en ligne pendant 7 jours consécutifs.', icon: 'emoji_events', tone: 'success', tags: ['Qualité'] },
  ];
  masonryCols = signal<number | null>(null);
  masonryImages = this.gallery.slice(0, 10);

  private urls: string[] = [];
  private url(b: Blob): string { const u = URL.createObjectURL(b); this.urls.push(u); return u; }

  // ── Images ───────────────────────────────────────────
  readonly images = buildSampleImages();
  readonly slides: CarouselSlide[] = this.images.map((i) => ({ url: i.url, title: i.caption, caption: i.name }));
  readonly cards = [
    { title: 'Balise GPS 4G', price: '45 000 FCFA', icon: 'router', tone: 'primary' },
    { title: 'Capteur carburant', price: '120 000 FCFA', icon: 'local_gas_station', tone: 'warning' },
    { title: 'Caméra embarquée', price: '95 000 FCFA', icon: 'videocam', tone: 'purple' },
    { title: 'Coupe-moteur', price: '25 000 FCFA', icon: 'power_settings_new', tone: 'error' },
    { title: 'Lecteur RFID', price: '38 000 FCFA', icon: 'contactless', tone: 'success' },
    { title: 'Bouton SOS', price: '12 000 FCFA', icon: 'sos', tone: 'info' },
  ];

  // ── Vidéo ────────────────────────────────────────────
  videoUrl = signal<string | null>(null);
  videoState = signal<'loading' | 'ready' | 'unsupported'>('loading');
  readonly subtitles: VideoTrack[] = [{
    label: 'Français', srclang: 'fr', default: false,
    src: this.url(new Blob([`WEBVTT

00:00.000 --> 00:02.000
Départ du dépôt de Yopougon

00:02.000 --> 00:04.000
Passage sur l’autoroute du Nord

00:04.000 --> 00:06.500
Arrivée chez le client à Abobo
`], { type: 'text/vtt' })),
  }];
  localVideo = signal<string | null>(null);

  // ── YouTube ──────────────────────────────────────────
  readonly ytVideos = [
    { id: 'aqz-KE-bpKQ', title: 'Big Buck Bunny — Blender Foundation', duration: '10:34' },
    { id: 'eRsGyueVLvQ', title: 'Sintel — Blender Foundation', duration: '14:48' },
  ];
  ytInput = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
  ytCurrent = signal('aqz-KE-bpKQ');
  ytEvents = signal<string[]>([]);
  loadYt(): void { const id = youtubeId(this.ytInput); this.ytCurrent.set(id ?? this.ytInput); }
  logYt(s: string): void { this.ytEvents.update((l) => [`${new Date().toLocaleTimeString('fr-FR')} — ${s}`, ...l].slice(0, 4)); }

  // ── Audio ────────────────────────────────────────────
  readonly tracks: AudioTrack[] = [
    { title: 'Appel client — Transports Yao', artist: 'Support · 14 oct. 2026', icon: 'support_agent', blob: buildSampleWav(12, 0) },
    { title: 'Message vocal — technicien', artist: 'Koffi N’Guessan', icon: 'engineering', blob: buildSampleWav(8, 2) },
    { title: 'Alerte sonore — sortie de zone', artist: 'Bibliothèque de sons', icon: 'notifications_active', blob: buildSampleWav(5, 4) },
  ].map((t) => ({ ...t, src: this.url(t.blob) }));
  readonly voice: AudioTrack[] = [this.tracks[1]];

  // ── PDF ──────────────────────────────────────────────
  readonly pdfBlob = buildSamplePdf('Contrat cadre 2026', 4);
  readonly pdfUrl = this.url(this.pdfBlob);
  localPdf = signal<{ url: string; name: string; blob: Blob } | null>(null);

  // ── Visionneuse ──────────────────────────────────────
  files = signal<ViewerFile[]>([]);

  // ── Recadrage ────────────────────────────────────────
  cropSrc = signal<string | null>(this.images[2]?.url ?? null);
  avatar = signal<string | null>(null);
  banner = signal<string | null>(null);

  constructor() {
    const facture = new Blob(['Facture FAC-2026-0981\nClient : Transports Yao & Fils\nMontant : 1 250 000 FCFA\nÉchéance : 30/10/2026\n'], { type: 'text/plain' });
    const zip = new Blob([new Uint8Array([80, 75, 3, 4])], { type: 'application/zip' });
    this.files.set([
      ...this.images.slice(0, 3).map((i) => ({ name: i.name, url: i.url, type: 'image/png', size: Math.round(i.url.length * 0.75) })),
      { name: 'contrat-cadre-2026.pdf', url: this.pdfUrl, type: 'application/pdf', size: this.pdfBlob.size, blob: this.pdfBlob },
      { name: 'appel-client.wav', url: this.tracks[0].src, type: 'audio/wav', size: this.tracks[0].blob!.size, blob: this.tracks[0].blob },
      { name: 'facture-0981.txt', url: this.url(facture), type: 'text/plain', size: facture.size, blob: facture },
      { name: 'export-balises.zip', url: this.url(zip), type: 'application/zip', size: 2_480_000 },
    ]);
    // Trois courtes vidéos enregistrées en parallèle pour la galerie vidéo.
    const variants = [
      { id: 'v1', title: 'Trajet CI-4521-AB', color: '#4f6bed', background: '#0f172a', category: 'Trajets', author: 'Koffi N’Guessan', meta: 'Plateau → Abobo · 42 km' },
      { id: 'v2', title: 'Tournée de livraison', color: '#22c55e', background: '#052e16', category: 'Trajets', author: 'Aminata Diallo', meta: 'Yopougon · 18 arrêts' },
      { id: 'v3', title: 'Test du coupe-moteur', color: '#f59e0b', background: '#1c1917', category: 'Installations', author: 'Serge Kouamé', meta: 'Atelier Marcory' },
    ];
    void Promise.all(variants.map((v) => recordSampleVideo(5, 640, 360, v))).then((blobs) => {
      const local: VideoItem[] = [];
      blobs.forEach((b, i) => { if (b) local.push({ ...variants[i], src: this.url(b), duration: '0:05', description: 'Vidéo générée localement depuis un canvas (MediaRecorder) pour la démonstration.' }); });
      this.videoItems.update((l) => [...local, ...l]);
      this.videoGenerating.set(false);
    });
    void recordSampleVideo(6).then((b) => {
      if (!b) { this.videoState.set('unsupported'); return; }
      const u = this.url(b);
      this.videoUrl.set(u);
      this.videoState.set('ready');
      this.files.update((l) => [...l.slice(0, 4), { name: 'trajet-ci-4521.webm', url: u, type: b.type, size: b.size }, ...l.slice(4)]);
    });
  }

  openViewer(i: number): void { this.viewer.open(this.files(), i); }
  openMasonry(i: number): void { this.viewer.open(this.masonryImages.map((m) => ({ name: m.name ?? 'image.jpg', url: m.url, type: 'image/jpeg' })), i); }

  pick(accept: string, cb: (f: File, url: string) => void): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => { const f = input.files?.[0]; if (f) cb(f, this.url(f)); };
    input.click();
  }
  pickVideo(): void { this.pick('video/*', (_f, u) => this.localVideo.set(u)); }
  pickPdf(): void { this.pick('application/pdf', (f, u) => this.localPdf.set({ url: u, name: f.name, blob: f })); }
  pickCrop(): void { this.pick('image/*', (_f, u) => this.cropSrc.set(u)); }
  addFiles(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = () => {
      const list = Array.from(input.files ?? []).map((f) => ({ name: f.name, url: this.url(f), type: f.type, size: f.size, blob: f }));
      if (list.length) { this.files.update((l) => [...list, ...l]); this.viewer.open(this.files(), 0); }
    };
    input.click();
  }

  ngOnDestroy(): void { this.urls.forEach((u) => URL.revokeObjectURL(u)); this.dialog.closeAll(); }
}
