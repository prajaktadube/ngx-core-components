import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface GridColumnDef<T = Record<string, unknown>> {
  field: string;
  title: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  editable?: boolean;
  align?: 'left' | 'center' | 'right';
  headerTemplate?: TemplateRef<GridHeaderTemplateContext<T>>;
  cellTemplate?: TemplateRef<GridCellTemplateContext<T>>;
}

export interface GridSortState {
  field: string;
  dir: 'asc' | 'desc';
}

export interface GridFilterState {
  field: string;
  value: string;
  operator?: 'contains' | 'startsWith' | 'endsWith' | 'eq';
}

export interface GridGroupState {
  field: string;
  dir?: 'asc' | 'desc';
}

export interface GridPageChangeEvent {
  page: number;
  pageSize: number;
}

export interface GridSortChangeEvent {
  sort: GridSortState | null;
}

export interface GridFilterChangeEvent {
  filters: GridFilterState[];
}

export interface GridGroupChangeEvent {
  group: GridGroupState | null;
}

export interface GridDataStateChangeEvent {
  page: number;
  pageSize: number;
  sort: GridSortState | null;
  filters: GridFilterState[];
  group: GridGroupState | null;
}

export interface GridRowClickEvent<T = Record<string, unknown>> {
  row: T;
  index: number;
}

export interface GridRowUpdateEvent<T = Record<string, unknown>> {
  previous: T;
  updated: T;
  index: number;
}

export interface GridGroupResult<T = Record<string, unknown>> {
  key: string;
  value: unknown;
  field: string;
  count: number;
  items: T[];
}

export interface GridHeaderTemplateContext<T = Record<string, unknown>> {
  $implicit: GridColumnDef<T>;
  column: GridColumnDef<T>;
  sort: GridSortState | null;
  filters: GridFilterState[];
  isServerMode: boolean;
}

export interface GridCellTemplateContext<T = Record<string, unknown>> {
  $implicit: unknown;
  value: unknown;
  row: T;
  column: GridColumnDef<T>;
  index: number;
  editing: boolean;
}

export interface GridRowTemplateContext<T = Record<string, unknown>> {
  $implicit: T;
  row: T;
  index: number;
  editing: boolean;
  expanded: boolean;
}

export interface GridDetailTemplateContext<T = Record<string, unknown>> {
  $implicit: T;
  row: T;
  index: number;
}

