import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'ngx-chart-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-container" [style.height.px]="height()">
      @if (mode() === 'loading') {
        <svg [attr.width]="'100%'" [attr.height]="height()" class="shimmer-svg">
          <defs>
            <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#e2e8f0" stop-opacity="0.3" />
              <stop offset="50%" stop-color="#e2e8f0" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.3" />
            </linearGradient>
          </defs>
          @switch (chartType()) {
            @case ('bar') {
              <rect x="10%" y="40%" width="12%" height="60%" fill="url(#shimmerGrad)" class="shimmer-rect" />
              <rect x="26%" y="20%" width="12%" height="80%" fill="url(#shimmerGrad)" class="shimmer-rect" />
              <rect x="42%" y="60%" width="12%" height="40%" fill="url(#shimmerGrad)" class="shimmer-rect" />
              <rect x="58%" y="30%" width="12%" height="70%" fill="url(#shimmerGrad)" class="shimmer-rect" />
              <rect x="74%" y="50%" width="12%" height="50%" fill="url(#shimmerGrad)" class="shimmer-rect" />
            }
            @case ('line') {
              <path d="M 10 80 Q 25 30 50 60 T 90 20" fill="none" stroke="url(#shimmerGrad)" stroke-width="4" transform="scale(3) translate(0, 5)" class="shimmer-rect" />
            }
            @case ('pie') {
              <circle cx="50%" cy="50%" r="30%" fill="none" stroke="url(#shimmerGrad)" stroke-width="40" class="shimmer-rect" />
            }
            @case ('scatter') {
              <circle cx="20%" cy="70%" r="8" fill="url(#shimmerGrad)" class="shimmer-rect" />
              <circle cx="40%" cy="40%" r="6" fill="url(#shimmerGrad)" class="shimmer-rect" />
              <circle cx="60%" cy="80%" r="10" fill="url(#shimmerGrad)" class="shimmer-rect" />
              <circle cx="80%" cy="30%" r="7" fill="url(#shimmerGrad)" class="shimmer-rect" />
            }
            @default {
              <line x1="10%" y1="90%" x2="90%" y2="90%" stroke="url(#shimmerGrad)" stroke-width="2" class="shimmer-rect" />
              <line x1="10%" y1="10%" x2="10%" y2="90%" stroke="url(#shimmerGrad)" stroke-width="2" class="shimmer-rect" />
              <rect x="20%" y="30%" width="30%" height="40%" fill="url(#shimmerGrad)" class="shimmer-rect" />
              <circle cx="70%" cy="50%" r="15%" fill="url(#shimmerGrad)" class="shimmer-rect" />
            }
          }
        </svg>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">{{ icon() }}</div>
          <div class="empty-message">{{ message() }}</div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-container {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ngx-chart-bg, transparent);
      border-radius: 8px;
    }
    .shimmer-svg {
      width: 100%;
      height: 100%;
    }
    .shimmer-rect {
      animation: shimmer 2s infinite linear;
    }
    @keyframes shimmer {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 0.5; }
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
    }
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .empty-message {
      font-size: 16px;
      color: var(--ngx-chart-axis-text, #64748b);
      font-family: sans-serif;
    }
  `]
})
export class ChartSkeletonComponent {
  mode = input<'loading' | 'empty'>('loading');
  chartType = input<'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'generic'>('generic');
  height = input<number>(260);
  message = input<string>('No data available');
  icon = input<string>('📊');
}
