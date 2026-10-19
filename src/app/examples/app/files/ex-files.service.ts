import { Injectable, computed, signal } from '@angular/core';
import { buildSampleImageSet, buildSamplePdf, buildSampleWav, formatBytes, recordSampleVideo } from '../../../data/static/media.data';
import { ViewerFile } from '../../../shared/components/media';

export type FmKind = 'folder' | 'image' | 'video' | 'audio' | 'pdf' | 'sheet' | 'slides' | 'doc' | 'text' | 'archive';

export interface FmItem {
  id: string;
  name: string;
  kind: FmKind;
  /** Dossier parent (`null` = racine « Mon disque »). */
  parent: string | null;
  size: number;
  modified: Date;
  owner: string;
  mime?: string;
  /** URL locale (data:/blob:) pour l'aperçu ; absente = aperçu indisponible. */
  url?: string;
  blob?: Blob;
  starred?: boolean;
  shared?: boolean;
  /** Couleur d'un dossier. */
  color?: string;
}

/** Icônes de type (assets/icons-files) et libellés. */
export const FM_KINDS: Record<FmKind, { label: string; icon: string; img: string; color: string }> = {
  folder: { label: 'Dossier', icon: 'folder', img: 'folder.png', color: '#64748b' },
  image: { label: 'Image', icon: 'image', img: 'jpg.png', color: '#8b5cf6' },
  video: { label: 'Vidéo', icon: 'movie', img: 'mp4.png', color: '#ec4899' },
  audio: { label: 'Audio', icon: 'audiotrack', img: 'mp3.png', color: '#f59e0b' },
  pdf: { label: 'PDF', icon: 'picture_as_pdf', img: 'pdf.png', color: '#ef4444' },
  sheet: { label: 'Tableur', icon: 'table_chart', img: 'xls.png', color: '#10b981' },
  slides: { label: 'Présentation', icon: 'slideshow', img: 'ppt.png', color: '#f97316' },
  doc: { label: 'Document', icon: 'description', img: 'txt.png', color: '#3b82f6' },
  text: { label: 'Texte', icon: 'article', img: 'csv.png', color: '#0ea5e9' },
  archive: { label: 'Archive', icon: 'folder_zip', img: 'rar-file.png', color: '#78716c' },
};

export const fmSize = (n: number) => (n ? formatBytes(n) : '—');

/** Type d'élément déduit d'un fichier local (sélection depuis l'ordinateur, glisser-déposer). */
export function kindOf(name: string, mime = ''): FmKind {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (/^(xlsx?|ods|numbers)$/.test(ext)) return 'sheet';
  if (/^(pptx?|odp|key)$/.test(ext)) return 'slides';
  if (/^(docx?|odt|rtf|pages)$/.test(ext)) return 'doc';
  if (/^(zip|rar|7z|tar|gz)$/.test(ext)) return 'archive';
  if (mime.startsWith('text/') || /^(txt|csv|json|md|log)$/.test(ext)) return 'text';
  return 'doc';
}

const d = (days: number, h = 10) => new Date(2026, 9, 17 - days, h, (days * 13) % 60);

/**
 * « Disque » statique partagé par le gestionnaire de fichiers, le sélecteur en modale et le fil d'équipe.
 * Tous les contenus sont générés localement (canvas, Web Audio, PDF minimal, MediaRecorder) : aucun réseau.
 */
@Injectable({ providedIn: 'root' })
export class ExFilesService {
  readonly items = signal<FmItem[]>([]);
  /** Quota de l'espace (octets). */
  readonly quota = 15 * 1024 ** 3;
  private built = false;
  private seq = 0;

  readonly used = computed(() => this.items().reduce((s, i) => s + i.size, 0) + 6.2 * 1024 **3);
  readonly usageByKind = computed(() => {
    const by = new Map<FmKind, number>();
    for (const i of this.items()) if (i.kind !== 'folder') by.set(i.kind, (by.get(i.kind) ?? 0) + i.size);
    // Volumes « historiques » du compte pour une jauge réaliste.
    const base: Partial<Record<FmKind, number>> = { image: 2.1, video: 2.6, pdf: 0.9, audio: 0.3, sheet: 0.2, archive: 0.1 };
    return (Object.keys(base) as FmKind[]).map((k) => ({ kind: k, ...FM_KINDS[k], bytes: (base[k] ?? 0) * 1024 ** 3 + (by.get(k) ?? 0) }));
  });

