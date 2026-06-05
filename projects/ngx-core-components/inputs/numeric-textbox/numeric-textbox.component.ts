import { Component, effect, input, output, signal, computed, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ngx-numeric-textbox',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumericTextBoxComponent),
      multi: true
    }
  ],
  template: `
    <div class="ngx-numeric" [class.disabled]="disabled()" [class.focused]="focused()" [class.has-error]="_resolvedStatus() === 'error'">
      @if (label()) { <label class="numeric-label">{{ label() }}</label> }
      <div class="numeric-input-wrap" [class]="'status-' + _resolvedStatus()">
        <ng-content select="[prefix]" />
        @if (prefix()) { <span class="numeric-prefix">{{ prefix() }}</span> }
        <input
          type="number" class="numeric-input"
          [min]="min()" [max]="max()" [step]="step()"
          [value]="currentValue()" [disabled]="disabled()" [placeholder]="placeholder()"
          [attr.aria-invalid]="_resolvedStatus() === 'error' ? 'true' : null"
          (focus)="focused.set(true)" (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          (change)="onChange($event)"
        />
        
        <!-- Status Indicator Icons -->
        @if (_resolvedStatus() === 'success') {
          <span class="status-icon status-icon-success" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
        } @else if (_resolvedStatus() === 'warning') {
          <span class="status-icon status-icon-warning" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </span>
        } @else if (_resolvedStatus() === 'error') {
          <span class="status-icon status-icon-error" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </span>
        }

        @if (suffix()) { <span class="numeric-suffix">{{ suffix() }}</span> }
        <ng-content select="[suffix]" />
        <div class="numeric-spin">
          <button class="spin-btn spin-up" type="button" [disabled]="disabled() || currentValue() >= max()" (click)="spin(1)" aria-label="Increase value">
            <svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor"><path d="M12 8l-6 6h12z"/></svg>
          </button>
          <button class="spin-btn spin-down" type="button" [disabled]="disabled() || currentValue() <= min()" (click)="spin(-1)" aria-label="Decrease value">
            <svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor"><path d="M12 16l6-6H6z"/></svg>
          </button>
        </div>
      </div>
      
      <div class="numeric-footer">
        @if (error()) {
          <div class="numeric-error">{{ error() }}</div>
        } @else if (hint()) {
          <div class="numeric-hint">{{ hint() }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --ngx-input-bg: #ffffff;
      --ngx-input-text: #0f172a;
      --ngx-input-border: #cbd5e1;
      --ngx-input-focus-border: #4f46e5;
      --ngx-input-focus-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
      --ngx-input-disabled-bg: #f1f5f9;
      --ngx-input-label: #475569;
      --ngx-input-label-active: #4f46e5;
      --ngx-input-placeholder: #94a3b8;
      
      --ngx-input-success-border: #10b981;
      --ngx-input-success-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
      --ngx-input-warning-border: #f59e0b;
      --ngx-input-warning-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
      --ngx-input-error-border: #ef4444;
      --ngx-input-error-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }
    
    :host-context(body.dark),
    :host-context(.dark),
    :host-context(.dark-theme) {
      --ngx-input-bg: #0f172a;
      --ngx-input-text: #f8fafc;
      --ngx-input-border: #334155;
      --ngx-input-focus-border: #818cf8;
      --ngx-input-focus-shadow: 0 0 0 3px rgba(129, 140, 248, 0.25);
      --ngx-input-disabled-bg: #1e293b;
      --ngx-input-label: #94a3b8;
      --ngx-input-label-active: #818cf8;
      --ngx-input-placeholder: #475569;
      
      --ngx-input-success-border: #34d399;
      --ngx-input-success-shadow: 0 0 0 3px rgba(52, 211, 153, 0.25);
      --ngx-input-warning-border: #fbbf24;
      --ngx-input-warning-shadow: 0 0 0 3px rgba(251, 191, 36, 0.25);
      --ngx-input-error-border: #f87171;
      --ngx-input-error-shadow: 0 0 0 3px rgba(248, 113, 113, 0.25);
    }

    .ngx-numeric { width: 100%; font-family: inherit; }
    
    .numeric-label {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      color: var(--ngx-input-label);
      margin-bottom: 6px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .focused .numeric-label {
      color: var(--ngx-input-label-active);
      transform: translateX(2px);
    }
    
    .numeric-input-wrap {
      display: flex;
      align-items: center;
      border: 1px solid var(--ngx-input-border);
      border-radius: var(--ngx-input-radius, 8px);
      background: var(--ngx-input-bg);
      overflow: hidden;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .focused .numeric-input-wrap {
      border-color: var(--ngx-input-focus-border);
      box-shadow: var(--ngx-input-focus-shadow), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    /* Validation status outline colors */
    .numeric-input-wrap.status-success {
      border-color: var(--ngx-input-success-border);
    }
    .focused .numeric-input-wrap.status-success {
      box-shadow: var(--ngx-input-success-shadow), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .numeric-input-wrap.status-warning {
      border-color: var(--ngx-input-warning-border);
    }
    .focused .numeric-input-wrap.status-warning {
      box-shadow: var(--ngx-input-warning-shadow), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .numeric-input-wrap.status-error {
      border-color: var(--ngx-input-error-border);
    }
    .focused .numeric-input-wrap.status-error {
      box-shadow: var(--ngx-input-error-shadow), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .disabled .numeric-input-wrap {
      background: var(--ngx-input-disabled-bg);
      cursor: not-allowed;
      opacity: 0.7;
      box-shadow: none;
    }
    
    .numeric-input {
      flex: 1;
      padding: 10px 14px;
      border: none;
      background: transparent;
      font-size: 14px;
      color: var(--ngx-input-text);
      outline: none;
      min-width: 0;
      -moz-appearance: textfield;
    }
    .numeric-input::placeholder {
      color: var(--ngx-input-placeholder);
      opacity: 0.8;
    }
    .numeric-input::-webkit-outer-spin-button,
    .numeric-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .numeric-input:disabled { cursor: not-allowed; }
    
    /* Status indicators */
    .status-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      flex-shrink: 0;
      animation: icon-scale-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    .status-icon-success { color: var(--ngx-input-success-border); }
    .status-icon-warning { color: var(--ngx-input-warning-border); }
    .status-icon-error { color: var(--ngx-input-error-border); }
    
    @keyframes icon-scale-in {
      from { transform: scale(0.6); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .numeric-prefix, .numeric-suffix { padding: 0 10px; color: var(--ngx-input-label); font-size: 14px; flex-shrink: 0; }
    
    /* Spin buttons */
    .numeric-spin {
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--ngx-input-border);
      align-self: stretch;
    }
    .spin-btn {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0 10px;
      color: var(--ngx-input-label);
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .spin-btn:hover:not(:disabled) {
      background: rgba(79, 70, 229, 0.08);
      color: var(--ngx-input-label-active);
    }
    .spin-btn:active:not(:disabled) {
      background: rgba(79, 70, 229, 0.15);
    }
    .spin-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    
    .spin-up {
      border-bottom: 0.5px solid var(--ngx-input-border);
    }
    
    /* Footer styles */
    .numeric-footer {
      margin-top: 5px;
      font-size: 12px;
    }
    .numeric-error {
      color: var(--ngx-input-error-border);
      font-weight: 550;
      animation: slide-down 0.2s ease-out;
    }
    .numeric-hint {
      color: var(--ngx-input-label);
    }
    
    @keyframes slide-down {
      from { transform: translateY(-4px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class NumericTextBoxComponent implements ControlValueAccessor {
  label = input('');
  value = input(0);
  min = input(-Infinity);
  max = input(Infinity);
  step = input(1);
  currentValue = signal(0);
  disabled = input(false);
  placeholder = input('');
  prefix = input('');
  suffix = input('');
  focused = signal(false);
  
  // Enterprise validation inputs
  status = input<'default' | 'success' | 'warning' | 'error'>('default');
  error = input('');
  hint = input('');

  valueChange = output<number>();

  _resolvedStatus = computed(() => {
    if (this.error()) return 'error';
    return this.status();
  });

  private onChangeFn: (v: number) => void = () => {};
  private onTouchedFn: () => void = () => {};

  constructor() {
    effect(() => {
      this.currentValue.set(this.clamp(this.value()));
    });
  }

  onChange(e: Event): void {
    const rawValue = (e.target as HTMLInputElement).value;
    if (rawValue === '') {
      (e.target as HTMLInputElement).value = String(this.currentValue());
      return;
    }

    const nextValue = Number(rawValue);
    if (Number.isFinite(nextValue)) {
      this.setValue(nextValue);
    }
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouchedFn();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.spin(1);
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.spin(-1);
    }
  }

  spin(dir: 1 | -1): void { this.setValue(this.currentValue() + dir * this.step()); }

  setValue(v: number): void {
    const clamped = this.clamp(v);
    this.currentValue.set(clamped);
    this.onChangeFn(clamped);
    this.valueChange.emit(clamped);
  }

  private clamp(value: number): number {
    return Math.max(this.min(), Math.min(this.max(), value));
  }

  // ControlValueAccessor implementation
  writeValue(val: number): void {
    this.currentValue.set(this.clamp(val ?? 0));
  }

  registerOnChange(fn: (v: number) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // Handled at form control template level
  }
}
