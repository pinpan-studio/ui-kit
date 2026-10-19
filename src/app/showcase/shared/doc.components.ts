import { AfterViewInit, Component, DestroyRef, Input, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface TocItem { id: string; label: string; }

/** En-tête + sommaire d'une page de documentation du catalogue. */
@Component({
  selector: 'kit-doc-page',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="doc-page">
      <header class="doc-hero">
        <div class="hero-icon"><mat-icon>{{ icon }}</mat-icon></div>
        <div class="hero-text">
          <span class="eyebrow">{{ eyebrow }}</span>
          <h1>{{ title }}</h1>
          @if (subtitle) { <p>{{ subtitle }}</p> }
        </div>
      </header>
      @if (toc.length) {
        <nav class="doc-toc" aria-label="Sommaire">
          @for (t of toc; track t.id) {
            <a [routerLink]="[]" [fragment]="t.id" class="toc-chip">{{ t.label }}</a>
          }
        </nav>
      }
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./doc.components.scss'],
})
export class DocPageComponent implements AfterViewInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = 'widgets';
  @Input() eyebrow = 'Composants';
  @Input() toc: TocItem[] = [];

  /** Le contenu défile dans un conteneur (pas la fenêtre) : on gère nous-mêmes les ancres #fragment. */
  ngAfterViewInit(): void {
    this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((f) => {
      if (!f) return;
      setTimeout(() => document.getElementById(f)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    });
  }
}

/** Section documentée (ancre + titre + description + contenu). */
@Component({
  selector: 'kit-section',
  standalone: true,
  template: `
    <section class="doc-section" [attr.id]="id">
      <div class="section-head">
        <h2>{{ title }}</h2>
        @if (source) { <code class="source" [title]="'Source : ' + source">{{ source }}</code> }
      </div>
      @if (description) { <p class="section-desc">{{ description }}</p> }
      <div class="section-body" [class.cols-2]="cols === 2" [class.cols-3]="cols === 3">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styleUrls: ['./doc.components.scss'],
})
export class DocSectionComponent {
  @Input() id = '';
  @Input() title = '';
  @Input() description = '';
  /** Origine dans le projet de référence (sélecteur ou classe CSS). */
  @Input() source = '';
  @Input() cols: 1 | 2 | 3 = 1;
}

/** Cadre de démonstration d'une variante, avec extrait de code copiable. */
@Component({
  selector: 'kit-demo',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="demo" [class.dense]="dense">
      <div class="demo-head">
        <span class="demo-label">{{ label }}</span>
        @if (hint) { <span class="demo-hint">{{ hint }}</span> }
        <span class="spacer"></span>
        @if (code) {
          <button mat-icon-button class="demo-btn" (click)="showCode.set(!showCode())" [matTooltip]="showCode() ? 'Masquer le code' : 'Voir le code'">
            <mat-icon>{{ showCode() ? 'code_off' : 'code' }}</mat-icon>
          </button>
        }
      </div>
      <div class="demo-stage" [class.pad-none]="flush" [class.stage-muted]="muted">
        <ng-content></ng-content>
      </div>
      @if (code && showCode()) {
        <div class="demo-code">
          <button mat-icon-button class="copy-btn" (click)="copy()" matTooltip="Copier"><mat-icon>content_copy</mat-icon></button>
          <pre><code>{{ code.trim() }}</code></pre>
        </div>
      }
    </div>
  `,
  styleUrls: ['./doc.components.scss'],
})
export class DemoComponent {
  private clipboard = inject(Clipboard);
  private snackBar = inject(MatSnackBar);

  @Input() label = '';
  @Input() hint = '';
  @Input() code = '';
  @Input() flush = false;
  @Input() muted = false;
  @Input() dense = false;
  showCode = signal(false);

  copy(): void {
    this.clipboard.copy(this.code.trim());
    this.snackBar.open('Extrait copié dans le presse-papiers', 'Fermer', { duration: 1800 });
  }
}

export const DOC_COMPONENTS = [DocPageComponent, DocSectionComponent, DemoComponent] as const;
