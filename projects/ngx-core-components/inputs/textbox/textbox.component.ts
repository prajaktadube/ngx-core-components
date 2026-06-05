import {
  Component, ChangeDetectionStrategy, input, output, signal, computed, forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ngx-textbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextBoxComponent),
      multi: true,
    },
  ],
  template: `
    <div class="ngx-textbox" [class.focused]="isFocused()" [class.has-error]="_resolvedStatus() === 'error'" [class.disabled]="disabled()">
      @if (label()) {
        <label class="ngx-textbox-label">{{ label() }}</label>
      }
      <div class="ngx-textbox-wrap" [class]="'status-' + _resolvedStatus()">
        <ng-content select="[prefix]" />
        @if (prefixIcon()) {
          <span class="ngx-textbox-affix ngx-textbox-prefix" aria-hidden="true">{{ prefixIcon() }}</span>
        }
        <input
          class="ngx-textbox-input"
          [type]="_currentType()"
          [value]="_displayValue()"
          [placeholder]="isFocused() || !label() ? placeholder() : ''"
          [disabled]="disabled()"
          [readOnly]="readonly()"
          [attr.maxlength]="maxlength() > 0 ? maxlength() : null"
          [attr.aria-invalid]="_resolvedStatus() === 'error' ? 'true' : null"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
        />
        
        <!-- Status Indicator Icons -->
        @if (_resolvedStatus() === 'success') {
          <span class="status-icon status-icon-success" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
        } @else if (_resolvedStatus() === 'warning') {
          <span class="status-icon status-icon-warning" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </span>
        } @else if (_resolvedStatus() === 'error') {
          <span class="status-icon status-icon-error" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </span>
        }

        @if (type() === 'password' && passwordToggle() && !disabled()) {
          <button class="ngx-textbox-password-toggle" type="button" (click)="togglePasswordVisibility()" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
            @if (showPassword()) {
              <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92C21.06 15.39 22 13.79 22 12c0-4.27-4.02-8-10-8-1.64 0-3.2.28-4.63.78l2.81 2.81c.56-.23 1.17-.36 1.82-.36zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.47 5.7c-2.76 0-5-2.24-5-5v-.06l8.06 8.06c-.92.35-1.92.56-3.06.56z"/></svg>
            } @else {
              <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            }
          </button>
        }
        @if (clearable() && !!_displayValue() && !disabled() && !readonly()) {
          <button class="ngx-textbox-clear" type="button" (click)="clearValue()" aria-label="Clear">✕</button>
        }
        @if (suffixIcon()) {
          <span class="ngx-textbox-affix ngx-textbox-suffix" aria-hidden="true">{{ suffixIcon() }}</span>
        }
        <ng-content select="[suffix]" />
      </div>
      <div class="ngx-textbox-footer">
        @if (error()) {
          <div class="ngx-textbox-error" [attr.id]="'err-' + _id">{{ error() }}</div>
        } @else if (hint()) {
          <div class="ngx-textbox-hint">{{ hint() }}</div>
        } @else {
          <div></div>
        }
        @if (maxlength() > 0 && showCharCount()) {
          <div class="ngx-textbox-charcount">{{ _displayValue().length }} / {{ maxlength() }}</div>
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

    .ngx-textbox { position: relative; font-family: inherit; }
    
    .ngx-textbox-label {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      color: var(--ngx-input-label);
      margin-bottom: 6px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .focused .ngx-textbox-label {
      color: var(--ngx-input-label-active);
      transform: translateX(2px);
    }
    
    .ngx-textbox-wrap {
      position: relative;
      display: flex;
      align-items: center;
      border: 1px solid var(--ngx-input-border);
      border-radius: var(--ngx-input-radius, 8px);
      background: var(--ngx-input-bg);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .focused .ngx-textbox-wrap {
      border-color: var(--ngx-input-focus-border);
      box-shadow: var(--ngx-input-focus-shadow), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    /* Validation status outline colors */
    .ngx-textbox-wrap.status-success {
      border-color: var(--ngx-input-success-border);
    }
    .focused .ngx-textbox-wrap.status-success {
      box-shadow: var(--ngx-input-success-shadow), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .ngx-textbox-wrap.status-warning {
      border-color: var(--ngx-input-warning-border);
    }
    .focused .ngx-textbox-wrap.status-warning {
      box-shadow: var(--ngx-input-warning-shadow), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .ngx-textbox-wrap.status-error {
      border-color: var(--ngx-input-error-border);
    }
    .focused .ngx-textbox-wrap.status-error {
      box-shadow: var(--ngx-input-error-shadow), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .disabled .ngx-textbox-wrap {
      background: var(--ngx-input-disabled-bg);
      cursor: not-allowed;
      opacity: 0.7;
      box-shadow: none;
    }
    
    .ngx-textbox-input {
      flex: 1;
      min-width: 0;
      padding: 10px 14px;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: var(--ngx-input-text);
      font-family: inherit;
    }
    .ngx-textbox-input::placeholder {
      color: var(--ngx-input-placeholder);
      opacity: 0.8;
    }
    .ngx-textbox-input:disabled { cursor: not-allowed; }
    
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

    .ngx-textbox-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 5px;
      font-size: 12px;
    }
    
    .ngx-textbox-error {
      color: var(--ngx-input-error-border);
      font-weight: 550;
      animation: slide-down 0.2s ease-out;
    }
    .ngx-textbox-hint {
      color: var(--ngx-input-label);
    }
    .ngx-textbox-charcount {
      color: var(--ngx-input-label);
      font-size: 11px;
      margin-left: auto;
    }
    
    @keyframes slide-down {
      from { transform: translateY(-4px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .ngx-textbox-affix { display: flex; align-items: center; padding: 0 10px; color: var(--ngx-input-label); font-size: 14px; flex-shrink: 0; }
    
    .ngx-textbox-clear {
      background: none; border: none; cursor: pointer; color: var(--ngx-input-placeholder); font-size: 12px;
      padding: 0 8px; line-height: 1; display: flex; align-items: center; flex-shrink: 0;
      transition: color 0.15s;
    }
    .ngx-textbox-clear:hover { color: var(--ngx-input-text); }
    
    .ngx-textbox-password-toggle {
      background: none; border: none; cursor: pointer; color: var(--ngx-input-placeholder); font-size: 14px;
      padding: 0 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: color 0.15s;
    }
    .ngx-textbox-password-toggle:hover { color: var(--ngx-input-text); }
  `]
})
export class TextBoxComponent implements ControlValueAccessor {
  value = input<string>('');
  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  error = input<string>('');
  hint = input<string>('');
  maxlength = input<number>(0);
  clearable = input<boolean>(false);
  showCharCount = input<boolean>(false);
  prefixIcon = input<string>('');
  suffixIcon = input<string>('');
  passwordToggle = input<boolean>(false);

