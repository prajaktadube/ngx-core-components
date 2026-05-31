import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  model,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SegmentedOption {
  label: string;
  value: any;
  badge?: string;
}

@Component({
  selector: 'ngx-segmented-control',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-segmented-control"
      [class.dark]="theme() === 'dark'"
      [class.disabled]="disabled()"
      [attr.id]="id()"
    >
      <!-- Sliding Highlight Backdrop indicator -->
      @if (selectedIndex() >= 0) {
        <div
          class="ngx-segmented-control__indicator"
          [style.width.%]="100 / options().length"
          [style.transform]="'translateX(' + (selectedIndex() * 100) + '%)'"
          [class]="variantClass()"
        ></div>
      }

      <!-- Option buttons -->
      @for (opt of options(); track opt.value; let idx = $index) {
        <button
          class="ngx-segmented-control__option"
          [class.selected]="idx === selectedIndex()"
          (click)="selectOption(opt.value)"
          [disabled]="disabled()"
          [style.width.%]="100 / options().length"
          type="button"
        >
          <span class="ngx-segmented-control__label-text">{{ opt.label }}</span>
          @if (opt.badge) {
            <span class="ngx-segmented-control__badge">{{ opt.badge }}</span>
          }
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      min-width: 240px;
    }

    .ngx-segmented-control {
      position: relative;
      display: flex;
      width: 100%;
      background: rgba(0, 0, 0, 0.04);
      padding: 3px;
      border-radius: 10px;
      box-sizing: border-box;
      user-select: none;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      border: 1px solid rgba(0, 0, 0, 0.03);
    }

    .ngx-segmented-control.dark {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.03);
    }

    .ngx-segmented-control.disabled {
      opacity: 0.55;
      pointer-events: none;
    }

    /* Active indicator marker */
    .ngx-segmented-control__indicator {
      position: absolute;
      top: 3px;
      left: 0;
      bottom: 3px;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 
        0 1px 3px rgba(0, 0, 0, 0.1),
        0 1px 2px rgba(0, 0, 0, 0.06);
      transition: transform 0.26s cubic-bezier(0.25, 0.8, 0.25, 1);
      z-index: 1;
    }

    .ngx-segmented-control.dark .ngx-segmented-control__indicator {
      background: rgba(255, 255, 255, 0.15);
      box-shadow: none;
    }

    /* Option tabs buttons */
    .ngx-segmented-control__option {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      background: transparent;
      border: none;
      cursor: pointer;
      z-index: 2;
      transition: color 0.2s ease;
      outline: none;
      height: 30px;
      box-sizing: border-box;
    }

    .ngx-segmented-control__option:hover:not([disabled]) {
      color: #0f172a;
    }

    .ngx-segmented-control__option.selected {
      color: #0f172a;
    }

    .ngx-segmented-control.dark .ngx-segmented-control__option {
      color: #94a3b8;
    }

    .ngx-segmented-control.dark .ngx-segmented-control__option:hover:not([disabled]),
    .ngx-segmented-control.dark .ngx-segmented-control__option.selected {
      color: #ffffff;
    }

    /* Badge indicators */
    .ngx-segmented-control__badge {
      font-size: 9px;
      padding: 1px 5px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.06);
      color: #475569;
      font-weight: 700;
      transition: all 0.2s ease;
    }

    .ngx-segmented-control__option.selected .ngx-segmented-control__badge {
      background: rgba(0, 0, 0, 0.1);
    }

    .ngx-segmented-control.dark .ngx-segmented-control__badge {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }

    .ngx-segmented-control.dark .ngx-segmented-control__option.selected .ngx-segmented-control__badge {
      background: rgba(255, 255, 255, 0.15);
    }

    /* ── Variants accent colors ── */
    .ngx-segmented-control__indicator.primary {
      background: var(--primary-color, #3b82f6);
    }
    .ngx-segmented-control__indicator.success {
      background: #10b981;
    }
    .ngx-segmented-control__indicator.danger {
      background: #ef4444;
    }
    .ngx-segmented-control__indicator.warning {
      background: #f59e0b;
    }
    .ngx-segmented-control__indicator.info {
      background: #3b82f6;
    }

    .ngx-segmented-control__indicator.primary,
    .ngx-segmented-control__indicator.success,
    .ngx-segmented-control__indicator.danger,
    .ngx-segmented-control__indicator.warning,
    .ngx-segmented-control__indicator.info {
      box-shadow: none;
    }

    /* Text colors matching colored indicators */
    .ngx-segmented-control__indicator:not(.default) ~ .ngx-segmented-control__option.selected {
      color: #ffffff;
    }

    .ngx-segmented-control:has(.ngx-segmented-control__indicator:not(.default)) .ngx-segmented-control__option.selected {
      color: #ffffff !important;
    }

    .ngx-segmented-control:has(.ngx-segmented-control__indicator:not(.default)) .ngx-segmented-control__option.selected .ngx-segmented-control__badge {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }
  `]
})
export class SegmentedControlComponent {
  // Inputs
  options = input<SegmentedOption[]>([]);
  value = model<any>(null); // Signal-based model for two-way binding
  disabled = input<boolean>(false);
  theme = input<'light' | 'dark'>('light');
  variant = input<'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info'>('default');
  id = input<string>('ngx-segmented-' + Math.random().toString(36).substring(2, 9));

  // Outputs
  valueChange = output<any>();

  // Computeds
  selectedIndex = computed(() => {
    const val = this.value();
    return this.options().findIndex(opt => opt.value === val);
  });

  variantClass = computed(() => {
    return this.variant() !== 'default' ? this.variant() : '';
  });

  selectOption(val: any) {
    if (this.disabled()) return;
    this.value.set(val);
    this.valueChange.emit(val);
  }
}
