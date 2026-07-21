import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface VirtualListItem {
  id: string | number;
  [key: string]: unknown;
}

export interface VirtualListItemClickEvent<T> {
  item: T;
  index: number;
}

@Component({
  selector: 'ngx-virtual-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div
      #scrollContainer
      class="vl-container"
      [style.height]="containerHeight() + 'px'"
      (scroll)="onScroll()"
    >
      <!-- Total height spacer -->
      <div class="vl-spacer" [style.height]="totalHeight() + 'px'"></div>

      <!-- Visible items absolute-positioned window -->
      <div
        class="vl-window"
        [style.transform]="'translateY(' + offsetY() + 'px)'"
      >
        @for (entry of visibleItems(); track entry.index) {
          <div
            class="vl-row"
            [class.vl-row--selected]="selectedIndex() === entry.index"
            [class.vl-row--striped]="striped() && entry.index % 2 !== 0"
            [style.height]="itemHeight() + 'px'"
            role="option"
            tabindex="0"
            (click)="handleItemClick(entry.item, entry.index)"
            (keydown.enter)="handleItemClick(entry.item, entry.index)"
            (keydown.space)="handleItemClick(entry.item, entry.index); $event.preventDefault()"
          >
            @if (renderTemplate()) {
              <ng-container *ngTemplateOutlet="renderTemplate()!; context: { $implicit: entry.item, index: entry.index }"></ng-container>
            } @else {
              <span class="vl-default-label">{{ getLabel(entry.item) }}</span>
            }
          </div>
        }
      </div>

      <!-- Empty state -->
      @if (items().length === 0) {
        <div class="vl-empty">
          <span class="vl-empty-icon">📋</span>
          <span>{{ emptyText() }}</span>
        </div>
      }
    </div>

    <!-- Footer info bar -->
    @if (showCount()) {
      <div class="vl-footer">
        <span>Showing {{ visibleItems().length }} of {{ items().length }} items</span>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      font-family: inherit;
    }

    .vl-container {
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 10px;
      background: var(--bg-primary, #ffffff);
      scroll-behavior: auto;
    }

    .vl-container::-webkit-scrollbar {
      width: 6px;
    }
    .vl-container::-webkit-scrollbar-track {
      background: transparent;
    }
    .vl-container::-webkit-scrollbar-thumb {
      background: var(--border-color, #cbd5e1);
      border-radius: 3px;
    }
    .vl-container::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary, #94a3b8);
    }

    .vl-spacer {
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      pointer-events: none;
    }

    .vl-window {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      will-change: transform;
    }

    .vl-row {
      display: flex;
      align-items: center;
      padding: 0 16px;
      cursor: pointer;
      border-bottom: 1px solid var(--border-color, #f1f5f9);
      transition: background-color 0.12s ease;
      box-sizing: border-box;
      gap: 12px;
    }

    .vl-row:hover {
      background: var(--bg-hover, rgba(79, 70, 229, 0.04));
    }

    .vl-row--selected {
      background: var(--primary-glow, rgba(79, 70, 229, 0.08));
      border-left: 3px solid var(--primary-color, #4f46e5);
    }

    .vl-row--striped:not(.vl-row--selected) {
      background: var(--bg-secondary, #f8fafc);
    }

    .vl-default-label {
      font-size: 13px;
      color: var(--text-primary, #0f172a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .vl-empty {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--text-secondary, #64748b);
      font-size: 14px;
    }

    .vl-empty-icon {
      font-size: 36px;
      opacity: 0.6;
    }

    .vl-footer {
      padding: 8px 16px;
      background: var(--bg-secondary, #f8fafc);
      border: 1px solid var(--border-color, #e2e8f0);
      border-top: none;
      border-radius: 0 0 10px 10px;
      font-size: 12px;
      color: var(--text-secondary, #64748b);
    }
  `]
})
export class VirtualListComponent<T extends VirtualListItem = VirtualListItem> {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  // ---------- Inputs ----------
  items = input<T[]>([]);
  itemHeight = input<number>(48);
  containerHeight = input<number>(400);
  overscan = input<number>(5);
  striped = input<boolean>(false);
  showCount = input<boolean>(true);
  emptyText = input<string>('No items to display');
  labelKey = input<string>('label');
  renderTemplate = input<import('@angular/core').TemplateRef<{ $implicit: T; index: number }> | null>(null);

  // ---------- Outputs ----------
  itemClick = output<VirtualListItemClickEvent<T>>();

  // ---------- Internal state ----------
  private scrollTop = signal<number>(0);
  selectedIndex = signal<number>(-1);

  // ---------- Computed ----------
  totalHeight = computed(() => this.items().length * this.itemHeight());

  startIndex = computed(() => {
    const raw = Math.floor(this.scrollTop() / this.itemHeight());
    return Math.max(0, raw - this.overscan());
  });

  endIndex = computed(() => {
    const visible = Math.ceil(this.containerHeight() / this.itemHeight());
    const raw = Math.floor(this.scrollTop() / this.itemHeight()) + visible;
    return Math.min(this.items().length - 1, raw + this.overscan());
  });

  visibleItems = computed(() => {
    const arr: { item: T; index: number }[] = [];
    const start = this.startIndex();
    const end = this.endIndex();
    const all = this.items();
    for (let i = start; i <= end; i++) {
      arr.push({ item: all[i], index: i });
    }
    return arr;
  });

  offsetY = computed(() => this.startIndex() * this.itemHeight());

  // ---------- Event handlers ----------
  onScroll(): void {
    const el = this.scrollContainer?.nativeElement;
    if (el) {
      this.scrollTop.set(el.scrollTop);
    }
  }

  handleItemClick(item: T, index: number): void {
    this.selectedIndex.set(index);
    this.itemClick.emit({ item, index });
  }

  getLabel(item: T): string {
    const key = this.labelKey();
    const val = (item as Record<string, unknown>)[key];
    return val != null ? String(val) : String(item['id'] ?? '');
  }

}
