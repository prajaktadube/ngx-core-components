import {
  Component, ChangeDetectionStrategy, input, output, signal, computed, forwardRef, ElementRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface RadioOption {
  label: string;
  value: unknown;
  disabled?: boolean;
}

@Component({
  selector: 'ngx-radio-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="ngx-radio-group-container"
      [class.has-error]="_resolvedStatus() === 'error'"
      [class.disabled]="disabled()"
      [class.status-success]="_resolvedStatus() === 'success'"
      [class.status-warning]="_resolvedStatus() === 'warning'"
    >
      @if (label()) {
        <span class="ngx-radio-group-label">{{ label() }}</span>
      }
      <div
        class="ngx-radio-group-options"
        [class.inline]="inline()"
        role="radiogroup"
        [attr.aria-label]="label()"
      >
        @for (opt of options(); track opt.value; let idx = $index) {
          <label
            class="ngx-radio"
            [class.disabled]="disabled() || !!opt.disabled"
            [class.checked]="isChecked(opt.value)"
          >
            <span
              class="ngx-radio-btn"
              [class.checked]="isChecked(opt.value)"
              (click)="select(opt)"
              role="radio"
              [attr.aria-checked]="isChecked(opt.value)"
              [attr.aria-disabled]="disabled() || opt.disabled"
              [attr.tabindex]="getTabindex(opt, idx)"
              (keydown)="onOptionKeyDown($event, opt, idx)"
            >
              <span class="ngx-radio-dot" [class.visible]="isChecked(opt.value)"></span>
            </span>
            <span class="ngx-radio-label" (click)="select(opt)">{{ opt.label }}</span>
          </label>
        }
      </div>
      
      @if (error()) {
        <div class="ngx-radio-error">{{ error() }}</div>
      } @else if (hint()) {
        <div class="ngx-radio-hint">{{ hint() }}</div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --ngx-input-success-border: #10b981;
      --ngx-input-success-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
      --ngx-input-warning-border: #f59e0b;
      --ngx-input-warning-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
      --ngx-input-error-border: #ef4444;
      --ngx-input-error-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
      
      --ngx-radio-border: #cbd5e1;
      --ngx-radio-bg: #ffffff;
      --ngx-radio-active: #4f46e5;
      --ngx-radio-text: #0f172a;
    }
    
    :host-context(body.dark),
    :host-context(.dark),
    :host-context(.dark-theme) {
      --ngx-radio-border: #475569;
      --ngx-radio-bg: #0f172a;
      --ngx-radio-active: #818cf8;
      --ngx-radio-text: #f8fafc;
      
      --ngx-input-success-border: #34d399;
      --ngx-input-success-shadow: 0 0 0 3px rgba(52, 211, 153, 0.3);
      --ngx-input-warning-border: #fbbf24;
      --ngx-input-warning-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3);
      --ngx-input-error-border: #f87171;
      --ngx-input-error-shadow: 0 0 0 3px rgba(248, 113, 113, 0.3);
    }
    
    .ngx-radio-group-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-family: inherit;
    }
    
    .ngx-radio-group-label {
      display: block;
      font-size: 13px;
      color: var(--ngx-radio-border);
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .ngx-radio-group-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ngx-radio-group-options.inline {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .ngx-radio {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
    }
    .ngx-radio.disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }
    
    .ngx-radio-btn {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      border: 2px solid var(--ngx-radio-border);
      border-radius: 50%;
      background: var(--ngx-radio-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }
    
    .ngx-radio-btn.checked {
      border-color: var(--ngx-radio-active);
    }
    
    .ngx-radio-btn:hover:not(.disabled) {
      border-color: var(--ngx-radio-active);
      transform: scale(1.05);
    }
    
    .ngx-radio-btn:focus-visible {
      border-color: var(--ngx-radio-active);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
    }
    
    .status-success .ngx-radio-btn { border-color: var(--ngx-input-success-border); }
    .status-success .ngx-radio-btn.checked { border-color: var(--ngx-input-success-border); }
    .status-success .ngx-radio-dot { background: var(--ngx-input-success-border); }
    .status-success .ngx-radio-btn:focus-visible { box-shadow: var(--ngx-input-success-shadow); }
    
    .status-warning .ngx-radio-btn { border-color: var(--ngx-input-warning-border); }
    .status-warning .ngx-radio-btn.checked { border-color: var(--ngx-input-warning-border); }
    .status-warning .ngx-radio-dot { background: var(--ngx-input-warning-border); }
    .status-warning .ngx-radio-btn:focus-visible { box-shadow: var(--ngx-input-warning-shadow); }
    
    .has-error .ngx-radio-btn { border-color: var(--ngx-input-error-border); }
    .has-error .ngx-radio-btn.checked { border-color: var(--ngx-input-error-border); }
    .has-error .ngx-radio-dot { background: var(--ngx-input-error-border); }
    .has-error .ngx-radio-btn:focus-visible { box-shadow: var(--ngx-input-error-shadow); }
    
    .ngx-radio-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--ngx-radio-active);
      opacity: 0;
      transform: scale(0.4);
      transition: opacity 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                  transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .ngx-radio-dot.visible {
      opacity: 1;
      transform: scale(1);
    }
    
    .ngx-radio-label {
      font-size: 14px;
      color: var(--ngx-radio-text);
      transition: color 0.15s ease;
    }
    .disabled .ngx-radio-label {
      cursor: not-allowed;
      opacity: 0.55;
    }
    
    .ngx-radio-error {
      color: var(--ngx-input-error-border);
      font-size: 12px;
      font-weight: 550;
      animation: slide-down 0.2s ease-out;
    }
    .ngx-radio-hint {
      color: #64748b;
      font-size: 12px;
    }
    
    @keyframes slide-down {
      from { transform: translateY(-4px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `],
})
export class RadioGroupComponent implements ControlValueAccessor {
  options = input<RadioOption[]>([]);
  label = input<string>('');
  value = input<unknown>(null);
  disabled = input<boolean>(false);
  inline = input<boolean>(false);

  // Enterprise validation signals
  status = input<'default' | 'success' | 'warning' | 'error'>('default');
  error = input<string>('');
  hint = input<string>('');

  valueChange = output<unknown>();

  _value = signal<unknown>(null);
  private _cvaActive = false;

  private _onChange: (val: unknown) => void = () => {};
  private _onTouched: () => void = () => {};

  _activeValue = computed(() => this._cvaActive ? this._value() : this.value());

  _resolvedStatus = computed(() => {
    if (this.error()) return 'error';
    return this.status();
  });

  constructor(private el: ElementRef) {}

  isChecked(val: unknown): boolean {
    return this._activeValue() === val;
  }

  select(opt: RadioOption): void {
    if (this.disabled() || opt.disabled) return;
    this._value.set(opt.value);
    this._onChange(opt.value);
    this._onTouched();
    this.valueChange.emit(opt.value);
  }

  getTabindex(opt: RadioOption, idx: number): string {
    if (this.disabled() || opt.disabled) return '-1';
    
    const activeVal = this._activeValue();
    const opts = this.options();
    
    if (activeVal !== null && activeVal !== undefined) {
      return this.isChecked(opt.value) ? '0' : '-1';
    }
    
    const firstEnabledIdx = opts.findIndex(o => !o.disabled);
    return idx === firstEnabledIdx ? '0' : '-1';
  }

  onOptionKeyDown(event: KeyboardEvent, opt: RadioOption, idx: number): void {
    if (this.disabled()) return;
    
    let nextIdx = idx;
    const opts = this.options();
    
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      do {
        nextIdx = (nextIdx + 1) % opts.length;
      } while (opts[nextIdx].disabled && nextIdx !== idx);
      
      this.select(opts[nextIdx]);
      this.focusOption(nextIdx);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      do {
        nextIdx = (nextIdx - 1 + opts.length) % opts.length;
      } while (opts[nextIdx].disabled && nextIdx !== idx);
      
      this.select(opts[nextIdx]);
      this.focusOption(nextIdx);
    }
  }

  private focusOption(idx: number): void {
    setTimeout(() => {
      const radioBtns = this.el.nativeElement.querySelectorAll('.ngx-radio-btn');
      if (radioBtns[idx]) {
        (radioBtns[idx] as HTMLElement).focus();
      }
    });
  }

  // ControlValueAccessor
  writeValue(val: unknown): void {
    this._cvaActive = true;
    this._value.set(val ?? null);
  }

  registerOnChange(fn: (val: unknown) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled at form control template level
  }
}
