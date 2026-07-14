import {
  Component, ChangeDetectionStrategy, input, output, signal, computed, effect,
  ContentChild, TemplateRef, inject
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NGX_CORE_I18N } from 'ngx-core-components/i18n';

export interface ListViewItemClickEvent<T = unknown> { item: T; index: number; }
export interface ListViewSelectionEvent<T = unknown> { selectedItems: T[]; }
export interface ListViewPageChangeEvent {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

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
          <span>{{ i18n.common.loading }}</span>
        </div>
      } @else if (totalItems() === 0) {
        <div class="lv-empty">{{ i18n.common.noData }}</div>
      } @else {
        <div class="lv-list" role="listbox" [attr.aria-multiselectable]="multiselect()">
          @for (item of visibleItems(); track trackFn(item, pageStartIndex() + $index); let i = $index) {
            <div
              class="lv-item"
              [class.lv-alt]="(pageStartIndex() + i) % 2 === 1"
              [class.lv-selected]="isSelected(item)"
              role="option"
              [attr.aria-selected]="isSelected(item)"
              (click)="onItemClick(item, pageStartIndex() + i)"
            >
              @if (itemTemplate) {
                <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item, index: pageStartIndex() + i }"/>
              } @else {
                <span class="lv-default-text">{{ getLabel(item) }}</span>
              }
            </div>
          }
        </div>

        @if (pageSize() > 0 && totalPages() > 1) {
          <div class="lv-pager">
            <button class="lv-pager-btn" type="button" [disabled]="currentPage() === 1" (click)="goToPreviousPage()">{{ i18n.pagination.previousPage }}</button>
            <div class="lv-pager-meta">{{ i18n.pagination.page }} {{ currentPage() }} {{ i18n.pagination.of }} {{ totalPages() }} <span class="lv-pager-count">{{ totalItems() }} items</span></div>
            <button class="lv-pager-btn" type="button" [disabled]="currentPage() === totalPages()" (click)="goToNextPage()">{{ i18n.pagination.nextPage }}</button>
          </div>
        }
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
    .lv-pager {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 10px 14px; border-top: 1px solid var(--ngx-list-border, #dee2e6); background: #fafbfc;
    }
    .lv-pager-btn {
      border: 1px solid #ced4da; background: #fff; color: #495057; border-radius: 4px;
      padding: 6px 10px; font-size: 12px; cursor: pointer; font-family: inherit;
    }
    .lv-pager-btn:hover:not(:disabled) { background: #f1f3f5; }
    .lv-pager-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .lv-pager-meta { font-size: 12px; color: #495057; }
    .lv-pager-count { color: #6c757d; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ListViewComponent<T = unknown> {
  i18n = inject(NGX_CORE_I18N);

  items = input<T[]>([]);
  selectable = input<boolean>(true);
  multiselect = input<boolean>(false);
  loading = input<boolean>(false);
  labelField = input<string>('label');
  pageSize = input<number>(0);

  itemClick = output<ListViewItemClickEvent<T>>();
  selectionChange = output<ListViewSelectionEvent<T>>();
  pageChange = output<ListViewPageChangeEvent>();

  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<{ $implicit: T; index: number }>;

  selectedItems = signal<Set<T>>(new Set());
  currentPage = signal(1);
  totalItems = computed(() => this.items().length);
  totalPages = computed(() => {
    const size = this.pageSize();
    if (size <= 0) {
      return this.totalItems() > 0 ? 1 : 0;
    }
    return Math.max(1, Math.ceil(this.totalItems() / size));
  });
  pageStartIndex = computed(() => this.pageSize() > 0 ? (this.currentPage() - 1) * this.pageSize() : 0);
  visibleItems = computed(() => {
    const size = this.pageSize();
    if (size <= 0) {
      return this.items();
    }

    return this.items().slice(this.pageStartIndex(), this.pageStartIndex() + size);
  });

  constructor() {
    effect(() => {
      if (this.pageSize() <= 0) {
        if (this.currentPage() !== 1) {
          this.currentPage.set(1);
        }
        return;
      }

      const maxPage = this.totalPages();
      if (maxPage > 0 && this.currentPage() > maxPage) {
        this.currentPage.set(maxPage);
        this.emitPageChange();
      }
    });
  }

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

  goToPreviousPage(): void {
    this.setPage(this.currentPage() - 1);
  }

  goToNextPage(): void {
    this.setPage(this.currentPage() + 1);
  }

  private setPage(page: number): void {
    const nextPage = Math.max(1, Math.min(this.totalPages(), page));
    if (nextPage === this.currentPage()) {
      return;
    }

    this.currentPage.set(nextPage);
    this.emitPageChange();
  }

  private emitPageChange(): void {
    this.pageChange.emit({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      totalItems: this.totalItems(),
      totalPages: this.totalPages(),
    });
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
