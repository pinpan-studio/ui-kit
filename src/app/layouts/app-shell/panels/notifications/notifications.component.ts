import { Component, EventEmitter, Output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MaterialModule } from '../../../../shared/material.module';
import { ModalService } from '../../../../core/services/modal.service';
import { NOTIFICATIONS, StaticNotification } from '../../../../data/static/session.data';

/** Panneau "Notifications" du drawer droit — liste statique, suppression locale. */
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [DatePipe, MaterialModule, NgScrollbarModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent {
  private modal = inject(ModalService);

  progress = { loading: false, label: '' };
  messages: StaticNotification[] = NOTIFICATIONS.map((m) => ({ ...m }));

  @Output() onGoBack = new EventEmitter<void>();
  @Output() onLeave = new EventEmitter<void>();
  @Output() onSelect = new EventEmitter<StaticNotification>();

  selectMessage = (message: StaticNotification) => { message.lu = true; this.onSelect.emit(message); };
  goBack = () => this.onGoBack.emit();
  close = () => this.onLeave.emit();

  deleteAll = () => {
    this.modal.confirm({ title: 'Notifications', message: 'Voulez-vous supprimer toutes les notifications ?' })
      .afterClosed()
      .subscribe((yes) => {
        if (!yes) return;
        this.progress = { loading: true, label: '' };
        setTimeout(() => { this.messages = []; this.progress = { loading: false, label: '' }; }, 600);
      });
  };
}