  // Enterprise status state
  status = input<'default' | 'success' | 'warning' | 'error'>('default');

  valueChange = output<string>();
  focusChange = output<boolean>();

  isFocused = signal(false);
  showPassword = signal(false);
  _cvaValue = signal<string>('');
  private _cvaActive = false;
  private _onChange: (v: string) => void = () => {};
  private _onTouched: () => void = () => {};

  _id = 'ngx-txt-' + Math.random().toString(36).substring(2, 9);

  _resolvedStatus = computed(() => {
    if (this.error()) return 'error';
    return this.status();
  });

  /** Merges reactive-form value (CVA) with template binding (input()). CVA takes precedence. */
  _displayValue = computed(() => this._cvaActive ? this._cvaValue() : this.value());

  _currentType = computed(() => {
    if (this.type() === 'password' && this.showPassword()) {
      return 'text';
    }
    return this.type();
  });

  togglePasswordVisibility(): void {
    if (this.disabled()) return;
    this.showPassword.update(v => !v);
  }

  onInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this._cvaValue.set(v);
    this._onChange(v);
    this.valueChange.emit(v);
  }

  onFocus(): void {
    this.isFocused.set(true);
    this.focusChange.emit(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.focusChange.emit(false);
    this._onTouched();
  }

  clearValue(): void {
    this._cvaValue.set('');
    this._onChange('');
    this.valueChange.emit('');
  }

  // ControlValueAccessor
  writeValue(val: string): void {
    this._cvaActive = true;
    this._cvaValue.set(val ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // disabled is controlled via input() for template usage;
    // reactive-form disable/enable is handled at the FormControl level.
  }
}
