import {
  Component, ChangeDetectionStrategy, input, output, signal, computed,
  HostListener, ElementRef, inject, forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NGX_CORE_I18N } from 'ngx-core-components/i18n';
import { DropdownOption } from '../dropdown/dropdown.component';

@Component({
  selector: 'ngx-multi-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="ngx-multi-select" [class.open]="isOpen()" [class.disabled]="disabled()">
      @if (label()) {
        <label class="ms-label">{{ label() }}</label>
      }
      <!-- Trigger -->
      <div
        class="ms-trigger"
        tabindex="0"
        (click)="toggle()"
        (keydown)="onTriggerKey($event)"
        role="combobox"
        aria-haspopup="listbox"
        [attr.aria-expanded]="isOpen()"
      >
        <div class="ms-tags">
          @for (val of displayValues(); track val.value) {
            <span class="ms-tag">
              {{ val.label }}
              <button class="ms-tag-remove" (click)="removeValue(val.value, $event)" [attr.aria-label]="'Remove ' + val.label">&#10005;</button>
            </span>
          }
          @if (displayValues().length === 0) {
            <span class="ms-placeholder">{{ effectivePlaceholder() }}</span>
          }
        </div>
        <span class="ms-arrow" [class.open]="isOpen()">&#9660;</span>
      </div>

      <!-- Popup -->
      @if (isOpen()) {
        <div class="ms-popup">
          @if (filterable()) {
            <div class="ms-search">
              <input
                class="ms-search-input"
                [placeholder]="i18n.multiSelect.searchPlaceholder"
                [value]="filterText()"
                (input)="filterText.set($any($event.target).value)"
                (click)="$event.stopPropagation()"
              />
            </div>
          }
          <div class="ms-list">
            <!-- Select All -->
            <label class="ms-item ms-select-all">
              <input
                type="checkbox"
                [checked]="allSelected()"
                [indeterminate]="someSelected() && !allSelected()"
                (change)="toggleAll()"
              />
              <span>{{ allSelected() ? i18n.multiSelect.deselectAll : i18n.multiSelect.selectAll }}</span>
            </label>
            <div class="ms-divider"></div>
            @for (opt of filteredOptions(); track opt.value; let i = $index) {
              <label
                class="ms-item"
                [class.checked]="isChecked(opt)"
                [class.disabled]="opt.disabled"
                [class.focused]="focusedIndex() === i"
                (mouseenter)="focusedIndex.set(i)"
              >
                <input
                  type="checkbox"
                  [checked]="isChecked(opt)"
                  [disabled]="!!opt.disabled"
                  (change)="toggleOption(opt)"
                  (click)="$event.stopPropagation()"
                />
                <span>{{ opt.label }}</span>
              </label>
            }
            @if (filteredOptions().length === 0) {
              <div class="ms-empty">{{ i18n.dropdown.noResults }}</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-multi-select { position: relative; font-family: inherit; }
    .ms-label { display: block; font-size: 13px; color: var(--ngx-input-label, #6c757d); margin-bottom: 4px; font-weight: 500; }
    .ms-trigger {
      display: flex; align-items: center; min-height: 38px;
      padding: 4px 8px 4px 4px; border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: var(--ngx-input-radius, 8px); background: var(--ngx-input-bg, #fff);
      cursor: pointer; user-select: none; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ms-trigger:hover { border-color: var(--ngx-input-focus, #4f46e5); }
    .open .ms-trigger { border-color: var(--ngx-input-focus, #4f46e5); box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.15)); }
    .disabled .ms-trigger { background: var(--ngx-input-disabled-bg, #f8f9fa); cursor: not-allowed; opacity: 0.7; }
    .ms-tags { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; align-items: center; }
    .ms-tag {
      display: inline-flex; align-items: center; gap: 4px;
      background: var(--ngx-input-tag-bg, #e0e7ff); color: var(--ngx-input-tag-color, #4f46e5);
      padding: 2px 6px 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;
      border: 1px solid rgba(79, 70, 229, 0.15);
    }
    .ms-tag-remove {
      background: none; border: none; cursor: pointer; padding: 0 2px;
      color: var(--ngx-input-tag-color, #4f46e5); font-size: 10px; line-height: 1;
      opacity: 0.6; transition: opacity 0.12s;
    }
    .ms-tag-remove:hover { opacity: 1; }
    .ms-placeholder { color: #adb5bd; font-size: 14px; padding: 0 4px; }
    .ms-arrow { font-size: 10px; color: #6c757d; transition: transform 0.15s; margin-left: auto; }
    .ms-arrow.open { transform: rotate(180deg); }
    .ms-popup {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 1000;
      background: var(--ngx-input-bg, #fff); border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: var(--ngx-input-radius, 8px); box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1)); overflow: hidden;
      transform-origin: top;
      animation: popup-slide 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes popup-slide {
      from { opacity: 0; transform: translateY(-4px) scaleY(0.95); }
      to { opacity: 1; transform: translateY(0) scaleY(1); }
    }
    .ms-search { padding: 8px; border-bottom: 1px solid var(--ngx-input-border, #ced4da); }
    .ms-search-input {
      width: 100%; padding: 6px 10px; border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: var(--radius-sm, 6px); font-size: 13px; outline: none; font-family: inherit;
      background: var(--bg-primary); color: var(--text-primary);
      transition: all 0.15s ease;
    }
    .ms-search-input:focus {
      border-color: var(--ngx-input-focus, #4f46e5);
      background: var(--bg-secondary);
    }
    .ms-list { max-height: 240px; overflow-y: auto; }
    .ms-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 12px;
      cursor: pointer; font-size: 14px; color: var(--ngx-input-text, #212529);
      transition: all 0.12s;
    }
    .ms-item:hover, .ms-item.focused { background: var(--ngx-grid-hover-bg, #f1f3f5); color: var(--ngx-input-focus, #4f46e5); }
    .ms-item.checked { background: var(--ngx-grid-selected-bg, #e8f0fe); color: var(--ngx-input-focus, #4f46e5); }
    .ms-item.disabled { color: #adb5bd; cursor: not-allowed; }
    .ms-item input[type="checkbox"] { width: 14px; height: 14px; cursor: pointer; accent-color: var(--ngx-input-focus, #4f46e5); }
    .ms-select-all { font-weight: 600; }
    .ms-divider { height: 1px; background: var(--ngx-input-border, #eee); margin: 2px 0; }
    .ms-empty { padding: 12px; text-align: center; color: #adb5bd; font-size: 13px; }
  `]
})
export class MultiSelectComponent implements ControlValueAccessor {
  options = input<DropdownOption[]>([]);
  values = input<unknown[]>([]);
  label = input<string>('');
  placeholder = input<string | null>(null);
  disabled = input<boolean>(false);
  filterable = input<boolean>(false);
  maxTags = input<number>(Infinity);

  valuesChange = output<unknown[]>();

  i18n = inject(NGX_CORE_I18N);
  effectivePlaceholder = computed(() => this.placeholder() ?? this.i18n.dropdown.selectPlaceholder);

  isOpen = signal(false);
  filterText = signal('');
  focusedIndex = signal(-1);
  _cvaValues = signal<unknown[]>([]);
  private _cvaActive = signal(false);
  private _onChange: (v: unknown[]) => void = () => {};
  private _onTouched: () => void = () => {};

  private el = inject(ElementRef);

  _activeValues = computed(() => this._cvaActive() ? this._cvaValues() : this.values());

  displayValues = computed(() =>
    this._activeValues()
      .slice(0, this.maxTags() === Infinity ? undefined : this.maxTags())
      .map(v => ({ value: v, label: this.options().find(o => o.value === v)?.label ?? String(v) }))
  );

  filteredOptions = computed(() => {
    const f = this.filterText().toLowerCase();
    return f ? this.options().filter(o => o.label.toLowerCase().includes(f)) : this.options();
  });

  allSelected = computed(() => this.options().every(o => this._activeValues().includes(o.value)));
  someSelected = computed(() => this.options().some(o => this._activeValues().includes(o.value)));

  isChecked(opt: DropdownOption): boolean { return this._activeValues().includes(opt.value); }

  toggle(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
  }

  toggleOption(opt: DropdownOption): void {
    if (opt.disabled) return;
    const cur = this._activeValues();
    const next = cur.includes(opt.value) ? cur.filter(v => v !== opt.value) : [...cur, opt.value];
    this._cvaValues.set(next);
    this._onChange(next);
    this._onTouched();
    this.valuesChange.emit(next);
  }

  removeValue(val: unknown, e: MouseEvent): void {
    e.stopPropagation();
    const next = this._activeValues().filter(v => v !== val);
    this._cvaValues.set(next);
    this._onChange(next);
    this.valuesChange.emit(next);
  }

  toggleAll(): void {
    const next = this.allSelected() ? [] : this.options().filter(o => !o.disabled).map(o => o.value);
    this._cvaValues.set(next);
    this._onChange(next);
    this.valuesChange.emit(next);
  }

  onTriggerKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(); }
    if (e.key === 'Escape') this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen.set(false);
      this.filterText.set('');
    }
  }

  // ControlValueAccessor
  writeValue(val: unknown[]): void {
    this._cvaActive.set(true);
    this._cvaValues.set(Array.isArray(val) ? val : []);
  }

  registerOnChange(fn: (v: unknown[]) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // disabled is controlled via input() for template usage.
  }
}
