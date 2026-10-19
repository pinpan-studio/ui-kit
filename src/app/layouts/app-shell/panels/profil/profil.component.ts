import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../../shared/material.module';
import { UI_DIRECTIVES } from '../../../../shared/directives/ui-directives';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { CURRENT_USER } from '../../../../data/static/session.data';

/** Dialog "Paramètres personnels" (photo, nom, email, téléphone). */
@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, FileUploadComponent, ...UI_DIRECTIVES],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
})
export class ProfilComponent {
  private dialogRef = inject(MatDialogRef<ProfilComponent>);
  private snackBar = inject(MatSnackBar);

  progress = { loading: false, label: '' };
  photo: any = null;
  iForm = new FormGroup({
    _id: new FormControl(CURRENT_USER._id, [Validators.required]),
    fullname: new FormControl(CURRENT_USER.fullname, [Validators.required]),
    mail: new FormControl(CURRENT_USER.mail),
    phone: new FormControl(CURRENT_USER.phone),
    avatar: new FormControl<any>(null),
  });

  addPhoto(file: any) { this.photo = file; this.iForm.patchValue({ avatar: file }); }

  save() {
    this.progress = { loading: true, label: 'Sauvegarde en cours...' };
    setTimeout(() => {
      this.progress = { loading: false, label: '' };
      this.dialogRef.close();
      this.snackBar.open('Profil mis à jour', 'Fermer', { duration: 2000 });
    }, 800);
  }

  close() { this.dialogRef.close(); }
}
