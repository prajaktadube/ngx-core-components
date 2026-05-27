import { Component, effect, input, output, signal, forwardRef } from '@angular/core';
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
    <div class="ngx-numeric" [class.disabled]="disabled()">
      @if (label()) { <label class="numeric-label">{{ label() }}</label> }
      <div class="numeric-input-wrap" [class.focused]="focused()">
        @if (prefix()) { <span class="numeric-prefix">{{ prefix() }}</span> }
        <input
          type="number" class="numeric-input"
          [min]="min()" [max]="max()" [step]="step()"
          [value]="currentValue()" [disabled]="disabled()" [placeholder]="placeholder()"
          (focus)="focused.set(true)" (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          (change)="onChange($event)"
        />
        @if (suffix()) { <span class="numeric-suffix">{{ suffix() }}</span> }
        <div class="numeric-spin">
          <button class="spin-btn" type="button" [disabled]="disabled() || currentValue() >= max()" (click)="spin(1)">▲</button>
          <button class="spin-btn" type="button" [disabled]="disabled() || currentValue() <= min()" (click)="spin(-1)">▼</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-numeric { width: 100%; }
    .numeric-label { display: block; font-size: 12px; font-weight: 600; color: var(--ngx-input-label, #495057); margin-bottom: 4px; }
    .numeric-input-wrap { display: flex; align-items: center; border: 1px solid var(--ngx-input-border, #ced4da); border-radius: var(--ngx-input-radius, 6px); background: var(--ngx-input-bg, #fff); overflow: hidden; transition: border-color 0.15s; }
    .numeric-input-wrap.focused { border-color: var(--ngx-input-focus, #1a73e8); box-shadow: 0 0 0 2px rgba(26,115,232,0.15); }
    .disabled .numeric-input-wrap { opacity: 0.5; }
    .numeric-input { flex: 1; padding: 8px 10px; border: none; background: transparent; font-size: 14px; color: var(--ngx-input-text, #212529); outline: none; min-width: 0; -moz-appearance: textfield; }
    .numeric-input::-webkit-outer-spin-button, .numeric-input::-webkit-inner-spin-button { -webkit-appearance: none; }
    .numeric-prefix, .numeric-suffix { padding: 0 8px; color: #6c757d; font-size: 12px; flex-shrink: 0; }
    .numeric-spin { display: flex; flex-direction: column; border-left: 1px solid var(--ngx-input-border, #ced4da); }
    .spin-btn { border: none; background: transparent; cursor: pointer; font-size: 8px; padding: 3px 7px; color: #6c757d; flex: 1; line-height: 1; }
    .spin-btn:hover:not(:disabled) { background: #f1f3f5; }
    .spin-btn:disabled { opacity: 0.4; cursor: not-allowed; }
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
  valueChange = output<number>();

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