@Component({
  selector: 'ngx-data-grid',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-data-grid" [class.loading]="loading()">

      <div class="grid-toolbar">
        <span class="grid-toolbar-title">Data Grid</span>
        <div class="grid-toolbar-actions">
          <button class="grid-action-btn" (click)="exportToJson()" title="Export JSON">JSON</button>
          <button class="grid-action-btn" (click)="exportToCsv()" title="Export CSV">CSV</button>
        </div>
      </div>

      @if (hasFilterableColumns()) {
        <div class="grid-filter-bar">
          @for (col of columns(); track col.field) {
            @if (col.filterable) {
              <input
                class="grid-filter-input"
                [placeholder]="'Filter ' + col.title"
                [value]="getFilter(col.field)"
                (input)="setFilter(col.field, $any($event.target).value)"
                [style.width.px]="col.width ?? 120"
              />
            } @else {
              <div [style.width.px]="col.width ?? 120" class="grid-filter-spacer"></div>
            }
          }
        </div>
      }

      <div class="grid-table-wrap">
        <table class="grid-table" [class.striped]="striped()">
          <thead>
            <tr>
              @if (showDetailToggle()) {
                <th class="grid-th grid-th-toggle" style="width:36px"></th>
              }
              @if (selectable()) {
                <th class="grid-th grid-th-check" style="width:40px">
                  <input type="checkbox" [checked]="allSelected()" [indeterminate]="someSelected() && !allSelected()" (change)="toggleAll()" />
                </th>
              }
              @for (col of columns(); track col.field) {
                <th
                  class="grid-th"
                  [style.width.px]="col.width"
                  [class.sortable]="col.sortable"
                  [class.sort-asc]="sortState()?.field === col.field && sortState()?.dir === 'asc'"
                  [class.sort-desc]="sortState()?.field === col.field && sortState()?.dir === 'desc'"
                  (click)="col.sortable ? onSort(col) : null"
                >
                  @if (resolveHeaderTemplate(col); as activeHeaderTemplate) {
                    <ng-container *ngTemplateOutlet="activeHeaderTemplate; context: {
                      $implicit: col,
                      column: col,
                      sort: sortState(),
                      filters: activeFilters(),
                      isServerMode: isAnyServerMode()
                    }" />
                  } @else {
                    <span class="th-text">{{ col.title }}</span>
                    @if (col.sortable) {
                      <span class="sort-icon">
                        @if (sortState()?.field === col.field) {
                          {{ sortState()?.dir === 'asc' ? '↑' : '↓' }}
                        } @else { ↕ }
                      </span>
                    }
                  }
                </th>
              }
              @if (editable()) {
                <th class="grid-th" style="width:120px">Actions</th>
              }
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              <tr>
                <td [attr.colspan]="renderColumnCount()" class="grid-loading-cell">
                  <div class="grid-spinner"></div>
                </td>
              </tr>
            } @else if (flatRenderedRows().length === 0 && groupedRows().length === 0) {
              <tr>
                <td [attr.colspan]="renderColumnCount()" class="grid-empty-cell">No data found.</td>
              </tr>
            } @else if (groupedRows().length > 0) {
              @for (group of groupedRows(); track group.key) {
                <tr class="grid-group-row" (click)="toggleGroup(group.key)">
                  <td [attr.colspan]="renderColumnCount()">
                    <button class="group-toggle" type="button" (click)="toggleGroup(group.key); $event.stopPropagation()">
                      {{ isGroupCollapsed(group.key) ? '▸' : '▾' }}
                    </button>
                    <strong>{{ group.field }}</strong>: {{ group.value }}
                    <span class="group-count">({{ group.count }})</span>
                  </td>
                </tr>

                @if (!isGroupCollapsed(group.key)) {
                  @for (row of group.items; track getKey(row, $index); let i = $index) {
                    <tr
                      class="grid-row"
                      [class.selected]="isRowSelected(row)"
                      (click)="onRowClick(row, i)"
                      (dblclick)="editable() ? beginEdit(row, i) : null"
                    >
                      @if (showDetailToggle()) {
                        <td class="grid-td grid-td-toggle">
                          <button class="toggle-btn" type="button" (click)="toggleDetail(row); $event.stopPropagation()">
                            {{ isExpanded(row) ? '▾' : '▸' }}
                          </button>
                        </td>
                      }

                      @if (selectable()) {
                        <td class="grid-td grid-td-check">
                          <input type="checkbox" [checked]="isRowSelected(row)" (change)="toggleRow(row)" (click)="$event.stopPropagation()" />
                        </td>
                      }

                      @if (rowTemplate()) {
                        <td class="grid-td" [attr.colspan]="columns().length + (editable() ? 1 : 0)">
                          <ng-container *ngTemplateOutlet="rowTemplate(); context: {
                            $implicit: row,
                            row: row,
                            index: i,
                            editing: isEditing(row),
                            expanded: isExpanded(row)
                          }" />
                        </td>
                      } @else {
                        @for (col of columns(); track col.field) {
                          <td class="grid-td" [style.text-align]="col.align ?? 'left'">
                            @if (isEditing(row) && editable() && col.editable) {
                              <input
                                class="grid-edit-input"
                                [value]="toStringSafe(getDraftValue(row, col.field))"
                                (input)="updateDraft(col.field, $any($event.target).value)"
                                (click)="$event.stopPropagation()"
                              />
                            } @else if (resolveCellTemplate(col)) {
                              <ng-container *ngTemplateOutlet="resolveCellTemplate(col)!; context: {
                                $implicit: getCellValue(row, col.field),
                                value: getCellValue(row, col.field),
                                row: row,
                                column: col,
                                index: i,
                                editing: isEditing(row)
                              }" />
                            } @else {
                              {{ getCellValue(row, col.field) }}
                            }
                          </td>
                        }

                        @if (editable()) {
                          <td class="grid-td grid-actions">
                            @if (!isEditing(row)) {
                              <button class="action-btn" type="button" (click)="beginEdit(row, i); $event.stopPropagation()">Edit</button>
                            } @else {
                              <button class="action-btn save" type="button" (click)="saveEdit(row, i); $event.stopPropagation()">Save</button>
                              <button class="action-btn" type="button" (click)="cancelEdit(); $event.stopPropagation()">Cancel</button>
                            }
                          </td>
                        }
                      }
                    </tr>

                    @if (showDetailToggle() && isExpanded(row) && detailRowTemplate()) {
                      <tr class="grid-detail-row">
                        <td [attr.colspan]="renderColumnCount()" class="grid-detail-cell">
                          <ng-container *ngTemplateOutlet="detailRowTemplate(); context: {
                            $implicit: row,
                            row: row,
                            index: i
                          }" />
                        </td>
                      </tr>
                    }
                  }
                }
              }
            } @else {
              @for (row of flatRenderedRows(); track getKey(row, $index); let i = $index) {
                <tr
                  class="grid-row"
                  [class.selected]="isRowSelected(row)"
                  (click)="onRowClick(row, i)"
                  (dblclick)="editable() ? beginEdit(row, i) : null"
                >
                  @if (showDetailToggle()) {
                    <td class="grid-td grid-td-toggle">
                      <button class="toggle-btn" type="button" (click)="toggleDetail(row); $event.stopPropagation()">
                        {{ isExpanded(row) ? '▾' : '▸' }}
                      </button>
                    </td>
                  }

                  @if (selectable()) {
                    <td class="grid-td grid-td-check">
                      <input type="checkbox" [checked]="isRowSelected(row)" (change)="toggleRow(row)" (click)="$event.stopPropagation()" />
                    </td>
                  }

                  @if (rowTemplate()) {
                    <td class="grid-td" [attr.colspan]="columns().length + (editable() ? 1 : 0)">
                      <ng-container *ngTemplateOutlet="rowTemplate(); context: {
                        $implicit: row,
                        row: row,
                        index: i,
                        editing: isEditing(row),
                        expanded: isExpanded(row)
                      }" />
                    </td>
                  } @else {
                    @for (col of columns(); track col.field) {
                      <td class="grid-td" [style.text-align]="col.align ?? 'left'">
                        @if (isEditing(row) && editable() && col.editable) {
                          <input
                            class="grid-edit-input"
                            [value]="toStringSafe(getDraftValue(row, col.field))"
                            (input)="updateDraft(col.field, $any($event.target).value)"
                            (click)="$event.stopPropagation()"
                          />
                        } @else if (resolveCellTemplate(col)) {
                          <ng-container *ngTemplateOutlet="resolveCellTemplate(col)!; context: {
                            $implicit: getCellValue(row, col.field),
                            value: getCellValue(row, col.field),
                            row: row,
                            column: col,
                            index: i,
                            editing: isEditing(row)
                          }" />
                        } @else {
                          {{ getCellValue(row, col.field) }}
                        }
                      </td>
                    }

                    @if (editable()) {
                      <td class="grid-td grid-actions">
                        @if (!isEditing(row)) {
                          <button class="action-btn" type="button" (click)="beginEdit(row, i); $event.stopPropagation()">Edit</button>
                        } @else {
                          <button class="action-btn save" type="button" (click)="saveEdit(row, i); $event.stopPropagation()">Save</button>
                          <button class="action-btn" type="button" (click)="cancelEdit(); $event.stopPropagation()">Cancel</button>
                        }
                      </td>
                    }
                  }
                </tr>

                @if (showDetailToggle() && isExpanded(row) && detailRowTemplate()) {
                  <tr class="grid-detail-row">
                    <td [attr.colspan]="renderColumnCount()" class="grid-detail-cell">
                      <ng-container *ngTemplateOutlet="detailRowTemplate(); context: {
                        $implicit: row,
                        row: row,
                        index: i
                      }" />
                    </td>
                  </tr>
                }
              }
            }
          </tbody>
        </table>
      </div>

      @if (showPager()) {
        <div class="grid-pagination">
          <span class="page-info">
            {{ pagerRangeStart() }}–{{ pagerRangeEnd() }} of {{ totalItems() }}
          </span>
          <div class="page-btns">
            <button class="page-btn" [disabled]="currentPage() === 1" (click)="goPage(1)">&#171;</button>
            <button class="page-btn" [disabled]="currentPage() === 1" (click)="goPage(currentPage() - 1)">&#8249;</button>
            @for (p of pageNumbers(); track p) {
              <button class="page-btn" [class.active]="p === currentPage()" (click)="goPage(p)">{{ p }}</button>
            }
            <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goPage(currentPage() + 1)">&#8250;</button>
            <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goPage(totalPages())">&#187;</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-data-grid {
      font-family: inherit;
      border: 1px solid var(--ngx-grid-border, #e2e8f0);
      border-radius: var(--ngx-grid-radius, 12px);
      overflow: hidden;
      background: var(--ngx-grid-bg, #ffffff);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s;
    }
    .grid-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--ngx-grid-header-bg, #f8fafc);
      border-bottom: 1px solid var(--ngx-grid-border, #e2e8f0);
      flex-wrap: wrap;
      gap: 12px;
    }
    .grid-toolbar-title {
      font-family: var(--ngx-heading-font-family, 'Outfit', sans-serif);
      font-weight: 700;
      font-size: 14px;
      color: var(--ngx-grid-text, #0f172a);
    }
    .grid-toolbar-actions {
      display: flex;
      gap: 6px;
    }
    .grid-action-btn {
      padding: 6px 14px;
      border: 1px solid var(--ngx-grid-border, #e2e8f0);
      border-radius: 8px;
      background: var(--ngx-grid-bg, #ffffff);
      color: var(--ngx-grid-text, #0f172a);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }
    .grid-action-btn:hover {
      background: var(--ngx-grid-hover-bg, #f1f5f9);
      border-color: var(--ngx-input-border, #cbd5e1);
      transform: translateY(-0.5px);
    }
    .grid-action-btn:active {
      transform: scale(0.97);
    }
    .grid-filter-bar {
      display: flex;
      gap: 8px;
      padding: 10px 16px;
      background: var(--ngx-grid-header-bg, #f8fafc);
      border-bottom: 1px solid var(--ngx-grid-border, #e2e8f0);
    }
    .grid-filter-input {
      padding: 6px 12px;
      border: 1px solid var(--ngx-grid-border, #cbd5e1);
      border-radius: 8px;
      font-size: 12px;
      outline: none;
      font-family: inherit;
      background: var(--ngx-input-bg, #ffffff);
      color: var(--ngx-grid-text, #0f172a);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .grid-filter-input:focus {
      border-color: var(--ngx-input-focus, #4f46e5);
      box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.15));
    }
    .grid-filter-spacer { flex-shrink: 0; }
    .grid-table-wrap { overflow-x: auto; }
    .grid-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .grid-th {
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      color: var(--ngx-grid-text-secondary, #64748b);
      background: var(--ngx-grid-header-bg, #f8fafc);
      border-bottom: 2px solid var(--ngx-grid-border, #e2e8f0);
      white-space: nowrap;
      user-select: none;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-family: var(--ngx-heading-font-family, 'Outfit', sans-serif);
    }
    .grid-th.sortable { cursor: pointer; transition: background-color 0.2s; }
    .grid-th.sortable:hover { background: var(--ngx-grid-hover-bg, #f1f5f9); }
    .grid-th.sort-asc, .grid-th.sort-desc { color: var(--ngx-input-focus, #4f46e5); }
    .th-text { margin-right: 4px; }
    .sort-icon { font-size: 10px; color: #cbd5e1; }
    .sort-asc .sort-icon, .sort-desc .sort-icon { color: var(--ngx-input-focus, #4f46e5); }
    .grid-group-row td {
      background: var(--ngx-grid-header-bg, #f8fafc);
      border-bottom: 1.5px solid var(--ngx-grid-border, #e2e8f0);
      color: var(--ngx-grid-text, #0f172a);
      font-size: 12px;
      font-weight: 600;
      padding: 11px 16px;
      cursor: pointer;
    }
    .group-toggle {
      border: none;
      background: transparent;
      margin-right: 6px;
      cursor: pointer;
      color: var(--ngx-grid-text-secondary, #64748b);
      font-size: 12px;
    }
    .group-count { color: var(--ngx-grid-text-secondary, #64748b); margin-left: 6px; font-weight: 500; }
    .grid-row {
      border-bottom: 1px solid var(--ngx-grid-border, #e2e8f0);
      transition: background-color 0.15s;
    }
    .grid-row:hover { background: var(--ngx-grid-hover-bg, #f1f5f9); }
    .grid-row.selected { background: var(--ngx-grid-selected-bg, #e0e7ff) !important; }
    .grid-table.striped .grid-row:nth-child(even) { background: var(--ngx-grid-stripe-bg, #f8fafc); }
    .grid-table.striped .grid-row:nth-child(even):hover { background: var(--ngx-grid-hover-bg, #f1f5f9); }
    .grid-table.striped .grid-row.selected { background: var(--ngx-grid-selected-bg, #e0e7ff) !important; }
    .grid-td {
      padding: 11px 16px;
      color: var(--ngx-grid-text, #0f172a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
    }
    .grid-th-check, .grid-td-check,
    .grid-th-toggle, .grid-td-toggle {
      width: 44px !important;
      text-align: center;
    }
    .toggle-btn {
      border: none;
      background: transparent;
      color: var(--ngx-grid-text-secondary, #64748b);
      cursor: pointer;
      font-size: 13px;
      transition: color 0.15s;
    }
    .toggle-btn:hover { color: var(--ngx-grid-text, #0f172a); }
    .grid-detail-row td {
      background: var(--ngx-grid-stripe-bg, #f8fafc);
      border-bottom: 1px solid var(--ngx-grid-border, #e2e8f0);
    }
    .grid-detail-cell {
      padding: 16px 24px;
      white-space: normal;
    }
    .grid-edit-input {
      width: 100%;
      min-width: 80px;
      padding: 6px 10px;
      border: 1px solid var(--ngx-grid-border, #cbd5e1);
      border-radius: 6px;
      font-size: 12px;
      font-family: inherit;
      background: var(--ngx-input-bg, #ffffff);
      color: var(--ngx-grid-text, #0f172a);
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .grid-edit-input:focus {
      border-color: var(--ngx-input-focus, #4f46e5);
      box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.15));
    }
    .grid-actions { white-space: nowrap; }
    .action-btn {
      border: 1px solid var(--ngx-grid-border, #cbd5e1);
      background: var(--ngx-grid-bg, #ffffff);
      color: var(--ngx-grid-text, #0f172a);
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 12px;
      font-weight: 500;
      margin-right: 6px;
      cursor: pointer;
      transition: all 0.2s;
      outline: none;
    }
    .action-btn:hover {
      background: var(--ngx-grid-hover-bg, #f1f5f9);
      border-color: var(--ngx-input-border, #cbd5e1);
    }
    .action-btn.save {
      border-color: var(--ngx-btn-primary-bg, #4f46e5);
      background: var(--ngx-btn-primary-bg, #4f46e5);
      color: #ffffff;
    }
    .action-btn.save:hover {
      background: var(--ngx-btn-primary-hover, #4338ca);
      border-color: var(--ngx-btn-primary-hover, #4338ca);
    }
    .action-btn:last-child { margin-right: 0; }
    .grid-loading-cell, .grid-empty-cell {
      padding: 48px;
      text-align: center;
      color: var(--ngx-grid-text-secondary, #64748b);
      font-weight: 500;
    }
    .grid-spinner {
      width: 28px;
      height: 28px;
      border: 3.5px solid var(--ngx-grid-border, #e2e8f0);
      border-top-color: var(--ngx-btn-primary-bg, #4f46e5);
      border-radius: 50%;
      animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .grid-pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      border-top: 1px solid var(--ngx-grid-border, #e2e8f0);
      background: var(--ngx-grid-bg, #ffffff);
      flex-wrap: wrap;
      gap: 8px;
    }
    .page-info { font-size: 12px; color: var(--ngx-grid-text-secondary, #64748b); font-weight: 500; }
    .page-btns { display: flex; gap: 4px; }
    .page-btn {
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid var(--ngx-grid-border, #e2e8f0);
      background: var(--ngx-grid-bg, #ffffff);
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      color: var(--ngx-grid-text, #0f172a);
      transition: all 0.2s;
      outline: none;
    }
    .page-btn:hover:not(:disabled) {
      background: var(--ngx-grid-hover-bg, #f1f5f9);
      border-color: var(--ngx-input-border, #cbd5e1);
    }
    .page-btn.active {
      background: var(--ngx-btn-primary-bg, #4f46e5);
      color: #ffffff;
      border-color: var(--ngx-btn-primary-bg, #4f46e5);
      box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
    }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class DataGridComponent<T extends object = Record<string, unknown>> {
  data = input<T[]>([]);
  columns = input<GridColumnDef<T>[]>([]);

  pageSize = input<number>(10);
  page = input<number>(1);
  total = input<number>(0);

  selectable = input<boolean>(false);
  striped = input<boolean>(true);
  loading = input<boolean>(false);
  editable = input<boolean>(false);

  sortMode = input<'client' | 'server'>('client');
  filterMode = input<'client' | 'server'>('client');
  groupMode = input<'client' | 'server'>('client');
  pagingMode = input<'client' | 'server'>('client');

  groupBy = input<GridGroupState | null>(null);
  groupedData = input<GridGroupResult<T>[]>([]);

  headerTemplate = input<TemplateRef<GridHeaderTemplateContext<T>> | null>(null);
  cellTemplate = input<TemplateRef<GridCellTemplateContext<T>> | null>(null);
  rowTemplate = input<TemplateRef<GridRowTemplateContext<T>> | null>(null);
  detailRowTemplate = input<TemplateRef<GridDetailTemplateContext<T>> | null>(null);

  rowClick = output<GridRowClickEvent<T>>();
  selectionChange = output<T[]>();
  sortChange = output<GridSortChangeEvent>();
  filterChange = output<GridFilterChangeEvent>();
  groupChange = output<GridGroupChangeEvent>();
  pageChange = output<GridPageChangeEvent>();
  dataStateChange = output<GridDataStateChangeEvent>();
  rowUpdate = output<GridRowUpdateEvent<T>>();

  sortState = signal<GridSortState | null>(null);
  currentPage = signal(1);
  selectedRows = signal<Set<string>>(new Set());
  expandedRows = signal<Set<string>>(new Set());
  collapsedGroups = signal<Set<string>>(new Set());
  editingRowKey = signal<string | null>(null);
  editingDraft = signal<Record<string, unknown>>({});
  private filters = signal<Map<string, string>>(new Map());

  constructor() {
    effect(() => {
      const externalPage = this.page();
      if (externalPage > 0 && externalPage !== this.currentPage()) {
        this.currentPage.set(externalPage);
      }
    });

    effect(() => {
      const max = this.totalPages();
      if (this.currentPage() > max) {
        this.currentPage.set(max);
      }
    });
  }

  hasFilterableColumns = computed(() => this.columns().some(column => column.filterable));
  isAnyServerMode = computed(() =>
    this.sortMode() === 'server' ||
    this.filterMode() === 'server' ||
    this.groupMode() === 'server' ||
    this.pagingMode() === 'server'
  );
  showDetailToggle = computed(() => this.detailRowTemplate() !== null);

  activeFilters = computed<GridFilterState[]>(() =>
    Array.from(this.filters().entries()).map(([field, value]) => ({ field, value, operator: 'contains' }))
  );

  private clientFilteredData = computed(() => {
    if (this.filterMode() !== 'client') {
      return this.data();
    }

    let rows = this.data() as T[];
    for (const filter of this.activeFilters()) {
      if (!filter.value) {
        continue;
      }
      const query = filter.value.toLowerCase();
      rows = rows.filter(row => String((row as Record<string, unknown>)[filter.field] ?? '').toLowerCase().includes(query));
    }
    return rows;
  });

  private clientSortedData = computed(() => {
    const rows = this.clientFilteredData();
    if (this.sortMode() !== 'client' || !this.sortState()) {
      return rows;
    }

    const state = this.sortState()!;
    return [...rows].sort((left, right) => {
      const leftValue = (left as Record<string, unknown>)[state.field];
      const rightValue = (right as Record<string, unknown>)[state.field];
      const compared = this.compareValues(leftValue, rightValue);
      return state.dir === 'asc' ? compared : -compared;
    });
  });

  private baseFlatData = computed(() => {
    if (this.sortMode() === 'server' || this.filterMode() === 'server') {
      return this.data();
    }
    return this.clientSortedData();
  });

  totalItems = computed(() => {
    if (this.pagingMode() === 'server') {
      return this.total() > 0 ? this.total() : this.data().length;
    }
    return this.baseFlatData().length;
  });

  totalPages = computed(() => {
    const pageSize = Math.max(1, this.pageSize());
    return Math.max(1, Math.ceil(this.totalItems() / pageSize));
  });

  flatRenderedRows = computed(() => {
    if (this.hasGrouping()) {
      return [] as T[];
    }

    if (this.pagingMode() === 'server') {
      return this.data();
    }

    const pageSize = Math.max(1, this.pageSize());
    const start = (this.currentPage() - 1) * pageSize;
    return this.baseFlatData().slice(start, start + pageSize);
  });

  groupedRows = computed(() => {
    if (!this.hasGrouping()) {
      return [] as GridGroupResult<T>[];
    }

    if (this.groupMode() === 'server') {
      return this.groupedData();
    }

    const group = this.groupBy();
    if (!group) {
      return [];
    }

    const source = this.pagingMode() === 'server'
      ? this.data()
      : this.paginateRows(this.baseFlatData());

    const map = new Map<string, GridGroupResult<T>>();
    for (const row of source) {
      const value = (row as Record<string, unknown>)[group.field];
      const key = String(value ?? '(empty)');
      const existing = map.get(key);
      if (existing) {
        existing.items.push(row);
        existing.count += 1;
      } else {
        map.set(key, { key, value, field: group.field, count: 1, items: [row] });
      }
    }

    const groups = Array.from(map.values());
    groups.sort((a, b) => {
      const compared = this.compareValues(a.value, b.value);
      return (group.dir ?? 'asc') === 'asc' ? compared : -compared;
    });

    return groups;
  });

  allSelected = computed(() => {
    const rows = this.visibleSelectionRows();
    if (rows.length === 0) {
      return false;
    }
    const selected = this.selectedRows();
    return rows.every(row => selected.has(this.keyOf(row)));
  });

  someSelected = computed(() => {
    const rows = this.visibleSelectionRows();
    const selected = this.selectedRows();
    return rows.some(row => selected.has(this.keyOf(row)));
  });

  pagerRangeStart = computed(() => {
    if (this.totalItems() === 0) {
      return 0;
    }
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  pagerRangeEnd = computed(() => {
    if (this.totalItems() === 0) {
      return 0;
    }
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const from = Math.max(1, current - 2);
    const to = Math.min(total, current + 2);
    for (let page = from; page <= to; page += 1) {
      pages.push(page);
    }
    return pages;
  });

  renderColumnCount = computed(() =>
    this.columns().length +
    (this.selectable() ? 1 : 0) +
    (this.showDetailToggle() ? 1 : 0) +
    (this.editable() ? 1 : 0)
  );

  showPager = computed(() => this.totalItems() > 0);

  getFilter(field: string): string {
    return this.filters().get(field) ?? '';
  }

  exportToJson(): void {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "grid-data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  exportToCsv(): void {
    if (this.data().length === 0) return;
    const cols = this.columns();
    const headers = cols.map(c => c.title);
    const fields = cols.map(c => c.field);
    const rows = this.data().map(row => {
      const r = row as Record<string, unknown>;
      return fields.map(field => {
        const val = r[field] ?? '';
        const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${valStr.replace(/"/g, '""')}"`;
      });
    });
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", "grid-data.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  setFilter(field: string, value: string): void {
    const nextFilters = new Map(this.filters());
    if (value) {
      nextFilters.set(field, value);
    } else {
      nextFilters.delete(field);
    }

    this.filters.set(nextFilters);
    this.currentPage.set(1);

    const filters = this.activeFilters();
    this.filterChange.emit({ filters });
    this.emitDataState();
  }

  onSort(column: GridColumnDef<T>): void {
    const current = this.sortState();
    if (current?.field === column.field) {
      this.sortState.set(current.dir === 'asc' ? { field: column.field, dir: 'desc' } : null);
    } else {
      this.sortState.set({ field: column.field, dir: 'asc' });
    }

    this.currentPage.set(1);
    this.sortChange.emit({ sort: this.sortState() });
    this.emitDataState();
  }

  setGroup(state: GridGroupState | null): void {
    this.groupChange.emit({ group: state });
    this.currentPage.set(1);
    this.emitDataState(state);
  }

  toggleGroup(key: string): void {
    const next = new Set(this.collapsedGroups());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.collapsedGroups.set(next);
  }

  isGroupCollapsed(key: string): boolean {
    return this.collapsedGroups().has(key);
  }

  goPage(page: number): void {
    const safePage = Math.max(1, Math.min(this.totalPages(), page));
    this.currentPage.set(safePage);
    this.pageChange.emit({ page: safePage, pageSize: this.pageSize() });
    this.emitDataState();
  }

  onRowClick(row: T, index: number): void {
    this.rowClick.emit({ row, index });
  }

  isRowSelected(row: T): boolean {
    return this.selectedRows().has(this.keyOf(row));
  }

  toggleRow(row: T): void {
    const key = this.keyOf(row);
    const next = new Set(this.selectedRows());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.selectedRows.set(next);
    this.selectionChange.emit(this.resolveSelectedRows(next));
  }

  toggleAll(): void {
    const next = new Set(this.selectedRows());
    const rows = this.visibleSelectionRows();
    if (this.allSelected()) {
      for (const row of rows) {
        next.delete(this.keyOf(row));
      }
    } else {
      for (const row of rows) {
        next.add(this.keyOf(row));
      }
    }
    this.selectedRows.set(next);
    this.selectionChange.emit(this.resolveSelectedRows(next));
  }

  toggleDetail(row: T): void {
    const key = this.keyOf(row);
    const next = new Set(this.expandedRows());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.expandedRows.set(next);
  }

  isExpanded(row: T): boolean {
    return this.expandedRows().has(this.keyOf(row));
  }

  beginEdit(row: T, _index: number): void {
    if (!this.editable()) {
      return;
    }

    const key = this.keyOf(row);
    this.editingRowKey.set(key);
    this.editingDraft.set({ ...(row as Record<string, unknown>) });
  }

  isEditing(row: T): boolean {
    return this.editingRowKey() === this.keyOf(row);
  }

  updateDraft(field: string, value: unknown): void {
    this.editingDraft.set({ ...this.editingDraft(), [field]: value });
  }

  getDraftValue(row: T, field: string): unknown {
    if (!this.isEditing(row)) {
      return (row as Record<string, unknown>)[field];
    }

    const draft = this.editingDraft();
    return Object.prototype.hasOwnProperty.call(draft, field)
      ? draft[field]
      : (row as Record<string, unknown>)[field];
  }

  saveEdit(row: T, index: number): void {
    const updated = { ...(row as Record<string, unknown>), ...this.editingDraft() } as T;
    this.rowUpdate.emit({ previous: row, updated, index });
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingRowKey.set(null);
    this.editingDraft.set({});
  }

  getCellValue(row: T, field: string): unknown {
    return (row as Record<string, unknown>)[field] ?? '';
  }

  resolveHeaderTemplate(column: GridColumnDef<T>): TemplateRef<GridHeaderTemplateContext<T>> | null {
    return column.headerTemplate ?? this.headerTemplate();
  }

  resolveCellTemplate(column: GridColumnDef<T>): TemplateRef<GridCellTemplateContext<T>> | null {
    return column.cellTemplate ?? this.cellTemplate();
  }

  toStringSafe(value: unknown): string {
    return value == null ? '' : String(value);
  }

  getKey(row: T, index: number): string {
    const source = row as Record<string, unknown>;
    return String(source['id'] ?? source['key'] ?? index);
  }

  private hasGrouping(): boolean {
    return this.groupBy() !== null;
  }

  private paginateRows(rows: T[]): T[] {
    if (this.pagingMode() === 'server') {
      return rows;
    }

    const pageSize = Math.max(1, this.pageSize());
    const start = (this.currentPage() - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }

  private compareValues(left: unknown, right: unknown): number {
    if (left == null && right == null) {
      return 0;
    }
    if (left == null) {
      return -1;
    }
    if (right == null) {
      return 1;
    }

    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }

    return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
  }

  private visibleSelectionRows(): T[] {
    if (this.groupedRows().length > 0) {
      const rows: T[] = [];
      for (const group of this.groupedRows()) {
        if (!this.isGroupCollapsed(group.key)) {
          rows.push(...group.items);
        }
      }
      return rows;
    }

    return this.flatRenderedRows();
  }

  private resolveSelectedRows(selection: Set<string>): T[] {
    const source = this.data();
    return source.filter(row => selection.has(this.keyOf(row)));
  }

  private keyOf(row: T): string {
    const source = row as Record<string, unknown>;
    return String(source['id'] ?? source['key'] ?? JSON.stringify(row));
  }

  private emitDataState(overrideGroup?: GridGroupState | null): void {
    this.dataStateChange.emit({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sort: this.sortState(),
      filters: this.activeFilters(),
      group: overrideGroup === undefined ? this.groupBy() : overrideGroup,
    });
  }
}
