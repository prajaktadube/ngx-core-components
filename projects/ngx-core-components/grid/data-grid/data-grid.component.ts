import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  effect,
  input,
  output,
  signal,
  inject,
  ElementRef,
  OnInit,
  untracked,
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
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  pinned?: 'left';
}

export interface GridSortState {
  field: string;
  dir: 'asc' | 'desc';
}

export interface GridFilterState {
  field: string;
  value: string;
  operator?: 'contains' | 'startsWith' | 'endsWith' | 'eq' | 'in';
  selectedValues?: string[];
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
          @if (showGlobalSearch()) {
            <div class="grid-search-wrap">
              <input
                class="grid-search-input"
                type="text"
                [placeholder]="globalSearchPlaceholder()"
                [value]="searchText()"
                (input)="searchText.set($any($event.target).value)"
              />
              @if (searchText()) {
                <button class="grid-search-clear" (click)="searchText.set('')" title="Clear search">×</button>
              }
            </div>
          }
          <button class="grid-action-btn" (click)="exportToJson()" title="Export JSON">JSON</button>
          <button class="grid-action-btn" (click)="exportToCsv()" title="Export CSV">CSV</button>
        </div>
      </div>

      <div class="grid-table-wrap">
        <table class="grid-table" [class.striped]="striped()">
          <thead>
            <tr>
              @if (rowReorderable()) {
                <th class="grid-th grid-th-reorder pinned-left" style="width:44px; left:0px"></th>
              }
              @if (showDetailToggle()) {
                <th class="grid-th grid-th-toggle pinned-left" [style.left.px]="rowReorderable() ? 44 : 0" style="width:44px"></th>
              }
              @if (selectable()) {
                <th class="grid-th grid-th-check pinned-left" [style.left.px]="(rowReorderable() ? 44 : 0) + (showDetailToggle() ? 44 : 0)" style="width:44px">
                  <input type="checkbox" [checked]="allSelected()" [indeterminate]="someSelected() && !allSelected()" (change)="toggleAll()" />
                </th>
              }
              @for (col of orderedColumns(); track col.field) {
                <th
                  class="grid-th"
                  [class.pinned-left]="col.pinned === 'left'"
                  [class.pinned-left-last]="col.pinned === 'left' && lastPinnedColumnField() === col.field"
                  [style.left.px]="col.pinned === 'left' ? columnOffsets()[col.field] : null"
                  [style.width.px]="getColumnWidth(col)"
                  [class.sortable]="col.sortable"
                  [class.sort-asc]="getSortDirection(col) === 'asc'"
                  [class.sort-desc]="getSortDirection(col) === 'desc'"
                  [class.dragging]="draggingField() === col.field"
                  [class.drag-over]="dragOverField() === col.field"
                  [attr.draggable]="reorderable() ? true : null"
                  (dragstart)="onDragStart($event, col)"
                  (dragover)="onDragOver($event, col)"
                  (drop)="onDrop($event, col)"
                  (dragend)="onDragEnd()"
                  (click)="col.sortable ? onSort(col, $event) : null"
                >
                  <div class="th-content-wrapper">
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
                        @if (getSortDirection(col); as dir) {
                          <span class="sort-icon active">
                            {{ dir === 'asc' ? '↑' : '↓' }}
                            @if (multiSort() && sortStates().length > 1) {
                              <sub class="sort-order-badge">{{ getSortIndex(col) }}</sub>
                            }
                          </span>
                        } @else {
                          <span class="sort-icon">↕</span>
                        }
                      }
                    }
                    @if (col.filterable) {
                      <button class="grid-filter-btn" [class.active]="filterStates().has(col.field)" (click)="openFilterPopover($event, col.field); $event.stopPropagation()" title="Filter column">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                      </button>
                    }
                  </div>
                  <div class="grid-resize-handle" (mousedown)="onResizeStart($event, col)" (click)="$event.stopPropagation()"></div>
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
                      [class.dragging-row]="draggingRowIndex() === i"
                      [class.drag-over-row]="dragOverRowIndex() === i"
                      (dragover)="onRowDragOver($event, i)"
                      (drop)="onRowDrop($event, i)"
                      (dragend)="onRowDragEnd()"
                      (click)="onRowClick(row, i)"
                      (dblclick)="editable() ? beginEdit(row, i) : null"
                    >
                      @if (rowReorderable()) {
                        <td class="grid-td grid-td-reorder pinned-left" style="left:0px; text-align:center; width:44px">
                          <span
                            class="row-drag-handle"
                            draggable="true"
                            (dragstart)="onRowDragStart($event, i)"
                            (dragend)="onRowDragEnd()"
                          >⋮⋮</span>
                        </td>
                      }

                      @if (showDetailToggle()) {
                        <td class="grid-td grid-td-toggle pinned-left" [style.left.px]="rowReorderable() ? 44 : 0">
                          <button class="toggle-btn" type="button" (click)="toggleDetail(row); $event.stopPropagation()">
                            {{ isExpanded(row) ? '▾' : '▸' }}
                          </button>
                        </td>
                      }

                      @if (selectable()) {
                        <td class="grid-td grid-td-check pinned-left" [style.left.px]="(rowReorderable() ? 44 : 0) + (showDetailToggle() ? 44 : 0)">
                          <input type="checkbox" [checked]="isRowSelected(row)" (change)="toggleRow(row)" (click)="$event.stopPropagation()" />
                        </td>
                      }

                      @if (rowTemplate()) {
                        <td class="grid-td" [attr.colspan]="orderedColumns().length + (editable() ? 1 : 0)">
                          <ng-container *ngTemplateOutlet="rowTemplate(); context: {
                            $implicit: row,
                            row: row,
                            index: i,
                            editing: isEditing(row),
                            expanded: isExpanded(row)
                          }" />
                        </td>
                      } @else {
                        @for (col of orderedColumns(); track col.field) {
                          <td
                            class="grid-td"
                            [class.pinned-left]="col.pinned === 'left'"
                            [class.pinned-left-last]="col.pinned === 'left' && lastPinnedColumnField() === col.field"
                            [style.left.px]="col.pinned === 'left' ? columnOffsets()[col.field] : null"
                            [style.text-align]="col.align ?? 'left'"
                            [style.width.px]="getColumnWidth(col)"
                          >
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
                              @if (showGlobalSearch() && searchText()) {
                                <span [innerHTML]="highlightSearchText(getCellValue(row, col.field))"></span>
                              } @else {
                                {{ getCellValue(row, col.field) }}
                              }
                            }
                          </td>
                        }

                        @if (editable()) {
                          <td class="grid-td grid-actions" style="width:120px">
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
                  [class.dragging-row]="draggingRowIndex() === i"
                  [class.drag-over-row]="dragOverRowIndex() === i"
                  (dragover)="onRowDragOver($event, i)"
                  (drop)="onRowDrop($event, i)"
                  (dragend)="onRowDragEnd()"
                  (click)="onRowClick(row, i)"
                  (dblclick)="editable() ? beginEdit(row, i) : null"
                >
                  @if (rowReorderable()) {
                    <td class="grid-td grid-td-reorder pinned-left" style="left:0px; text-align:center; width:44px">
                      <span
                        class="row-drag-handle"
                        draggable="true"
                        (dragstart)="onRowDragStart($event, i)"
                        (dragend)="onRowDragEnd()"
                      >⋮⋮</span>
                    </td>
                  }

                  @if (showDetailToggle()) {
                    <td class="grid-td grid-td-toggle pinned-left" [style.left.px]="rowReorderable() ? 44 : 0">
                      <button class="toggle-btn" type="button" (click)="toggleDetail(row); $event.stopPropagation()">
                        {{ isExpanded(row) ? '▾' : '▸' }}
                      </button>
                    </td>
                  }

                  @if (selectable()) {
                    <td class="grid-td grid-td-check pinned-left" [style.left.px]="(rowReorderable() ? 44 : 0) + (showDetailToggle() ? 44 : 0)">
                      <input type="checkbox" [checked]="isRowSelected(row)" (change)="toggleRow(row)" (click)="$event.stopPropagation()" />
                    </td>
                  }

                  @if (rowTemplate()) {
                    <td class="grid-td" [attr.colspan]="orderedColumns().length + (editable() ? 1 : 0)">
                      <ng-container *ngTemplateOutlet="rowTemplate(); context: {
                        $implicit: row,
                        row: row,
                        index: i,
                        editing: isEditing(row),
                        expanded: isExpanded(row)
                      }" />
                    </td>
                  } @else {
                    @for (col of orderedColumns(); track col.field) {
                      <td
                        class="grid-td"
                        [class.pinned-left]="col.pinned === 'left'"
                        [class.pinned-left-last]="col.pinned === 'left' && lastPinnedColumnField() === col.field"
                        [style.left.px]="col.pinned === 'left' ? columnOffsets()[col.field] : null"
                        [style.text-align]="col.align ?? 'left'"
                        [style.width.px]="getColumnWidth(col)"
                      >
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
                          @if (showGlobalSearch() && searchText()) {
                            <span [innerHTML]="highlightSearchText(getCellValue(row, col.field))"></span>
                          } @else {
                            {{ getCellValue(row, col.field) }}
                          }
                        }
                      </td>
                    }

                    @if (editable()) {
                      <td class="grid-td grid-actions" style="width:120px">
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
          @if (hasAggregation()) {
            <tfoot>
              <tr class="grid-footer-row">
                @if (showDetailToggle()) {
                  <td class="grid-td-toggle" [class.sticky-toggle]="hasPinnedColumns()" style="left:0px"></td>
                }
                @if (selectable()) {
                  <td class="grid-td-check" [class.sticky-check]="hasPinnedColumns()" [style.left.px]="showDetailToggle() ? 44 : 0"></td>
                }
                @for (col of orderedColumns(); track col.field) {
                  <td
                    class="grid-td grid-footer-cell"
                    [class.pinned-left]="col.pinned === 'left'"
                    [class.pinned-left-last]="col.pinned === 'left' && lastPinnedColumnField() === col.field"
                    [style.left.px]="col.pinned === 'left' ? columnOffsets()[col.field] : null"
                    [style.text-align]="col.align ?? 'left'"
                    [style.width.px]="getColumnWidth(col)"
                  >
                    @if (col.aggregation) {
                      <span class="agg-label">{{ col.aggregation }}: </span>
                      <strong class="agg-value">{{ getAggregationValue(col) }}</strong>
                    }
                  </td>
                }
                @if (editable()) {
                  <td></td>
                }
              </tr>
            </tfoot>
          }
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

      <!-- Excel-Style Filter Popover Overlay -->
      @if (activeFilterPopover(); as pop) {
        <div class="grid-filter-popover" [style.top.px]="pop.top" [style.left.px]="pop.left" (click)="$event.stopPropagation()">
          <div class="popover-section text-filter-section">
            <label class="popover-label">Text Filter</label>
            <div class="text-filter-row">
              <select class="popover-select" [value]="tempFilterOperator()" (change)="tempFilterOperator.set($any($event.target).value)">
                <option value="contains">Contains</option>
                <option value="eq">Equals</option>
                <option value="startsWith">Starts With</option>
                <option value="endsWith">Ends With</option>
              </select>
              <input class="popover-input" type="text" [value]="tempFilterValue()" (input)="tempFilterValue.set($any($event.target).value)" placeholder="Filter value..." />
            </div>
          </div>
          
          <div class="popover-section checklist-section">
            <label class="popover-label">Checklist Filter</label>
            <div class="checklist-actions">
              <label class="checklist-item select-all">
                <input type="checkbox" [checked]="tempSelectedValues().size === getDistinctValues(pop.field).length" [indeterminate]="tempSelectedValues().size > 0 && tempSelectedValues().size < getDistinctValues(pop.field).length" (change)="toggleSelectAllChecklist()" />
                <span>(Select All)</span>
              </label>
            </div>
            <div class="checklist-scroll">
              @for (val of getDistinctValues(pop.field); track val) {
                <label class="checklist-item">
                  <input type="checkbox" [checked]="tempSelectedValues().has(val)" (change)="toggleChecklistItem(val)" />
                  <span>{{ val }}</span>
                </label>
              }
            </div>
          </div>
          
          <div class="popover-footer">
            <button class="popover-btn clear" (click)="clearPopoverFilter()">Clear</button>
            <div class="footer-actions">
              <button class="popover-btn cancel" (click)="activeFilterPopover.set(null)">Cancel</button>
              <button class="popover-btn apply" (click)="applyPopoverFilter()">Apply</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-data-grid {
      position: relative;
      font-family: inherit;
      border: 1px solid var(--ngx-grid-border, #e2e8f0);
      border-radius: var(--ngx-grid-radius, 12px);
      overflow: visible;
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
      border-radius: var(--ngx-grid-radius, 12px) var(--ngx-grid-radius, 12px) 0 0;
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
    .grid-table-wrap { overflow-x: auto; overflow-y: hidden; }
    .grid-table { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed; }
    .grid-th {
      position: relative;
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
    
    .th-content-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      width: 100%;
    }
    .grid-filter-btn {
      background: transparent;
      border: none;
      color: var(--ngx-grid-text-secondary, #64748b);
      cursor: pointer;
      padding: 2px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .grid-filter-btn:hover {
      background: var(--ngx-grid-hover-bg, #e2e8f0);
      color: var(--ngx-grid-text, #0f172a);
    }
    .grid-filter-btn.active {
      color: var(--ngx-input-focus, #4f46e5);
      background: rgba(79, 70, 229, 0.1);
    }
    .grid-resize-handle {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      background: transparent;
      z-index: 10;
      transition: background-color 0.2s;
    }
    .grid-resize-handle:hover,
    .grid-resize-handle.resizing {
      background: var(--ngx-input-focus, #4f46e5);
    }
    
    .grid-filter-popover {
      position: absolute;
      width: 250px;
      background: var(--ngx-grid-bg, #ffffff);
      border: 1px solid var(--ngx-grid-border, #e2e8f0);
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      padding: 12px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      font-family: inherit;
    }
    .popover-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .popover-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--ngx-grid-text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .text-filter-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .popover-select {
      padding: 6px;
      border: 1px solid var(--ngx-grid-border, #cbd5e1);
      border-radius: 6px;
      font-size: 12px;
      font-family: inherit;
      outline: none;
      background: var(--ngx-input-bg, #ffffff);
      color: var(--ngx-grid-text, #0f172a);
    }
    .popover-input {
      padding: 6px 10px;
      border: 1px solid var(--ngx-grid-border, #cbd5e1);
      border-radius: 6px;
      font-size: 12px;
      font-family: inherit;
      outline: none;
      background: var(--ngx-input-bg, #ffffff);
      color: var(--ngx-grid-text, #0f172a);
    }
    .checklist-section {
      border-top: 1px solid var(--ngx-grid-border, #e2e8f0);
      padding-top: 10px;
    }
    .checklist-scroll {
      max-height: 120px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
      border: 1px solid var(--ngx-grid-border, #e2e8f0);
      border-radius: 6px;
      padding: 6px;
    }
    .checklist-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--ngx-grid-text, #0f172a);
      cursor: pointer;
      user-select: none;
    }
    .checklist-item input {
      margin: 0;
    }
    .popover-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--ngx-grid-border, #e2e8f0);
      padding-top: 10px;
      margin-top: 4px;
    }
    .footer-actions {
      display: flex;
      gap: 6px;
    }
    .popover-btn {
      padding: 5px 10px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid var(--ngx-grid-border, #cbd5e1);
      background: var(--ngx-grid-bg, #ffffff);
      color: var(--ngx-grid-text, #0f172a);
      transition: all 0.2s;
    }
    .popover-btn:hover {
      background: var(--ngx-grid-hover-bg, #f1f5f9);
    }
    .popover-btn.apply {
      background: var(--ngx-btn-primary-bg, #4f46e5);
      color: #ffffff;
      border-color: var(--ngx-btn-primary-bg, #4f46e5);
    }
    .popover-btn.apply:hover {
      background: var(--ngx-btn-primary-hover, #4338ca);
      border-color: var(--ngx-btn-primary-hover, #4338ca);
    }
    .popover-btn.clear {
      color: #ef4444;
      border-color: transparent;
      background: transparent;
    }
    .popover-btn.clear:hover {
      background: #fef2f2;
    }

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
      box-sizing: border-box;
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
      border-radius: 0 0 var(--ngx-grid-radius, 12px) var(--ngx-grid-radius, 12px);
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
    
    .grid-footer-row td {
      background: var(--ngx-grid-header-bg, #f8fafc);
      border-top: 2px solid var(--ngx-grid-border, #e2e8f0);
      font-size: 12px;
      padding: 12px 16px;
      color: var(--ngx-grid-text, #0f172a);
    }
    .agg-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--ngx-grid-text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .agg-value {
      font-weight: 700;
      color: var(--ngx-input-focus, #4f46e5);
    }
    .pinned-left {
      position: sticky !important;
      z-index: 2;
      background: var(--ngx-grid-bg, #ffffff);
    }
    th.pinned-left {
      z-index: 4;
      background: var(--ngx-grid-header-bg, #f8fafc);
    }
    .sticky-toggle {
      position: sticky !important;
      left: 0;
      z-index: 3;
      background: var(--ngx-grid-bg, #ffffff);
    }
    th.sticky-toggle {
      z-index: 5;
      background: var(--ngx-grid-header-bg, #f8fafc);
    }
    .sticky-check {
      position: sticky !important;
      z-index: 3;
      background: var(--ngx-grid-bg, #ffffff);
    }
    th.sticky-check {
      z-index: 5;
      background: var(--ngx-grid-header-bg, #f8fafc);
    }
    .pinned-left-last,
    .sticky-toggle-last,
    .sticky-check-last {
      border-right: 2px solid var(--ngx-grid-border, #cbd5e1) !important;
    }
    .grid-table.striped .grid-row:nth-child(even) .pinned-left,
    .grid-table.striped .grid-row:nth-child(even) .sticky-toggle,
    .grid-table.striped .grid-row:nth-child(even) .sticky-check {
      background: var(--ngx-grid-stripe-bg, #f8fafc);
    }
    .grid-row:hover .pinned-left,
    .grid-row:hover .sticky-toggle,
    .grid-row:hover .sticky-check {
      background: var(--ngx-grid-hover-bg, #f1f5f9) !important;
    }
    .grid-row.selected .pinned-left,
    .grid-row.selected .sticky-toggle,
    .grid-row.selected .sticky-check {
      background: var(--ngx-grid-selected-bg, #e0e7ff) !important;
    }
    .grid-footer-row .pinned-left,
    .grid-footer-row .sticky-toggle,
    .grid-footer-row .sticky-check {
      background: var(--ngx-grid-header-bg, #f8fafc);
    }
    
    /* Drag & Drop Reordering Styles */
    .grid-th[draggable="true"] {
      cursor: grab;
    }
    .grid-th[draggable="true"]:active {
      cursor: grabbing;
    }
    .grid-th.dragging {
      opacity: 0.4;
      background: var(--ngx-grid-hover-bg, #f1f5f9) !important;
      border: 1.5px dashed var(--ngx-input-border, #cbd5e1);
    }
    .grid-th.drag-over {
      border-left: 3px solid var(--ngx-input-focus, #4f46e5) !important;
    }
    
    /* Multi-Column Sorting order badge */
    .sort-icon.active {
      color: var(--ngx-input-focus, #4f46e5);
      font-weight: 700;
    }
    .sort-order-badge {
      font-size: 8px;
      line-height: 1;
      background: var(--ngx-input-focus, #4f46e5);
      color: #ffffff;
      padding: 1px 3.5px;
      border-radius: 4px;
      vertical-align: super;
      margin-left: 2px;
    }
    
    /* Global Search Styles */
    .grid-search-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .grid-search-input {
      padding: 6px 30px 6px 12px;
      border: 1px solid var(--ngx-grid-border, #cbd5e1);
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      background: var(--ngx-input-bg, #ffffff);
      color: var(--ngx-grid-text, #0f172a);
      outline: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      width: 180px;
    }
    .grid-search-input:focus {
      border-color: var(--ngx-input-focus, #4f46e5);
      box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.15));
      width: 220px;
    }
    .grid-search-clear {
      position: absolute;
      right: 8px;
      background: transparent;
      border: none;
      color: var(--ngx-grid-text-secondary, #94a3b8);
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      line-height: 1;
    }
    .grid-search-clear:hover {
      color: var(--ngx-grid-text, #0f172a);
    }
    .search-highlight {
      background-color: rgba(251, 191, 36, 0.3);
      color: inherit;
      font-weight: 600;
      padding: 1px 2px;
      border-radius: 4px;
    }

    /* Row Drag & Drop Styles */
    .row-drag-handle {
      cursor: grab;
      user-select: none;
      color: var(--ngx-grid-text-secondary, #94a3b8);
      font-size: 15px;
      font-weight: 700;
      display: inline-block;
      padding: 4px 8px;
      transition: color 0.15s ease;
    }
    .row-drag-handle:hover {
      color: var(--ngx-grid-text, #0f172a);
    }
    .row-drag-handle:active {
      cursor: grabbing;
    }
    .grid-row.dragging-row {
      opacity: 0.4;
      background: var(--ngx-grid-hover-bg, #f1f5f9) !important;
      border: 1.5px dashed var(--ngx-input-border, #cbd5e1);
    }
    .grid-row.drag-over-row {
      border-top: 2px solid var(--ngx-input-focus, #4f46e5) !important;
    }
  `],
})
export class DataGridComponent<T extends object = Record<string, unknown>> implements OnInit {
  data = input<T[]>([]);
  columns = input<GridColumnDef<T>[]>([]);
  stateKey = input<string>('');
  reorderable = input<boolean>(false);
  multiSort = input<boolean>(false);
  columnReorder = output<{ columns: GridColumnDef<T>[] }>();
  rowReorderable = input<boolean>(false);
  showGlobalSearch = input<boolean>(false);
  globalSearchPlaceholder = input<string>('Search...');
  rowReorder = output<{ previousIndex: number; currentIndex: number; data: T[] }>();

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
  
  // Enterprise Extensions
  private elementRef = inject(ElementRef);
  columnWidths = signal<Record<string, number>>({});
  filterStates = signal<Map<string, GridFilterState>>(new Map());
  sortStates = signal<GridSortState[]>([]);
  columnOrder = signal<string[]>([]);
  
  // Drag and drop state
  draggingField = signal<string | null>(null);
  dragOverField = signal<string | null>(null);
  draggingRowIndex = signal<number | null>(null);
  dragOverRowIndex = signal<number | null>(null);
  
  // Resizing state
  private resizeStartWidth = 0;
  private resizeStartX = 0;
  private resizingField: string | null = null;
  private isInitialPageSync = true;

  // Filter Popover state
  activeFilterPopover = signal<{ field: string; top: number; left: number } | null>(null);
  tempFilterValue = signal<string>('');
  tempFilterOperator = signal<'contains' | 'startsWith' | 'endsWith' | 'eq'>('contains');
  tempSelectedValues = signal<Set<string>>(new Set());

  // Global search state
  searchText = signal<string>('');

  constructor() {
    effect(() => {
      const externalPage = this.page();
      const current = untracked(() => this.currentPage());
      if (this.isInitialPageSync) {
        this.isInitialPageSync = false;
        if (this.stateKey()) {
          return;
        }
      }
      if (externalPage > 0 && externalPage !== current) {
        untracked(() => this.currentPage.set(externalPage));
      }
    });

    effect(() => {
      const max = this.totalPages();
      if (this.currentPage() > max) {
        this.currentPage.set(max);
      }
    });

    effect(() => {
      const states = this.sortStates();
      const current = untracked(() => this.sortState());
      const first = states.length > 0 ? states[0] : null;
      if (JSON.stringify(first) !== JSON.stringify(current)) {
        untracked(() => this.sortState.set(first));
      }
    });

    effect(() => {
      const single = this.sortState();
      const current = untracked(() => this.sortStates());
      const first = current.length > 0 ? current[0] : null;
      if (JSON.stringify(single) !== JSON.stringify(first)) {
        untracked(() => this.sortStates.set(single ? [single] : []));
      }
    });

    effect(() => {
      const key = this.stateKey();
      if (!key || typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      const state = {
        columnWidths: this.columnWidths(),
        sortState: this.sortState(),
        sortStates: this.sortStates(),
        columnOrder: this.columnOrder(),
        currentPage: this.currentPage(),
        filters: Array.from(this.filterStates().values()),
        searchText: this.searchText()
      };
      try {
        localStorage.setItem(`ngx_grid_state_${key}`, JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to save grid state to localStorage', e);
      }
    });
  }

  ngOnInit(): void {
    this.loadState();
  }

  private loadState(): void {
    const key = this.stateKey();
    if (!key || typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    try {
      const saved = localStorage.getItem(`ngx_grid_state_${key}`);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.columnWidths) {
          this.columnWidths.set(state.columnWidths);
        }
        if (state.columnOrder) {
          this.columnOrder.set(state.columnOrder);
        }
        if (state.sortStates) {
          this.sortStates.set(state.sortStates);
          this.sortState.set(state.sortStates.length > 0 ? state.sortStates[0] : null);
        } else if (state.sortState !== undefined) {
          this.sortState.set(state.sortState);
          this.sortStates.set(state.sortState ? [state.sortState] : []);
        }
        if (state.currentPage !== undefined) {
          this.currentPage.set(state.currentPage);
        }
        if (state.filters) {
          const map = new Map<string, GridFilterState>();
          (state.filters as GridFilterState[]).forEach((f: GridFilterState) => {
            map.set(f.field, f);
          });
          this.filterStates.set(map);
        }
        if (state.searchText !== undefined) {
          this.searchText.set(state.searchText);
        }
      }
    } catch (e) {
      console.warn('Failed to load grid state from localStorage', e);
    }
  }

  orderedColumns = computed(() => {
    const cols = this.columns();
    const order = this.columnOrder();
    
    let mapped = [...cols];
    if (order.length > 0) {
      mapped.sort((a, b) => {
        const idxA = order.indexOf(a.field);
        const idxB = order.indexOf(b.field);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }
    
    const pinned = mapped.filter(c => c.pinned === 'left');
    const normal = mapped.filter(c => c.pinned !== 'left');
    return [...pinned, ...normal];
  });

  hasPinnedColumns = computed(() => this.columns().some(c => c.pinned === 'left'));

  lastPinnedColumnField = computed(() => {
    const pinned = this.orderedColumns().filter(c => c.pinned === 'left');
    return pinned.length > 0 ? pinned[pinned.length - 1].field : null;
  });

  columnOffsets = computed(() => {
    const offsets: Record<string, number> = {};
    let currentOffset = 0;
    
    if (this.rowReorderable()) {
      currentOffset += 44;
    }
    if (this.showDetailToggle()) {
      currentOffset += 44;
    }
    if (this.selectable()) {
      currentOffset += 44;
    }
    
    const cols = this.orderedColumns();
    for (const col of cols) {
      if (col.pinned === 'left') {
        offsets[col.field] = currentOffset;
        currentOffset += this.getColumnWidth(col) ?? 120;
      }
    }
    return offsets;
  });

  hasFilterableColumns = computed(() => this.columns().some(column => column.filterable));
  isAnyServerMode = computed(() =>
    this.sortMode() === 'server' ||
    this.filterMode() === 'server' ||
    this.groupMode() === 'server' ||
    this.pagingMode() === 'server'
  );
  showDetailToggle = computed(() => this.detailRowTemplate() !== null);

  activeFilters = computed<GridFilterState[]>(() =>
    Array.from(this.filterStates().values())
  );

  private clientFilteredData = computed(() => {
    if (this.filterMode() !== 'client') {
      return this.data();
    }

    let rows = this.data() as T[];
    for (const filter of this.activeFilters()) {
      if (filter.operator === 'in') {
        const selected = filter.selectedValues ?? [];
        if (selected.length > 0) {
          rows = rows.filter(row => {
            const cellVal = String((row as Record<string, unknown>)[filter.field] ?? '');
            const displayVal = cellVal === '' || cellVal == null ? '(Blank)' : cellVal;
            return selected.includes(displayVal);
          });
        }
      } else {
        if (!filter.value) {
          continue;
        }
        const query = filter.value.toLowerCase();
        const operator = filter.operator ?? 'contains';
        rows = rows.filter(row => {
          const cellVal = String((row as Record<string, unknown>)[filter.field] ?? '').toLowerCase();
          if (operator === 'eq') return cellVal === query;
          if (operator === 'startsWith') return cellVal.startsWith(query);
          if (operator === 'endsWith') return cellVal.endsWith(query);
          return cellVal.includes(query); // contains
        });
      }
    }
    const searchVal = this.searchText().trim().toLowerCase();
    if (searchVal) {
      const cols = this.orderedColumns();
      rows = rows.filter(row => {
        return cols.some(col => {
          const cellVal = String((row as Record<string, unknown>)[col.field] ?? '').toLowerCase();
          return cellVal.includes(searchVal);
        });
      });
    }
    return rows;
  });

  private clientSortedData = computed(() => {
    const rows = this.clientFilteredData();
    if (this.sortMode() !== 'client') {
      return rows;
    }

    const activeSorts = this.sortStates();
    if (activeSorts.length === 0) {
      return rows;
    }

    return [...rows].sort((left, right) => {
      for (const state of activeSorts) {
        const leftValue = (left as Record<string, unknown>)[state.field];
        const rightValue = (right as Record<string, unknown>)[state.field];
        const compared = this.compareValues(leftValue, rightValue);
        if (compared !== 0) {
          return state.dir === 'asc' ? compared : -compared;
        }
      }
      return 0;
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
    this.orderedColumns().length +
    (this.selectable() ? 1 : 0) +
    (this.showDetailToggle() ? 1 : 0) +
    (this.rowReorderable() ? 1 : 0) +
    (this.editable() ? 1 : 0)
  );

  showPager = computed(() => this.totalItems() > 0);

  getFilter(field: string): string {
    return this.filterStates().get(field)?.value ?? '';
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
    const cols = this.orderedColumns();
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
    const nextStates = new Map(this.filterStates());
    if (value) {
      nextStates.set(field, { field, value, operator: 'contains' });
    } else {
      nextStates.delete(field);
    }

    this.filterStates.set(nextStates);
    this.currentPage.set(1);

    const filters = this.activeFilters();
    this.filterChange.emit({ filters });
    this.emitDataState();
  }

  getColumnWidth(col: GridColumnDef<T>): number | undefined {
    return this.columnWidths()[col.field] ?? col.width;
  }

  onResizeStart(event: MouseEvent, col: GridColumnDef<T>): void {
    event.stopPropagation();
    event.preventDefault();
    this.resizingField = col.field;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = this.columnWidths()[col.field] ?? col.width ?? 120;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!this.resizingField) return;
      const deltaX = moveEvent.clientX - this.resizeStartX;
      const newWidth = Math.max(50, this.resizeStartWidth + deltaX);
      this.columnWidths.update(widths => ({
        ...widths,
        [this.resizingField!]: newWidth
      }));
    };

    const onMouseUp = () => {
      this.resizingField = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  openFilterPopover(event: MouseEvent, field: string): void {
    event.stopPropagation();
    if (this.activeFilterPopover()?.field === field) {
      this.activeFilterPopover.set(null);
      return;
    }

    const current = this.filterStates().get(field);
    this.tempFilterValue.set(current?.value ?? '');
    this.tempFilterOperator.set(
      (current?.operator === 'in' ? 'contains' : current?.operator) ?? 'contains'
    );

    const distinct = this.getDistinctValues(field);
    if (current?.selectedValues) {
      this.tempSelectedValues.set(new Set(current.selectedValues));
    } else {
      this.tempSelectedValues.set(new Set(distinct));
    }

    const buttonEl = event.currentTarget as HTMLElement;
    const gridEl = this.elementRef.nativeElement.querySelector('.ngx-data-grid') as HTMLElement;
    const buttonRect = buttonEl.getBoundingClientRect();
    const gridRect = gridEl.getBoundingClientRect();

    const top = buttonRect.bottom - gridRect.top;
    const left = buttonRect.left - gridRect.left;

    this.activeFilterPopover.set({
      field,
      top,
      left: Math.min(left, gridRect.width - 260)
    });
  }

  getDistinctValues(field: string): string[] {
    const vals = new Set<string>();
    this.data().forEach(row => {
      const val = (row as Record<string, unknown>)[field];
      vals.add(val == null || val === '' ? '(Blank)' : String(val));
    });
    return Array.from(vals).sort();
  }

  toggleChecklistItem(val: string): void {
    const next = new Set(this.tempSelectedValues());
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    this.tempSelectedValues.set(next);
  }

  toggleSelectAllChecklist(): void {
    const pop = this.activeFilterPopover();
    if (!pop) return;
    const distinct = this.getDistinctValues(pop.field);
    if (this.tempSelectedValues().size === distinct.length) {
      this.tempSelectedValues.set(new Set());
    } else {
      this.tempSelectedValues.set(new Set(distinct));
    }
  }

  applyPopoverFilter(): void {
    const pop = this.activeFilterPopover();
    if (!pop) return;

    const field = pop.field;
    const distinct = this.getDistinctValues(field);
    const selected = this.tempSelectedValues();

    let filterState: GridFilterState | null = null;

    if (this.tempFilterValue()) {
      filterState = {
        field,
        value: this.tempFilterValue(),
        operator: this.tempFilterOperator()
      };
    } else if (selected.size < distinct.length) {
      filterState = {
        field,
        value: '',
        operator: 'in',
        selectedValues: Array.from(selected)
      };
    }

    const nextStates = new Map(this.filterStates());
    if (filterState) {
      nextStates.set(field, filterState);
    } else {
      nextStates.delete(field);
    }

    this.filterStates.set(nextStates);
    this.currentPage.set(1);
    this.activeFilterPopover.set(null);

    this.filterChange.emit({ filters: this.activeFilters() });
    this.emitDataState();
  }

  clearPopoverFilter(): void {
    const pop = this.activeFilterPopover();
    if (!pop) return;

    const field = pop.field;
    const nextStates = new Map(this.filterStates());
    nextStates.delete(field);

    this.filterStates.set(nextStates);
    this.currentPage.set(1);
    this.activeFilterPopover.set(null);

    this.filterChange.emit({ filters: this.activeFilters() });
    this.emitDataState();
  }

  hasAggregation = computed(() => this.columns().some(col => col.aggregation));

  getAggregationValue(col: GridColumnDef<T>): string {
    const rows = this.clientFilteredData();
    if (rows.length === 0) return '-';

    const values = rows.map(r => {
      const val = (r as Record<string, unknown>)[col.field];
      return typeof val === 'number' ? val : Number(val);
    }).filter(v => !isNaN(v));

    if (col.aggregation === 'count') {
      return String(rows.length);
    }

    if (values.length === 0) return '-';

    switch (col.aggregation) {
      case 'sum': {
        const sum = values.reduce((acc, v) => acc + v, 0);
        return this.formatAggValue(sum);
      }
      case 'avg': {
        const sum = values.reduce((acc, v) => acc + v, 0);
        const avg = sum / values.length;
        return this.formatAggValue(avg);
      }
      case 'min': {
        return this.formatAggValue(Math.min(...values));
      }
      case 'max': {
        return this.formatAggValue(Math.max(...values));
      }
      default:
        return '-';
    }
  }

  private formatAggValue(val: number): string {
    return val % 1 === 0 ? String(val) : val.toFixed(2);
  }

  onSort(column: GridColumnDef<T>, event?: MouseEvent): void {
    const isMulti = this.multiSort() && event && (event.ctrlKey || event.shiftKey);
    const currentStates = [...this.sortStates()];
    const index = currentStates.findIndex(s => s.field === column.field);

    if (isMulti) {
      if (index !== -1) {
        const current = currentStates[index];
        if (current.dir === 'asc') {
          currentStates[index] = { field: column.field, dir: 'desc' };
        } else {
          currentStates.splice(index, 1);
        }
      } else {
        currentStates.push({ field: column.field, dir: 'asc' });
      }
      this.sortStates.set(currentStates);
    } else {
      if (index !== -1 && currentStates.length === 1) {
        const current = currentStates[0];
        if (current.dir === 'asc') {
          this.sortStates.set([{ field: column.field, dir: 'desc' }]);
        } else {
          this.sortStates.set([]);
        }
      } else {
        this.sortStates.set([{ field: column.field, dir: 'asc' }]);
      }
    }

    this.currentPage.set(1);
    this.sortChange.emit({ sort: this.sortState(), sorts: this.sortStates() } as any);
    this.emitDataState();
  }

  onDragStart(event: DragEvent, col: GridColumnDef<T>): void {
    if (!this.reorderable()) return;
    this.draggingField.set(col.field);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', col.field);
    }
  }

  onDragOver(event: DragEvent, col: GridColumnDef<T>): void {
    if (!this.reorderable() || this.draggingField() === col.field) return;
    event.preventDefault();
    this.dragOverField.set(col.field);
  }

  onDrop(event: DragEvent, targetCol: GridColumnDef<T>): void {
    if (!this.reorderable()) return;
    const sourceField = this.draggingField();
    const targetField = targetCol.field;
    if (sourceField && sourceField !== targetField) {
      const currentOrder = this.columnOrder().length > 0 
        ? [...this.columnOrder()] 
        : this.columns().map(c => c.field);
        
      const sourceIndex = currentOrder.indexOf(sourceField);
      const targetIndex = currentOrder.indexOf(targetField);
      if (sourceIndex !== -1 && targetIndex !== -1) {
        currentOrder.splice(sourceIndex, 1);
        currentOrder.splice(targetIndex, 0, sourceField);
        this.columnOrder.set(currentOrder);
        this.columnReorder.emit({ columns: this.orderedColumns() });
      }
    }
    this.draggingField.set(null);
    this.dragOverField.set(null);
  }

  onDragEnd(): void {
    this.draggingField.set(null);
    this.dragOverField.set(null);
  }

  onRowDragStart(event: DragEvent, index: number): void {
    if (!this.rowReorderable()) return;
    this.draggingRowIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  onRowDragOver(event: DragEvent, index: number): void {
    if (!this.rowReorderable() || this.draggingRowIndex() === index) return;
    event.preventDefault();
    this.dragOverRowIndex.set(index);
  }

  onRowDrop(event: DragEvent, targetIndex: number): void {
    if (!this.rowReorderable()) return;
    const sourceIndex = this.draggingRowIndex();
    if (sourceIndex !== null && sourceIndex !== targetIndex) {
      const rendered = this.flatRenderedRows();
      const sourceItem = rendered[sourceIndex];
      const targetItem = rendered[targetIndex];
      
      const currentData = [...this.data()];
      const actualSourceIdx = currentData.indexOf(sourceItem);
      const actualTargetIdx = currentData.indexOf(targetItem);
      
      if (actualSourceIdx !== -1 && actualTargetIdx !== -1) {
        currentData.splice(actualSourceIdx, 1);
        currentData.splice(actualTargetIdx, 0, sourceItem);
        this.rowReorder.emit({
          previousIndex: actualSourceIdx,
          currentIndex: actualTargetIdx,
          data: currentData
        });
      }
    }
    this.draggingRowIndex.set(null);
    this.dragOverRowIndex.set(null);
  }

  onRowDragEnd(): void {
    this.draggingRowIndex.set(null);
    this.dragOverRowIndex.set(null);
  }

  getSortIndex(col: GridColumnDef<T>): number {
    return this.sortStates().findIndex(s => s.field === col.field) + 1;
  }

  getSortDirection(col: GridColumnDef<T>): 'asc' | 'desc' | null {
    const found = this.sortStates().find(s => s.field === col.field);
    return found ? found.dir : null;
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

  highlightSearchText(value: unknown): string {
    const rawVal = value == null ? '' : String(value);
    const searchVal = this.searchText().trim();
    if (!searchVal || !this.showGlobalSearch()) {
      return this.escapeHtml(rawVal);
    }
    
    const escapedVal = this.escapeHtml(rawVal);
    const escapedSearch = this.escapeRegExp(searchVal);
    try {
      const regex = new RegExp(`(${escapedSearch})`, 'gi');
      return escapedVal.replace(regex, '<mark class="search-highlight">$1</mark>');
    } catch {
      return escapedVal;
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private escapeRegExp(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
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
