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
    .progress-label { font-size: 12px; font-weight: 600; color: var(--ngx-progress-label, #495057); margin-bottom: 4px; }
    .progress-track { background: var(--ngx-progress-track, #e9ecef); border-radius: 999px; overflow: hidden; position: relative; }
    .progress-fill { height: 100%; border-radius: 999px; transition: width 0.3s ease; }
    .progress-value { font-size: 11px; color: #6c757d; margin-top: 3px; text-align: right; }

    .progress-fill-indeterminate { height: 100%; border-radius: 999px; width: 40%; animation: indeterminate 1.5s infinite ease-in-out; position: absolute; }
    @keyframes indeterminate { 0% { left: -40%; } 100% { left: 120%; } }

    .variant-primary { background: var(--ngx-progress-primary, #1a73e8); }
    .variant-success { background: var(--ngx-progress-success, #27ae60); }
    .variant-danger { background: var(--ngx-progress-danger, #e74c3c); }
    .variant-warning { background: var(--ngx-progress-warning, #f39c12); }
    .variant-info { background: var(--ngx-progress-info, #17a2b8); }
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
