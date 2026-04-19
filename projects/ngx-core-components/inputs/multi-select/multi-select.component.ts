import {
  Component, ChangeDetectionStrategy, input, output, signal, computed,
  HostListener, ElementRef, inject
} from '@angular/core';
import { DropdownOption } from '../dropdown/dropdown.component';

@Component({
  selector: 'ngx-multi-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-multi-select" [class.open]="isOpen()" [class.disabled]="disabled()" role="combobox">
      @if (label()) {
        <label class="ms-label">{{ label() }}</label>
      }
      <!-- Trigger -->
      <div class="ms-trigger" tabindex="0" (click)="toggle()" (keydown)="onTriggerKey($event)">
        <div class="ms-tags">
          @for (val of displayValues(); track val.value) {
            <span class="ms-tag">
              {{ val.label }}
              <button class="ms-tag-remove" (click)="removeValue(val.value, $event)" [attr.aria-label]="'Remove ' + val.label">&#10005;</button>
            </span>
          }
          @if (displayValues().length === 0) {
            <span class="ms-placeholder">{{ placeholder() }}</span>
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
                placeholder="Search..."
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
              <span>Select All</span>
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
              <div class="ms-empty">No results</div>
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
      border-radius: var(--ngx-input-radius, 4px); background: var(--ngx-input-bg, #fff);
      cursor: pointer; user-select: none; transition: border-color 0.15s, box-shadow 0.15s;
    }
    .ms-trigger:hover { border-color: #adb5bd; }
    .open .ms-trigger { border-color: var(--ngx-input-focus, #4a90d9); box-shadow: 0 0 0 2px rgba(74,144,217,0.18); }
    .disabled .ms-trigger { background: #f8f9fa; cursor: not-allowed; }
    .ms-tags { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; align-items: center; }
    .ms-tag {
      display: inline-flex; align-items: center; gap: 4px;
      background: var(--ngx-input-tag-bg, #e8f0fe); color: var(--ngx-input-tag-color, #1a73e8);
      padding: 2px 4px 2px 8px; border-radius: 3px; font-size: 12px;
    }
    .ms-tag-remove {
      background: none; border: none; cursor: pointer; padding: 0 2px;
      color: var(--ngx-input-tag-color, #1a73e8); font-size: 10px; line-height: 1;
    }
    .ms-placeholder { color: #adb5bd; font-size: 14px; padding: 0 4px; }
    .ms-arrow { font-size: 10px; color: #6c757d; transition: transform 0.15s; margin-left: auto; }
    .ms-arrow.open { transform: rotate(180deg); }
    .ms-popup {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 1000;
      background: var(--ngx-input-bg, #fff); border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: var(--ngx-input-radius, 4px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); overflow: hidden;
    }
    .ms-search { padding: 8px; border-bottom: 1px solid var(--ngx-input-border, #ced4da); }
    .ms-search-input {
      width: 100%; padding: 6px 10px; border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: 3px; font-size: 13px; outline: none; font-family: inherit;
    }
    .ms-list { max-height: 240px; overflow-y: auto; }
    .ms-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 12px;
      cursor: pointer; font-size: 14px; color: var(--ngx-input-text, #212529);
    }
    .ms-item:hover, .ms-item.focused { background: #f1f3f5; }
    .ms-item.checked { background: #f0f7ff; }
    .ms-item.disabled { color: #adb5bd; cursor: not-allowed; }
    .ms-item input[type="checkbox"] { width: 14px; height: 14px; cursor: pointer; accent-color: var(--ngx-input-focus, #4a90d9); }
    .ms-select-all { font-weight: 500; }
    .ms-divider { height: 1px; background: #eee; margin: 2px 0; }
    .ms-empty { padding: 12px; text-align: center; color: #adb5bd; font-size: 13px; }
  `]
})
export class MultiSelectComponent {
  options = input<DropdownOption[]>([]);
  values = input<unknown[]>([]);
  label = input<string>('');
  placeholder = input<string>('Select...');
  disabled = input<boolean>(false);
  filterable = input<boolean>(false);
  maxTags = input<number>(Infinity);

  valuesChange = output<unknown[]>();

  isOpen = signal(false);
  filterText = signal('');
  focusedIndex = signal(-1);

  private el = inject(ElementRef);

  displayValues = computed(() =>
    this.values()
      .slice(0, this.maxTags() === Infinity ? undefined : this.maxTags())
      .map(v => ({ value: v, label: this.options().find(o => o.value === v)?.label ?? String(v) }))
  );

  filteredOptions = computed(() => {
    const f = this.filterText().toLowerCase();
    return f ? this.options().filter(o => o.label.toLowerCase().includes(f)) : this.options();
  });

  allSelected = computed(() => this.options().every(o => this.values().includes(o.value)));
  someSelected = computed(() => this.options().some(o => this.values().includes(o.value)));

  isChecked(opt: DropdownOption): boolean { return this.values().includes(opt.value); }

  toggle(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
  }

  toggleOption(opt: DropdownOption): void {
    if (opt.disabled) return;
    const cur = this.values();
    const next = cur.includes(opt.value) ? cur.filter(v => v !== opt.value) : [...cur, opt.value];
    this.valuesChange.emit(next);
  }

  removeValue(val: unknown, e: MouseEvent): void {
    e.stopPropagation();
    this.valuesChange.emit(this.values().filter(v => v !== val));
  }

  toggleAll(): void {
    if (this.allSelected()) this.valuesChange.emit([]);
    else this.valuesChange.emit(this.options().filter(o => !o.disabled).map(o => o.value));
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
}
