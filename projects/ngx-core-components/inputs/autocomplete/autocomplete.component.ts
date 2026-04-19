import {
  Component, ChangeDetectionStrategy, input, output, signal, computed,
  forwardRef, HostListener, ElementRef, inject
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownOption } from '../dropdown/dropdown.component';

@Component({
  selector: 'ngx-autocomplete',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="ngx-autocomplete"
      [class.open]="isOpen()"
      [class.focused]="isFocused()"
      [class.has-error]="!!error()"
      [class.disabled]="disabled()"
    >
      @if (label()) {
        <label class="ngx-ac-label">{{ label() }}</label>
      }
      <div class="ngx-ac-wrap">
        <input
          class="ngx-ac-input"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [value]="_inputText()"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          role="combobox"
          [attr.aria-expanded]="isOpen()"
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />
        @if (_inputText()) {
          <button class="ngx-ac-clear" (click)="clear()" aria-label="Clear">&#10005;</button>
        }
      </div>

      <!-- Suggestion panel — floats above DOM via absolute positioning -->
      @if (isOpen() && filteredOptions().length > 0) {
        <div class="ngx-ac-panel" role="listbox">
          @for (opt of filteredOptions(); track opt.value; let i = $index) {
            <div
              class="ngx-ac-item"
              [class.focused]="focusedIndex() === i"
              [class.disabled]="opt.disabled"
              role="option"
              [attr.aria-selected]="isSelected(opt)"
              (mousedown)="selectOption(opt)"
              (mouseenter)="focusedIndex.set(i)"
            >{{ opt.label }}</div>
          }
        </div>
      }

      @if (error()) {
        <div class="ngx-ac-error">{{ error() }}</div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-autocomplete { position: relative; font-family: inherit; }
    .ngx-ac-label { display: block; font-size: 13px; color: var(--ngx-input-label, #6c757d); margin-bottom: 4px; font-weight: 500; }
    .ngx-ac-wrap {
      display: flex; align-items: center;
      border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: var(--ngx-input-radius, 4px);
      background: var(--ngx-input-bg, #fff);
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .focused .ngx-ac-wrap {
      border-color: var(--ngx-input-focus, #4a90d9);
      box-shadow: 0 0 0 2px rgba(74,144,217,0.18);
    }
    .has-error .ngx-ac-wrap { border-color: var(--ngx-input-error, #e74c3c); }
    .disabled .ngx-ac-wrap { background: #f8f9fa; }
    .ngx-ac-input {
      flex: 1; padding: 8px 12px; border: none; outline: none;
      background: transparent; font-size: 14px; color: var(--ngx-input-text, #212529);
      font-family: inherit;
    }
    .ngx-ac-input:disabled { cursor: not-allowed; color: #adb5bd; }
    .ngx-ac-clear {
      padding: 0 10px; background: none; border: none; cursor: pointer;
      color: #adb5bd; font-size: 14px; line-height: 1;
    }
    .ngx-ac-panel {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 1000;
      background: var(--ngx-input-bg, #fff);
      border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: var(--ngx-input-radius, 4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      max-height: 240px; overflow-y: auto;
    }
    .ngx-ac-item {
      padding: 8px 12px; font-size: 14px; cursor: pointer;
      color: var(--ngx-input-text, #212529); transition: background 0.1s;
    }
    .ngx-ac-item:hover, .ngx-ac-item.focused { background: var(--ngx-input-hover-bg, #f1f3f5); }
    .ngx-ac-item.disabled { color: #adb5bd; cursor: not-allowed; pointer-events: none; }
    .ngx-ac-error { font-size: 12px; color: var(--ngx-input-error, #e74c3c); margin-top: 4px; }
  `],
})
export class AutocompleteComponent implements ControlValueAccessor {
  options = input<DropdownOption[]>([]);
  label = input<string>('');
  placeholder = input<string>('Type to search...');
  disabled = input<boolean>(false);
  error = input<string>('');
  minLength = input<number>(1);

  valueChange = output<unknown>();

  _inputText = signal<string>('');
  _selectedValue = signal<unknown>(null);
  isOpen = signal(false);
  isFocused = signal(false);
  focusedIndex = signal(-1);

  private _onChange: (val: unknown) => void = () => {};
  private _onTouched: () => void = () => {};
  private el = inject(ElementRef);

  filteredOptions = computed(() => {
    const text = this._inputText().toLowerCase();
    if (text.length < this.minLength()) return [];
    return this.options().filter(o => o.label.toLowerCase().includes(text));
  });

  isSelected(opt: DropdownOption): boolean {
    return this._selectedValue() === opt.value;
  }

  onInput(e: Event): void {
    const text = (e.target as HTMLInputElement).value;
    this._inputText.set(text);
    this._selectedValue.set(null);
    this.isOpen.set(text.length >= this.minLength());
    this.focusedIndex.set(-1);
  }

  onFocus(): void {
    this.isFocused.set(true);
    if (this._inputText().length >= this.minLength()) {
      this.isOpen.set(true);
    }
  }

  onBlur(): void {
    this.isFocused.set(false);
    this._onTouched();
    setTimeout(() => this.isOpen.set(false), 150);
  }

  onKeyDown(e: KeyboardEvent): void {
    const n = this.filteredOptions().length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.focusedIndex.update(i => Math.min(n - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.focusedIndex.update(i => Math.max(-1, i - 1));
    } else if (e.key === 'Enter') {
      const idx = this.focusedIndex();
      if (idx >= 0 && idx < n) this.selectOption(this.filteredOptions()[idx]);
    } else if (e.key === 'Escape') {
      this.isOpen.set(false);
    }
  }

  selectOption(opt: DropdownOption): void {
    if (opt.disabled) return;
    this._inputText.set(opt.label);
    this._selectedValue.set(opt.value);
    this.isOpen.set(false);
    this._onChange(opt.value);
    this._onTouched();
    this.valueChange.emit(opt.value);
  }

  clear(): void {
    this._inputText.set('');
    this._selectedValue.set(null);
    this.isOpen.set(false);
    this._onChange(null);
    this.valueChange.emit(null);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen.set(false);
    }
  }

  // ControlValueAccessor
  writeValue(val: unknown): void {
    if (val === null || val === undefined) {
      this._inputText.set('');
      this._selectedValue.set(null);
      return;
    }
    const match = this.options().find(o => o.value === val);
    this._inputText.set(match?.label ?? String(val));
    this._selectedValue.set(val);
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
