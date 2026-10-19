import { Component, EventEmitter, Output } from '@angular/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MaterialModule } from '../../../../shared/material.module';

/** Panneau "Paramètres du compte" du drawer droit. */
@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [MaterialModule, NgScrollbarModule],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent {
  mode = '_PROFIL_';
  @Output() onLeave = new EventEmitter<void>();
  @Output() onSelect = new EventEmitter<string[]>();

  selectMode = (val: string) => { this.mode = val; this.onSelect.emit([val]); };
  close = () => this.onLeave.emit();
}
