import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { ArticleBodyComponent, articleToc } from '../../shared/components/content';
import { DOCS_NAV, DOC_PAGE } from '../../data/static/content.data';
import { ExAppShellComponent } from './ex-app-shell.component';

/**
 * /examples/app/docs — documentation en trois colonnes : arborescence recherchable (collante),
 * page en carte (typographie « md »), sommaire de page ; avis « Cette page vous a aidé ? », pages précédente / suivante.
 * Mise en page alignée sur les autres écrans : marges du shell, en-tête de page, cartes à bordure fine, sans ombre.
 */
@Component({
  selector: 'app-docs-example',
  standalone: true,
  imports: [FormsModule, MaterialModule, ArticleBodyComponent, ExAppShellComponent],
  template: `
    <ex-app-shell title="Documentation" crumb="Ressources">
      <div class="page-head">
        <div class="titles">
          <span class="eyebrow">Ressources</span>
          <h1>Documentation</h1>
          <p>Guides, fondations et référence des composants du kit.</p>
        </div>
        <div class="actions">
          <button mat-stroked-button class="nav-btn" (click)="navOpen.set(true)"><mat-icon>menu_book</mat-icon>Sommaire</button>
          <button mat-stroked-button><mat-icon>edit</mat-icon>Modifier cette page</button>
        </div>
      </div>

      <div class="docs">
        <aside class="tree" [class.open]="navOpen()" aria-label="Arborescence de la documentation">
          <label class="searchbox"><mat-icon>search</mat-icon><input type="search" placeholder="Filtrer" [value]="q()" (input)="q.set($any($event.target).value)" /></label>
          <nav>
            @for (g of nav(); track g.label) {
              <div class="group">
                <button type="button" class="g-head" (click)="toggle(g.label)" [attr.aria-expanded]="!closed().has(g.label)">
                  <mat-icon>{{ g.icon }}</mat-icon><span>{{ g.label }}</span><mat-icon class="chev" [class.shut]="closed().has(g.label)">expand_more</mat-icon>
                </button>
                @if (!closed().has(g.label) || q()) {
                  @for (p of g.children; track p.slug) {
                    <a href="#" class="leaf" [class.on]="p.slug === current()" (click)="open(p.slug!, $event)">{{ p.label }}@if (p.badge) { <span class="badge">{{ p.badge }}</span> }</a>
                  }
                }
              </div>
            }
          </nav>
        </aside>
        <div class="scrim" [class.open]="navOpen()" (click)="navOpen.set(false)"></div>

        <article class="card doc">
          <nav class="crumbs" aria-label="Fil d’Ariane"><span>Composants</span><mat-icon>chevron_right</mat-icon><span class="cur">{{ currentLabel() }}</span></nav>
          <h2 class="doc-title">{{ currentLabel() }}</h2>
          <div class="meta"><span class="m3-badge info">Stable</span><code>shared/components/content</code><span>Mis à jour le 17 octobre 2026</span></div>
          <app-article-body [blocks]="blocks" size="md" />

          <section class="feedback">
            @switch (vote()) {
              @case (null) {
                <strong>Cette page vous a-t-elle aidé ?</strong>
                <div class="votes">
                  <button mat-stroked-button (click)="vote.set('up')"><mat-icon>thumb_up</mat-icon>Oui</button>
                  <button mat-stroked-button (click)="vote.set('down')"><mat-icon>thumb_down</mat-icon>Non</button>
                </div>
              }
              @case ('down') {
                @if (sent()) { <p class="thanks"><mat-icon>check_circle</mat-icon>Merci, l’équipe documentation va revoir cette page.</p> }
                @else {
                  <form class="why" (ngSubmit)="sent.set(true)">
                    <strong>Que pouvons-nous améliorer ?</strong>
                    <div class="reasons">
                      @for (r of reasons; track r) { <mat-checkbox color="primary" [(ngModel)]="picked[r]" [name]="r">{{ r }}</mat-checkbox> }
                    </div>
                    <div class="form-field"><div class="field-box textarea-box"><textarea name="msg" rows="3" [(ngModel)]="message" placeholder="Précisez (facultatif)"></textarea></div></div>
                    <div class="row"><button mat-button type="button" (click)="vote.set(null)">Annuler</button><button mat-flat-button color="primary" type="submit">Envoyer</button></div>
                  </form>
                }
              }
              @default { <p class="thanks"><mat-icon>favorite</mat-icon>Merci pour votre retour !</p> }
            }
          </section>

          <nav class="pager" aria-label="Pages voisines">
            <a href="#" (click)="open('formulaires', $event)"><small>Précédent</small><strong><mat-icon>arrow_back</mat-icon>Formulaires</strong></a>
            <a href="#" class="next" (click)="open('article', $event)"><small>Suivant</small><strong>Article<mat-icon>arrow_forward</mat-icon></strong></a>
          </nav>
        </article>

        <aside class="otp" aria-label="Sur cette page">
          <span class="text-overline">Sur cette page</span>
          @for (t of toc; track t.id) { <a href="#" [class.sub]="t.level === 3" (click)="scrollTo(t.id, $event)">{{ t.text }}</a> }
          <hr />
          <a href="#" (click)="$event.preventDefault()"><mat-icon>bug_report</mat-icon>Signaler un problème</a>
        </aside>
      </div>
    </ex-app-shell>
  `,
  styleUrls: ['./docs-example.component.scss'],
})
export class DocsExampleComponent {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly blocks = DOC_PAGE;
  readonly toc = articleToc(DOC_PAGE);
  readonly q = signal('');
  readonly current = signal('commentaires');
  readonly closed = signal(new Set<string>(['Guides']));
  readonly navOpen = signal(false);
  readonly vote = signal<'up' | 'down' | null>(null);
  readonly sent = signal(false);
  readonly reasons = ['Information manquante', 'Exemple de code incorrect', 'Difficile à comprendre', 'Faute ou coquille'];
  picked: Record<string, boolean> = {};
  message = '';

  readonly nav = computed(() => {
    const q = this.q().trim().toLowerCase();
    return DOCS_NAV.map((g) => ({ ...g, children: (g.children ?? []).filter((c) => !q || c.label.toLowerCase().includes(q)) })).filter((g) => g.children.length);
  });
  readonly currentLabel = computed(() => DOCS_NAV.flatMap((g) => g.children ?? []).find((c) => c.slug === this.current())?.label ?? '');

  toggle(label: string): void {
    this.closed.update((s) => { const n = new Set(s); if (n.has(label)) n.delete(label); else n.add(label); return n; });
  }

  open(slug: string, e: Event): void {
    e.preventDefault();
    this.current.set(slug);
    this.navOpen.set(false);
    this.vote.set(null);
    this.sent.set(false);
    this.host.nativeElement.querySelector('.content')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollTo(id: string, e: Event): void {
    e.preventDefault();
    this.host.nativeElement.querySelector('#' + CSS.escape(id))?.scrollIntoView({ behavior: 'smooth' });
  }
}
