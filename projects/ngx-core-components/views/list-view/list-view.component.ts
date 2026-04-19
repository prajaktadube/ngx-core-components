import {
  Component, ChangeDetectionStrategy, input, output, signal, computed,
  ContentChild, TemplateRef
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface ListViewItemClickEvent<T = unknown> { item: T; index: number; }
export interface ListViewSelectionEvent<T = unknown> { selectedItems: T[]; }

@Component({
  selector: 'ngx-list-view',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-list-view">
      <!-- Header slot -->
      <ng-content select="[listHeader]"/>

      <!-- Loading -->
      @if (loading()) {
        <div class="lv-loading">
          <div class="lv-spinner"></div>
          <span>Loading...</span>
        </div>
      } @else if (items().length === 0) {
        <div class="lv-empty">No items to display.</div>
      } @else {
        <div class="lv-list" role="listbox" [attr.aria-multiselectable]="multiselect()">
          @for (item of items(); track trackFn(item, $index); let i = $index) {
            <div
              class="lv-item"
              [class.lv-alt]="i % 2 === 1"
              [class.lv-selected]="isSelected(item)"
              role="option"
              [attr.aria-selected]="isSelected(item)"
              (click)="onItemClick(item, i)"
            >
              @if (itemTemplate) {
                <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item, index: i }"/>
              } @else {
                <span class="lv-default-text">{{ getLabel(item) }}</span>
              }
            </div>
          }
        </div>
      }

      <!-- Footer slot -->
      <ng-content select="[listFooter]"/>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-list-view {
      border: 1px solid var(--ngx-list-border, #dee2e6); border-radius: var(--ngx-list-radius, 4px);
      background: var(--ngx-list-bg, #fff); overflow: hidden; font-family: inherit;
    }
    .lv-list { overflow-y: auto; }
    .lv-item {
      padding: 10px 16px; cursor: pointer; border-bottom: 1px solid var(--ngx-list-border, #dee2e6);
      transition: background 0.1s; color: var(--ngx-list-text, #212529); font-size: 13px;
    }
    .lv-item:last-child { border-bottom: none; }
    .lv-item:hover { background: var(--ngx-list-hover-bg, #f1f3f5); }
    .lv-item.lv-alt { background: var(--ngx-list-alt-bg, #f8f9fa); }
    .lv-item.lv-alt:hover { background: var(--ngx-list-hover-bg, #f1f3f5); }
    .lv-item.lv-selected { background: var(--ngx-list-selected-bg, #e8f0fe); color: var(--ngx-list-selected-color, #1a73e8); font-weight: 500; }
    .lv-item.lv-selected:hover { background: var(--ngx-list-selected-bg, #e8f0fe); }
    .lv-default-text { display: block; }
    .lv-loading, .lv-empty {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 32px; color: #adb5bd; font-size: 13px;
    }
    .lv-spinner {
      width: 20px; height: 20px; border: 2px solid #dee2e6; border-top-color: #4a90d9;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ListViewComponent<T = unknown> {
  items = input<T[]>([]);
  selectable = input<boolean>(true);
  multiselect = input<boolean>(false);
  loading = input<boolean>(false);
  labelField = input<string>('label');

  itemClick = output<ListViewItemClickEvent<T>>();
  selectionChange = output<ListViewSelectionEvent<T>>();

  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<{ $implicit: T; index: number }>;

  selectedItems = signal<Set<T>>(new Set());

  isSelected(item: T): boolean { return this.selectedItems().has(item); }

  onItemClick(item: T, index: number): void {
    this.itemClick.emit({ item, index });
    if (!this.selectable()) return;
    const s = new Set(this.selectedItems());
    if (this.multiselect()) {
      s.has(item) ? s.delete(item) : s.add(item);
    } else {
      if (s.has(item) && s.size === 1) s.clear();
      else { s.clear(); s.add(item); }
    }
    this.selectedItems.set(s);
    this.selectionChange.emit({ selectedItems: [...s] });
  }

  getLabel(item: T): string {
    if (typeof item === 'string' || typeof item === 'number') return String(item);
    const r = item as Record<string, unknown>;
    return String(r[this.labelField()] ?? r['label'] ?? r['name'] ?? r['title'] ?? JSON.stringify(item));
  }

  trackFn(item: T, index: number): string {
    if (typeof item === 'object' && item !== null) {
      const r = item as Record<string, unknown>;
      return String(r['id'] ?? r['key'] ?? index);
    }
    return String(index);
  }
}
