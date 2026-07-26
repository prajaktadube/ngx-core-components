import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  model,
  computed,
  viewChildren,
  ElementRef,
  effect,
  signal,
  HostListener,
  OnInit
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
      [class.auto-width]="!equalWidth()"
      [class]="variantClass()"
      [attr.id]="id()"
    >
      <!-- Sliding Highlight Backdrop indicator -->
      @if (selectedIndex() >= 0) {
        <div
          class="ngx-segmented-control__indicator"
          [style.width.px]="indicatorWidth()"
          [style.transform]="'translateX(' + indicatorLeft() + 'px)'"
          [class]="variant()"
        ></div>
      }

      <!-- Option buttons -->
      @for (opt of options(); track opt.value; let idx = $index) {
        <button
          #optionBtn
          class="ngx-segmented-control__option"
          [class.selected]="idx === selectedIndex()"
          (click)="selectOption(opt.value)"
          [disabled]="disabled()"
          [style.flex]="equalWidth() ? '1 1 0%' : '0 0 auto'"
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
      min-width: 200px;
    }

    .ngx-segmented-control {
      position: relative;
      display: inline-flex;
      width: 100%;
      background: rgba(15, 23, 42, 0.05);
      padding: 3px;
      border-radius: 12px;
      box-sizing: border-box;
      user-select: none;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      border: 1px solid rgba(15, 23, 42, 0.04);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .ngx-segmented-control.dark {
      background: rgba(30, 41, 59, 0.6);
      border-color: rgba(255, 255, 255, 0.05);
    }

    .ngx-segmented-control.disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    /* Active sliding indicator marker */
    .ngx-segmented-control__indicator {
      position: absolute;
      top: 3px;
      left: 0;
      bottom: 3px;
      background: #ffffff;
      border-radius: 9px;
      box-shadow: 
        0 2px 4px rgba(15, 23, 42, 0.04),
        0 4px 10px rgba(15, 23, 42, 0.08);
      transition: transform 0.28s cubic-bezier(0.25, 0.8, 0.25, 1), width 0.28s cubic-bezier(0.25, 0.8, 0.25, 1);
      z-index: 1;
    }

    .ngx-segmented-control.dark .ngx-segmented-control__indicator.default {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: none;
    }

    /* Option tabs buttons */
    .ngx-segmented-control__option {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 16px;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      background: transparent;
      border: none;
      cursor: pointer;
      z-index: 2;
      transition: color 0.2s ease, transform 0.1s ease;
      outline: none;
      height: 32px;
      box-sizing: border-box;
    }

    .ngx-segmented-control__option:hover:not([disabled]) {
      color: #0f172a;
    }

    .ngx-segmented-control__option:active:not([disabled]) {
      transform: scale(0.97);
    }

    .ngx-segmented-control__option.selected {
      color: #0f172a;
    }

    .ngx-segmented-control.dark .ngx-segmented-control__option {
      color: #94a3b8;
    }

    .ngx-segmented-control.dark .ngx-segmented-control__option:hover:not([disabled]) {
      color: #cbd5e1;
    }

    .ngx-segmented-control.dark .ngx-segmented-control__option.selected {
      color: #ffffff;
    }

    /* Badge indicators */
    .ngx-segmented-control__badge {
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 99px;
      background: rgba(15, 23, 42, 0.08);
      color: #475569;
      font-weight: 750;
      transition: all 0.2s ease;
    }

    .ngx-segmented-control__option.selected .ngx-segmented-control__badge {
      background: rgba(15, 23, 42, 0.12);
      color: #0f172a;
    }

    .ngx-segmented-control.dark .ngx-segmented-control__badge {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }

    .ngx-segmented-control.dark .ngx-segmented-control__option.selected .ngx-segmented-control__badge {
      background: rgba(255, 255, 255, 0.16);
      color: #ffffff;
    }

    /* ── Variants accent colors ── */
    .ngx-segmented-control__indicator.primary {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    }
    .ngx-segmented-control__indicator.success {
      background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    }
    .ngx-segmented-control__indicator.danger {
      background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    }
    .ngx-segmented-control__indicator.warning {
      background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
    }
    .ngx-segmented-control__indicator.info {
      background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
    }

    .ngx-segmented-control__indicator.primary,
    .ngx-segmented-control__indicator.success,
    .ngx-segmented-control__indicator.danger,
    .ngx-segmented-control__indicator.warning,
    .ngx-segmented-control__indicator.info {
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
      border: none;
    }

    /* Text colors matching colored indicators */
    .ngx-segmented-control-variant-active .ngx-segmented-control__option.selected {
      color: #ffffff !important;
    }

    .ngx-segmented-control-variant-active .ngx-segmented-control__option.selected .ngx-segmented-control__badge {
      background: rgba(255, 255, 255, 0.2) !important;
      color: #ffffff !important;
    }
  `]
})
export class SegmentedControlComponent implements OnInit {
  // Inputs
  options = input<SegmentedOption[]>([]);
  value = model<any>(null); // Signal-based model for two-way binding
  disabled = input<boolean>(false);
  theme = input<'light' | 'dark'>('light');
  variant = input<'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info'>('default');
  equalWidth = input<boolean>(true);
  id = input<string>('ngx-segmented-' + Math.random().toString(36).substring(2, 9));

  // Outputs
  valueChange = output<any>();

  // Sliding Indicator State Signals
  indicatorWidth = signal<number>(0);
  indicatorLeft = signal<number>(0);

  // View Children query to access button native elements
  optionElements = viewChildren<ElementRef<HTMLButtonElement>>('optionBtn');

  // Computeds
  selectedIndex = computed(() => {
    const val = this.value();
    return this.options().findIndex(opt => opt.value === val);
  });

  variantClass = computed(() => {
    let classes = '';
    if (this.variant() !== 'default') {
      classes += ' ngx-segmented-control-variant-active';
    }
    return classes;
  });

  constructor() {
    // Reactively update indicator coordinates when option query or selection shifts
    effect(() => {
      this.updateIndicator();
    });
  }

  ngOnInit(): void {
    // Initial update trigger
    setTimeout(() => this.updateIndicator(), 50);
  }

  @HostListener('window:resize')
  onResize() {
    this.updateIndicator();
  }

  updateIndicator() {
    const idx = this.selectedIndex();
    const buttons = this.optionElements();
    if (idx >= 0 && buttons && buttons[idx]) {
      const btnEl = buttons[idx].nativeElement;
      this.indicatorWidth.set(btnEl.offsetWidth);
      this.indicatorLeft.set(btnEl.offsetLeft);
    }
  }

  selectOption(val: any) {
    if (this.disabled()) return;
    this.value.set(val);
    this.valueChange.emit(val);
    setTimeout(() => this.updateIndicator(), 0);
  }
}
