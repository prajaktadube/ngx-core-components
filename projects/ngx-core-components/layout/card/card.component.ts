import { Component, computed, input, output } from '@angular/core';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';

@Component({
  selector: 'ngx-card',
  standalone: true,
  template: `
    <div
      class="ngx-card"
      [class]="'ngx-card-' + variant()"
      [class.hoverable]="hoverable()"
      [class.selectable]="selectable()"
      [class.selected]="selected()"
      (click)="(selectable() || hoverable()) ? cardClick.emit($event) : null"
    >
      @if (hasHeader()) {
        <div class="card-header">
          @if (headerIcon()) { <span class="card-header-icon">{{ headerIcon() }}</span> }
          <div class="card-header-text">
            <div class="card-title">{{ title() }}</div>
            @if (subtitle()) { <div class="card-subtitle">{{ subtitle() }}</div> }
          </div>
          <div class="card-header-actions">
            <ng-content select="[cardActions]" />
          </div>
        </div>
      }
      @if (imageUrl()) {
        <div class="card-image"><img [src]="imageUrl()" [alt]="imageAlt()" /></div>
      }
      <div class="card-body">
        <ng-content />
      </div>
      <ng-content select="[cardFooter]" />
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-card {
      background: var(--ngx-card-bg, #fff);
      border-radius: var(--ngx-card-radius, 8px);
      overflow: hidden; font-family: inherit;
    }
    .ngx-card-default { border: 1px solid var(--ngx-card-border, #e9ecef); }
    .ngx-card-outlined { border: 2px solid var(--ngx-card-border, #dee2e6); }
    .ngx-card-elevated { border: none; box-shadow: var(--ngx-card-shadow, 0 2px 12px rgba(0,0,0,0.1)); }
    .ngx-card-filled { background: var(--ngx-card-filled-bg, #f8f9fa); border: 1px solid transparent; }
    .ngx-card.hoverable { transition: box-shadow 0.2s, transform 0.2s; cursor: pointer; }
    .ngx-card.hoverable:hover { box-shadow: var(--ngx-card-hover-shadow, 0 4px 20px rgba(0,0,0,0.15)); transform: translateY(-2px); }
    .ngx-card.selectable { cursor: pointer; }
    .ngx-card.selected { border-color: var(--ngx-card-selected-border, #1a73e8); box-shadow: 0 0 0 2px rgba(26,115,232,0.2); }

    .card-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px 0; }
    .card-header-icon { font-size: 20px; flex-shrink: 0; }
    .card-header-text { flex: 1; min-width: 0; }
    .card-title { font-size: 15px; font-weight: 700; color: var(--ngx-card-title-color, #212529); }
    .card-subtitle { font-size: 12px; color: var(--ngx-card-subtitle-color, #6c757d); margin-top: 2px; }
    .card-header-actions { display: flex; align-items: center; gap: 6px; }

    .card-image img { width: 100%; height: 180px; object-fit: cover; display: block; }
    .card-body { padding: var(--ngx-card-padding, 20px); font-size: 14px; color: var(--ngx-card-text, #495057); line-height: 1.6; }
  `]
})
export class CardComponent {
  title = input('');
  subtitle = input('');
  headerIcon = input('');
  imageUrl = input('');
  imageAlt = input('');
  variant = input<CardVariant>('default');
  hoverable = input(false);
  selectable = input(false);
  selected = input(false);

  cardClick = output<MouseEvent>();

  hasHeader = computed(() => !!(this.title() || this.subtitle() || this.headerIcon()));
}
