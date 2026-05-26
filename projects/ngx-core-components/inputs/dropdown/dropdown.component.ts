import {
  Component, ChangeDetectionStrategy, input, output, signal, computed,
  HostListener, ElementRef, inject, forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  label: string;
  value: unknown;
  disabled?: boolean;
}

@Component({
  selector: 'ngx-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="ngx-dropdown"
      [class.open]="isOpen()"
      [class.disabled]="disabled()"
      [class.has-error]="!!error()"
      [attr.aria-expanded]="isOpen()"
      role="combobox"
    >
      @if (label()) {
        <label class="ngx-dropdown-label">
          {{ label() }}
          @if (required()) { <span class="ngx-dropdown-required" aria-hidden="true">*</span> }
        </label>
      }

      <!-- Trigger -->
      <div
        class="ngx-dropdown-trigger"
        [attr.tabindex]="disabled() ? -1 : 0"
        (click)="toggle()"
        (keydown)="onTriggerKey($event)"
        [attr.aria-label]="selectedLabel() || placeholder()"
        [attr.aria-disabled]="disabled()"
      >
        <span class="trigger-text" [class.placeholder]="!selectedLabel()">
          {{ selectedLabel() || placeholder() }}
        </span>
        <span class="trigger-arrow" [class.open]="isOpen()">&#9660;</span>
      </div>

      <!-- Popup -->
      @if (isOpen()) {
        <div class="ngx-dropdown-popup" role="listbox">
          @if (filterable()) {
            <div class="popup-search">
              <input
                #filterInput
                class="popup-search-input"
                placeholder="Search..."
                [value]="filterText()"
                (input)="filterText.set($any($event.target).value)"
                (keydown)="onFilterKey($event)"
              />
            </div>
          }
          <div class="popup-list">
            @for (opt of filteredOptions(); track opt.value; let i = $index) {
              <div
                class="popup-item"
                [class.selected]="isSelected(opt)"
                [class.focused]="focusedIndex() === i"
                [class.disabled]="opt.disabled"
                role="option"
                [attr.aria-selected]="isSelected(opt)"
                (click)="selectOption(opt)"
                (mouseenter)="focusedIndex.set(i)"
              >{{ opt.label }}</div>
            }
            @if (filteredOptions().length === 0) {
              <div class="popup-empty">No results</div>
            }
          </div>
        </div>
      }
      @if (error()) {
        <div class="ngx-dropdown-error">{{ error() }}</div>
      } @else if (hint()) {
        <div class="ngx-dropdown-hint">{{ hint() }}</div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-dropdown { position: relative; font-family: inherit; }
    .ngx-dropdown-label { display: block; font-size: 13px; color: var(--ngx-input-label, #6c757d); margin-bottom: 4px; font-weight: 500; }
    .ngx-dropdown-trigger {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: var(--ngx-input-radius, 8px); background: var(--ngx-input-bg, #fff);
      cursor: pointer; user-select: none; font-size: 14px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ngx-dropdown-trigger:hover { border-color: var(--ngx-input-focus, #4f46e5); }
    .open .ngx-dropdown-trigger {
      border-color: var(--ngx-input-focus, #4f46e5);
      box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.15));
    }
    .disabled .ngx-dropdown-trigger { background: var(--ngx-input-disabled-bg, #f8f9fa); cursor: not-allowed; color: #adb5bd; opacity: 0.7; }
    .trigger-text { flex: 1; color: var(--ngx-input-text, #212529); }
    .trigger-text.placeholder { color: #adb5bd; }
    .trigger-arrow { font-size: 10px; color: #6c757d; transition: transform 0.15s; }
    .trigger-arrow.open { transform: rotate(180deg); }
    .ngx-dropdown-popup {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 1000;
      background: var(--ngx-input-bg, #fff); border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: var(--ngx-input-radius, 8px); box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
      overflow: hidden;
      transform-origin: top;
      animation: popup-slide 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes popup-slide {
      from { opacity: 0; transform: translateY(-4px) scaleY(0.95); }
      to { opacity: 1; transform: translateY(0) scaleY(1); }
    }
    .popup-search { padding: 8px; border-bottom: 1px solid var(--ngx-input-border, #ced4da); }
    .popup-search-input {
      width: 100%; padding: 6px 10px; border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: var(--radius-sm, 6px); font-size: 13px; outline: none; font-family: inherit;
      background: var(--bg-primary); color: var(--text-primary);
      transition: all 0.15s ease;
    }
    .popup-search-input:focus {
      border-color: var(--ngx-input-focus, #4f46e5);
      background: var(--bg-secondary);
    }
    .popup-list { max-height: 240px; overflow-y: auto; }
    .popup-item {
      padding: 8px 12px; font-size: 14px; cursor: pointer;
      color: var(--ngx-input-text, #212529); transition: all 0.12s;
    }
    .popup-item:hover, .popup-item.focused { background: var(--ngx-grid-hover-bg, #f1f3f5); color: var(--ngx-input-focus, #4f46e5); }
    .popup-item.selected { background: var(--ngx-grid-selected-bg, #e8f0fe); color: var(--ngx-input-focus, #4f46e5); font-weight: 600; }
    .popup-item.disabled { color: #adb5bd; cursor: not-allowed; }
    .popup-item.disabled:hover { background: none; }
    .popup-empty { padding: 12px; text-align: center; color: #adb5bd; font-size: 13px; }
    .has-error .ngx-dropdown-trigger { border-color: var(--ngx-input-error, #e74c3c); }
    .has-error.focused .ngx-dropdown-trigger, .has-error.open .ngx-dropdown-trigger { box-shadow: 0 0 0 2px rgba(231,76,60,0.18); }
    .ngx-dropdown-error { font-size: 12px; color: var(--ngx-input-error, #e74c3c); margin-top: 4px; }
    .ngx-dropdown-hint { font-size: 12px; color: var(--ngx-input-label, #6c757d); margin-top: 4px; }
    .ngx-dropdown-required { color: var(--ngx-input-error, #e74c3c); margin-left: 2px; }
  `]
})
export class DropdownComponent implements ControlValueAccessor {
  options = input<DropdownOption[]>([]);
  value = input<unknown>(null);
  label = input<string>('');
  placeholder = input<string>('Select...');
  disabled = input<boolean>(false);
  filterable = input<boolean>(false);
  required = input<boolean>(false);
  error = input<string>('');
  hint = input<string>('');

  valueChange = output<unknown>();

  isOpen = signal(false);
  filterText = signal('');
  focusedIndex = signal(-1);
  _cvaValue = signal<unknown>(null);
  private _cvaActive = false;
  private _onChange: (v: unknown) => void = () => {};
  private _onTouched: () => void = () => {};

  private el = inject(ElementRef);

  _activeValue = computed(() => this._cvaActive ? this._cvaValue() : this.value());

  selectedLabel = computed(() => {
    const opt = this.options().find(o => o.value === this._activeValue());
    return opt?.label ?? '';
  });

  filteredOptions = computed(() => {
    const f = this.filterText().toLowerCase();
    return f ? this.options().filter(o => o.label.toLowerCase().includes(f)) : this.options();
  });

  isSelected(opt: DropdownOption): boolean { return opt.value === this._activeValue(); }

  toggle(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      const opts = this.filteredOptions();
      const selectedIndex = opts.findIndex(o => o.value === this._activeValue());
      this.focusedIndex.set(selectedIndex >= 0 ? selectedIndex : (opts.length > 0 ? 0 : -1));
    } else {
      this.filterText.set('');
      this.focusedIndex.set(-1);
      this._onTouched();
    }
  }

  selectOption(opt: DropdownOption): void {
    if (opt.disabled) return;
    this._cvaActive = true;
    this._cvaValue.set(opt.value);
    this._onChange(opt.value);
    this._onTouched();
    this.valueChange.emit(opt.value);
    this.isOpen.set(false);
    this.filterText.set('');
  }

  onTriggerKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(); }
    if (e.key === 'Escape') this.isOpen.set(false);
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!this.isOpen()) this.isOpen.set(true); else this.moveFocus(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); this.moveFocus(-1); }
  }

  onFilterKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowDown') { e.preventDefault(); this.moveFocus(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); this.moveFocus(-1); }
    if (e.key === 'Enter') {
      const opts = this.filteredOptions();
      const i = this.focusedIndex();
      if (i >= 0 && i < opts.length) this.selectOption(opts[i]);
    }
    if (e.key === 'Escape') this.isOpen.set(false);
  }

  private moveFocus(delta: number): void {
    const n = this.filteredOptions().length;
    if (n <= 0) {
      this.focusedIndex.set(-1);
      return;
    }
    this.focusedIndex.update(i => Math.max(0, Math.min(n - 1, i + delta)));
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      if (this.isOpen()) {
        this.isOpen.set(false);
        this.filterText.set('');
        this.focusedIndex.set(-1);
        this._onTouched();
      }
    }
  }

  // ControlValueAccessor
  writeValue(val: unknown): void {
    this._cvaActive = true;
    this._cvaValue.set(val ?? null);
  }

  registerOnChange(fn: (v: unknown) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // disabled is controlled via input() for template usage.
  }
}

