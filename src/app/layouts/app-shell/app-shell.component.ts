import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { filter } from 'rxjs';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MaterialModule } from '../../shared/material.module';
import { ThemeService } from '../../core/services/theme.service';
import { ModalService } from '../../core/services/modal.service';
import { ThemePickerComponent } from '../../shared/components/theme-picker/theme-picker.component';
import { CURRENT_USER, NOTIFICATIONS, StaticNotification, StaticUser } from '../../data/static/session.data';
import { MAIN_MENU, MenuItem } from './menu.data';
import { UserSettingsComponent } from './panels/user-settings/user-settings.component';
import { NotificationsComponent } from './panels/notifications/notifications.component';
import { ProfilComponent } from './panels/profil/profil.component';
import { ResetPasswordComponent } from './panels/reset-password/reset-password.component';
import { GoogleAuthModalComponent } from './panels/google-auth-modal/google-auth-modal.component';

/**
 * Shell applicatif (ex-`MainComponent`) : rail d'icônes à gauche, barre d'outils,
 * zone de contenu routée, drawer droit (compte / notifications).
 * 100 % statique : utilisateur et notifications viennent de `data/static/session.data.ts`.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, NgScrollbarModule, UserSettingsComponent, NotificationsComponent, ThemePickerComponent],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
})
export class AppShellComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;

  readonly theme = inject(ThemeService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private modal = inject(ModalService);
  private breakpointObserver = inject(BreakpointObserver);

  user: StaticUser | null = CURRENT_USER;
  messages: StaticNotification[] = NOTIFICATIONS.filter((m) => !m.lu);
  sideShow: 'user-settings' | 'notifications' = 'user-settings';
  mainAction: { title: string; icon?: string; action: (e: Event) => void } | null = null;

  menuItems: MenuItem[] = MAIN_MENU;
  pageTitle = signal('Referentiel unique');
  isMobile = signal(false);

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe((result) => this.isMobile.set(result.matches));

    this.updatePageTitle(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.updatePageTitle(e.urlAfterRedirects));
  }

  changeThemeMode = () => this.theme.toggle();

  openSideRight = () => { this.sideShow = 'user-settings'; this.drawer.open(); };
  closeSideRight = () => this.drawer.close();
  openNotification = () => { this.sideShow = 'notifications'; this.drawer.open(); };
  goBack = () => (this.sideShow = 'user-settings');

  showFastSignin = (_lock?: boolean) => this.openGoogleAuthModal();

  openGoogleAuthModal = () =>
    this.dialog.open(GoogleAuthModalComponent, {
      backdropClass: 'startBackDrop', panelClass: 'google-auth-dialog-panel', width: '440px', data: { errorMessage: null },
    }).afterClosed().subscribe((ok) => { if (ok) this.user = CURRENT_USER; });

  onSettingSelect = (setting: string[]) => {
    switch (setting[0]) {
      case '_PROFIL_':
        this.dialog.open(ProfilComponent, { width: '400px', backdropClass: 'startBackDrop', disableClose: true });
        break;
      case '_RESET_PASSWORD_':
        this.dialog.open(ResetPasswordComponent, { width: '400px', backdropClass: 'startBackDrop', disableClose: true });
        break;
      case '_DISCONNECT_':
        this.modal.bottomConfirm({ title: 'Confirmation', message: 'Voulez-vous vous déconnecter ?' })
          .afterDismissed()
          .subscribe((yes) => { if (yes) { this.user = null; this.drawer.close(); } });
        break;
    }
  };

  onMessageSelect = (message: StaticNotification) => {
    this.modal.showPushMessage({ title: message.objet, message: message.contenu }, () => {
      this.messages = this.messages.filter((m) => m._id !== message._id);
    });
  };

  private flattenMenu(items: MenuItem[]): { libelle: string; path: string }[] {
    return items.flatMap((item) => [
      ...(item.$object?.type ? [{ libelle: item.libelle, path: '/main/' + item.$object.type }] : []),
      ...this.flattenMenu(item.children ?? []),
    ]);
  }

  private updatePageTitle(url: string): void {
    const match = this.flattenMenu(this.menuItems)
      .filter((i) => url === i.path || url.startsWith(i.path + '/'))
      .sort((a, b) => b.path.length - a.path.length)[0];
    this.pageTitle.set(match?.libelle ?? 'Referentiel unique');
  }

  initiales = (): string =>
    (this.user?.fullname ?? '').split(' ').filter(Boolean).map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}
