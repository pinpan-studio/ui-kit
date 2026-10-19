/** Extraits de code affichés dans la galerie Médias (bouton « </> »). */
export const MEDIA_SNIPPETS = {
  video: `
import { VideoPlayerComponent, VideoTrack } from 'shared/components/media';

subtitles: VideoTrack[] = [{ src: 'assets/trajet.fr.vtt', label: 'Français', srclang: 'fr' }];

<app-video-player
  [src]="videoUrl"
  poster="assets/bg.jpg"
  title="Trajet CI-4521-AB"
  [tracks]="subtitles"
  aspectRatio="16 / 9"
  (ended)="onEnded()" />`,
  youtube: `
<!-- URL complète, youtu.be, shorts ou identifiant de 11 caractères -->
<app-youtube-player
  video="https://youtu.be/aqz-KE-bpKQ"
  title="Installer une balise GPS"
  duration="10:34"
  [start]="60"
  [controls]="true"
  (stateChange)="onState($event)" />  <!-- 'playing' | 'paused' | 'ended' -->`,
  audio: `
import { AudioPlayerComponent, AudioTrack } from 'shared/components/media';

tracks: AudioTrack[] = [
  { src: url, title: 'Appel client', artist: 'Support', blob: file }, // blob → vraie forme d'onde
];

<app-audio-player [tracks]="tracks" />                      <!-- carte -->
<app-audio-player [tracks]="[note]" variant="compact" />    <!-- note vocale -->
<app-audio-player [tracks]="tracks" variant="playlist" />   <!-- playlist -->`,
  pdf: `
<app-pdf-viewer
  [src]="pdfUrl"          <!-- blob:, data: ou même origine -->
  [blob]="pdfFile"        <!-- optionnel : compte les pages -->
  name="contrat-cadre-2026.pdf"
  height="640px" />`,
  viewer: `
import { FileViewerService, ViewerFile } from 'shared/components/media';

private viewer = inject(FileViewerService);

files: ViewerFile[] = [
  { name: 'photo.png', url: imgUrl, type: 'image/png', size: 182000 },
  { name: 'contrat.pdf', url: pdfUrl, type: 'application/pdf', blob: pdf },
  { name: 'appel.wav', url: wavUrl, type: 'audio/wav' },
];

open(i: number) { this.viewer.open(this.files, i); }`,
  carousel: `
slides: CarouselSlide[] = [{ url: 'assets/bg.jpg', title: 'Flotte', caption: 'Plateau' }];

<app-carousel [items]="slides" [autoplay]="4000" indicators="dots" />
<app-carousel [items]="slides" indicators="thumbs" [loop]="false" />`,
  carouselTpl: `
<app-carousel [items]="produits" [perView]="3" [gap]="12">
  <ng-template #slide let-item let-i="index">
    <div class="product">{{ item.title }} — {{ item.price }}</div>
  </ng-template>
</app-carousel>`,
  cropper: `
<app-image-cropper
  [src]="photoUrl"
  [round]="true"            <!-- cadre rond (avatar) -->
  [aspect]="1"              <!-- largeur / hauteur -->
  [outputWidth]="512"
  format="image/png"
  (cropped)="avatar = $event"  <!-- data URL -->
  (cancel)="close()" />`,
  imageGallery: `
images: GalleryImage[] = [
  { url, title: 'Dépôt de Yopougon', caption: '…', width: 1200, height: 800, category: 'Dépôts' },
];

<app-image-gallery [images]="images" layout="justified" [rowHeight]="200"
  filters switcher selectable [pageSize]="20" (selectionChange)="sel = $event">
  <button mat-stroked-button selectionActions>Télécharger</button>   <!-- barre de sélection -->
</app-image-gallery>

<!-- layout : 'grid' (+ [aspectRatio], [minWidth]) · 'justified' (+ [rowHeight]) · 'masonry' -->`,
  videoGallery: `
videos: VideoItem[] = [
  { id: 'a', title: 'Trajet CI-4521-AB', src: 'assets/videos/trajet.mp4', duration: '4:12', category: 'Trajets' },
  { id: 'b', title: 'Installer une balise', youtube: 'https://youtu.be/…', duration: '10:34', category: 'Tutoriels' },
];

<app-video-gallery [videos]="videos" layout="theater" filters />   <!-- lecteur + playlist -->
<app-video-gallery [videos]="videos" layout="grid" />              <!-- cartes + modale -->`,
  masonry: `
<app-masonry-grid [items]="notes" [minColumnWidth]="240" [gap]="16" [columns]="null">
  <ng-template #item let-note let-i="index">
    <article class="carte">{{ note.titre }} …</article>
  </ng-template>
</app-masonry-grid>`,
};
