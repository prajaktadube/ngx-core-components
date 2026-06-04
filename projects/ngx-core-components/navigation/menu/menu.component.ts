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
						[attr.aria-haspopup]="item.children && item.children.length ? 'true' : null"
						[attr.aria-expanded]="item.children && item.children.length ? (openIndex() === i) : null"
						(click)="handleClick($event, item, i)"
						(keydown.enter)="handleClick($event, item, i)"
					>
						@if (item.icon) { <span class="menu-icon">{{ item.icon }}</span> }
						<span class="menu-label">{{ item.label }}</span>
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
											<span class="menu-label">{{ child.label }}</span>
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
		@keyframes submenuSlideIn {
			from { opacity: 0; transform: translateY(-6px); }
			to   { opacity: 1; transform: translateY(0); }
		}
		:host { display: block; }
		.ngx-menu { display: flex; align-items: stretch; background: var(--ngx-menu-bg, #fff); border: 1px solid var(--ngx-menu-border, #dee2e6); border-radius: var(--ngx-menu-radius, 10px); overflow: visible; }
		.menu-vertical { flex-direction: column; }
		.menu-item { position: relative; display: flex; align-items: center; gap: 10px; padding: 9px 18px; font-size: 13px; font-weight: 500; cursor: pointer; color: var(--ngx-menu-color, #212529); transition: background 0.2s ease, color 0.2s ease; white-space: nowrap; user-select: none; }
		.menu-item::after { content: ''; position: absolute; bottom: 0; left: 18px; right: 18px; height: 2.5px; background: linear-gradient(90deg, var(--ngx-menu-active-color, #1a73e8), #4fc3f7); border-radius: 2px; transform: scaleX(0); transform-origin: left; transition: transform 0.25s ease; pointer-events: none; }
		:host:not(.menu-vertical) .menu-item:hover:not(.disabled)::after,
		:host:not(.menu-vertical) .menu-item.active::after { transform: scaleX(1); }
		.menu-vertical .menu-item::after { display: none; }
		.menu-item:hover:not(.disabled), .menu-item.open { background: var(--ngx-menu-hover-bg, rgba(26,115,232,0.06)); color: var(--ngx-menu-active-color, #1a73e8); }
		.menu-item.disabled { opacity: 0.5; cursor: not-allowed; }
		.menu-item:focus-visible, .menu-subitem:focus-visible { outline: 2px solid var(--ngx-menu-active-color, #1a73e8); outline-offset: -2px; border-radius: 4px; }
		.menu-icon { font-size: 16px; flex-shrink: 0; display: inline-flex; align-items: center; }
		.menu-label { flex: 1; }
		.menu-arrow { margin-left: auto; padding-left: 10px; font-size: 11px; transition: transform 0.2s ease; }
		.menu-item.open > .menu-arrow { transform: rotate(180deg); }
		.menu-vertical .menu-item.open > .menu-arrow { transform: rotate(0deg); }
		.menu-separator { border: none; border-top: 1px solid var(--ngx-menu-separator, #dee2e6); margin: 4px 0; }
		.menu-submenu { position: absolute; top: 100%; left: 0; min-width: 210px; background: var(--ngx-menu-submenu-bg, rgba(255,255,255,0.82)); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid var(--ngx-menu-border, rgba(222,226,230,0.7)); border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.06), 0 12px 36px rgba(0,0,0,0.10); z-index: 1000; padding: 4px 0; animation: submenuSlideIn 0.18s ease-out; }
		.menu-vertical .menu-submenu { top: 0; left: 100%; }
		.menu-subitem { display: flex; align-items: center; gap: 10px; padding: 8px 18px; font-size: 13px; cursor: pointer; color: var(--ngx-menu-color, #212529); transition: background 0.2s ease, color 0.2s ease; white-space: nowrap; border-radius: 6px; margin: 0 4px; }
		.menu-subitem:hover:not(.disabled) { background: var(--ngx-menu-hover-bg, rgba(26,115,232,0.06)); color: var(--ngx-menu-active-color, #1a73e8); }
		.menu-item.active, .menu-subitem.active { background: linear-gradient(135deg, var(--ngx-menu-active-bg, rgba(232,240,254,0.85)), rgba(79,195,247,0.15)); color: var(--ngx-menu-active-color, #1a73e8); font-weight: 600; }
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
