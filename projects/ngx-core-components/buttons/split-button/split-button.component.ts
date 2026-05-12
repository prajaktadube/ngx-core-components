import { Component, HostListener, ElementRef, inject, input, output, signal } from '@angular/core';
import { ButtonComponent, ButtonVariant, ButtonSize } from '../button/button.component';

export interface SplitButtonItem { label?: string; text?: string; icon?: string; disabled?: boolean; separator?: boolean; }

@Component({
  selector: 'ngx-split-button',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="ngx-split-btn" [class.open]="open()">
      <ngx-button [variant]="variant()" [size]="size()" [disabled]="disabled()" [loading]="loading()" (clicked)="mainClicked.emit($event)">
        <ng-content />
      </ngx-button>
      <button class="split-arrow" [class]="'ngx-btn ngx-btn-' + size() + ' ngx-btn-' + variant()" [disabled]="disabled()" (click)="toggle()" aria-haspopup="true" [attr.aria-expanded]="open()">
        <span class="arrow-icon">▾</span>
      </button>
      @if (open()) {
        <ul class="split-menu" role="menu">
          @for (item of items(); track (item.text || item.label || $index)) {
            @if (item.separator) {
              <li class="split-menu-separator" role="separator"></li>
            } @else {
              <li class="split-menu-item" [class.disabled]="item.disabled" role="menuitem"
                (click)="onItemClick(item)">
                @if (item.icon) { <span class="item-icon">{{ item.icon }}</span> }
                <span>{{ item.text || item.label }}</span>
              </li>
            }
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    :host { display: inline-block; position: relative; }
    .ngx-split-btn { display: inline-flex; position: relative; }
    .ngx-split-btn ngx-button :global(.ngx-btn) { border-radius: var(--ngx-btn-radius, 4px) 0 0 var(--ngx-btn-radius, 4px) !important; border-right: none; }
    .split-arrow { border-radius: 0 var(--ngx-btn-radius, 4px) var(--ngx-btn-radius, 4px) 0 !important; padding: 0 10px; cursor: pointer; font-family: inherit; border-left: 1px solid rgba(255,255,255,0.3); }
    .split-arrow:disabled { opacity: 0.55; cursor: not-allowed; }
    .split-menu { position: absolute; top: 100%; left: 0; min-width: 100%; margin-top: 2px; background: var(--ngx-menu-bg, #fff); border: 1px solid var(--ngx-menu-border, #dee2e6); border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); list-style: none; padding: 4px 0; z-index: 1000; }
    .split-menu-item { display: flex; align-items: center; gap: 8px; padding: 8px 14px; font-size: 13px; cursor: pointer; color: #212529; }
    .split-menu-item:hover:not(.disabled) { background: #f1f3f5; }
    .split-menu-item.disabled { color: #adb5bd; cursor: not-allowed; }
    .split-menu-separator { margin: 4px 0; height: 1px; background: var(--ngx-menu-separator, #dee2e6); list-style: none; }
    .item-icon { font-size: 14px; }
  `]
})
export class SplitButtonComponent {
  private el = inject(ElementRef);

  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  disabled = input(false);
  loading = input(false);
  items = input<SplitButtonItem[]>([]);
  open = signal(false);

  mainClicked = output<MouseEvent>();
  itemClicked = output<SplitButtonItem>();

  toggle(): void {
    if (this.disabled() || this.loading()) return;
    this.open.update(v => !v);
  }

  onItemClick(item: SplitButtonItem): void {
    if (item.disabled) return;
    this.itemClicked.emit(item);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }
}
