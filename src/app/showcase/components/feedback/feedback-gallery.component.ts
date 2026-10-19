import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from '../../../shared/material.module';
import { DOC_COMPONENTS, TocItem } from '../../shared/doc.components';
import { ModalService } from '../../../core/services/modal.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CrudDialogComponent } from '../../../shared/components/crud-dialog/crud-dialog.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { OverlaySpinerComponent } from '../../../shared/components/overlay-spinner/overlay-spinner.component';
import { ProfilComponent } from '../../../layouts/app-shell/panels/profil/profil.component';
import { ResetPasswordComponent } from '../../../layouts/app-shell/panels/reset-password/reset-password.component';
import { GoogleAuthModalComponent } from '../../../layouts/app-shell/panels/google-auth-modal/google-auth-modal.component';
import { FeedbackAdvancedComponent } from './feedback-advanced.component';

/** Galerie /components/feedback — alertes, toasts, modales, drawers, confirmations, chargement, erreurs. */
@Component({
  selector: 'app-feedback-gallery',
  standalone: true,
  imports: [MaterialModule, NgxSkeletonLoaderModule, SkeletonComponent, EmptyStateComponent, OverlaySpinerComponent, ...DOC_COMPONENTS, FeedbackAdvancedComponent],
  templateUrl: './feedback-gallery.component.html',
  styleUrls: ['./feedback-gallery.component.scss'],
})
export class FeedbackGalleryComponent {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private modal = inject(ModalService);

  readonly toc: TocItem[] = [
    { id: 'alert', label: 'Alert' }, { id: 'toast', label: 'Toast / Snackbar' }, { id: 'modal', label: 'Modal' },
    { id: 'dialog', label: 'Dialog' }, { id: 'confirm', label: 'Confirmation' }, { id: 'drawer', label: 'Drawer' },
    { id: 'tooltip', label: 'Tooltip' }, { id: 'loading', label: 'Loading' }, { id: 'skeleton', label: 'Skeleton' },
    { id: 'error', label: 'Error state' },
    { id: 'upload-queue', label: 'Upload multiple' }, { id: 'banner', label: 'Bannière / hors ligne' }, { id: 'result', label: 'Page de résultat' },
    { id: 'undo', label: 'Annuler (undo)' },
  ];

  dismissed = signal<Set<string>>(new Set());
  drawerOpen = signal(false);
  drawerMode = signal<'over' | 'side'>('over');
  overlay = signal({ loading: false, label: '' });
  progress = signal(35);
  lastResult = signal<string>('—');

  dismiss(id: string) { this.dismissed.set(new Set(this.dismissed()).add(id)); }
  restore() { this.dismissed.set(new Set()); }

  toast(kind: 'success' | 'error' | 'info' | 'plain' | 'action') {
    const map = {
      success: ['Client enregistré avec succès', 'snackbar-success'],
      error: ['Erreur : la référence existe déjà', 'snackbar-error'],
      info: ['Synchronisation planifiée à 22:00', 'snackbar-info'],
      plain: ['Produit mis à jour', ''],
      action: ['3 lignes supprimées', ''],
    } as const;
    const [msg, cls] = map[kind];
    const ref = this.snackBar.open(msg, kind === 'action' ? 'Annuler' : 'Fermer', { duration: 3500, panelClass: cls || undefined });
    if (kind === 'action') ref.onAction().subscribe(() => this.snackBar.open('Suppression annulée', 'Fermer', { duration: 2000 }));
  }

  toastPosition(v: 'top' | 'bottom', h: 'start' | 'center' | 'end') {
    this.snackBar.open(`Position ${v} / ${h}`, 'Fermer', { duration: 2500, verticalPosition: v, horizontalPosition: h });
  }

  confirmDialog(type: 'danger' | 'warning' | 'info') {
    const data = {
      danger: { title: 'Supprimer le produit', message: 'Êtes-vous sûr de vouloir supprimer le produit « PROD-001 » ? Cette action est irréversible.', type: 'danger', confirmLabel: 'Supprimer' },
      warning: { title: 'Suspendre le contrat', message: 'Le client ne sera plus facturé à partir du mois prochain.', type: 'warning', confirmLabel: 'Suspendre' },
      info: { title: 'Générer le rôle', message: 'Le rôle de facturation d’octobre 2026 va être généré (312 factures).', type: 'info' },
    }[type];
    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe((r) => this.lastResult.set(r ? 'Confirmé' : 'Annulé'));
  }

