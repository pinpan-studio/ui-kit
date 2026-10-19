import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { ThemeSettingsComponent } from '../../shared/components/theme-picker/theme-picker.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CopyFieldComponent, PasswordFieldComponent, TagInputComponent } from '../../shared/components/fields';
import { CURRENT_USER } from '../../data/static/session.data';
import { ExAppShellComponent } from './ex-app-shell.component';

/** /examples/app/settings — sous-navigation de sections, réglages en lignes « libellé / contrôle », thème réel, clés d'API, zone sensible confirmée. */
@Component({
  selector: 'app-settings-example',
  standalone: true,
  imports: [FormsModule, MaterialModule, ThemeSettingsComponent, CopyFieldComponent, PasswordFieldComponent, TagInputComponent, ExAppShellComponent],
  template: `
    <ex-app-shell nav="sidebar" title="Paramètres" crumb="Compte">
      <div class="page-head"><div class="titles"><span class="eyebrow">Compte</span><h1>Paramètres</h1><p>Profil, sécurité et préférences de l’espace de travail.</p></div></div>
      <div class="layout">
        <nav class="sub" aria-label="Sections">
          @for (s of sections; track s.id) {
            <button [class.on]="section() === s.id" (click)="section.set(s.id)"><mat-icon>{{ s.icon }}</mat-icon><span>{{ s.label }}</span></button>
          }
        </nav>

        <div class="panes">
          @switch (section()) {
            @case ('profile') {
              <section class="card pane">
                <header><h2>Profil</h2><p>Visible par les membres de votre organisation.</p></header>
                <div class="set">
                  <div class="s-lbl"><strong>Photo</strong><small>JPG ou PNG, 2 Mo maximum.</small></div>
                  <div class="s-ctl avatar-row"><span class="ava lg">JK</span><button mat-stroked-button><mat-icon>upload</mat-icon>Changer</button><button mat-button>Retirer</button></div>
                </div>
                <div class="set">
                  <div class="s-lbl"><strong>Nom</strong></div>
                  <div class="s-ctl row-2">
                    <div class="form-field"><div class="field-box"><input [(ngModel)]="profile.first" aria-label="Prénom" /></div></div>
                    <div class="form-field"><div class="field-box"><input [(ngModel)]="profile.last" aria-label="Nom" /></div></div>
                  </div>
                </div>
                <div class="set">
                  <div class="s-lbl"><strong>Coordonnées</strong><small>L’e-mail sert à la connexion.</small></div>
                  <div class="s-ctl col">
                    <div class="form-field"><div class="field-box"><mat-icon>mail</mat-icon><input [(ngModel)]="profile.mail" aria-label="E-mail" /></div></div>
                    <div class="form-field"><div class="field-box"><mat-icon>call</mat-icon><input [(ngModel)]="profile.phone" aria-label="Téléphone" /></div></div>
                  </div>
                </div>
                <div class="set">
                  <div class="s-lbl"><strong>Compétences</strong><small>Aide vos collègues à vous mentionner.</small></div>
                  <div class="s-ctl"><app-tag-input [(ngModel)]="profile.skills" [suggestions]="skillSuggestions" placeholder="Ajouter une compétence" /></div>
                </div>
                <div class="set">
                  <div class="s-lbl"><strong>Bio</strong></div>
                  <div class="s-ctl"><div class="form-field"><div class="field-box textarea-box"><textarea rows="3" [(ngModel)]="profile.bio" aria-label="Bio"></textarea></div></div></div>
                </div>
                <footer><button mat-button>Annuler</button><button mat-flat-button color="primary" (click)="save()">Enregistrer</button></footer>
              </section>
            }
            @case ('security') {
              <section class="card pane">
                <header><h2>Mot de passe</h2><p>12 caractères minimum, avec majuscules, chiffres et symboles.</p></header>
                <div class="set">
                  <div class="s-lbl"><strong>Nouveau mot de passe</strong><small>Dernière modification il y a 3 mois.</small></div>
                  <div class="s-ctl col"><app-password-field [(ngModel)]="password" generator /></div>
                </div>
                <footer><button mat-flat-button color="primary" [disabled]="password.length < 8" (click)="save('Mot de passe mis à jour')">Mettre à jour</button></footer>
              </section>
              <section class="card pane">
                <header><h2>Connexion</h2><p>Protégez l’accès à votre compte.</p></header>
                @for (o of security; track o.label) {
                  <div class="set inline"><div class="s-lbl"><strong>{{ o.label }}</strong><small>{{ o.sub }}</small></div><mat-slide-toggle [(ngModel)]="o.on" color="primary" [attr.aria-label]="o.label" /></div>
                }
              </section>
              <section class="card pane">
                <header><h2>Sessions actives</h2><p>Appareils actuellement connectés.</p></header>
                @for (s of sessions; track s.device) {
                  <div class="set inline">
                    <span class="ic-tile"><mat-icon>{{ s.icon }}</mat-icon></span>
                    <div class="s-lbl"><strong>{{ s.device }}</strong><small>{{ s.where }}</small></div>
                    @if (s.current) { <span class="m3-badge success">Cette session</span> } @else { <button mat-button color="warn">Déconnecter</button> }
                  </div>
                }
              </section>
            }
            @case ('api') {
              <section class="card pane">
                <header><h2>Clés d’API</h2><p>Accès programmatique à vos données. Ne partagez jamais la clé secrète.</p></header>
                <div class="set">
                  <div class="s-lbl"><strong>Identifiant public</strong><small>Utilisable côté navigateur.</small></div>
                  <div class="s-ctl"><app-copy-field value="pk_live_7Hk2pQ9xWm4ZcV1n" icon="key" label="l’identifiant public" /></div>
                </div>
                <div class="set">
                  <div class="s-lbl"><strong>Clé secrète</strong><small>Créée le 2 septembre 2026.</small></div>
                  <div class="s-ctl"><app-copy-field [value]="secret()" icon="lock" label="la clé secrète" secret regenerable (regenerate)="regenerate()" /></div>
                </div>
                <div class="set">
                  <div class="s-lbl"><strong>Webhook</strong><small>Événements facture et paiement.</small></div>
                  <div class="s-ctl"><app-copy-field value="https://api.scstorage.ci/hooks/7Hk2-pQ" icon="webhook" label="l’URL du webhook" /></div>
                </div>
              </section>
            }
            @case ('notifications') {
              <section class="card pane">
                <header><h2>Notifications</h2><p>Choisissez où être prévenu pour chaque événement.</p></header>
                <table class="matrix">
                  <thead><tr><th>Événement</th><th>E-mail</th><th>Push</th><th>SMS</th></tr></thead>
                  <tbody>
                    @for (n of notifs; track n.label) {
                      <tr><td>{{ n.label }}<small>{{ n.sub }}</small></td>
                        <td><mat-checkbox [(ngModel)]="n.mail" color="primary" [attr.aria-label]="n.label + ' par e-mail'" /></td>
                        <td><mat-checkbox [(ngModel)]="n.push" color="primary" [attr.aria-label]="n.label + ' en push'" /></td>
                        <td><mat-checkbox [(ngModel)]="n.sms" color="primary" [attr.aria-label]="n.label + ' par SMS'" /></td></tr>
                    }
                  </tbody>
                </table>
              </section>
            }
            @case ('appearance') {
              <section class="card pane">
                <header><h2>Apparence</h2><p>Mode et couleur s’appliquent immédiatement à toute l’interface.</p></header>
                <app-theme-settings />
              </section>
              <section class="card pane">
                <header><h2>Préférences régionales</h2></header>
                <div class="set inline"><div class="s-lbl"><strong>Affichage compact</strong><small>Réduit l’espacement des listes et tableaux.</small></div><mat-slide-toggle color="primary" aria-label="Affichage compact" /></div>
                <div class="set inline"><div class="s-lbl"><strong>Langue</strong><small>Français (Côte d’Ivoire)</small></div><button mat-stroked-button>Modifier</button></div>
                <div class="set inline"><div class="s-lbl"><strong>Fuseau horaire</strong><small>GMT · Abidjan</small></div><button mat-stroked-button>Modifier</button></div>
              </section>
            }
            @case ('danger') {
              <section class="card pane danger">
                <header><h2>Zone sensible</h2><p>Ces actions sont définitives.</p></header>
                <div class="set inline"><div class="s-lbl"><strong>Exporter mes données</strong><small>Archive ZIP de toutes vos données, envoyée par e-mail.</small></div><button mat-stroked-button (click)="save('Export demandé')">Exporter</button></div>
                <div class="set inline"><div class="s-lbl"><strong>Supprimer le compte</strong><small>Supprime définitivement votre compte et vos accès.</small></div><button mat-flat-button color="warn" (click)="deleteAccount()">Supprimer</button></div>
              </section>
            }
          }
        </div>
      </div>
    </ex-app-shell>
  `,
  styleUrls: ['./settings-example.component.scss'],
})
export class SettingsExampleComponent {
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  readonly sections = [
    { id: 'profile', label: 'Profil', icon: 'person' },
    { id: 'security', label: 'Sécurité', icon: 'shield' },
    { id: 'api', label: 'API & intégrations', icon: 'key' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'appearance', label: 'Apparence', icon: 'palette' },
    { id: 'danger', label: 'Zone sensible', icon: 'warning' },
  ];
  readonly section = signal('profile');
  readonly secret = signal('sk_demo_51Nf3a9QeLx2Tb8Rk0pYv');
  readonly skillSuggestions = ['Logistique', 'Facturation', 'Formation', 'Support', 'Achats', 'Comptabilité'];
  password = '';
  profile = { first: CURRENT_USER.prenoms, last: CURRENT_USER.nom, mail: CURRENT_USER.mail, phone: CURRENT_USER.phone, bio: 'Administrateur de l’espace SC Storage.', skills: ['Logistique', 'Formation'] };
  security = [
    { label: 'Vérification en deux étapes', sub: 'Code SMS à chaque nouvelle connexion', on: true },
    { label: 'Connexion avec Google', sub: 'jean.kouassi@gmail.com', on: true },
    { label: 'Alertes de connexion', sub: 'E-mail lors d’une connexion inhabituelle', on: false },
  ];
  readonly sessions = [
    { device: 'MacBook Pro · Chrome', where: 'Abidjan · maintenant', icon: 'laptop_mac', current: true },
    { device: 'iPhone 15 Pro · Safari', where: 'Abidjan · il y a 2 h', icon: 'phone_iphone', current: false },
  ];
  notifs = [
    { label: 'Nouvelles factures', sub: 'Émises par votre équipe', mail: true, push: true, sms: false },
    { label: 'Paiements reçus', sub: 'Tous moyens de paiement', mail: true, push: false, sms: false },
    { label: 'Relances', sub: 'Factures échues', mail: false, push: true, sms: true },
    { label: 'Mentions', sub: 'Commentaires et fil d’équipe', mail: true, push: true, sms: false },
  ];

  save(msg = 'Modifications enregistrées'): void { this.snack.open(msg, 'OK', { duration: 2500 }); }
  regenerate(): void {
    this.secret.set('sk_demo_' + Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12));
    this.save('Nouvelle clé secrète générée');
  }
  deleteAccount(): void {
    const data: ConfirmDialogData = { title: 'Supprimer le compte ?', message: 'Votre compte, vos accès et vos préférences seront supprimés définitivement. Cette action est irréversible.', confirmLabel: 'Supprimer définitivement', type: 'danger' };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px' }).afterClosed().subscribe((ok) => ok && this.save('Suppression simulée (exemple statique)'));
  }
}
