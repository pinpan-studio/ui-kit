import { Component, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS } from '../../shared/doc.components';
import {
  BannerComponent, NetworkStatusService, OfflineBannerComponent, ResultComponent, ResultStatus, UndoService, UploadQueueComponent,
} from '../../../shared/components/feedback';
import { buildSamplePdf, buildSampleWav } from '../../../data/static/media.data';

/** Sections ajoutées à la galerie Feedback : upload multiple, bannières, page de résultat, annulation. */
@Component({
  selector: 'app-feedback-advanced',
  standalone: true,
  imports: [MaterialModule, ...DOC_COMPONENTS, UploadQueueComponent, BannerComponent, OfflineBannerComponent, ResultComponent],
  templateUrl: './feedback-advanced.component.html',
  styleUrls: ['./feedback-advanced.component.scss'],
})
export class FeedbackAdvancedComponent {
  private snack = inject(MatSnackBar);
  private undo = inject(UndoService);
  readonly net = inject(NetworkStatusService);

  readonly code = {
    upload: `
// Envoi réel : Observable<number> de progression (HttpClient + reportProgress en production).
upload: Uploader = (file) => this.api.upload(file);   // se désabonner annule l'envoi

<app-upload-queue accept="image/*,application/pdf,.xlsx" [maxSize]="10 * 1024 * 1024"
  [maxFiles]="10" [concurrency]="2" [uploader]="upload" (completed)="onDone($event)" />`,
    banner: `
<app-banner tone="maintenance" title="Maintenance planifiée" actionLabel="Détails"
  dismissKey="maintenance-2026-10" (action)="openDetails()">
  La plateforme sera indisponible dimanche 19 octobre de 2 h à 4 h.
</app-banner>

<!-- Dans le layout, une seule fois : -->
<app-offline-banner />`,
    result: `
<app-result status="success" title="Paiement confirmé" subtitle="Un reçu a été envoyé par email.">
  <div class="receipt">…récapitulatif…</div>
  <div actions>
    <button mat-stroked-button>Télécharger le reçu</button>
    <button mat-flat-button>Retour au tableau de bord</button>
  </div>
</app-result>

<app-result status="404" />   <!-- 403 · 404 · 500 · error · warning · info · pending -->`,
    undo: `
private undo = inject(UndoService);

remove(item: Item) {
  const before = this.items();
  this.items.set(before.filter((i) => i !== item));           // mise à jour optimiste
  this.undo.run({
    message: \`« \${item.nom} » supprimé\`,
    undo: () => this.items.set(before),                        // clic sur « Annuler »
    commit: () => this.api.delete(item.id),                    // après 5 s sans annulation
  });
}`,
  };

  // ── Upload ───────────────────────────────────────────
  addSamples(q: UploadQueueComponent): void {
    const f = (b: Blob, name: string) => new File([b], name, { type: b.type });
    q.add([
      f(buildSamplePdf('Contrat cadre 2026', 6), 'contrat-cadre-2026.pdf'),
      f(buildSampleWav(20), 'appel-client.wav'),
      f(new Blob([new Uint8Array(2_400_000)], { type: 'image/jpeg' }), 'photo-installation.jpg'),
      f(new Blob([new Uint8Array(900_000)], { type: 'image/png' }), 'erreur-scan-carte-grise.png'),
      f(new Blob([new Uint8Array(30_000_000)], { type: 'video/mp4' }), 'video-trop-lourde.mp4'),
      f(new Blob(['x'], { type: 'application/x-msdownload' }), 'installeur.exe'),
    ]);
  }
  onDone(files: File[]): void { this.snack.open(`${files.length} fichier(s) envoyé(s) — démo statique`, 'Fermer', { duration: 2500 }); }

  // ── Bannières ────────────────────────────────────────
  bannerKey = signal(0);
  resetBanners(): void { this.bannerKey.update((k) => k + 1); }

  // ── Résultat ─────────────────────────────────────────
  result = signal<ResultStatus>('success');
  readonly statuses: ResultStatus[] = ['success', 'error', 'pending', 'warning', '403', '404', '500'];

  // ── Annulation ───────────────────────────────────────
  readonly initialItems = [
    { id: 1, nom: 'Zone « Dépôt Yopougon »', icon: 'pentagon', meta: 'Géofence · 2,4 km²' },
    { id: 2, nom: 'Alerte « Excès de vitesse »', icon: 'speed', meta: 'Règle · 12 véhicules' },
    { id: 3, nom: 'Rapport hebdomadaire', icon: 'description', meta: 'Planifié · lundi 8 h' },
    { id: 4, nom: 'Utilisateur Serge Kouamé', icon: 'person', meta: 'Superviseur' },
    { id: 5, nom: 'Véhicule CI-0418-GH', icon: 'two_wheeler', meta: 'Yamaha Crux' },
  ];
  items = signal(this.initialItems);
  commits = signal<string[]>([]);
  remove(it: { id: number; nom: string }): void {
    const before = this.items();
    this.items.set(before.filter((x) => x.id !== it.id));
    this.undo.run({
      message: `${it.nom} supprimé`,
      undo: () => this.items.set(before.some((x) => x.id === it.id) ? this.mergeBack(it.id, before) : before),
      commit: () => this.commits.update((c) => [`${new Date().toLocaleTimeString('fr-FR')} — suppression validée : ${it.nom}`, ...c].slice(0, 4)),
    });
  }
  /** Réinsère l'élément à sa place sans annuler les autres suppressions intervenues depuis. */
  private mergeBack(id: number, before: typeof this.initialItems): typeof this.initialItems {
    const keep = new Set([...this.items().map((x) => x.id), id]);
    return before.filter((x) => keep.has(x.id));
  }
}