  /** Construit le disque au premier usage (les générateurs ont besoin du DOM). */
  ensure(): void {
    if (this.built) return;
    this.built = true;
    const f = (id: string, name: string, parent: string | null, color: string, days: number, extra: Partial<FmItem> = {}): FmItem =>
      ({ id, name, kind: 'folder', parent, size: 0, modified: d(days), owner: 'Jean Kouassi', color, ...extra });
    const blobItem = (name: string, parent: string | null, blob: Blob, days: number, owner: string, extra: Partial<FmItem> = {}): FmItem =>
      ({ id: this.id(), name, kind: kindOf(name, blob.type), parent, size: blob.size, modified: d(days), owner, mime: blob.type, blob, url: URL.createObjectURL(blob), ...extra });
    const ghost = (name: string, parent: string | null, size: number, days: number, owner: string, extra: Partial<FmItem> = {}): FmItem =>
      ({ id: this.id(), name, kind: kindOf(name), parent, size, modified: d(days), owner, ...extra });

    const photos = buildSampleImageSet(10);
    const csv = new Blob(['Client;Ville;CA (FCFA)\nSotra Logistique;Abidjan;10000000\nCacao Plus;Yamoussoukro;121250000\nBanque Lagune;San Pedro;43750000\n'], { type: 'text/csv' });
    const notes = new Blob(['Compte rendu — atelier produit du 14 octobre\n\n1. Priorité : planning terrain\n2. Mode hors ligne à cadrer\n3. Revue des jetons de couleur\n'], { type: 'text/plain' });

    this.items.set([
      f('docs', 'Documents', null, '#3b82f6', 1),
      f('contracts', 'Contrats', 'docs', '#3b82f6', 3, { shared: true }),
      f('invoices', 'Factures 2026', 'docs', '#10b981', 0),
      f('photos', 'Photos terrain', null, '#8b5cf6', 2, { starred: true }),
      f('media', 'Médias', null, '#ec4899', 4),
      f('sotra', 'Projet Sotra', null, '#f59e0b', 1, { shared: true, starred: true }),

      blobItem('Contrat cadre 2026.pdf', 'contracts', buildSamplePdf('Contrat cadre 2026', 4), 3, 'Fatou Diabaté', { starred: true, shared: true }),
      blobItem('Avenant n°2 — Cacao Plus.pdf', 'contracts', buildSamplePdf('Avenant n°2', 2), 12, 'Fatou Diabaté'),
      blobItem('FAC-2026-0981.pdf', 'invoices', buildSamplePdf('Facture FAC-2026-0981', 1), 0, 'Jean Kouassi'),
      blobItem('FAC-2026-0974.pdf', 'invoices', buildSamplePdf('Facture FAC-2026-0974', 1), 5, 'Jean Kouassi'),
      ghost('Relevé septembre.xlsx', 'invoices', 184_320, 9, 'Fatou Diabaté'),
      blobItem('Clients actifs.csv', 'docs', csv, 1, 'Aïcha Diallo'),
      blobItem('Compte rendu atelier.txt', 'docs', notes, 2, 'Grace Kouamé', { shared: true }),
      ghost('Présentation T4.pptx', 'docs', 4_812_000, 6, 'Ibrahim Sanogo'),
      ghost('Procédure d’installation.docx', 'docs', 642_000, 20, 'Marc Yao'),

      ...photos.slice(0, 7).map((p, i) => ({ ...blobItem(p.name, 'photos', dataUrlToBlob(p.url), i, i % 2 ? 'Aya Koné' : 'Marc Yao'), name: p.caption.replace(/[—–]/g, '-') + '.jpg' })),
      ...photos.slice(7, 10).map((p, i) => ({ ...blobItem(p.name, 'sotra', dataUrlToBlob(p.url), i + 1, 'Aya Koné'), name: `Quai ${i + 2} - Vridi.jpg` })),

      blobItem('Message vocal - technicien.wav', 'media', buildSampleWav(8, 2), 1, 'Koffi N’Guessan'),
      blobItem('Appel client - Transports Yao.wav', 'media', buildSampleWav(12, 0), 6, 'Support'),
      ghost('Archives 2025.zip', 'media', 412_000_000, 40, 'Jean Kouassi'),
      blobItem('Planning de déploiement.pdf', 'sotra', buildSamplePdf('Planning de déploiement Sotra', 3), 1, 'Jean Kouassi', { shared: true }),
      ghost('Budget Sotra.xlsx', 'sotra', 96_256, 2, 'Ibrahim Sanogo', { starred: true }),
      blobItem('Rapport mensuel.pdf', null, buildSamplePdf('Rapport mensuel — septembre', 5), 4, 'Jean Kouassi'),
    ]);

    // La vidéo s'enregistre en tâche de fond (MediaRecorder) puis rejoint le dossier « Médias ».
    void recordSampleVideo(5, 640, 360, { title: 'Trajet CI-4521-AB' }).then((blob) => {
      if (!blob) return;
      this.items.update((l) => [...l, blobItem('Trajet CI-4521-AB.webm', 'media', blob, 0, 'Marc Yao', { starred: true })]);
    });
  }

