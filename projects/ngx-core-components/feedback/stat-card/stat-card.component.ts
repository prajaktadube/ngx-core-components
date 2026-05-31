import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatCardVariant = 'default' | 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'ngx-stat-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-stat-card"
      [class.dark]="theme() === 'dark'"
      [class.loading]="loading()"
      [class]="variantClass()"
    >
      <!-- Loading skeleton -->
      @if (loading()) {
        <div class="ngx-stat-card__skeleton">
          <div class="skeleton-row skeleton-label"></div>
          <div class="skeleton-row skeleton-value"></div>
          <div class="skeleton-row skeleton-subtitle"></div>
        </div>
      } @else {
        <!-- Icon -->
        @if (icon()) {
          <div class="ngx-stat-card__icon">{{ icon() }}</div>
        }

        <!-- Label -->
        <div class="ngx-stat-card__label">{{ label() }}</div>

        <!-- Value -->
        <div class="ngx-stat-card__value">{{ value() }}</div>

        <!-- Trend + Subtitle row -->
        <div class="ngx-stat-card__footer">
          @if (trend() !== 'neutral' || trendValue()) {
            <span class="ngx-stat-card__trend" [class]="trendClass()">
              {{ trendArrow() }}
              @if (trendValue()) {
                <span class="ngx-stat-card__trend-value">{{ trendValue() }}</span>
              }
            </span>
          }
          @if (subtitle()) {
            <span class="ngx-stat-card__subtitle">{{ subtitle() }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* ── Base card ── */
    .ngx-stat-card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 22px 24px 18px;
      border-radius: 16px;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      background: var(--ngx-stat-card-bg, rgba(255, 255, 255, 0.72));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1.5px solid var(--ngx-stat-card-border, rgba(255, 255, 255, 0.55));
      box-shadow:
        0 4px 24px rgba(0, 0, 0, 0.07),
        0 1.5px 4px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      transition:
        transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.22s ease,
        border-color 0.2s ease;
      cursor: default;
    }

    .ngx-stat-card:hover:not(.loading) {
      transform: translateY(-3px) scale(1.005);
      box-shadow:
        0 12px 36px rgba(0, 0, 0, 0.1),
        0 4px 8px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.85);
    }

    /* ── Dark mode ── */
    .ngx-stat-card.dark {
      background: var(--ngx-stat-card-dark-bg, rgba(30, 32, 48, 0.85));
      border-color: var(--ngx-stat-card-dark-border, rgba(255, 255, 255, 0.08));
      box-shadow:
        0 4px 24px rgba(0, 0, 0, 0.35),
        0 1.5px 4px rgba(0, 0, 0, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }
    .ngx-stat-card.dark:hover:not(.loading) {
      box-shadow:
        0 12px 36px rgba(0, 0, 0, 0.5),
        0 4px 8px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.07);
    }

    /* ── Variant accent strips (top border gradient) ── */
    .ngx-stat-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      padding: 1.5px;
      background: var(--ngx-stat-card-gradient, linear-gradient(135deg, rgba(200,200,200,0.3) 0%, transparent 60%));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    .ngx-stat-card-success::before {
      background: linear-gradient(135deg, hsl(142, 70%, 65%) 0%, transparent 55%);
    }
    .ngx-stat-card-danger::before {
      background: linear-gradient(135deg, hsl(0, 75%, 65%) 0%, transparent 55%);
    }
    .ngx-stat-card-warning::before {
      background: linear-gradient(135deg, hsl(38, 90%, 62%) 0%, transparent 55%);
    }
    .ngx-stat-card-info::before {
      background: linear-gradient(135deg, hsl(207, 90%, 65%) 0%, transparent 55%);
    }
    .ngx-stat-card-default::before {
      background: linear-gradient(135deg, hsl(250, 60%, 72%) 0%, transparent 55%);
    }

    /* ── Icon ── */
    .ngx-stat-card__icon {
      font-size: 28px;
      line-height: 1;
      margin-bottom: 2px;
      user-select: none;
    }

    /* ── Label ── */
    .ngx-stat-card__label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ngx-stat-label-color, hsl(220, 15%, 55%));
    }
    .dark .ngx-stat-card__label {
      color: var(--ngx-stat-label-dark-color, hsl(220, 15%, 60%));
    }

    /* ── Value ── */
    .ngx-stat-card__value {
      font-size: 36px;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.02em;
      color: var(--ngx-stat-value-color, hsl(220, 25%, 14%));
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dark .ngx-stat-card__value {
      color: var(--ngx-stat-value-dark-color, hsl(220, 20%, 94%));
    }

    /* ── Footer ── */
    .ngx-stat-card__footer {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
      flex-wrap: wrap;
    }

    /* ── Trend ── */
    .ngx-stat-card__trend {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 6px;
      padding: 1px 7px;
    }
    .ngx-stat-card__trend-value {
      font-size: 12px;
    }
    .trend-up {
      color: hsl(142, 60%, 30%);
      background: hsl(142, 65%, 95%);
    }
    .trend-down {
      color: hsl(0, 70%, 38%);
      background: hsl(0, 70%, 96%);
    }
    .trend-neutral {
      color: hsl(220, 10%, 48%);
      background: hsl(220, 10%, 94%);
    }
    /* Dark trend badges */
    .dark .trend-up {
      color: hsl(142, 70%, 72%);
      background: hsl(142, 50%, 10%);
    }
    .dark .trend-down {
      color: hsl(0, 75%, 72%);
      background: hsl(0, 55%, 10%);
    }
    .dark .trend-neutral {
      color: hsl(220, 12%, 68%);
      background: hsl(220, 12%, 16%);
    }

    /* ── Subtitle ── */
    .ngx-stat-card__subtitle {
      font-size: 12px;
      color: var(--ngx-stat-subtitle-color, hsl(220, 12%, 55%));
    }
    .dark .ngx-stat-card__subtitle {
      color: var(--ngx-stat-subtitle-dark-color, hsl(220, 12%, 58%));
    }

    /* ── Skeleton loading ── */
    .ngx-stat-card__skeleton {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 4px 0;
    }

    .skeleton-row {
      border-radius: 6px;
      background: linear-gradient(
        90deg,
        rgba(150, 150, 150, 0.12) 25%,
        rgba(150, 150, 150, 0.22) 50%,
        rgba(150, 150, 150, 0.12) 75%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.4s ease-in-out infinite;
    }
    .dark .skeleton-row {
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.04) 25%,
        rgba(255, 255, 255, 0.10) 50%,
        rgba(255, 255, 255, 0.04) 75%
      );
      background-size: 200% 100%;
    }

    .skeleton-label  { height: 12px; width: 45%; }
    .skeleton-value  { height: 36px; width: 65%; }
    .skeleton-subtitle { height: 12px; width: 55%; }

    @keyframes skeleton-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class StatCardComponent {
  label       = input<string>('');
  value       = input<string | number>('');
  subtitle    = input<string>('');
  trend       = input<'up' | 'down' | 'neutral'>('neutral');
  trendValue  = input<string>('');
  icon        = input<string>('');
  variant     = input<StatCardVariant>('default');
  theme       = input<'light' | 'dark'>('light');
  loading     = input<boolean>(false);

  variantClass = computed(() => `ngx-stat-card-${this.variant()}`);

  trendClass = computed(() => `trend-${this.trend()}`);

  trendArrow = computed(() => {
    switch (this.trend()) {
      case 'up':   return '▲';
      case 'down': return '▼';
      default:     return '—';
    }
  });
}
