import {
  Component, ChangeDetectionStrategy, input, output, signal, computed, forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ngx-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <div class="ngx-checkbox-container" [class.has-error]="_resolvedStatus() === 'error'" [class.disabled]="disabled()" [class.status-success]="_resolvedStatus() === 'success'" [class.status-warning]="_resolvedStatus() === 'warning'">
      <div class="ngx-checkbox-row">
        <span
          class="ngx-checkbox-box"
          [class.checked]="_displayChecked()"
          [class.indeterminate]="indeterminate()"
          (click)="toggle()"
          (keydown.space)="$event.preventDefault(); toggle()"
          (keydown.enter)="$event.preventDefault(); toggle()"
          role="checkbox"
          [attr.aria-checked]="indeterminate() ? 'mixed' : _displayChecked()"
          [attr.aria-disabled]="disabled()"
          [attr.tabindex]="disabled() ? null : '0'"
        >
          @if (_displayChecked() && !indeterminate()) {
            <svg class="ngx-checkbox-icon" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          } @else if (indeterminate()) {
            <span class="ngx-checkbox-dash"></span>
          }
        </span>
        @if (label()) {
          <span class="ngx-checkbox-label" (click)="toggle()">{{ label() }}</span>
        }
      </div>
      
      @if (error()) {
        <div class="ngx-checkbox-error">{{ error() }}</div>
      } @else if (hint()) {
        <div class="ngx-checkbox-hint">{{ hint() }}</div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      --ngx-input-success-border: #10b981;
      --ngx-input-success-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
      --ngx-input-warning-border: #f59e0b;
      --ngx-input-warning-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
      --ngx-input-error-border: #ef4444;
      --ngx-input-error-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
      
      --ngx-checkbox-border: #cbd5e1;
      --ngx-checkbox-bg: #ffffff;
      --ngx-checkbox-active: #4f46e5;
      --ngx-checkbox-radius: 6px;
      --ngx-checkbox-text: #0f172a;
    }
    
    :host-context(body.dark),
    :host-context(.dark),
    :host-context(.dark-theme) {
      --ngx-checkbox-border: #475569;
      --ngx-checkbox-bg: #0f172a;
      --ngx-checkbox-active: #818cf8;
      --ngx-checkbox-text: #f8fafc;
      
      --ngx-input-success-border: #34d399;
      --ngx-input-success-shadow: 0 0 0 3px rgba(52, 211, 153, 0.3);
      --ngx-input-warning-border: #fbbf24;
      --ngx-input-warning-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3);
      --ngx-input-error-border: #f87171;
      --ngx-input-error-shadow: 0 0 0 3px rgba(248, 113, 113, 0.3);
    }
    
    .ngx-checkbox-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-family: inherit;
    }
    
    .ngx-checkbox-row {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    
    .ngx-checkbox-box {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      border: 2px solid var(--ngx-checkbox-border);
      border-radius: var(--ngx-checkbox-radius);
      background: var(--ngx-checkbox-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      outline: none;
    }
    
    .disabled .ngx-checkbox-box {
      cursor: not-allowed;
      opacity: 0.55;
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    
    :host-context(.dark) .disabled .ngx-checkbox-box,
    :host-context(.dark-theme) .disabled .ngx-checkbox-box {
      background: #1e293b;
      border-color: #334155;
    }
    
    .ngx-checkbox-box.checked,
    .ngx-checkbox-box.indeterminate {
      background: var(--ngx-checkbox-active);
      border-color: var(--ngx-checkbox-active);
      color: #ffffff;
    }
    
    .ngx-checkbox-box:hover:not(.disabled) {
      border-color: var(--ngx-checkbox-active);
      transform: scale(1.05);
    }
    
    .ngx-checkbox-box:focus-visible {
      border-color: var(--ngx-checkbox-active);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
    }
    
    .status-success .ngx-checkbox-box { border-color: var(--ngx-input-success-border); }
    .status-success .ngx-checkbox-box.checked { background: var(--ngx-input-success-border); }
    .status-success .ngx-checkbox-box:focus-visible { box-shadow: var(--ngx-input-success-shadow); }
    
    .status-warning .ngx-checkbox-box { border-color: var(--ngx-input-warning-border); }
    .status-warning .ngx-checkbox-box.checked { background: var(--ngx-input-warning-border); }
    .status-warning .ngx-checkbox-box:focus-visible { box-shadow: var(--ngx-input-warning-shadow); }
    
    .has-error .ngx-checkbox-box { border-color: var(--ngx-input-error-border); }
    .has-error .ngx-checkbox-box.checked { background: var(--ngx-input-error-border); }
    .has-error .ngx-checkbox-box:focus-visible { box-shadow: var(--ngx-input-error-shadow); }
    
    .ngx-checkbox-icon {
      width: 12px;
      height: 10px;
      animation: checkmark-draw 0.18s cubic-bezier(0.12, 0.4, 0.29, 1.46) forwards;
    }
    
    .ngx-checkbox-dash {
      width: 10px;
      height: 2px;
      background: #ffffff;
      border-radius: 1px;
      animation: dash-draw 0.15s ease-out forwards;
    }
    
    .ngx-checkbox-label {
      font-size: 14px;
      color: var(--ngx-checkbox-text);
      cursor: pointer;
      user-select: none;
      transition: color 0.15s ease;
    }
    .disabled .ngx-checkbox-label {
      cursor: not-allowed;
      opacity: 0.55;
    }
    
    .ngx-checkbox-error {
      color: var(--ngx-input-error-border);
      font-size: 12px;
      font-weight: 550;
      margin-left: 30px;
      animation: slide-down 0.2s ease-out;
    }
    .ngx-checkbox-hint {
      color: #64748b;
      font-size: 12px;
      margin-left: 30px;
    }
    
    @keyframes checkmark-draw {
      from { transform: scale(0.6); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes dash-draw {
      from { transform: scaleX(0.5); opacity: 0; }
      to { transform: scaleX(1); opacity: 1; }
    }
    
    @keyframes slide-down {
      from { transform: translateY(-4px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `],
})
export class CheckboxComponent implements ControlValueAccessor {
  label = input<string>('');
  checked = input<boolean>(false);
  disabled = input<boolean>(false);
  indeterminate = input<boolean>(false);

  // Enterprise validation signals
  status = input<'default' | 'success' | 'warning' | 'error'>('default');
  error = input<string>('');
  hint = input<string>('');

  checkedChange = output<boolean>();

  _checked = signal<boolean>(false);
  private _cvaActive = false;

  private _onChange: (val: boolean) => void = () => {};
  private _onTouched: () => void = () => {};

  _displayChecked = computed(() => this._cvaActive ? this._checked() : this.checked());

  _resolvedStatus = computed(() => {
    if (this.error()) return 'error';
    return this.status();
  });

  toggle(): void {
    if (this.disabled()) return;
    const next = !this._displayChecked();
    this._checked.set(next);
    this._onChange(next);
    this._onTouched();
    this.checkedChange.emit(next);
  }

  // ControlValueAccessor
  writeValue(val: boolean): void {
    this._cvaActive = true;
    this._checked.set(!!val);
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled at form control template level
  }
}
