import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
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
      @for (item of items; track item.id) {
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
              [disabled]="item.disabled"
              (click)="selectItem(item, $event)"
            >
              @if (item.icon) { <span class="menu-icon">{{ item.icon }}</span> }
              <span class="menu-label">{{ item.label }}</span>
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
    .ngx-context-menu-backdrop { position: fixed; inset: 0; z-index: 9998; background: transparent; }
    .ngx-context-menu { position: fixed; z-index: 9999; padding: 6px; border: 1px solid var(--border-color, #d9dee8); border-radius: 8px; background: var(--bg-secondary, #ffffff); box-shadow: var(--shadow-lg, 0 18px 40px rgba(15, 23, 42, 0.16)); color: var(--text-primary, #111827); font-family: var(--ngx-font-family, inherit); }
    .menu-entry { position: relative; }
    .menu-item { position: relative; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 9px; width: 100%; border: 0; border-radius: 6px; background: transparent; color: inherit; cursor: pointer; font: inherit; font-size: 13px; line-height: 1.2; padding: 8px 10px; text-align: left; white-space: nowrap; }
    .menu-item:hover:not(:disabled), .menu-item:focus-visible { background: var(--border-light, #f3f6fb); outline: none; }
    .menu-item:disabled { color: var(--text-secondary, #94a3b8); cursor: not-allowed; }
    .menu-item.danger { color: var(--ngx-danger, #dc2626); }
    .menu-icon { width: 16px; text-align: center; color: var(--text-secondary, #64748b); }
    .menu-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    .menu-arrow { color: var(--text-secondary, #64748b); }
    .menu-separator { height: 1px; margin: 5px 4px; background: var(--border-color, #e5e7eb); }
    .submenu { display: none; position: absolute; left: calc(100% - 4px); top: -6px; min-width: 190px; padding: 6px; border: 1px solid var(--border-color, #d9dee8); border-radius: 8px; background: var(--bg-secondary, #ffffff); box-shadow: var(--shadow-lg, 0 18px 40px rgba(15, 23, 42, 0.16)); }
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
