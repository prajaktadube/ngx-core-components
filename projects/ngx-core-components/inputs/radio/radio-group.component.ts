import {
  Component, ChangeDetectionStrategy, input, output, signal, computed, forwardRef
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
      class="ngx-radio-group"
      [class.inline]="inline()"
      role="radiogroup"
      [attr.aria-label]="label()"
    >
      @if (label()) {
        <span class="ngx-radio-group-label">{{ label() }}</span>
      }
      @for (opt of options(); track opt.value) {
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
            tabindex="0"
            (keydown.enter)="select(opt)"
            (keydown.space)="select(opt)"
          >
            <span class="ngx-radio-dot" [class.visible]="isChecked(opt.value)"></span>
          </span>
          <span class="ngx-radio-label">{{ opt.label }}</span>
        </label>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-radio-group { display: flex; flex-direction: column; gap: 8px; font-family: inherit; }
    .ngx-radio-group.inline { flex-direction: row; flex-wrap: wrap; gap: 16px; }
    .ngx-radio-group-label { display: block; font-size: 13px; color: var(--ngx-input-label, #6c757d); font-weight: 500; margin-bottom: 4px; }
    .ngx-radio {
      display: inline-flex; align-items: center; gap: 8px;
      cursor: pointer; user-select: none;
    }
    .ngx-radio.disabled { cursor: not-allowed; opacity: 0.55; }
    .ngx-radio-btn {
      width: 18px; height: 18px; flex-shrink: 0;
      border: 2px solid var(--ngx-radio-border, #ced4da);
      border-radius: 50%;
      background: var(--ngx-radio-bg, #fff);
      display: flex; align-items: center; justify-content: center;
      transition: border-color 0.15s;
      outline: none;
    }
    .ngx-radio-btn.checked { border-color: var(--ngx-radio-active, #4a90d9); }
    .ngx-radio-btn:focus-visible { box-shadow: 0 0 0 2px rgba(74,144,217,0.35); }
    .ngx-radio-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--ngx-radio-active, #4a90d9);
      opacity: 0; transform: scale(0.5); transition: opacity 0.15s, transform 0.15s;
    }
    .ngx-radio-dot.visible { opacity: 1; transform: scale(1); }
    .ngx-radio-label { font-size: 14px; color: var(--ngx-input-text, #212529); }
  `],
})
export class RadioGroupComponent implements ControlValueAccessor {
  options = input<RadioOption[]>([]);
  label = input<string>('');
  value = input<unknown>(null);
  disabled = input<boolean>(false);
  inline = input<boolean>(false);

  valueChange = output<unknown>();

  _value = signal<unknown>(null);
  private _cvaActive = false;

  private _onChange: (val: unknown) => void = () => {};
  private _onTouched: () => void = () => {};

  _activeValue = computed(() => this._cvaActive ? this._value() : this.value());

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

  setDisabledState(_isDisabled: boolean): void {
    // disabled handled via input()
  }
}
