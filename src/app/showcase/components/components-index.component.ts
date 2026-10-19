import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DOC_COMPONENTS } from '../shared/doc.components';
import { COMPONENT_CATEGORIES } from '../kit-nav';

/** /components : index des catégories. */
@Component({
  selector: 'app-components-index',
  standalone: true,
  imports: [RouterLink, MatIconModule, ...DOC_COMPONENTS],
  template: `
    <kit-doc-page title="Composants" icon="widgets" eyebrow="Catalogue"
      subtitle="Tous les composants visuels du projet, regroupés par catégorie, avec leurs variantes d'état et des extraits de code à réutiliser.">
      <div class="cat-grid">
        @for (c of categories; track c.path) {
          <a class="cat-card" [routerLink]="c.path">
            <div class="cat-icon"><mat-icon>{{ c.icon }}</mat-icon></div>
            <div class="cat-text"><strong>{{ c.label }}</strong><span>{{ c.description }}</span></div>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </a>
        }
      </div>
    </kit-doc-page>
  `,
  styles: [`
    .cat-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-m); }
    .cat-card { display:flex; align-items:flex-start; gap:14px; padding:20px; border-radius: var(--radius-card); border:0;
      background: var(--card-bg); box-shadow: var(--elevation-1); text-decoration:none; color: var(--text-primary); transition: all .2s ease; }
    .cat-card:hover { background: var(--mat-sys-surface-container, var(--hover-bg)); transform: translateY(-2px); }
    .cat-icon { width:44px; height:44px; flex-shrink:0; border-radius: 50%; display:flex; align-items:center; justify-content:center; background: var(--primary-color-light); color: var(--primary-color); }
    .cat-text { display:flex; flex-direction:column; gap:4px; flex:1; }
    .cat-text strong { font-family:'Outfit',sans-serif; font-size:16px; }
    .cat-text span { font-size:12.5px; color: var(--text-secondary); line-height:1.5; }
    .arrow { color: var(--text-muted); }
  `],
})
export class ComponentsIndexComponent {
  readonly categories = COMPONENT_CATEGORIES;
}
