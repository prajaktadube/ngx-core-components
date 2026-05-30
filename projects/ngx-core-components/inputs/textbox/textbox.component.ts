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
    <div class="ngx-textbox" [class.focused]="isFocused()" [class.has-error]="!!error()" [class.disabled]="disabled()">
      @if (label()) {
        <label class="ngx-textbox-label" [class.floating]="isFocused() || !!_displayValue()">{{ label() }}</label>
      }
      <div class="ngx-textbox-wrap">
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
          [attr.aria-invalid]="!!error()"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
        />
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
      </div>
      @if (maxlength() > 0 && showCharCount()) {
        <div class="ngx-textbox-charcount">{{ _displayValue().length }} / {{ maxlength() }}</div>
      }
      @if (error()) {
        <div class="ngx-textbox-error">{{ error() }}</div>
      } @else if (hint()) {
        <div class="ngx-textbox-hint">{{ hint() }}</div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-textbox { position: relative; font-family: inherit; }
    .ngx-textbox-label {
      display: block; font-size: 12px; font-weight: 600; color: var(--ngx-input-label, #475569);
      margin-bottom: 6px; transition: color 0.15s;
    }
    .ngx-textbox-wrap {
      position: relative;
      display: flex;
      align-items: center;
      border: 1px solid var(--ngx-input-border, #cbd5e1);
      border-radius: var(--ngx-input-radius, 8px);
      background: var(--ngx-input-bg, #fff);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .focused .ngx-textbox-wrap {
      border-color: var(--ngx-input-focus, #4f46e5);
      box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.15));
    }
    .has-error .ngx-textbox-wrap {
      border-color: var(--ngx-input-error, #ef4444);
    }
    .has-error.focused .ngx-textbox-wrap {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }
    .disabled .ngx-textbox-wrap {
      background: var(--ngx-input-disabled-bg, #f8f9fa);
      cursor: not-allowed;
      opacity: 0.7;
    }
    .ngx-textbox-input {
      flex: 1;
      min-width: 0;
      padding: 10px 14px;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: var(--ngx-input-text, #0f172a);
      font-family: inherit;
    }
    .ngx-textbox-input:disabled { cursor: not-allowed; color: #94a3b8; }
    .ngx-textbox-error { font-size: 12px; color: var(--ngx-input-error, #ef4444); margin-top: 4px; font-weight: 550; }
    .ngx-textbox-hint { font-size: 12px; color: var(--ngx-input-label, #64748b); margin-top: 4px; }
    .ngx-textbox-affix { display: flex; align-items: center; padding: 0 10px; color: #64748b; font-size: 14px; flex-shrink: 0; }
    .ngx-textbox-clear {
      background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 12px;
      padding: 0 8px; line-height: 1; display: flex; align-items: center; flex-shrink: 0;
    }
    .ngx-textbox-clear:hover { color: #475569; }
    .ngx-textbox-password-toggle {
      background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 14px;
      padding: 0 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .ngx-textbox-password-toggle:hover { color: #475569; }
    .ngx-textbox-charcount { font-size: 11px; color: #94a3b8; margin-top: 3px; text-align: right; }
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

  valueChange = output<string>();
  focusChange = output<boolean>();

  isFocused = signal(false);
  showPassword = signal(false);
  _cvaValue = signal<string>('');
  private _cvaActive = false;
  private _onChange: (v: string) => void = () => {};
  private _onTouched: () => void = () => {};

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

