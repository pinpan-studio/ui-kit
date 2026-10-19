import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Page provisoire affichée pour une route dont la version statique n'est pas encore portée. */
@Component({
  selector: 'app-page-placeholder',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="ph">
      <div class="ph-icon"><mat-icon>construction</mat-icon></div>
      <h3>{{ title }}</h3>
      <p>Cette page est en cours de conversion vers sa version statique.</p>
      <a mat-stroked-button routerLink="/pages"><mat-icon>view_quilt</mat-icon> Galerie des pages</a>
    </div>
  `,
  styles: [`
    .ph { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:64px 24px; text-align:center; }
    .ph-icon { width:80px; height:80px; border-radius:50%; display:flex; align-items:center; justify-content:center; background: var(--primary-color-light); }
    .ph-icon mat-icon { font-size:36px; width:36px; height:36px; color: var(--primary-color); }
    p { color: var(--text-secondary); margin:0; }
  `],
})
export class PagePlaceholderComponent {
  title = inject(ActivatedRoute).snapshot.data['title'] ?? 'Page';
}
