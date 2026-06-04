import { Component, computed, input, output, signal } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'ngx-breadcrumb',
  standalone: true,
  template: `
    <nav class="ngx-breadcrumb" aria-label="breadcrumb">
      @for (item of visibleItems(); track item.label; let i = $index; let last = $last) {
        @if (i > 0) { <span class="breadcrumb-separator" aria-hidden="true">{{ separator() }}</span> }
        @if (last) {
          <span class="breadcrumb-item active" aria-current="page">
            @if (item.icon) { <span class="breadcrumb-icon">{{ item.icon }}</span> }
            {{ item.label }}
          </span>
        } @else if (item.url) {
          <a class="breadcrumb-item" [href]="item.url" (click)="onNav($event, item)">
            @if (item.icon) { <span class="breadcrumb-icon">{{ item.icon }}</span> }
            {{ item.label }}
          </a>
        } @else {
          <button class="breadcrumb-item breadcrumb-btn" (click)="itemClick.emit(item)">
            @if (item.icon) { <span class="breadcrumb-icon">{{ item.icon }}</span> }
            {{ item.label }}
          </button>
        }
      }
      @if (shouldCollapse()) {
        <span class="breadcrumb-separator" aria-hidden="true">{{ separator() }}</span>
        <button
          class="breadcrumb-item breadcrumb-btn breadcrumb-ellipsis"
          (click)="isCollapsed.set(false)"
          aria-label="Show all breadcrumbs"
          title="Show all breadcrumbs"
        >&hellip;</button>
        <span class="breadcrumb-separator" aria-hidden="true">{{ separator() }}</span>
        @for (item of tailItems(); track item.label; let i = $index; let last = $last) {
          @if (last) {
            <span class="breadcrumb-item active" aria-current="page">
              @if (item.icon) { <span class="breadcrumb-icon">{{ item.icon }}</span> }
              {{ item.label }}
            </span>
          } @else if (item.url) {
            <a class="breadcrumb-item" [href]="item.url" (click)="onNav($event, item)">
              @if (item.icon) { <span class="breadcrumb-icon">{{ item.icon }}</span> }
              {{ item.label }}
            </a>
          } @else {
            <button class="breadcrumb-item breadcrumb-btn" (click)="itemClick.emit(item)">
              @if (item.icon) { <span class="breadcrumb-icon">{{ item.icon }}</span> }
              {{ item.label }}
            </button>
          }
          @if (!last) { <span class="breadcrumb-separator" aria-hidden="true">{{ separator() }}</span> }
        }
      }
    </nav>
  `,
  styles: [`
    :host { display: block; }
    .ngx-breadcrumb { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; font-size: 13px; }
    .breadcrumb-separator {
      color: var(--ngx-breadcrumb-separator, #adb5bd);
      padding: 0 2px;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }
    .ngx-breadcrumb:hover .breadcrumb-separator { opacity: 1; }
    .breadcrumb-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--ngx-breadcrumb-link, #1a73e8);
      text-decoration: none;
      padding: 2px 8px;
      border-radius: 12px;
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    .breadcrumb-item:hover:not(.active) {
      background-color: var(--ngx-breadcrumb-hover-bg, rgba(26, 115, 232, 0.08));
      color: var(--ngx-breadcrumb-link-hover, #1557b0);
    }
    .breadcrumb-item:focus-visible {
      outline: 2px solid var(--ngx-breadcrumb-focus, #1a73e8);
      outline-offset: 2px;
    }
    .breadcrumb-item.active {
      color: var(--ngx-breadcrumb-active, #495057);
      background-color: var(--ngx-breadcrumb-active-bg, rgba(73, 80, 87, 0.08));
      cursor: default;
      font-weight: 600;
    }
    .breadcrumb-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
      padding: 2px 8px;
    }
    .breadcrumb-ellipsis {
      font-weight: 700;
      letter-spacing: 1px;
      min-width: 28px;
      justify-content: center;
    }
    .breadcrumb-icon { font-size: 14px; }
  `]
})
export class BreadcrumbComponent {
  items = input<BreadcrumbItem[]>([]);
  separator = input('/');
  maxVisible = input(0);
  itemClick = output<BreadcrumbItem>();

  isCollapsed = signal<boolean>(true);

  /** True when collapse mode is active: maxVisible > 0, items exceed threshold, and user hasn't expanded */
  shouldCollapse = computed(() => {
    const max = this.maxVisible();
    return max > 0 && this.items().length > max + 1 && this.isCollapsed();
  });

  /** Items to render in the main @for loop: all items when not collapsing, or only the first item when collapsing */
  visibleItems = computed(() => {
    if (this.shouldCollapse()) {
      return this.items().slice(0, 1);
    }
    return this.items();
  });

  /** The trailing items shown after the ellipsis when collapsed */
  tailItems = computed(() => {
    if (this.shouldCollapse()) {
      return this.items().slice(-this.maxVisible());
    }
    return [];
  });

  onNav(event: MouseEvent, item: BreadcrumbItem): void { event.preventDefault(); this.itemClick.emit(item); }
}