  legacyConfirm() {
    this.modal.confirm({ title: 'Valeur', message: 'Voulez-vous supprimer la valeur ?' }).afterClosed().subscribe((r) => this.lastResult.set(r ? 'Confirmé' : 'Annulé'));
  }
  legacyAlert() { this.modal.alert({ title: 'Compte réinitialisé', message: 'Votre compte a été réinitialisé. Veuillez changer votre mot de passe.' }); }
  legacyPrompt() {
    this.modal.prompt({ title: 'Motif de rejet', message: 'Indiquez la raison pour laquelle cette proforma a été refusée par le client :' })
      .afterClosed().subscribe((r) => this.lastResult.set(r ? `Saisi : « ${r} »` : 'Annulé'));
  }
  bottomConfirm() {
    this.modal.bottomConfirm({ title: 'Confirmation', message: 'Voulez-vous vous déconnecter ?' }).afterDismissed().subscribe((r) => this.lastResult.set(r ? 'Confirmé' : 'Annulé'));
  }
  pushMessage() { this.modal.showPushMessage({ title: 'Nouvelle requête client', message: 'Transports Yao SARL a ouvert la requête REQ-2026-0412 « Balise hors ligne ».', actionBtn: { label: 'Voir la requête', link: '/harnais' } }); }
  priorityMessage() { this.modal.showPriorityMessage({ subTitle: 'Information importante', title: 'Maintenance planifiée', message: ['La plateforme sera indisponible le 18/10 de 22:00 à 23:30.', 'Les synchronisations seront rattrapées automatiquement.'] }); }

  crudDialog() {
    this.dialog.open(CrudDialogComponent, {
      width: '640px', panelClass: 'assac-dialog-panel',
      data: { title: 'Nouvelle note', subtitle: 'Ajouter une note de suivi', mode: 'create', fields: [
        { key: 'objet', label: 'Objet', type: 'text', placeholder: 'Ex : Relance paiement' },
        { key: 'type', label: 'Type', type: 'select', options: [{ value: 'APPEL', label: 'Appel' }, { value: 'VISITE', label: 'Visite' }, { value: 'MAIL', label: 'Email' }] },
        { key: 'contenu', label: 'Contenu', type: 'textarea', placeholder: 'Détail…' },
      ] },
    });
  }
  profil() { this.dialog.open(ProfilComponent, { width: '400px', backdropClass: 'startBackDrop' }); }
  resetPassword() { this.dialog.open(ResetPasswordComponent, { width: '400px', backdropClass: 'startBackDrop' }); }
  googleAuth(error = false) {
    this.dialog.open(GoogleAuthModalComponent, { backdropClass: 'startBackDrop', panelClass: 'google-auth-dialog-panel', width: '440px', data: { errorMessage: error ? 'Impossible de finaliser la connexion Google. Veuillez réessayer.' : null } });
  }

  showOverlay() {
    this.overlay.set({ loading: true, label: 'Connexion en cours ...' });
    setTimeout(() => this.overlay.set({ loading: false, label: '' }), 2000);
  }
  bumpProgress() { this.progress.set(this.progress() >= 100 ? 0 : this.progress() + 15); }

  readonly code = {
    snackbar: `
this.snackBar.open('Client enregistré avec succès', 'Fermer', {
  duration: 3500,
  panelClass: 'snackbar-success',   // snackbar-success | snackbar-error | snackbar-info (styles.scss)
});`,
    confirm: `
this.dialog.open(ConfirmDialogComponent, {
  data: { title: 'Supprimer le produit', message: '… irréversible.', type: 'danger', confirmLabel: 'Supprimer' },
}).afterClosed().subscribe(ok => { if (ok) { /* suppression locale */ } });`,
    modal: `
// ModalService (core/services/modal.service.ts) — dialogs génériques
this.modal.confirm({ title: 'Valeur', message: 'Voulez-vous supprimer la valeur ?' }).afterClosed().subscribe(…);
this.modal.prompt({ title: 'Motif de rejet', message: 'Indiquez la raison…' }).afterClosed().subscribe(texte => …);
this.modal.alert({ title: 'Compte réinitialisé', message: '…' });
this.modal.bottomConfirm({ message: 'Voulez-vous vous déconnecter ?' }).afterDismissed().subscribe(…);`,
    drawer: `
<mat-sidenav-container>
  <mat-sidenav #drawer position="end" mode="over" class="right-drawer">…</mat-sidenav>
  <mat-sidenav-content>
    <button mat-flat-button (click)="drawer.toggle()">Ouvrir</button>
  </mat-sidenav-content>
</mat-sidenav-container>`,
    skeleton: `
@if (loading()) { <app-skeleton variant="card" [count]="3" /> } @else { … }
<!-- variants : line | card | table-row | avatar -->`,
  };
}
