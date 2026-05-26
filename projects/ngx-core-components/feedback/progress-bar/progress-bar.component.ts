import { Component, computed, input } from '@angular/core';

export type ProgressVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'ngx-progress-bar',
  standalone: true,
  template: `
    <div class="ngx-progress-bar">
      @if (label()) { <div class="progress-label">{{ label() }}</div> }
      <div class="progress-track" [style.height.px]="height()">
        @if (indeterminate()) {
          <div class="progress-fill-indeterminate" [class]="'variant-' + variant()"></div>
        } @else {
          <div
            class="progress-fill"
            [class]="'variant-' + variant()"
            [style.width.%]="clampedPct()"
            role="progressbar"
            [attr.aria-valuenow]="value()"
            [attr.aria-valuemin]="min()"
            [attr.aria-valuemax]="max()"
          ></div>
        }
      </div>
      @if (showValue()) {
        <div class="progress-value">{{ clampedPct().toFixed(0) }}%</div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-progress-bar { width: 100%; }
    .progress-label { font-size: 12px; font-weight: 600; color: var(--ngx-progress-label, var(--text-secondary, #475569)); margin-bottom: 4px; }
    .progress-track { background: var(--ngx-progress-track, var(--border-color, #e2e8f0)); border-radius: 999px; overflow: hidden; position: relative; }
    .progress-fill { 
      height: 100%; border-radius: 999px; transition: width 0.3s ease; 
      background-image: linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent);
      background-size: 1rem 1rem;
      animation: progress-bar-stripes 1s linear infinite;
    }
    .progress-value { font-size: 11px; color: var(--text-secondary, #6c757d); margin-top: 3px; text-align: right; }

    .progress-fill-indeterminate { height: 100%; border-radius: 999px; width: 40%; animation: indeterminate 1.5s infinite ease-in-out; position: absolute; }
    @keyframes indeterminate { 0% { left: -40%; } 100% { left: 120%; } }
    @keyframes progress-bar-stripes {
      from { background-position: 1rem 0; }
      to { background-position: 0 0; }
    }

    .variant-primary { background-color: var(--ngx-progress-primary, #4f46e5); }
    .variant-success { background-color: var(--ngx-progress-success, #10b981); }
    .variant-danger { background-color: var(--ngx-progress-danger, #ef4444); }
    .variant-warning { background-color: var(--ngx-progress-warning, #f59e0b); }
    .variant-info { background-color: var(--ngx-progress-info, #3b82f6); }
  `]
})
export class ProgressBarComponent {
  value = input(0);
  min = input(0);
  max = input(100);
  label = input('');
  variant = input<ProgressVariant>('primary');
  height = input(8);
  showValue = input(false);
  indeterminate = input(false);

  clampedPct = computed(() =>
    Math.max(0, Math.min(100, ((this.value() - this.min()) / Math.max(1, this.max() - this.min())) * 100))
  );
}
