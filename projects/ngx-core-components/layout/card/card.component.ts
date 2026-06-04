import { Component, computed, input, output } from '@angular/core';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled' | 'glass';

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
      background: var(--ngx-card-bg, var(--bg-primary, #ffffff));
      border-radius: var(--ngx-card-radius, 12px);
      overflow: hidden;
      font-family: inherit;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ngx-card-default { 
      border: 1px solid var(--ngx-card-border, var(--border-color, #e2e8f0)); 
    }
    .ngx-card-outlined { 
      border: 2px solid var(--ngx-card-border, var(--border-color, #cbd5e1)); 
    }
    .ngx-card-elevated { 
      border: 1px solid var(--ngx-card-border, rgba(0, 0, 0, 0.04));
      box-shadow: var(--ngx-card-shadow, 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.03)); 
    }
    .ngx-card-filled { 
      background: var(--ngx-card-filled-bg, var(--bg-secondary, #f8fafc)); 
      border: 1px solid transparent; 
    }
    .ngx-card-glass {
      background: var(--ngx-card-glass-bg, rgba(255, 255, 255, 0.45));
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--ngx-card-glass-border, rgba(255, 255, 255, 0.2));
      box-shadow: var(--ngx-card-glass-shadow, 0 8px 32px 0 rgba(31, 38, 135, 0.04));
    }
    .ngx-card.hoverable { 
      cursor: pointer; 
    }
    .ngx-card.hoverable:hover { 
      box-shadow: var(--ngx-card-hover-shadow, 0 12px 25px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.05)); 
      transform: translateY(-4px) scale(1.01); 
    }
    .ngx-card.selectable { 
      cursor: pointer; 
    }
    .ngx-card.selected { 
      border-color: var(--ngx-card-selected-border, var(--primary-color, #1a73e8)); 
      box-shadow: 0 0 0 2px var(--ngx-card-selected-outline, rgba(26, 115, 232, 0.15)); 
    }

    .card-header { display: flex; align-items: center; gap: 10px; padding: 20px 20px 0; }
    .card-header-icon { font-size: 20px; flex-shrink: 0; }
    .card-header-text { flex: 1; min-width: 0; }
    .card-title { font-size: 15px; font-weight: 750; color: var(--ngx-card-title-color, var(--text-primary, #0f172a)); }
    .card-subtitle { font-size: 12px; color: var(--ngx-card-subtitle-color, var(--text-secondary, #64748b)); margin-top: 2px; font-weight: 500; }
    .card-header-actions { display: flex; align-items: center; gap: 6px; }

    .card-image img { width: 100%; height: 180px; object-fit: cover; display: block; }
    .card-body { padding: var(--ngx-card-padding, 20px); font-size: 14px; color: var(--ngx-card-text, var(--text-primary, #334155)); line-height: 1.6; }
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
