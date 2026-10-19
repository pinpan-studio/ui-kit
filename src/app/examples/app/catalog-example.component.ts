import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material.module';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { RangeSliderComponent, RangeValue, RatingComponent } from '../../shared/components/fields';
import { EX_CATEGORIES, EX_PRODUCTS, ExProduct } from '../../data/static/examples.data';
import { ExAppShellComponent } from './ex-app-shell.component';

const PRICE_MIN = 60_000;
const PRICE_MAX = 420_000;

/** /examples/app/catalog — navigation haute, facettes (catégories, prix avec histogramme, note, stock), filtres actifs, grille produits. */
@Component({
  selector: 'app-catalog-example',
  standalone: true,
  imports: [DecimalPipe, FormsModule, MaterialModule, EmptyStateComponent, RangeSliderComponent, RatingComponent, ExAppShellComponent],
  template: `
    <ex-app-shell nav="topnav" title="Catalogue">
      <div class="page-head">
        <div class="titles">
          <span class="eyebrow">Matériel & accessoires</span>
          <h1>Catalogue</h1>
          <p>Livraison sous 48 h à Abidjan · retours gratuits sous 14 jours</p>
        </div>
        <div class="actions">
          <button mat-stroked-button class="cart" (click)="toCheckout()" [disabled]="!cart()">
            <mat-icon>shopping_bag</mat-icon>Panier@if (cart()) { <span class="cart-n">{{ cart() }}</span> }
          </button>
        </div>
      </div>

      <div class="layout">
        <aside class="facets" [class.open]="showFilters()" aria-label="Filtres">
          <div class="f-head"><h2>Filtres</h2>@if (activeCount()) { <button mat-button (click)="reset()">Réinitialiser</button> }</div>
          <section class="f-group">
            <h3>Catégorie</h3>
            @for (c of categories; track c) {
              <mat-checkbox [checked]="cats().has(c)" (change)="toggleCat(c)" color="primary">{{ c }}<span class="n">{{ countCat(c) }}</span></mat-checkbox>
            }
          </section>
          <section class="f-group">
            <h3>Prix</h3>
            <app-range-slider [ngModel]="price()" (ngModelChange)="price.set($event)" [min]="priceMin" [max]="priceMax" [step]="10000" [histogram]="histogram" [inputs]="false" [format]="fmtPrice" />
            <div class="range-val"><span>{{ price()[0] | number: '1.0-0' }} F</span><span>{{ price()[1] | number: '1.0-0' }} F</span></div>
          </section>
          <section class="f-group">
            <h3>Note minimale</h3>
            <mat-radio-group class="ratings" [value]="minRating()" (change)="minRating.set($event.value)" color="primary">
              @for (r of [0, 4, 4.5]; track r) {
                <mat-radio-button [value]="r">@if (r) { <app-rating [value]="r" readonly half size="small" /> {{ r | number: '1.0-1' }} et plus } @else { Toutes les notes }</mat-radio-button>
              }
            </mat-radio-group>
          </section>
          <section class="f-group">
            <mat-slide-toggle [checked]="inStock()" (change)="inStock.set($event.checked)" color="primary">En stock uniquement</mat-slide-toggle>
          </section>
          <button mat-flat-button color="primary" class="apply" (click)="showFilters.set(false)">Voir {{ products().length }} article(s)</button>
        </aside>
        <div class="scrim" [class.open]="showFilters()" (click)="showFilters.set(false)"></div>

        <section class="results">
          <div class="r-bar">
            <button mat-stroked-button class="filters-btn" (click)="showFilters.set(true)"><mat-icon>tune</mat-icon>Filtres@if (activeCount()) { · {{ activeCount() }} }</button>
            <span class="count"><strong>{{ products().length }}</strong> article(s)</span>
            <span class="spacer"></span>
            <div class="form-field sort"><div class="field-box select-box">
              <mat-select [value]="sort()" (valueChange)="sort.set($event)" panelClass="m3-dropdown-menu" aria-label="Trier par">
                @for (s of sorts; track s.id) { <mat-option [value]="s.id">{{ s.label }}</mat-option> }
              </mat-select>
            </div></div>
          </div>

          @if (activeCount()) {
            <mat-chip-set class="active" aria-label="Filtres actifs">
              @for (c of cats(); track c) { <mat-chip (removed)="toggleCat(c)">{{ c }}<button matChipRemove [attr.aria-label]="'Retirer ' + c"><mat-icon>cancel</mat-icon></button></mat-chip> }
              @if (priceActive()) { <mat-chip (removed)="price.set([priceMin, priceMax])">{{ fmtPrice(price()[0]) }} – {{ fmtPrice(price()[1]) }}<button matChipRemove aria-label="Retirer le filtre de prix"><mat-icon>cancel</mat-icon></button></mat-chip> }
              @if (minRating()) { <mat-chip (removed)="minRating.set(0)">{{ minRating() | number: '1.0-1' }} ★ et plus<button matChipRemove aria-label="Retirer le filtre de note"><mat-icon>cancel</mat-icon></button></mat-chip> }
              @if (inStock()) { <mat-chip (removed)="inStock.set(false)">En stock<button matChipRemove aria-label="Retirer le filtre de stock"><mat-icon>cancel</mat-icon></button></mat-chip> }
            </mat-chip-set>
          }

          <div class="grid">
            @for (p of products(); track p.id) {
              <article class="card product">
                <div class="visual" [style.--h]="p.hue">
                  <mat-icon>{{ p.icon }}</mat-icon>
                  @if (p.badge) { <span class="badge" [class.promo]="p.badge.startsWith('-')">{{ p.badge }}</span> }
                  <button mat-icon-button class="fav" [class.on]="favs().has(p.id)" (click)="toggleFav(p.id)" [attr.aria-pressed]="favs().has(p.id)" [attr.aria-label]="'Favori : ' + p.name">
                    <mat-icon>{{ favs().has(p.id) ? 'favorite' : 'favorite_border' }}</mat-icon></button>
                </div>
                <div class="p-body">
                  <span class="cat">{{ p.category }}</span>
                  <h3>{{ p.name }}</h3>
                  <span class="rating"><app-rating [value]="p.rating" readonly half size="small" /><span>{{ p.rating | number: '1.1-1' }}</span></span>
                  <div class="p-foot">
                    <span class="price">{{ p.price | number: '1.0-0' }}<small>FCFA</small></span>
                    @if (!p.stock) { <span class="stock out">Rupture</span> } @else if (p.stock < 8) { <span class="stock low">Plus que {{ p.stock }}</span> }
                  </div>
                  <button mat-stroked-button class="add" [disabled]="!p.stock" (click)="add(p)"><mat-icon>add_shopping_cart</mat-icon>Ajouter</button>
                </div>
              </article>
            } @empty {
              <div class="card empty"><app-empty-state icon="filter_alt_off" title="Aucun article" subtitle="Élargissez vos filtres pour voir plus de résultats." actionLabel="Réinitialiser les filtres" (actionClick)="reset()" /></div>
            }
          </div>
        </section>
      </div>
    </ex-app-shell>
  `,
  styleUrls: ['./catalog-example.component.scss'],
})
export class CatalogExampleComponent {
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  readonly categories = EX_CATEGORIES;
  readonly priceMin = PRICE_MIN;
  readonly priceMax = PRICE_MAX;
  readonly sorts = [
    { id: 'pop', label: 'Pertinence' }, { id: 'asc', label: 'Prix croissant' },
    { id: 'desc', label: 'Prix décroissant' }, { id: 'rating', label: 'Mieux notés' },
  ];
  /** Répartition des prix (12 tranches) pour l'histogramme du filtre. */
  readonly histogram = Array.from({ length: 12 }, (_, i) => {
    const w = (PRICE_MAX - PRICE_MIN) / 12;
    return EX_PRODUCTS.filter((p) => p.price >= PRICE_MIN + i * w && p.price < PRICE_MIN + (i + 1) * w).length;
  });
  readonly fmtPrice = (v: number) => Math.round(v / 1000) + ' k';

