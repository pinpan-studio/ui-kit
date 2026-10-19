import { Component, computed, input, signal } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import type { HzSlide } from '../../../data/static/harnais.data';

/** Carrousel : diapositives (image ou visuel à icône), flèches, pastilles, clavier et glissement tactile. */
@Component({
  selector: 'app-hz-carousel',
  standalone: true,
  imports: [MaterialModule],
  template: `
    <div class="viewport" tabindex="0" role="region" aria-roledescription="carrousel" [attr.aria-label]="label()"
      (keydown.arrowLeft)="go(-1)" (keydown.arrowRight)="go(1)"
      (pointerdown)="startX = $event.clientX" (pointerup)="swipe($event.clientX)">
      <div class="track" [style.transform]="'translateX(' + (-index() * 100) + '%)'">
        @for (s of slides(); track $index) {
          <article class="slide" [attr.aria-hidden]="$index !== index()" [style.--tone]="toneVar(s.tone)">
            <div class="visual" [class.has-image]="!!s.image">
              @if (s.image) { <img [src]="s.image" [alt]="s.title" loading="lazy" /> }
              @else { <mat-icon>{{ s.icon ?? 'auto_awesome' }}</mat-icon> }
              @if (s.tag) { <span class="tag">{{ s.tag }}</span> }
            </div>
            <div class="content">
              <h4>{{ s.title }}</h4>
              @if (s.text) { <p>{{ s.text }}</p> }
              @if (s.stats?.length) {
                <dl class="mini-stats">
                  @for (st of s.stats; track st.label) { <div><dt>{{ st.label }}</dt><dd>{{ st.value }}</dd></div> }
                </dl>
              }
            </div>
          </article>
        }
      </div>
      <button type="button" class="nav prev" [disabled]="index() === 0" (click)="go(-1)" aria-label="Précédent"><mat-icon>chevron_left</mat-icon></button>
      <button type="button" class="nav next" [disabled]="index() === slides().length - 1" (click)="go(1)" aria-label="Suivant"><mat-icon>chevron_right</mat-icon></button>
    </div>
    <div class="dots">
      @for (s of slides(); track $index) {
        <button type="button" [class.on]="$index === index()" (click)="index.set($index)" [attr.aria-label]="'Diapositive ' + ($index + 1)"></button>
      }
      <span class="pos">{{ index() + 1 }} / {{ slides().length }}</span>
    </div>
  `,
  styleUrls: ['./carousel-widget.component.scss'],
})
export class HzCarouselComponent {
  readonly slides = input.required<HzSlide[]>();
  readonly index = signal(0);
  readonly label = computed(() => `${this.slides().length} diapositives`);
  startX = 0;

  go(step: number): void {
    this.index.update((i) => Math.max(0, Math.min(this.slides().length - 1, i + step)));
  }
  swipe(x: number): void {
    const dx = x - this.startX;
    if (Math.abs(dx) > 40) this.go(dx < 0 ? 1 : -1);
  }
  toneVar = (tone?: string) => (!tone || tone === 'primary' ? 'var(--primary-color)' : tone === 'neutral' ? 'var(--text-muted)' : `var(--${tone}-color)`);
}
