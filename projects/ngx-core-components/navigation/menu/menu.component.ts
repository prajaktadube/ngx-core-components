import { Component, input, output, signal, HostListener, computed } from '@angular/core';

export interface MenuItem {
	label?: string;
	icon?: string;
	url?: string;
	disabled?: boolean;
	separator?: boolean;
	children?: MenuItem[];
}

@Component({
	selector: 'ngx-menu',
	standalone: true,
	template: `
		<nav class="ngx-menu" [class.menu-vertical]="orientation() === 'vertical'" role="menubar">
			@for (item of items(); track $index; let i = $index) {
				@if (item.separator) {
					<hr class="menu-separator" />
				} @else {
					<div
						class="menu-item"
						[class.has-children]="item.children && item.children.length > 0"
						[class.open]="openIndex() === i"
						[class.disabled]="item.disabled"
						[class.active]="isActiveItem(item)"
						role="menuitem"
						[attr.tabindex]="item.disabled ? -1 : 0"
						(click)="handleClick($event, item, i)"
						(keydown.enter)="handleClick($event, item, i)"
					>
						@if (item.icon) { <span class="menu-icon">{{ item.icon }}</span> }
						{{ item.label }}
						@if (item.children && item.children.length) {
							<span class="menu-arrow">{{ orientation() === 'vertical' ? '&#8250;' : '&#9662;' }}</span>
						}
						@if (item.children && item.children.length && openIndex() === i) {
							<div class="menu-submenu" role="menu">
								@for (child of item.children; track $index) {
									@if (child.separator) {
										<hr class="menu-separator" />
									} @else {
										<div class="menu-subitem" [class.disabled]="child.disabled" [class.active]="isActiveItem(child)" role="menuitem" [attr.tabindex]="child.disabled ? -1 : 0" (click)="handleSubClick($event, child)">
											@if (child.icon) { <span class="menu-icon">{{ child.icon }}</span> }
											{{ child.label }}
										</div>
									}
								}
							</div>
						}
					</div>
				}
			}
		</nav>
	`,
	styles: [`
		:host { display: block; }
		.ngx-menu { display: flex; align-items: stretch; background: var(--ngx-menu-bg, #fff); border: 1px solid var(--ngx-menu-border, #dee2e6); border-radius: var(--ngx-menu-radius, 6px); overflow: visible; }
		.menu-vertical { flex-direction: column; }
		.menu-item { position: relative; display: flex; align-items: center; gap: 7px; padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer; color: var(--ngx-menu-color, #212529); transition: background 0.12s; white-space: nowrap; user-select: none; }
		.menu-item:hover:not(.disabled), .menu-item.open { background: var(--ngx-menu-hover-bg, #f1f3f5); color: var(--ngx-menu-active-color, #1a73e8); }
		.menu-item.disabled { opacity: 0.5; cursor: not-allowed; }
		.menu-icon { font-size: 15px; flex-shrink: 0; }
		.menu-arrow { margin-left: auto; padding-left: 8px; font-size: 11px; }
		.menu-separator { border: none; border-top: 1px solid var(--ngx-menu-separator, #dee2e6); margin: 4px 0; }
		.menu-submenu { position: absolute; top: 100%; left: 0; min-width: 200px; background: var(--ngx-menu-bg, #fff); border: 1px solid var(--ngx-menu-border, #dee2e6); border-radius: 6px; box-shadow: 0 6px 24px rgba(0,0,0,0.12); z-index: 1000; }
		.menu-vertical .menu-submenu { top: 0; left: 100%; }
		.menu-subitem { display: flex; align-items: center; gap: 7px; padding: 8px 16px; font-size: 13px; cursor: pointer; color: var(--ngx-menu-color, #212529); transition: background 0.12s; white-space: nowrap; }
		.menu-subitem:hover:not(.disabled) { background: var(--ngx-menu-hover-bg, #f1f3f5); color: var(--ngx-menu-active-color, #1a73e8); }
		.menu-item.active, .menu-subitem.active { background: var(--ngx-menu-active-bg, #e8f0fe); color: var(--ngx-menu-active-color, #1a73e8); font-weight: 600; }
	`]
})
export class MenuComponent {
	items = input<MenuItem[]>([]);
	orientation = input<'horizontal' | 'vertical'>('horizontal');
	/** Label or URL of the currently active item — used to highlight the active menu entry. */
	activeItem = input<string>('');
	openIndex = signal<number | null>(null);
	itemClick = output<MenuItem>();

	isActiveItem(item: MenuItem): boolean {
		const active = this.activeItem();
		if (!active) return false;
		return item.label === active || item.url === active;
	}

	handleClick(event: Event, item: MenuItem, i: number): void {
		if (item.disabled) return;
		event.stopPropagation();
		if (item.children && item.children.length) { this.openIndex.set(this.openIndex() === i ? null : i); }
		else { this.itemClick.emit(item); this.openIndex.set(null); }
	}

	handleSubClick(event: Event, child: MenuItem): void {
		if (child.disabled) return;
		event.stopPropagation();
		this.itemClick.emit(child);
		this.openIndex.set(null);
	}

	@HostListener('document:click')
	closeAll(): void { this.openIndex.set(null); }
}