  readonly cats = signal(new Set<string>());
  readonly price = signal<RangeValue>([PRICE_MIN, PRICE_MAX]);
  readonly minRating = signal(0);
  readonly inStock = signal(false);
  readonly sort = signal('pop');
  readonly favs = signal(new Set<string>(['p-3']));
  readonly cart = signal(0);
  readonly showFilters = signal(false);

  readonly priceActive = computed(() => this.price()[0] > PRICE_MIN || this.price()[1] < PRICE_MAX);
  readonly activeCount = computed(() => this.cats().size + (this.priceActive() ? 1 : 0) + (this.minRating() ? 1 : 0) + (this.inStock() ? 1 : 0));
  readonly products = computed(() => {
    const [lo, hi] = this.price();
    const list = EX_PRODUCTS.filter((p) => (!this.cats().size || this.cats().has(p.category)) && p.price >= lo && p.price <= hi
      && p.rating >= this.minRating() && (!this.inStock() || p.stock > 0));
    const s = this.sort();
    return s === 'pop' ? list : [...list].sort((a, b) => (s === 'asc' ? a.price - b.price : s === 'desc' ? b.price - a.price : b.rating - a.rating));
  });

  countCat(c: string): number { return EX_PRODUCTS.filter((p) => p.category === c).length; }
  toggleCat(c: string): void { this.cats.update((s) => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n; }); }
  toggleFav(id: string): void { this.favs.update((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }
  reset(): void { this.cats.set(new Set()); this.price.set([PRICE_MIN, PRICE_MAX]); this.minRating.set(0); this.inStock.set(false); }

  add(p: ExProduct): void {
    this.cart.update((n) => n + 1);
    this.snack.open(`« ${p.name} » ajouté au panier`, 'Commander', { duration: 3000 }).onAction().subscribe(() => this.toCheckout());
  }
  toCheckout(): void { this.router.navigate(['/examples/forms/checkout']); }
}
