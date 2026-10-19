import { Component, input, linkedSignal } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { ArticleBodyComponent, CommentThreadComponent, type CommentItem } from '../../../shared/components/content';
import { AuditLogComponent, BarcodeComponent, QrCodeComponent, TextDiffComponent } from '../../../shared/components/data';
import { BannerComponent, ResultComponent } from '../../../shared/components/feedback';
import { ME, PEOPLE } from '../../../data/static/content.data';
import type { HarnaisWidget, HzTextVariant } from '../../../data/static/harnais.data';

type ContentBlock = Extract<HarnaisWidget, { type: 'typography' | 'article' | 'comments' | 'qrcode' | 'textdiff' | 'audit' | 'result' | 'banner' }>;

/** Élément HTML sémantique de chaque style typographique. */
const TAG: Partial<Record<HzTextVariant, string>> = { display: 'h1', h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', 'page-title': 'h2', 'card-title': 'h3', quote: 'blockquote' };

/**
 * Widgets de contenu : échelle typographique du kit, article éditorial, fil de commentaires,
 * QR code / code-barres, diff de texte, journal d'audit, écran de résultat, bannière.
 */
@Component({
  selector: 'app-hz-content',
  standalone: true,
  imports: [MaterialModule, ArticleBodyComponent, CommentThreadComponent, AuditLogComponent, QrCodeComponent, BarcodeComponent, TextDiffComponent, BannerComponent, ResultComponent],
  template: `
    @let b = block();
    @switch (b.type) {
      @case ('typography') {
        <div class="typo">
          @for (t of b.items; track $index) {
            <div class="typo-row">
              <span class="typo-tag">{{ tagOf(t.variant) }}</span>
              @switch (tagOf(t.variant)) {
                @case ('h1') { <h1 [class]="cls(t.variant)" [style.color]="toneVar(t.tone)">{{ t.text }}</h1> }
                @case ('h2') { <h2 [class]="cls(t.variant)" [style.color]="toneVar(t.tone)">{{ t.text }}</h2> }
                @case ('h3') { <h3 [class]="cls(t.variant)" [style.color]="toneVar(t.tone)">{{ t.text }}</h3> }
                @case ('h4') { <h4 [class]="cls(t.variant)" [style.color]="toneVar(t.tone)">{{ t.text }}</h4> }
                @case ('blockquote') { <blockquote class="quote" [style.--tone]="toneVar(t.tone) ?? 'var(--primary-color)'">{{ t.text }}</blockquote> }
                @default { <p [class]="cls(t.variant)" [style.color]="toneVar(t.tone)">{{ t.text }}</p> }
              }
            </div>
          }
        </div>
      }
      @case ('article') { <app-article-body class="article" [blocks]="b.blocks" size="md" [anchors]="false" [serif]="!!b.serif" /> }
      @case ('comments') {
        <app-comment-thread [comments]="comments()" [me]="me" [mentionables]="people" [title]="''" [compact]="true" (changed)="comments.set($event)" />
      }
      @case ('qrcode') {
        <div class="codes">
          <app-qr-code [value]="b.value" [size]="148" [caption]="b.caption ?? ''" />
          @if (b.barcode) { <div class="barcode"><app-barcode [value]="b.barcode" [height]="52" /></div> }
        </div>
      }
      @case ('textdiff') { <app-text-diff [before]="b.before" [after]="b.after" [mode]="b.mode ?? 'unified'" /> }
      @case ('audit') { <app-audit-log [entries]="b.entries" /> }
      @case ('result') { <app-result [status]="b.status" [title]="b.title ?? ''" [subtitle]="b.text ?? ''" [compact]="true" /> }
      @case ('banner') { <app-banner [tone]="b.tone" [title]="b.title ?? ''" [icon]="b.icon ?? ''" [dismissible]="true">{{ b.text }}</app-banner> }
    }
  `,
  styles: [`
    :host { display: block; }
    .typo { display: flex; flex-direction: column; }
    .typo-row {
      display: grid; grid-template-columns: 82px minmax(0, 1fr); gap: 12px; align-items: baseline;
      padding: 10px 0; border-bottom: 1px dashed var(--border-color);
      &:last-child { border-bottom: 0; }
      > :not(.typo-tag) { margin: 0; color: var(--text-primary); overflow-wrap: anywhere; }
    }
    .typo-tag { font-family: var(--font-mono); font-size: var(--hz-meta); color: var(--text-muted); }
    .quote {
      padding: 4px 0 4px 14px; border-left: 3px solid var(--tone);
      font-family: var(--font-heading); font-size: 17px; font-style: italic; line-height: 1.5;
    }
    .article { display: block; }
    .codes { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 24px; padding: 4px 0; }
    .barcode { padding: 12px; border-radius: 12px; background: #fff; }
  `],
})
export class HzContentComponent {
  readonly block = input.required<ContentBlock>();

  readonly me = ME;
  readonly people = PEOPLE;
  /** Fil de commentaires : copie locale pour que réponses et réactions persistent. */
  readonly comments = linkedSignal<CommentItem[]>(() => { const b = this.block(); return b.type === 'comments' ? b.comments : []; });

  tagOf = (v: HzTextVariant) => TAG[v] ?? 'p';
  cls = (v: HzTextVariant) => `text-${v}`;
  toneVar = (tone?: string) => (!tone ? null : tone === 'neutral' ? 'var(--text-muted)' : tone === 'primary' ? 'var(--primary-color)' : `var(--${tone}-color)`);
}