  /** Ajoute des fichiers locaux (sélection ou glisser-déposer) dans un dossier. */
  addFiles(files: FileList | File[], parent: string | null): FmItem[] {
    const added = [...files].map((file) => ({
      id: this.id(), name: file.name, kind: kindOf(file.name, file.type), parent, size: file.size, modified: new Date(), owner: 'Jean Kouassi',
      mime: file.type, blob: file, url: URL.createObjectURL(file),
    }) as FmItem);
    this.items.update((l) => [...l, ...added]);
    return added;
  }

  createFolder(name: string, parent: string | null): FmItem {
    const folder: FmItem = { id: this.id(), name, kind: 'folder', parent, size: 0, modified: new Date(), owner: 'Jean Kouassi', color: '#64748b' };
    this.items.update((l) => [...l, folder]);
    return folder;
  }

  patch(id: string, p: Partial<FmItem>): void { this.items.update((l) => l.map((i) => (i.id === id ? { ...i, ...p } : i))); }

  /** Supprime des éléments et tout le contenu des dossiers concernés. */
  remove(ids: string[]): void {
    const all = new Set(ids);
    let grew = true;
    while (grew) {
      grew = false;
      for (const i of this.items()) if (i.parent && all.has(i.parent) && !all.has(i.id)) { all.add(i.id); grew = true; }
    }
    this.items.update((l) => l.filter((i) => !all.has(i.id)));
  }

  children(parent: string | null): FmItem[] { return this.items().filter((i) => i.parent === parent); }
  get(id: string | null): FmItem | undefined { return id ? this.items().find((i) => i.id === id) : undefined; }
  /** Chemin racine → dossier. */
  path(id: string | null): FmItem[] {
    const out: FmItem[] = [];
    for (let cur = this.get(id); cur; cur = this.get(cur.parent)) out.unshift(cur);
    return out;
  }
  /** Taille cumulée et nombre d'éléments d'un dossier. */
  folderStats(id: string): { count: number; size: number } {
    const kids = this.children(id);
    return kids.reduce((acc, k) => {
      if (k.kind !== 'folder') return { count: acc.count + 1, size: acc.size + k.size };
      const s = this.folderStats(k.id);
      return { count: acc.count + 1, size: acc.size + s.size };
    }, { count: 0, size: 0 });
  }

  toViewer(items: FmItem[]): ViewerFile[] {
    return items.filter((i) => i.kind !== 'folder').map((i) => ({ name: i.name, url: i.url ?? '', type: i.mime, size: i.size, blob: i.blob }));
  }

  private id(): string { return 'f' + ++this.seq; }
}

function dataUrlToBlob(url: string): Blob {
  const [head, data] = url.split(',');
  const mime = /:(.*?);/.exec(head)?.[1] ?? 'image/jpeg';
  const bin = atob(data);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
