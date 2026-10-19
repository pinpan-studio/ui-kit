import { Component, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { ARTICLES, BLOG_CATEGORIES } from '../../data/static/content.data';
import { ExAppShellComponent } from './ex-app-shell.component';
import { initials } from './ex-utils';

/** /examples/app/blog — magazine : article à la une, catégories, grille de cartes, colonne (newsletter, populaires, tags). */
@Component({
  selector: 'app-blog-example',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, MaterialModule, ExAppShellComponent],
  template: `
    <ex-app-shell nav="topnav" title="Blog">
      <header class="masthead">
        <span class="text-overline">Le journal du produit</span>
        <h1>Carnets de conception</h1>
        <p>Design, produit et ingénierie : ce que nous apprenons en construisant le kit.</p>
      </header>

      @if (featured(); as f) {
        <a class="card feature" [routerLink]="['/examples/app/blog', f.slug]">
          <div class="f-art" [style.--h]="f.hue"><mat-icon>{{ f.icon }}</mat-icon></div>
          <div class="f-body">
            <span class="cat">{{ f.category }} · À la une</span>
            <h2>{{ f.title }}</h2>
            <p>{{ f.dek }}</p>
            <div class="byline"><span class="ava" [style.background]="f.author.color">{{ initials(f.author.name) }}</span>
              <span><strong>{{ f.author.name }}</strong><small>{{ f.date | date: 'd MMMM yyyy' }} · {{ f.minutes }} min de lecture</small></span></div>
          </div>
        </a>
      }

      <div class="layout">
        <div>
          <nav class="cats" aria-label="Catégories">
            @for (c of categories; track c) { <button class="chip-filter" [class.on]="cat() === c" (click)="cat.set(c)">{{ c }}</button> }
          </nav>
          <div class="grid">
            @for (a of list(); track a.slug) {
              <a class="post" [routerLink]="['/examples/app/blog', a.slug]">
                <div class="p-art" [style.--h]="a.hue"><mat-icon>{{ a.icon }}</mat-icon></div>
                <span class="cat">{{ a.category }}</span>
                <h3>{{ a.title }}</h3>
                <p class="text-clamp-2">{{ a.dek }}</p>
                <small class="meta">{{ a.author.name }} · {{ a.date | date: 'd MMM' }} · {{ a.minutes }} min</small>
              </a>
            }
          </div>
        </div>

        <aside class="side">
          <section class="card newsletter">
            <mat-icon>mark_email_unread</mat-icon>
            <h3>La lettre du jeudi</h3>
            <p>Un article, trois liens, zéro spam. Chaque jeudi matin.</p>
            @if (subscribed()) {
              <p class="ok"><mat-icon>check_circle</mat-icon>Inscription confirmée pour {{ email }}.</p>
            } @else {
              <form (ngSubmit)="subscribe()" class="nl-form">
                <div class="form-field"><div class="field-box"><mat-icon>mail</mat-icon><input name="email" type="email" [(ngModel)]="email" placeholder="vous@exemple.ci" required /></div></div>
                <button mat-flat-button color="primary" type="submit" [disabled]="!email.includes('@')">S’abonner</button>
              </form>
            }
          </section>
          <section class="card popular">
            <h3>Les plus lus</h3>
            <ol>
              @for (a of popular; track a.slug; let i = $index) {
                <li><span class="rank">{{ i + 1 }}</span><a [routerLink]="['/examples/app/blog', a.slug]">{{ a.title }}</a></li>
              }
            </ol>
          </section>
          <section class="card tags">
            <h3>Sujets</h3>
            <div>@for (t of tags; track t) { <span>#{{ t }}</span> }</div>
          </section>
        </aside>
      </div>
    </ex-app-shell>
  `,
  styleUrls: ['./blog-example.component.scss'],
})
export class BlogExampleComponent {
  readonly categories = BLOG_CATEGORIES;
  readonly cat = signal('Tous');
  readonly featured = computed(() => ARTICLES.find((a) => a.featured));
  readonly list = computed(() => ARTICLES.filter((a) => !a.featured && (this.cat() === 'Tous' || a.category === this.cat())));
  readonly popular = ARTICLES.slice(0, 4);
  readonly tags = [...new Set(ARTICLES.flatMap((a) => a.tags))];
  readonly initials = initials;
  readonly subscribed = signal(false);
  email = '';

  subscribe(): void { if (this.email.includes('@')) this.subscribed.set(true); }
}
