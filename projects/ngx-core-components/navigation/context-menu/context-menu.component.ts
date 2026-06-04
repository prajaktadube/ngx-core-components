import { CommonModule } from '@angular/common';
import { Component, input, output, signal, effect, HostListener } from '@angular/core';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  shortcut?: string;
  children?: ContextMenuItem[];
}

@Component({
  selector: 'ngx-context-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open()) {
      <div
        class="ngx-context-menu-backdrop"
        (click)="close()"
        (contextmenu)="$event.preventDefault(); close()"
      ></div>
      <div
        class="ngx-context-menu"
        role="menu"
        [style.left.px]="x()"
        [style.top.px]="y()"
        [style.min-width.px]="width()"
        (click)="$event.stopPropagation()"
      >
        <ng-container *ngTemplateOutlet="menuList; context: { items: items() }"></ng-container>
      </div>
    }

    <ng-template #menuList let-items="items">
      @for (item of items; track item.id; let i = $index) {
        @if (item.separator) {
          <div class="menu-separator" role="separator"></div>
        } @else {
          <div class="menu-entry">
            <button
              class="menu-item"
              type="button"
              role="menuitem"
              [class.danger]="item.danger"
              [class.has-children]="item.children?.length"
              [class.focused]="focusedIndex() === flatIndexOf(item)"
              [disabled]="item.disabled"
              (click)="selectItem(item, $event)"
            >
              @if (item.icon) { <span class="menu-icon">{{ item.icon }}</span> }
              <span class="menu-label">{{ item.label }}</span>
              @if (item.shortcut) { <span class="menu-shortcut">{{ item.shortcut }}</span> }
              @if (item.children?.length) { <span class="menu-arrow">&gt;</span> }
            </button>
            @if (item.children?.length) {
              <div class="submenu" role="menu">
                <ng-container *ngTemplateOutlet="menuList; context: { items: item.children }"></ng-container>
              </div>
            }
          </div>
        }
      }
    </ng-template>
  `,
  styles: [`
    @keyframes contextMenuFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .ngx-context-menu-backdrop { position: fixed; inset: 0; z-index: 9998; background: transparent; }
    .ngx-context-menu {
      position: fixed; z-index: 9999; padding: 6px;
      border: 1px solid var(--border-color, rgba(217, 222, 232, 0.6));
      border-radius: 10px;
      background: var(--bg-secondary, rgba(255, 255, 255, 0.82));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      box-shadow:
        0 4px 6px -1px rgba(15, 23, 42, 0.06),
        0 10px 15px -3px rgba(15, 23, 42, 0.08),
        0 20px 40px -4px rgba(15, 23, 42, 0.12);
      color: var(--text-primary, #111827);
      font-family: var(--ngx-font-family, inherit);
      animation: contextMenuFadeIn 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .menu-entry { position: relative; }
    .menu-item {
      position: relative; display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 9px;
      width: 100%; border: 0; border-radius: 6px; background: transparent; color: inherit; cursor: pointer;
      font: inherit; font-size: 13px; line-height: 1.2; padding: 8px 10px; text-align: left; white-space: nowrap;
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .menu-item:hover:not(:disabled), .menu-item.focused:not(:disabled) { background: var(--border-light, #f3f6fb); outline: none; }
    .menu-item:focus-visible { background: var(--border-light, #f3f6fb); outline: 2px solid var(--primary-color, #4f46e5); outline-offset: -2px; border-radius: 6px; }
    .menu-item:disabled { color: var(--text-secondary, #94a3b8); cursor: not-allowed; }
    .menu-item.danger { color: var(--ngx-danger, #dc2626); }
    .menu-item.danger:hover:not(:disabled), .menu-item.danger.focused:not(:disabled) { background: rgba(220, 38, 38, 0.08); }
    .menu-icon { width: 16px; text-align: center; color: var(--text-secondary, #64748b); }
    .menu-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    .menu-shortcut { font-size: 10px; font-weight: 600; color: var(--text-secondary, #64748b); background: var(--border-light, #f1f5f9); border: 1px solid var(--border-color, #e2e8f0); padding: 2px 6px; border-radius: 4px; font-family: monospace; margin-left: auto; }
    .menu-arrow { color: var(--text-secondary, #64748b); }
    .menu-separator { height: 1px; margin: 5px 4px; background: var(--border-color, #e5e7eb); }
    .submenu {
      display: none; position: absolute; left: calc(100% - 4px); top: -6px; min-width: 190px; padding: 6px;
      border: 1px solid var(--border-color, rgba(217, 222, 232, 0.6));
      border-radius: 10px;
      background: var(--bg-secondary, rgba(255, 255, 255, 0.82));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      box-shadow:
        0 4px 6px -1px rgba(15, 23, 42, 0.06),
        0 10px 15px -3px rgba(15, 23, 42, 0.08),
        0 20px 40px -4px rgba(15, 23, 42, 0.12);
      animation: contextMenuFadeIn 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .menu-entry:hover > .submenu, .menu-entry:focus-within > .submenu { display: block; }
  `]
})
export class ContextMenuComponent {
  items = input<ContextMenuItem[]>([]);
  open = input(false);
  x = input(0);
  y = input(0);
  width = input(200);

  itemSelected = output<ContextMenuItem>();
  openChange = output<boolean>();

  /** Tracks the focused item index for keyboard navigation (-1 = none). */
  focusedIndex = signal<number>(-1);

  constructor() {
    // Reset focused index whenever the menu opens or closes
    effect(() => {
      this.open(); // subscribe to changes
      this.focusedIndex.set(-1);
    });
  }

  /** Returns the flat index of an item across all top-level items (excluding separators). */
  flatIndexOf(item: ContextMenuItem): number {
    return this.navigableItems().indexOf(item);
  }

  /** Flat list of navigable (non-separator) top-level items. */
  private navigableItems(): ContextMenuItem[] {
    return this.items().filter(i => !i.separator);
  }

  /** Navigable and non-disabled items indices used for arrow-key movement. */
  private navigableIndices(): number[] {
    return this.navigableItems()
      .map((item, idx) => (!item.disabled ? idx : -1))
      .filter(idx => idx !== -1);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.open()) return;

    const indices = this.navigableIndices();
    if (indices.length === 0) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
      return;
    }

    const current = this.focusedIndex();

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIdx = indices.find(i => i > current) ?? indices[0];
      this.focusedIndex.set(nextIdx);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const reversed = [...indices].reverse();
      const prevIdx = reversed.find(i => i < current) ?? reversed[0];
      this.focusedIndex.set(prevIdx);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const items = this.navigableItems();
      if (current >= 0 && current < items.length) {
        const item = items[current];
        if (!item.disabled && !item.children?.length) {
          this.itemSelected.emit(item);
          this.close();
        }
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  selectItem(item: ContextMenuItem, event: MouseEvent): void {
    event.stopPropagation();
    if (item.disabled || item.children?.length) return;
    this.itemSelected.emit(item);
    this.close();
  }

  close(): void {
    this.openChange.emit(false);
  }
}
