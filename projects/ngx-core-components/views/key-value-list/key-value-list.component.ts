import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface KeyValueItem {
  key: string;
  value: any;
  label: string;
  group?: string;
  type?: 'text' | 'badge' | 'code';
  badgeVariant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  copyable?: boolean;
}

@Component({
  selector: 'ngx-key-value-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-key-value-list"
      [class.dark]="theme() === 'dark'"
      [class.striped]="striped()"
      [class.layout-vertical]="layout() === 'vertical'"
    >
      <!-- Search Input Header -->
      @if (searchable()) {
        <div class="ngx-key-value-list__search-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            class="ngx-key-value-list__search-input"
            placeholder="Search properties..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
          />
          @if (searchTerm()) {
            <button class="clear-search" (click)="searchTerm.set('')" aria-label="Clear search">✕</button>
          }
        </div>
      }

      <!-- Groups List -->
      @if (groupKeys().length === 0) {
        <div class="ngx-key-value-list__empty">No properties match search filter</div>
      } @else {
        <div class="ngx-key-value-list__groups">
          @for (group of groupKeys(); track group) {
            <div class="ngx-key-value-list__group-card" [class.collapsed]="!isGroupExpanded(group)">
              <!-- Group Header (Only show if group is not empty string) -->
              @if (group) {
                <div
                  class="ngx-key-value-list__group-header"
                  (click)="toggleGroup(group)"
                  role="button"
                  tabindex="0"
                  (keydown.enter)="toggleGroup(group)"
                >
                  <span class="group-title">{{ group }}</span>
                  <span class="group-count">({{ groupedFilteredItems()[group].length }})</span>
                  <svg class="chevron-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              }

              <!-- Group Rows -->
              @if (isGroupExpanded(group)) {
                <div class="ngx-key-value-list__rows">
                  @for (item of groupedFilteredItems()[group]; track item.key) {
                    <div
                      class="ngx-key-value-list__row"
                      (click)="onRowClick(item)"
                    >
                      <!-- Key Label -->
                      <div class="ngx-key-value-list__label">{{ item.label }}</div>

                      <!-- Value Renderer -->
                      <div class="ngx-key-value-list__value-container">
                        <div class="ngx-key-value-list__value-wrapper">
                          @switch (item.type) {
                            @case ('badge') {
                              <span
                                class="ngx-key-value-list__badge"
                                [class]="item.badgeVariant || 'default'"
                              >
                                {{ item.value }}
                              </span>
                            }
                            @case ('code') {
                              <code class="ngx-key-value-list__code">{{ item.value }}</code>
                            }
                            @default {
                              <span class="ngx-key-value-list__text">{{ item.value }}</span>
                            }
                          }

                          <!-- Copy Action Button -->
                          @if (item.copyable) {
                            <button
                              class="ngx-key-value-list__copy-btn"
                              (click)="copyValue(item.value, item.key, $event)"
                              [class.copied]="copiedKey() === item.key"
                              [attr.aria-label]="'Copy ' + item.label"
                            >
                              @if (copiedKey() === item.key) {
                                <span class="copied-tooltip">Copied!</span>
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              } @else {
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                              }
                            </button>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .ngx-key-value-list {
      width: 100%;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      color: #334155;
    }

    .ngx-key-value-list.dark {
      color: #cbd5e1;
    }

    /* ── Search Bar ── */
    .ngx-key-value-list__search-wrap {
      position: relative;
      width: 100%;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: #94a3b8;
    }

    .ngx-key-value-list__search-input {
      width: 100%;
      padding: 8px 36px 8px 36px;
      font-size: 13px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: rgba(255, 255, 255, 0.7);
      outline: none;
      transition: all 0.2s ease;
    }

    .ngx-key-value-list__search-input:focus {
      border-color: var(--primary-color, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .dark .ngx-key-value-list__search-input {
      border-color: rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.4);
      color: #f1f5f9;
    }

    .clear-search {
      position: absolute;
      right: 12px;
      border: none;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      font-size: 11px;
      padding: 4px;
    }

    /* ── Empty results ── */
    .ngx-key-value-list__empty {
      padding: 24px;
      text-align: center;
      font-size: 13px;
      color: #64748b;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
    }

    .dark .ngx-key-value-list__empty {
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.02);
    }

    /* ── Collapsible Groups ── */
    .ngx-key-value-list__groups {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ngx-key-value-list__group-card {
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(0, 0, 0, 0.04);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .dark .ngx-key-value-list__group-card {
      background: rgba(30, 32, 48, 0.35);
      border-color: rgba(255, 255, 255, 0.05);
    }

    .ngx-key-value-list__group-header {
      padding: 12px 18px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.02);
      border-bottom: 1px solid rgba(0, 0, 0, 0.03);
      user-select: none;
      outline: none;
    }

    .dark .ngx-key-value-list__group-header {
      background: rgba(255, 255, 255, 0.02);
      border-bottom-color: rgba(255, 255, 255, 0.03);
    }

    .group-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
    }

    .dark .group-title {
      color: #94a3b8;
    }

    .group-count {
      font-size: 11px;
      color: #94a3b8;
    }

    .chevron-icon {
      margin-left: auto;
      color: #94a3b8;
      transition: transform 0.2s ease;
    }

    .collapsed .chevron-icon {
      transform: rotate(-90deg);
    }

    .collapsed .ngx-key-value-list__group-header {
      border-bottom-color: transparent;
    }

    /* ── Rows layout ── */
    .ngx-key-value-list__rows {
      display: flex;
      flex-direction: column;
    }

    .ngx-key-value-list__row {
      display: flex;
      align-items: center;
      padding: 10px 18px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.03);
      font-size: 13px;
      min-height: 42px;
      box-sizing: border-box;
    }

    .ngx-key-value-list__row:last-child {
      border-bottom: none;
    }

    .dark .ngx-key-value-list__row {
      border-bottom-color: rgba(255, 255, 255, 0.03);
    }

    /* Column labels */
    .ngx-key-value-list__label {
      width: 35%;
      font-weight: 600;
      color: #64748b;
      padding-right: 16px;
      box-sizing: border-box;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dark .ngx-key-value-list__label {
      color: #94a3b8;
    }

    /* Column values */
    .ngx-key-value-list__value-container {
      width: 65%;
      display: flex;
      align-items: center;
    }

    .ngx-key-value-list__value-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 100%;
    }

    .ngx-key-value-list__text {
      color: #0f172a;
      font-weight: 500;
    }

    .dark .ngx-key-value-list__text {
      color: #f1f5f9;
    }

    /* striped row shading */
    .striped .ngx-key-value-list__row:nth-child(even) {
      background: rgba(0, 0, 0, 0.015);
    }

    .dark.striped .ngx-key-value-list__row:nth-child(even) {
      background: rgba(255, 255, 255, 0.01);
    }

    /* ── Render types ── */

    /* Badges */
    .ngx-key-value-list__badge {
      display: inline-flex;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: capitalize;
    }

    .ngx-key-value-list__badge.default {
      background: #f1f5f9;
      color: #475569;
    }
    .ngx-key-value-list__badge.success {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .ngx-key-value-list__badge.danger {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    .ngx-key-value-list__badge.warning {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    .ngx-key-value-list__badge.info {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .dark .ngx-key-value-list__badge.default {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }

    /* Code blocks */
    .ngx-key-value-list__code {
      font-family: monospace;
      font-size: 12px;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      color: #e11d48;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .dark .ngx-key-value-list__code {
      background: rgba(15, 23, 42, 0.5);
      border-color: rgba(255, 255, 255, 0.04);
      color: #f43f5e;
    }

    /* Copy Button */
    .ngx-key-value-list__copy-btn {
      position: relative;
      border: none;
      background: transparent;
      color: #94a3b8;
      padding: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .ngx-key-value-list__copy-btn:hover {
      background: rgba(0, 0, 0, 0.04);
      color: #475569;
    }

    .ngx-key-value-list__copy-btn.copied {
      color: #10b981 !important;
    }

    .dark .ngx-key-value-list__copy-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #e2e8f0;
    }

    /* Tooltip */
    .copied-tooltip {
      position: absolute;
      bottom: 22px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      background: #0f172a;
      color: #ffffff;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      white-space: nowrap;
      pointer-events: none;
      animation: tooltipPop 0.15s ease-out forwards;
    }

    @keyframes tooltipPop {
      from { opacity: 0; transform: translateX(-50%) translateY(4px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    /* ── Vertical Layout ── */
    .layout-vertical .ngx-key-value-list__row {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      padding: 12px 18px;
    }

    .layout-vertical .ngx-key-value-list__label {
      width: 100%;
      padding-right: 0;
    }

    .layout-vertical .ngx-key-value-list__value-container {
      width: 100%;
    }
  `]
})
export class KeyValueListComponent {
  // Inputs
  items = input<KeyValueItem[]>([]);
  layout = input<'horizontal' | 'vertical'>('horizontal');
  striped = input<boolean>(false);
  searchable = input<boolean>(false);
  theme = input<'light' | 'dark'>('light');
  id = input<string>('ngx-kv-list-' + Math.random().toString(36).substring(2, 9));

  // Outputs
  valueClick = output<{ key: string; value: any }>();

  // Internal signals
  searchTerm = signal<string>('');
  copiedKey = signal<string | null>(null);
  collapsedGroups = signal<Set<string>>(new Set());

  // Search filtering
  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const rawItems = this.items() || [];
    if (!term) return rawItems;
    return rawItems.filter(
      item =>
        item.label.toLowerCase().includes(term) ||
        String(item.value).toLowerCase().includes(term)
    );
  });

  // Group calculations
  groupedFilteredItems = computed(() => {
    const list = this.filteredItems();
    const groups: { [key: string]: KeyValueItem[] } = {};

    list.forEach(item => {
      const gName = item.group || '';
      if (!groups[gName]) {
        groups[gName] = [];
      }
      groups[gName].push(item);
    });

    return groups;
  });

  groupKeys = computed(() => {
    return Object.keys(this.groupedFilteredItems());
  });

  toggleGroup(group: string) {
    this.collapsedGroups.update(set => {
      const next = new Set(set);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }

  isGroupExpanded(group: string) {
    return !this.collapsedGroups().has(group);
  }

  copyValue(val: any, key: string, event: MouseEvent) {
    event.stopPropagation(); // Avoid triggering row clicks
    const textStr = String(val);

    navigator.clipboard.writeText(textStr).then(() => {
      this.copiedKey.set(key);
      setTimeout(() => {
        if (this.copiedKey() === key) {
          this.copiedKey.set(null);
        }
      }, 2000);
    });
  }

  onRowClick(item: KeyValueItem) {
    this.valueClick.emit({ key: item.key, value: item.value });
  }
}
