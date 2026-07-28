import {
  Component, ChangeDetectionStrategy, input, output, signal, computed, forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ngx-numeric-textbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumericTextBoxComponent),
      multi: true,
    },
  ],
  template: `
    <div class="ngx-numeric-textbox" [class.focused]="isFocused()" [class.has-error]="status() === 'error'" [class.disabled]="disabled()">
      @if (label()) {
        <label class="ngx-numeric-label">{{ label() }}</label>
      }
      <div class="ngx-numeric-wrap" [class]="'status-' + status()">
        @if (currency() && currencyPosition() === 'prefix') {
          <span class="ngx-numeric-affix ngx-numeric-prefix">{{ currency() }}</span>
        }
        @if (prefixIcon()) {
          <span class="ngx-numeric-affix ngx-numeric-prefix">{{ prefixIcon() }}</span>
        }
        <input
          class="ngx-numeric-input"
          type="text"
          inputmode="decimal"
          [value]="formattedValue()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readOnly]="readonly()"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
        />
        @if (currency() && currencyPosition() === 'suffix') {
          <span class="ngx-numeric-affix ngx-numeric-suffix">{{ currency() }}</span>
        }
        @if (showSpinners() && !disabled() && !readonly()) {
          <div class="ngx-numeric-spinners">
            <button type="button" class="spinner-btn spinner-up" (click)="stepUp()" tabindex="-1">▲</button>
            <button type="button" class="spinner-btn spinner-down" (click)="stepDown()" tabindex="-1">▼</button>
          </div>
        }
        @if (clearable() && value() !== null && !disabled()) {
          <button type="button" class="ngx-numeric-clear" (click)="clearValue()">✕</button>
        }
      </div>
      @if (error()) {
        <div class="ngx-numeric-error">{{ error() }}</div>
      } @else if (hint()) {
        <div class="ngx-numeric-hint">{{ hint() }}</div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-numeric-textbox { font-family: var(--ngx-font-family, inherit); }
    .ngx-numeric-label { display: block; font-size: 12px; font-weight: 700; color: var(--ngx-input-label, #475569); margin-bottom: 4px; }
    .ngx-numeric-wrap { display: flex; align-items: center; border: 1px solid var(--ngx-input-border, #cbd5e1); border-radius: var(--ngx-input-radius, 8px); background: var(--ngx-input-bg, #ffffff); overflow: hidden; transition: all 0.15s; }
    .ngx-numeric-wrap:focus-within { border-color: var(--ngx-input-focus, #4f46e5); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12); }
    .ngx-numeric-wrap.status-error { border-color: #ef4444; }
    .ngx-numeric-affix { padding: 0 10px; font-size: 13px; font-weight: 600; color: #64748b; background: #f8fafc; height: 38px; display: flex; align-items: center; }
    .ngx-numeric-input { flex: 1; border: none; background: transparent; outline: none; padding: 8px 12px; font-size: 13px; color: var(--ngx-input-text, #0f172a); width: 100%; font-variant-numeric: tabular-nums; }
    .ngx-numeric-spinners { display: flex; flex-direction: column; border-left: 1px solid #e2e8f0; height: 38px; }
    .spinner-btn { flex: 1; border: none; background: #f8fafc; font-size: 8px; cursor: pointer; color: #64748b; padding: 0 6px; transition: background 0.15s; }
    .spinner-btn:hover { background: #e2e8f0; color: #4f46e5; }
    .ngx-numeric-clear { border: none; background: transparent; cursor: pointer; color: #94a3b8; padding: 0 8px; font-size: 12px; }
    .ngx-numeric-error { font-size: 11px; color: #ef4444; margin-top: 4px; }
    .ngx-numeric-hint { font-size: 11px; color: #64748b; margin-top: 4px; }
  `]
})
export class NumericTextBoxComponent implements ControlValueAccessor {
  value = input<number | null>(null);
  min = input<number | null>(null);
  max = input<number | null>(null);
  step = input<number>(1);
  decimals = input<number | null>(null);
  useGrouping = input<boolean>(true);
  currency = input<string>('');
  currencyPosition = input<'prefix' | 'suffix'>('prefix');
  label = input<string>('');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  status = input<'normal' | 'success' | 'warning' | 'error'>('normal');
  error = input<string>('');
  hint = input<string>('');
  prefixIcon = input<string>('');
  showSpinners = input<boolean>(true);
  clearable = input<boolean>(false);

  valueChange = output<any>();

  isFocused = signal<boolean>(false);

  private _cvaValue = signal<number | null>(null);
  private _cvaActive = false;

  _resolvedValue = computed<number | null>(() => this._cvaActive ? this._cvaValue() : this.value());

  formattedValue = computed(() => {
    const val = this._resolvedValue();
    if (val === null || val === undefined) return '';

    if (this.isFocused()) {
      return String(val);
    }

    const dec = this.decimals();
    const formatter = new Intl.NumberFormat('en-US', {
      useGrouping: this.useGrouping(),
      minimumFractionDigits: dec ?? 0,
      maximumFractionDigits: dec ?? 20,
    });
    return formatter.format(val);
  });

  private onChange: (val: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: number | null): void {
    this._cvaActive = true;
    this._cvaValue.set(val);
  }

  registerOnChange(fn: (val: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // handled via signal input
  }

  onInput(event: Event): void {
    const inputVal = (event.target as HTMLInputElement).value;
    const num = parseFloat(inputVal.replace(/,/g, ''));
    if (isNaN(num)) {
      this.updateValue(null);
    } else {
      this.updateValue(this.clamp(num));
    }
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.stepUp();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.stepDown();
    }
  }

  stepUp(): void {
    const current = this._resolvedValue() ?? 0;
    this.updateValue(this.clamp(current + this.step()));
  }

  stepDown(): void {
    const current = this._resolvedValue() ?? 0;
    this.updateValue(this.clamp(current - this.step()));
  }

  clearValue(): void {
    this.updateValue(null);
  }

  private clamp(val: number): number {
    let result = val;
    const minVal = this.min();
    const maxVal = this.max();
    if (minVal !== null && result < minVal) result = minVal;
    if (maxVal !== null && result > maxVal) result = maxVal;

    const dec = this.decimals();
    if (dec !== null && dec >= 0) {
      result = parseFloat(result.toFixed(dec));
    }
    return result;
  }

  private updateValue(val: number | null): void {
    this._cvaValue.set(val);
    this.onChange(val);
    this.valueChange.emit(val);
  }
}
