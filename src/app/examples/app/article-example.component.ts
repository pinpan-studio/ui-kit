import { AfterViewInit, Component, DestroyRef, ElementRef, computed, inject, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { ArticleBodyComponent, CommentThreadComponent, articleToc } from '../../shared/components/content';
import { ARTICLES, COMMENTS, ME, PEOPLE } from '../../data/static/content.data';
import { ExAppShellComponent } from './ex-app-shell.component';
import { initials } from './ex-utils';

/**
 * /examples/app/blog/:slug — page article : progression de lecture, sommaire suivi,
 * réglages de lecture (taille, police), partage, auteur, articles liés et commentaires.
 */
@Component({
  selector: 'app-article-example',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, MaterialModule, ArticleBodyComponent, CommentThreadComponent, ExAppShellComponent],
  templateUrl: './article-example.component.html',
  styleUrls: ['./article-example.component.scss'],
})
export class ArticleExampleComponent implements AfterViewInit {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  slug = input<string>('');

  readonly article = computed(() => ARTICLES.find((a) => a.slug === this.slug()) ?? ARTICLES[0]);
  readonly toc = computed(() => articleToc(this.article().blocks));
  readonly related = computed(() => ARTICLES.filter((a) => a.slug !== this.article().slug).slice(0, 3));
  readonly comments = COMMENTS;
  readonly me = ME;
  readonly people = PEOPLE;
  readonly initials = initials;

  readonly progress = signal(0);
  readonly active = signal('');
  readonly size = signal<'md' | 'lg'>('lg');
  readonly serif = signal(false);
  readonly claps = signal(128);
  readonly clapped = signal(false);
  readonly saved = signal(false);
  readonly copied = signal(false);

  ngAfterViewInit(): void {
    // Le défilement se fait dans la zone de contenu du shell, pas dans la fenêtre.
    const scroller = this.host.nativeElement.querySelector('.content') as HTMLElement | null;
    if (!scroller) return;
    const onScroll = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      this.progress.set(max > 0 ? Math.min(100, (scroller.scrollTop / max) * 100) : 0);
      const heads = [...this.host.nativeElement.querySelectorAll<HTMLElement>('app-article-body h2, app-article-body h3')];
      const top = scroller.getBoundingClientRect().top + 120;
      const current = heads.filter((h) => h.getBoundingClientRect().top < top).pop();
      this.active.set(current?.id ?? '');
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => scroller.removeEventListener('scroll', onScroll));
    onScroll();
  }

  goTo(id: string, e: Event): void {
    e.preventDefault();
    this.host.nativeElement.querySelector('#' + CSS.escape(id))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  clap(): void {
    this.clapped.update((v) => !v);
    this.claps.update((n) => n + (this.clapped() ? 1 : -1));
  }

  share(): void {
    navigator.clipboard?.writeText(location.href).catch(() => undefined);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1600);
  }

  toComments(): void {
    this.host.nativeElement.querySelector('#comments')?.scrollIntoView({ behavior: 'smooth' });
  }
}
