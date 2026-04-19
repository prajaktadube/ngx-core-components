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
    <label class="ngx-checkbox" [class.disabled]="disabled()">
      <span class="ngx-checkbox-box" [class.checked]="_displayChecked()" [class.indeterminate]="indeterminate()" (click)="toggle()">
        @if (_displayChecked()) {
          <svg class="ngx-checkbox-icon" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        } @else if (indeterminate()) {
          <span class="ngx-checkbox-dash"></span>
        }
      </span>
      @if (label()) {
        <span class="ngx-checkbox-label">{{ label() }}</span>
      }
    </label>
  `,
  styles: [`
    :host { display: inline-block; }
    .ngx-checkbox {
      display: inline-flex; align-items: center; gap: 8px;
      cursor: pointer; user-select: none; font-family: inherit;
    }
    .ngx-checkbox.disabled { cursor: not-allowed; opacity: 0.55; }
    .ngx-checkbox-box {
      width: 18px; height: 18px; flex-shrink: 0;
      border: 2px solid var(--ngx-checkbox-border, #ced4da);
      border-radius: var(--ngx-checkbox-radius, 3px);
      background: var(--ngx-checkbox-bg, #fff);
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, border-color 0.15s;
    }
    .ngx-checkbox-box.checked, .ngx-checkbox-box.indeterminate {
      background: var(--ngx-checkbox-active, #4a90d9);
      border-color: var(--ngx-checkbox-active, #4a90d9);
      color: #fff;
    }
    .ngx-checkbox-icon { width: 12px; height: 10px; }
    .ngx-checkbox-dash {
      width: 8px; height: 2px; background: #fff; border-radius: 1px;
    }
    .ngx-checkbox-label { font-size: 14px; color: var(--ngx-input-text, #212529); }
  `],
})
export class CheckboxComponent implements ControlValueAccessor {
  label = input<string>('');
  checked = input<boolean>(false);
  disabled = input<boolean>(false);
  indeterminate = input<boolean>(false);

  checkedChange = output<boolean>();

  _checked = signal<boolean>(false);
  private _cvaActive = false;

  private _onChange: (val: boolean) => void = () => {};
  private _onTouched: () => void = () => {};

  _displayChecked = computed(() => this._cvaActive ? this._checked() : this.checked());

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

  setDisabledState(_isDisabled: boolean): void {
    // disabled handled via input()
  }
}
