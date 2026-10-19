import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../../shared/material.module';
import { UI_DIRECTIVES } from '../../../../shared/directives/ui-directives';
import { OverlaySpinerComponent } from '../../../../shared/components/overlay-spinner/overlay-spinner.component';

/** Dialog "Modifiez votre mot de passe" — validation visuelle uniquement. */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, OverlaySpinerComponent, ...UI_DIRECTIVES],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  private dialogRef = inject(MatDialogRef<ResetPasswordComponent>);
  private snackBar = inject(MatSnackBar);

  progress = { loading: false, label: '' };
  pForm = new FormGroup({
    pass: new FormControl<string | null>(null, [Validators.required]),
    newpass: new FormControl<string | null>(null, [Validators.required, Validators.minLength(6)]),
    cpass: new FormControl<string | null>(null, [Validators.required]),
  });

  savePassword() {
    this.progress = { loading: true, label: 'Modification en cours...' };
    setTimeout(() => {
      this.progress = { loading: false, label: '' };
      this.dialogRef.close();
      this.snackBar.open('Mot de passe modifié', 'Fermer', { duration: 2000 });
    }, 800);
  }

  close() { this.dialogRef.close(); }
}
