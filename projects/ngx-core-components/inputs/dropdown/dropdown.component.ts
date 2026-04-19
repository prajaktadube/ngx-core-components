import {
  Component, ChangeDetectionStrategy, input, output, signal, computed,
  HostListener, ElementRef, inject
} from '@angular/core';

export interface DropdownOption {
  label: string;
  value: unknown;
  disabled?: boolean;
}

@Component({
  selector: 'ngx-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-dropdown"
      [class.open]="isOpen()"
      [class.disabled]="disabled()"
      [attr.aria-expanded]="isOpen()"
      role="combobox"
    >
      @if (label()) {
        <label class="ngx-dropdown-label">{{ label() }}</label>
      }

      <!-- Trigger -->
      <div
        class="ngx-dropdown-trigger"
        tabindex="0"
        (click)="toggle()"
        (keydown)="onTriggerKey($event)"
        [attr.aria-label]="selectedLabel() || placeholder()"
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
      border-radius: var(--ngx-input-radius, 4px); background: var(--ngx-input-bg, #fff);
      cursor: pointer; user-select: none; font-size: 14px;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .ngx-dropdown-trigger:hover { border-color: #adb5bd; }
    .open .ngx-dropdown-trigger {
      border-color: var(--ngx-input-focus, #4a90d9);
      box-shadow: 0 0 0 2px rgba(74,144,217,0.18);
    }
    .disabled .ngx-dropdown-trigger { background: #f8f9fa; cursor: not-allowed; color: #adb5bd; }
    .trigger-text { flex: 1; color: var(--ngx-input-text, #212529); }
    .trigger-text.placeholder { color: #adb5bd; }
    .trigger-arrow { font-size: 10px; color: #6c757d; transition: transform 0.15s; }
    .trigger-arrow.open { transform: rotate(180deg); }
    .ngx-dropdown-popup {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 1000;
      background: var(--ngx-input-bg, #fff); border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: var(--ngx-input-radius, 4px); box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      overflow: hidden;
    }
    .popup-search { padding: 8px; border-bottom: 1px solid var(--ngx-input-border, #ced4da); }
    .popup-search-input {
      width: 100%; padding: 6px 10px; border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: 3px; font-size: 13px; outline: none; font-family: inherit;
    }
    .popup-list { max-height: 240px; overflow-y: auto; }
    .popup-item {
      padding: 8px 12px; font-size: 14px; cursor: pointer;
      color: var(--ngx-input-text, #212529); transition: background 0.1s;
    }
    .popup-item:hover, .popup-item.focused { background: var(--ngx-input-hover-bg, #f1f3f5); }
    .popup-item.selected { background: var(--ngx-input-selected-bg, #e8f0fe); color: var(--ngx-input-focus, #4a90d9); font-weight: 500; }
    .popup-item.disabled { color: #adb5bd; cursor: not-allowed; }
    .popup-item.disabled:hover { background: none; }
    .popup-empty { padding: 12px; text-align: center; color: #adb5bd; font-size: 13px; }
  `]
})
export class DropdownComponent {
  options = input<DropdownOption[]>([]);
  value = input<unknown>(null);
  label = input<string>('');
  placeholder = input<string>('Select...');
  disabled = input<boolean>(false);
  filterable = input<boolean>(false);

  valueChange = output<unknown>();

  isOpen = signal(false);
  filterText = signal('');
  focusedIndex = signal(-1);

  private el = inject(ElementRef);

  selectedLabel = computed(() => {
    const opt = this.options().find(o => o.value === this.value());
    return opt?.label ?? '';
  });

  filteredOptions = computed(() => {
    const f = this.filterText().toLowerCase();
    return f ? this.options().filter(o => o.label.toLowerCase().includes(f)) : this.options();
  });

  isSelected(opt: DropdownOption): boolean { return opt.value === this.value(); }

  toggle(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
    if (!this.isOpen()) this.filterText.set('');
  }

  selectOption(opt: DropdownOption): void {
    if (opt.disabled) return;
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
    this.focusedIndex.update(i => Math.max(0, Math.min(n - 1, i + delta)));
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen.set(false);
      this.filterText.set('');
    }
  }
}
