import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/material.module';

/** Modale "Connexion requise" (bouton Google). Version statique : simule la redirection. */
@Component({
  selector: 'app-google-auth-modal',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './google-auth-modal.component.html',
  styleUrls: ['./google-auth-modal.component.scss'],
})
export class GoogleAuthModalComponent {
  private dialogRef = inject(MatDialogRef<GoogleAuthModalComponent>);
  private router = inject(Router);
  private data = inject<{ errorMessage?: string | null }>(MAT_DIALOG_DATA, { optional: true });

  progress = { loading: false, label: '' };
  get errorMessage(): string | null { return this.data?.errorMessage ?? null; }

  signinWithGoogle(): void {
    this.progress = { loading: true, label: 'Redirection vers Google ...' };
    setTimeout(() => { this.dialogRef.close(true); this.router.navigate(['/main']); }, 900);
  }
}
