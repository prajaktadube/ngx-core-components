import { Component, input } from '@angular/core';

export type SkeletonShape = 'text' | 'circle' | 'rect' | 'card';

@Component({
  selector: 'ngx-skeleton',
  standalone: true,
  template: `
    @if (shape() === 'card') {
      <div class="skeleton-card">
        <div class="skeleton-rect" [style.height.px]="160"></div>
        <div class="skeleton-card-body">
          <div class="skeleton-text" [style.width]="'70%'"></div>
          <div class="skeleton-text" [style.width]="'90%'"></div>
          <div class="skeleton-text" [style.width]="'50%'"></div>
        </div>
      </div>
    } @else if (shape() === 'circle') {
      <div class="skeleton-circle" [style.width.px]="size()" [style.height.px]="size()"></div>
    } @else if (shape() === 'text') {
      <div class="skeleton-text-block">
        @for (line of lines(); track $index) {
          <div class="skeleton-text" [style.width]="line"></div>
        }
      </div>
    } @else {
      <div class="skeleton-rect" [style.width]="width()" [style.height]="height()"></div>
    }
  `,
  styles: [`
    :host { display: block; }
    .skeleton-circle, .skeleton-rect, .skeleton-text { 
      background: var(--ngx-skeleton-bg, var(--border-color, #e2e8f0)); 
      border-radius: 4px; 
      animation: shimmer 1.5s infinite linear; 
      background-size: 200% 100%; 
      background-image: linear-gradient(90deg, 
        var(--ngx-skeleton-bg, var(--border-color, #e2e8f0)) 25%, 
        var(--ngx-skeleton-highlight, var(--bg-primary, #f1f5f9)) 50%, 
        var(--ngx-skeleton-bg, var(--border-color, #e2e8f0)) 75%
      ); 
    }
    .skeleton-circle { border-radius: 50%; }
    .skeleton-text { height: 14px; margin-bottom: 8px; border-radius: 4px; }
    .skeleton-text:last-child { margin-bottom: 0; }
    .skeleton-rect { border-radius: 6px; }
    .skeleton-card { border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--bg-secondary) !important; border: 1px solid var(--border-color); }
    .skeleton-card-body { padding: 12px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `]
})
export class SkeletonComponent {
  shape = input<SkeletonShape>('rect');
  size = input(40);
  width = input('100%');
  height = input('16px');
  lines = input<string[]>(['100%', '80%', '60%']);
}
