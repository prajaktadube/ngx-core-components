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
  DestroyRef,
  HostListener,
  ContentChildren,
  Directive,
  Input,
  QueryList,
  Injector,
  afterNextRender,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NGX_CORE_I18N } from 'ngx-core-components/i18n';
import { GridExportService } from './grid-export.service';
import { GridExportXlsxService } from './services/grid-export-xlsx.service';
import { GridStatusBarComponent } from './components/grid-status-bar/grid-status-bar.component';
import { GridFilterBuilderComponent } from './components/grid-filter-builder/grid-filter-builder.component';
import type { TreeDataConfig, FilterExpression, GridStatusBarAggregates, GridInfiniteScrollEvent } from './models';

// Re-export all model types so existing imports from this file continue to work
export type {
  GridColumnDef,
  GridSortState,
  GridFilterState,
  GridGroupState,
  GridPageChangeEvent,
  GridSortChangeEvent,
  GridFilterChangeEvent,
  GridGroupChangeEvent,
  GridDataStateChangeEvent,
  GridRowClickEvent,
  GridRowUpdateEvent,
  GridGroupResult,
  GridHeaderTemplateContext,
  GridCellTemplateContext,
  GridRowTemplateContext,
  GridDetailTemplateContext,
  GridFooterTemplateContext,
} from './models';

import type {
  GridColumnDef,
  GridSortState,
  GridFilterState,
  GridGroupState,
  GridPageChangeEvent,
  GridSortChangeEvent,
  GridFilterChangeEvent,
  GridGroupChangeEvent,
  GridDataStateChangeEvent,
  GridRowClickEvent,
  GridRowUpdateEvent,
  GridGroupResult,
  GridHeaderTemplateContext,
  GridCellTemplateContext,
  GridRowTemplateContext,
  GridDetailTemplateContext,
  GridFooterTemplateContext,
} from './models';

@Directive({
  selector: '[ngxGridCellTemplate]',
  standalone: true,
})
export class NgxGridCellTemplateDirective {
  @Input('ngxGridCellTemplate') columnField!: string;
  templateRef = inject(TemplateRef);
}

@Directive({
  selector: '[ngxGridEditCellTemplate]',
  standalone: true,
})
export class NgxGridEditCellTemplateDirective {
  @Input('ngxGridEditCellTemplate') columnField!: string;
  templateRef = inject(TemplateRef);
}

@Directive({
  selector: '[ngxGridHeaderTemplate]',
  standalone: true,
})
export class NgxGridHeaderTemplateDirective {
  @Input('ngxGridHeaderTemplate') columnField!: string;
  templateRef = inject(TemplateRef);
}

@Directive({
  selector: '[ngxGridFooterTemplate]',
  standalone: true,
})
export class NgxGridFooterTemplateDirective {
  @Input('ngxGridFooterTemplate') columnField!: string;
  templateRef = inject(TemplateRef);
}

@Component({
  selector: 'ngx-data-grid',
  standalone: true,
  imports: [NgTemplateOutlet, GridStatusBarComponent, GridFilterBuilderComponent],
  providers: [GridExportXlsxService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-data-grid"
      [class.loading]="loading()"
      [class.compact]="compact()"
      role="region"
      [attr.aria-label]="i18n.grid.dataGrid"
      [attr.tabindex]="keyboardNavigation() || enableContextMenu() ? 0 : null"
    >
      <div class="visually-hidden" aria-live="polite" aria-atomic="true">{{ selectionAnnouncement() }}</div>

      @if (showGroupingPanel()) {
        <div
          class="grid-grouping-panel"
          (dragover)="onGroupingPanelDragOver($event)"
          (dragleave)="onGroupingPanelDragLeave($event)"
          (drop)="onGroupingPanelDrop($event)"
          [class.drag-over]="isGroupingPanelDragOver()"
        >
          <div class="grouping-panel-label">
            @if (internalGroupBy(); as gb) {
              <span>{{ i18n.grid.groupedBy }}</span>
              <span class="group-chip">
                {{ getColumnTitle(gb.field) }}
                <button class="remove-group-btn" (click)="clearGrouping()">×</button>
              </span>
            } @else {
              <span>{{ i18n.grid.groupColumnsHint }}</span>
            }
          </div>
        </div>
      }

      <div class="grid-toolbar" role="toolbar" [attr.aria-label]="i18n.grid.toolbar">
        <span class="grid-toolbar-title">{{ i18n.grid.dataGrid }}</span>
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
                <button
                  class="grid-search-clear"
                  (click)="searchText.set('')"
                  [attr.title]="i18n.grid.clearSearch"
                  [attr.aria-label]="i18n.grid.clearSearch"
                >
                  ×
                </button>
              }
            </div>
          }
          @if (activeFilters().length > 0) {
            <button
              class="grid-action-btn clear-filters-btn"
              (click)="clearAllFilters()"
              [attr.title]="i18n.grid.clearFilters"
              [attr.aria-label]="i18n.grid.clearFilters"
            >
              Clear Filters
            </button>
          }
          @if (showColumnChooser()) {
            <button
              class="grid-action-btn"
              (click)="openColumnChooser($event)"
              [attr.aria-expanded]="activeColumnChooserPopover() !== null"
              [attr.aria-controls]="instanceId + '-column-chooser'"
              [attr.aria-label]="i18n.grid.chooseColumns"
              type="button"
            >
              {{ i18n.grid.chooseColumns }}
            </button>
          }
          @if (showFilterBuilder()) {
            <button
              class="grid-action-btn"
              type="button"
              (click)="openFilterBuilder($event)"
              [attr.aria-haspopup]="'dialog'"
              [attr.aria-expanded]="isFilterBuilderOpen()"
              [attr.aria-controls]="instanceId + '-filter-builder'"
              [attr.title]="i18n.grid.advancedFilterBuilder"
              [attr.aria-label]="i18n.grid.advancedFilterBuilder"
            >
              🔍 Filter
            </button>
          }
          <button
            class="grid-action-btn"
            (click)="exportToJson()"
            [attr.title]="i18n.grid.exportJson"
            [attr.aria-label]="i18n.grid.exportJson"
          >
            JSON
          </button>
          <button
            class="grid-action-btn"
            (click)="exportToCsv()"
            [attr.title]="i18n.grid.exportCsv"
            [attr.aria-label]="i18n.grid.exportCsv"
          >
            CSV
          </button>
          <button
            class="grid-action-btn"
            (click)="exportToXlsx()"
            [attr.title]="i18n.grid.exportXlsx"
            [attr.aria-label]="i18n.grid.exportXlsx"
          >
            XLSX
          </button>
          <button
            class="grid-action-btn"
            (click)="exportToExcel()"
            [attr.title]="i18n.grid.exportExcel"
            [attr.aria-label]="i18n.grid.exportExcel"
          >
            Excel
          </button>
          <button
            class="grid-action-btn"
            (click)="exportToPdf()"
            [attr.title]="i18n.grid.exportPdf"
            [attr.aria-label]="i18n.grid.exportPdf"
          >
            PDF
          </button>
        </div>
      </div>

      <div class="grid-table-wrap" #viewportEl (scroll)="onViewportScroll($event)" [attr.aria-busy]="loading()">
        <table class="grid-table" [class.striped]="striped()">
          <colgroup>
            @if (rowReorderable()) {
              <col style="width: 44px" />
            }
            @if (showDetailToggle()) {
              <col style="width: 44px" />
            }
            @if (selectable()) {
              <col style="width: 44px" />
            }
            @for (col of orderedColumns(); track col.field) {
              <col [style.width.px]="getColumnWidth(col)" />
            }
            @if (editable()) {
              <col style="width: 120px" />
            }
          </colgroup>
          <thead>
            <ng-template #headerCellContent let-col="col">
              <div class="th-content-wrapper">
                @if (resolveHeaderTemplate(col); as activeHeaderTemplate) {
                  <ng-container
                    *ngTemplateOutlet="
                      activeHeaderTemplate;
                      context: {
                        $implicit: col,
                        column: col,
                        sort: sortState(),
                        filters: activeFilters(),
                        isServerMode: isAnyServerMode(),
                      }
                    "
                  />
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
                  <button
                    class="grid-filter-btn"
                    [class.active]="filterStates().has(col.field)"
                    (click)="openFilterPopover($event, col.field); $event.stopPropagation()"
                    [attr.title]="i18n.grid.filterColumn"
                    [attr.aria-label]="i18n.grid.filterColumn"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                  </button>
                }
              </div>
              <div
                class="grid-resize-handle"
                (mousedown)="onResizeStart($event, col)"
                (dblclick)="onResizeDoubleClick($event, col)"
                (click)="$event.stopPropagation()"
              ></div>
            </ng-template>

            <tr class="grid-header-row">
              @if (rowReorderable()) {
                <th
                  class="grid-th grid-th-reorder pinned-left"
                  [class.pinned-left-last]="isRowReorderableLastPinned()"
                  [attr.rowspan]="hasColumnCategories() ? 2 : 1"
                  style="width:44px; left:0px"
                ></th>
              }
              @if (showDetailToggle()) {
                <th
                  class="grid-th grid-th-toggle pinned-left"
                  [class.pinned-left-last]="isDetailToggleLastPinned()"
                  [attr.rowspan]="hasColumnCategories() ? 2 : 1"
                  [style.left.px]="rowReorderable() ? 44 : 0"
                  style="width:44px"
                ></th>
              }
              @if (selectable()) {
                <th
                  class="grid-th grid-th-check pinned-left"
                  [class.pinned-left-last]="isSelectableLastPinned()"
                  [attr.rowspan]="hasColumnCategories() ? 2 : 1"
                  [style.left.px]="(rowReorderable() ? 44 : 0) + (showDetailToggle() ? 44 : 0)"
                  style="width:44px"
                >
                  <input
                    type="checkbox"
                    [attr.aria-label]="allSelected() ? i18n.grid.deselectAll : i18n.grid.selectAll"
                    [checked]="allSelected()"
                    [indeterminate]="someSelected() && !allSelected()"
                    (change)="toggleAll()"
                  />
                </th>
              }
              @for (cell of headerRows().row1; track cell.field) {
                @if (cell.isCategory) {
                  <th
                    class="grid-th grid-category-th"
                    [class.pinned-left]="cell.pinned === 'left'"
                    [class.pinned-left-last]="cell.isPinnedLast"
                    [class.pinned-right]="cell.pinned === 'right'"
                    [class.pinned-right-first]="cell.isPinnedFirst"
                    [style.left.px]="cell.pinned === 'left' ? cell.leftOffset : null"
                    [style.right.px]="cell.pinned === 'right' ? cell.rightOffset : null"
                    [attr.colspan]="cell.colSpan"
                    [attr.rowspan]="cell.rowSpan"
                  >
                    <span class="category-title">{{ cell.title }}</span>
                  </th>
                } @else {
                  <th
                    class="grid-th"
                    [class.pinned-left]="cell.column.pinned === 'left'"
                    [class.pinned-left-last]="cell.isPinnedLast"
                    [class.pinned-right]="cell.column.pinned === 'right'"
                    [class.pinned-right-first]="cell.isPinnedFirst"
                    [style.left.px]="cell.column.pinned === 'left' ? cell.leftOffset : null"
                    [style.right.px]="cell.column.pinned === 'right' ? cell.rightOffset : null"
                    [style.width.px]="getColumnWidth(cell.column)"
                    [class.sortable]="cell.column.sortable"
                    [class.sort-asc]="getSortDirection(cell.column) === 'asc'"
                    [class.sort-desc]="getSortDirection(cell.column) === 'desc'"
                    [class.dragging]="draggingField() === cell.column.field"
                    [class.drag-over]="dragOverField() === cell.column.field"
                    [attr.draggable]="reorderable() || cell.column.groupable ? true : null"
                    (dragstart)="onDragStart($event, cell.column)"
                    (dragover)="onDragOver($event, cell.column)"
                    (drop)="onDrop($event, cell.column)"
                    (dragend)="onDragEnd()"
                    (click)="cell.column.sortable ? onSort(cell.column, $event) : null"
                    [attr.colspan]="cell.colSpan"
                    [attr.rowspan]="cell.rowSpan"
                  >
                    <ng-container *ngTemplateOutlet="headerCellContent; context: { col: cell.column }" />
                  </th>
                }
              }
              @if (editable()) {
                <th
                  class="grid-th"
                  [class.pinned-right]="firstPinnedRightColumnField() !== null"
                  [class.pinned-right-first]="firstPinnedRightColumnField() === null"
                  [style.right.px]="firstPinnedRightColumnField() !== null ? 0 : null"
                  [attr.rowspan]="hasColumnCategories() ? 2 : 1"
                  style="width:120px"
                >
                  Actions
                </th>
              }
            </tr>
            @if (hasColumnCategories()) {
              <tr class="grid-header-row sub-header-row">
                @for (cell of headerRows().row2; track cell.field) {
                  <th
                    class="grid-th"
                    [class.pinned-left]="cell.column.pinned === 'left'"
                    [class.pinned-left-last]="cell.isPinnedLast"
                    [class.pinned-right]="cell.column.pinned === 'right'"
                    [class.pinned-right-first]="cell.isPinnedFirst"
                    [style.left.px]="cell.column.pinned === 'left' ? cell.leftOffset : null"
                    [style.right.px]="cell.column.pinned === 'right' ? cell.rightOffset : null"
                    [style.width.px]="getColumnWidth(cell.column)"
                    [class.sortable]="cell.column.sortable"
                    [class.sort-asc]="getSortDirection(cell.column) === 'asc'"
                    [class.sort-desc]="getSortDirection(cell.column) === 'desc'"
                    [class.dragging]="draggingField() === cell.column.field"
                    [class.drag-over]="dragOverField() === cell.column.field"
                    [attr.draggable]="reorderable() || cell.column.groupable ? true : null"
                    (dragstart)="onDragStart($event, cell.column)"
                    (dragover)="onDragOver($event, cell.column)"
                    (drop)="onDrop($event, cell.column)"
                    (dragend)="onDragEnd()"
                    (click)="cell.column.sortable ? onSort(cell.column, $event) : null"
                    [attr.colspan]="cell.colSpan"
                    [attr.rowspan]="cell.rowSpan"
                  >
                    <ng-container *ngTemplateOutlet="headerCellContent; context: { col: cell.column }" />
                  </th>
                }
              </tr>
            }
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
                <td [attr.colspan]="renderColumnCount()" class="grid-empty-cell">{{ i18n.grid.noData }}</td>
              </tr>
            } @else if (groupedRows().length > 0) {
              @for (group of groupedRows(); track group.key) {
                <tr class="grid-group-row" (click)="toggleGroup(group.key)">
                  @if (groupAggregations()) {
                    @if (rowReorderable()) {
                      <td
                        class="grid-td grid-td-reorder pinned-left"
                        [class.pinned-left-last]="isRowReorderableLastPinned()"
                        style="left:0px; width:44px"
                      ></td>
                    }
                    @if (showDetailToggle()) {
                      <td
                        class="grid-td grid-td-toggle pinned-left"
                        [class.pinned-left-last]="isDetailToggleLastPinned()"
                        [style.left.px]="rowReorderable() ? 44 : 0"
                        style="width:44px"
                      ></td>
                    }
                    @if (selectable()) {
                      <td
                        class="grid-td grid-td-check pinned-left"
                        [class.pinned-left-last]="isSelectableLastPinned()"
                        [style.left.px]="(rowReorderable() ? 44 : 0) + (showDetailToggle() ? 44 : 0)"
                        style="width:44px"
                      >
                        <input
                          type="checkbox"
                          [checked]="isGroupAllSelected(group)"
                          (change)="toggleGroupSelection(group, $event)"
                          (click)="$event.stopPropagation()"
                        />
                      </td>
                    }
                    @for (col of orderedColumns(); track col.field; let first = $first) {
                      <td
                        class="grid-td"
                        [class.pinned-left]="col.pinned === 'left'"
                        [class.pinned-left-last]="col.pinned === 'left' && lastPinnedColumnField() === col.field"
                        [class.pinned-right]="col.pinned === 'right'"
                        [class.pinned-right-first]="
                          col.pinned === 'right' && firstPinnedRightColumnField() === col.field
                        "
                        [style.left.px]="col.pinned === 'left' ? columnOffsets()[col.field] : null"
                        [style.right.px]="col.pinned === 'right' ? columnRightOffsets()[col.field] : null"
                        [style.text-align]="col.align ?? 'left'"
                        [style.width.px]="getColumnWidth(col)"
                      >
                        @if (first) {
                          <div style="display: flex; align-items: center; gap: 4px;">
                            <button
                              class="group-toggle"
                              type="button"
                              (click)="toggleGroup(group.key); $event.stopPropagation()"
                              style="background: transparent; border: none; cursor: pointer; padding: 0 4px; font-weight: bold; color: inherit; outline: none;"
                            >
                              {{ isGroupCollapsed(group.key) ? '▸' : '▾' }}
                            </button>
                            <strong>{{ col.category ? '' : group.field + ': ' }}</strong
                            >{{ group.value }} <span class="group-count">({{ group.count }})</span>
                          </div>
                        } @else if (col.aggregation) {
                          <span class="agg-label">{{ col.aggregation }}: </span>
                          <strong class="agg-value">{{ getGroupAggregationValue(group, col) }}</strong>
                        }
                      </td>
                    }
                    @if (editable()) {
                      <td
                        [class.pinned-right]="firstPinnedRightColumnField() !== null"
                        [class.pinned-right-first]="firstPinnedRightColumnField() === null"
                        [style.right.px]="firstPinnedRightColumnField() !== null ? 0 : null"
                      ></td>
                    }
                  } @else {
                    <td [attr.colspan]="renderColumnCount()">
                      <button
                        class="group-toggle"
                        type="button"
                        (click)="toggleGroup(group.key); $event.stopPropagation()"
                      >
                        {{ isGroupCollapsed(group.key) ? '▸' : '▾' }}
                      </button>
                      <strong>{{ group.field }}</strong
                      >: {{ group.value }}
                      <span class="group-count">({{ group.count }})</span>
                    </td>
                  }
                </tr>

                @if (!isGroupCollapsed(group.key)) {
                  @for (row of group.items; track getKey(row, $index); let i = $index) {
                    <tr
                      [class]="'grid-row ' + getRowCustomClass(row)"
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
                        <td
                          class="grid-td grid-td-reorder pinned-left"
                          [class.pinned-left-last]="isRowReorderableLastPinned()"
                          style="left:0px; text-align:center; width:44px"
                        >
                          <span
                            class="row-drag-handle"
                            draggable="true"
                            (dragstart)="onRowDragStart($event, i)"
                            (dragend)="onRowDragEnd()"
                            [attr.title]="i18n.grid.dragRowToReorder"
                            [attr.aria-label]="i18n.grid.dragRowToReorder"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              style="display: block;"
                            >
                              <circle cx="9" cy="5" r="1.5"></circle>
                              <circle cx="9" cy="12" r="1.5"></circle>
                              <circle cx="9" cy="19" r="1.5"></circle>
                              <circle cx="15" cy="5" r="1.5"></circle>
                              <circle cx="15" cy="12" r="1.5"></circle>
                              <circle cx="15" cy="19" r="1.5"></circle>
                            </svg>
                          </span>
                        </td>
                      }

                      @if (showDetailToggle()) {
                        <td
                          class="grid-td grid-td-toggle pinned-left"
                          [class.pinned-left-last]="isDetailToggleLastPinned()"
                          [style.left.px]="rowReorderable() ? 44 : 0"
                        >
                          <button
                            class="toggle-btn"
                            [class.expanded]="isExpanded(row)"
                            type="button"
                            (click)="toggleDetail(row); $event.stopPropagation()"
                            [attr.title]="i18n.grid.toggleDetails"
                            [attr.aria-label]="i18n.grid.toggleDetails"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="12"
                              height="12"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="3.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              class="chevron-icon"
                            >
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        </td>
                      }

                      @if (selectable()) {
                        <td
                          class="grid-td grid-td-check pinned-left"
                          [class.pinned-left-last]="isSelectableLastPinned()"
                          [style.left.px]="(rowReorderable() ? 44 : 0) + (showDetailToggle() ? 44 : 0)"
                        >
                          <input
                            type="checkbox"
                            [attr.aria-label]="i18n.grid.selectRow(rowSelectionKey(row))"
                            [checked]="isRowSelected(row)"
                            (change)="toggleRow(row)"
                            (click)="$event.stopPropagation()"
                          />
                        </td>
                      }

                      @if (rowTemplate()) {
                        <td class="grid-td" [attr.colspan]="orderedColumns().length + (editable() ? 1 : 0)">
                          <ng-container
                            *ngTemplateOutlet="
                              rowTemplate();
                              context: {
                                $implicit: row,
                                row: row,
                                index: i,
                                editing: isEditing(row),
                                expanded: isExpanded(row),
                              }
                            "
                          />
                        </td>
                      } @else {
                        @for (col of orderedColumns(); track col.field) {
                          @if (getCellRowSpan(row, col.field, i, group.items) > 0) {
                            <td
                              class="grid-td"
                              [attr.rowspan]="getCellRowSpan(row, col.field, i, group.items)"
                              [class.pinned-left]="col.pinned === 'left'"
                              [class.pinned-left-last]="col.pinned === 'left' && lastPinnedColumnField() === col.field"
                              [class.pinned-right]="col.pinned === 'right'"
                              [class.pinned-right-first]="
                                col.pinned === 'right' && firstPinnedRightColumnField() === col.field
                              "
                              [class.cell-focused]="focusedCell()?.row === row && focusedCell()?.colField === col.field"
                              [attr.tabindex]="
                                keyboardNavigation() || enableContextMenu()
                                  ? focusedCell()?.row === row && focusedCell()?.colField === col.field
                                    ? 0
                                    : -1
                                  : null
                              "
                              [class.cell-focused-editing]="
                                focusedCell()?.row === row &&
                                focusedCell()?.colField === col.field &&
                                focusedCellEditActive()
                              "
                              [style.left.px]="col.pinned === 'left' ? columnOffsets()[col.field] : null"
                              [style.right.px]="col.pinned === 'right' ? columnRightOffsets()[col.field] : null"
                              [style.text-align]="col.align ?? 'left'"
                              [style.width.px]="getColumnWidth(col)"
                              [class.cell-selected]="isCellSelected(row, col.field)"
                              (mousedown)="onCellMouseDown($event, row, col.field)"
                              (mouseenter)="onCellMouseEnter(row, col.field)"
                              (contextmenu)="onCellContextMenu($event, row, col.field)"
                              (click)="onCellClick(row, col.field, $event)"
                            >
                              @if (isEditing(row) && editable() && col.editable) {
                                @if (resolveEditCellTemplate(col); as activeEditTemplate) {
                                  <ng-container
                                    *ngTemplateOutlet="
                                      activeEditTemplate;
                                      context: {
                                        $implicit: getDraftValue(row, col.field),
                                        value: getCellValue(row, col.field),
                                        row: row,
                                        column: col,
                                        index: i,
                                        editing: true,
                                        draftValue: getDraftValue(row, col.field),
                                        updateDraft: getUpdateDraftCallback(col.field),
                                      }
                                    "
                                  />
                                } @else {
                                  <input
                                    class="grid-edit-input"
                                    [value]="toStringSafe(getDraftValue(row, col.field))"
                                    (input)="updateDraft(col.field, $any($event.target).value)"
                                    (click)="$event.stopPropagation()"
                                  />
                                }
                              } @else if (resolveCellTemplate(col)) {
                                <ng-container
                                  *ngTemplateOutlet="
                                    resolveCellTemplate(col)!;
                                    context: {
                                      $implicit: getCellValue(row, col.field),
                                      value: getCellValue(row, col.field),
                                      row: row,
                                      column: col,
                                      index: i,
                                      editing: isEditing(row),
                                    }
                                  "
                                />
                              } @else {
                                @if (showGlobalSearch() && searchText()) {
                                  <span [innerHTML]="highlightSearchText(getCellValue(row, col.field))"></span>
                                } @else {
                                  {{ getCellValue(row, col.field) }}
                                }
                              }
                            </td>
                          }
                        }

                        @if (editable()) {
                          <td
                            class="grid-td grid-actions"
                            [class.pinned-right]="firstPinnedRightColumnField() !== null"
                            [class.pinned-right-first]="firstPinnedRightColumnField() === null"
                            [style.right.px]="firstPinnedRightColumnField() !== null ? 0 : null"
                            style="width:120px"
                          >
                            @if (!isEditing(row)) {
                              <button
                                class="action-btn"
                                type="button"
                                (click)="beginEdit(row, i); $event.stopPropagation()"
                              >
                                Edit
                              </button>
                            } @else {
                              <button
                                class="action-btn save"
                                type="button"
                                (click)="saveEdit(row, i); $event.stopPropagation()"
                              >
                                Save
                              </button>
                              <button class="action-btn" type="button" (click)="cancelEdit(); $event.stopPropagation()">
                                Cancel
                              </button>
                            }
                          </td>
                        }
                      }
                    </tr>

                    @if (showDetailToggle() && detailRowTemplate()) {
                      <tr class="grid-detail-row" [class.expanded]="isExpanded(row)">
                        <td [attr.colspan]="renderColumnCount()" class="grid-detail-cell">
                          <div class="detail-wrapper" [class.expanded]="isExpanded(row)">
                            <ng-container
                              *ngTemplateOutlet="
                                detailRowTemplate();
                                context: {
                                  $implicit: row,
                                  row: row,
                                  index: i,
                                }
                              "
                            />
                          </div>
                        </td>
                      </tr>
                    }
                  }
                }
              }
            } @else {
              @if (virtualScroll()) {
                <tr [style.height.px]="startIndex() * rowHeight()">
                  <td [attr.colspan]="renderColumnCount()" style="padding:0; border:none; height: inherit;"></td>
                </tr>
              }
              @for (
                row of virtualScroll() ? visibleRows() : flatRenderedRows();
                track getKey(row, $index);
                let i = $index
              ) {
                @let actualIndex = virtualScroll() ? startIndex() + i : i;
                <tr
                  [class]="'grid-row ' + getRowCustomClass(row)"
                  [class.selected]="isRowSelected(row)"
                  [class.dragging-row]="draggingRowIndex() === actualIndex"
                  [class.drag-over-row]="dragOverRowIndex() === actualIndex"
                  [style.transform]="getRowTranslation(actualIndex)"
                  (dragover)="onRowDragOver($event, actualIndex)"
                  (drop)="onRowDrop($event, actualIndex)"
                  (dragend)="onRowDragEnd()"
                  (click)="onRowClick(row, actualIndex)"
                  (dblclick)="editable() ? beginEdit(row, actualIndex) : null"
                >
                  @if (rowReorderable()) {
                    <td
                      class="grid-td grid-td-reorder pinned-left"
                      [class.pinned-left-last]="isRowReorderableLastPinned()"
                      style="left:0px; text-align:center; width:44px"
                    >
                      <span
                        class="row-drag-handle"
                        draggable="true"
                        (dragstart)="onRowDragStart($event, actualIndex)"
                        (dragend)="onRowDragEnd()"
                        [attr.title]="i18n.grid.dragRowToReorder"
                        [attr.aria-label]="i18n.grid.dragRowToReorder"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          style="display: block;"
                        >
                          <circle cx="9" cy="5" r="1.5"></circle>
                          <circle cx="9" cy="12" r="1.5"></circle>
                          <circle cx="9" cy="19" r="1.5"></circle>
                          <circle cx="15" cy="5" r="1.5"></circle>
                          <circle cx="15" cy="12" r="1.5"></circle>
                          <circle cx="15" cy="19" r="1.5"></circle>
                        </svg>
                      </span>
                    </td>
                  }

                  @if (showDetailToggle()) {
                    <td
                      class="grid-td grid-td-toggle pinned-left"
                      [class.pinned-left-last]="isDetailToggleLastPinned()"
                      [style.left.px]="rowReorderable() ? 44 : 0"
                    >
                      <button
                        class="toggle-btn"
                        [class.expanded]="isExpanded(row)"
                        type="button"
                        (click)="toggleDetail(row); $event.stopPropagation()"
                        [attr.title]="i18n.grid.toggleDetails"
                        [attr.aria-label]="i18n.grid.toggleDetails"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="12"
                          height="12"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="chevron-icon"
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </td>
                  }

                  @if (selectable()) {
                    <td
                      class="grid-td grid-td-check pinned-left"
                      [class.pinned-left-last]="isSelectableLastPinned()"
                      [style.left.px]="(rowReorderable() ? 44 : 0) + (showDetailToggle() ? 44 : 0)"
                    >
                      <input
                        type="checkbox"
                        [attr.aria-label]="i18n.grid.selectRow(rowSelectionKey(row))"
                        [checked]="isRowSelected(row)"
                        (change)="toggleRow(row)"
                        (click)="$event.stopPropagation()"
                      />
                    </td>
                  }

                  @if (rowTemplate()) {
                    <td class="grid-td" [attr.colspan]="orderedColumns().length + (editable() ? 1 : 0)">
                      <ng-container
                        *ngTemplateOutlet="
                          rowTemplate();
                          context: {
                            $implicit: row,
                            row: row,
                            index: actualIndex,
                            editing: isEditing(row),
                            expanded: isExpanded(row),
                          }
                        "
                      />
                    </td>
                  } @else {
                    @for (col of orderedColumns(); track col.field) {
                      @if (getCellRowSpan(row, col.field, actualIndex) > 0) {
                        <td
                          class="grid-td"
                          [attr.rowspan]="getCellRowSpan(row, col.field, actualIndex)"
                          [class.pinned-left]="col.pinned === 'left'"
                          [class.pinned-left-last]="col.pinned === 'left' && lastPinnedColumnField() === col.field"
                          [class.pinned-right]="col.pinned === 'right'"
                          [class.pinned-right-first]="
                            col.pinned === 'right' && firstPinnedRightColumnField() === col.field
                          "
                          [class.cell-focused]="focusedCell()?.row === row && focusedCell()?.colField === col.field"
                          [attr.tabindex]="
                            keyboardNavigation() || enableContextMenu()
                              ? focusedCell()?.row === row && focusedCell()?.colField === col.field
                                ? 0
                                : -1
                              : null
                          "
                          [class.cell-focused-editing]="
                            focusedCell()?.row === row &&
                            focusedCell()?.colField === col.field &&
                            focusedCellEditActive()
                          "
                          [style.left.px]="col.pinned === 'left' ? columnOffsets()[col.field] : null"
                          [style.right.px]="col.pinned === 'right' ? columnRightOffsets()[col.field] : null"
                          [style.text-align]="col.align ?? 'left'"
                          [style.width.px]="getColumnWidth(col)"
                          [class.cell-selected]="isCellSelected(row, col.field)"
                          (mousedown)="onCellMouseDown($event, row, col.field)"
                          (mouseenter)="onCellMouseEnter(row, col.field)"
                          (contextmenu)="onCellContextMenu($event, row, col.field)"
                          (click)="onCellClick(row, col.field, $event)"
                        >
                          @if (isEditing(row) && editable() && col.editable) {
                            @if (resolveEditCellTemplate(col); as activeEditTemplate) {
                              <ng-container
                                *ngTemplateOutlet="
                                  activeEditTemplate;
                                  context: {
                                    $implicit: getDraftValue(row, col.field),
                                    value: getCellValue(row, col.field),
                                    row: row,
                                    column: col,
                                    index: actualIndex,
                                    editing: true,
                                    draftValue: getDraftValue(row, col.field),
                                    updateDraft: getUpdateDraftCallback(col.field),
                                  }
                                "
                              />
                            } @else {
                              <input
                                class="grid-edit-input"
                                [value]="toStringSafe(getDraftValue(row, col.field))"
                                (input)="updateDraft(col.field, $any($event.target).value)"
                                (click)="$event.stopPropagation()"
                              />
                            }
                          } @else if (resolveCellTemplate(col)) {
                            <ng-container
                              *ngTemplateOutlet="
                                resolveCellTemplate(col)!;
                                context: {
                                  $implicit: getCellValue(row, col.field),
                                  value: getCellValue(row, col.field),
                                  row: row,
                                  column: col,
                                  index: actualIndex,
                                  editing: isEditing(row),
                                }
                              "
                            />
                          } @else {
                            @if (showGlobalSearch() && searchText()) {
                              <span [innerHTML]="highlightSearchText(getCellValue(row, col.field))"></span>
                            } @else {
                              {{ getCellValue(row, col.field) }}
                            }
                          }
                        </td>
                      }
                    }

                    @if (editable()) {
                      <td
                        class="grid-td grid-actions"
                        [class.pinned-right]="firstPinnedRightColumnField() !== null"
                        [class.pinned-right-first]="firstPinnedRightColumnField() === null"
                        [style.right.px]="firstPinnedRightColumnField() !== null ? 0 : null"
                        style="width:120px"
                      >
                        @if (!isEditing(row)) {
                          <button
                            class="action-btn"
                            type="button"
                            (click)="beginEdit(row, actualIndex); $event.stopPropagation()"
                          >
                            Edit
                          </button>
                        } @else {
                          <button
                            class="action-btn save"
                            type="button"
                            (click)="saveEdit(row, actualIndex); $event.stopPropagation()"
                          >
                            Save
                          </button>
                          <button class="action-btn" type="button" (click)="cancelEdit(); $event.stopPropagation()">
                            Cancel
                          </button>
                        }
                      </td>
                    }
                  }
                </tr>

                @if (showDetailToggle() && detailRowTemplate()) {
                  <tr class="grid-detail-row" [class.expanded]="isExpanded(row)">
                    <td [attr.colspan]="renderColumnCount()" class="grid-detail-cell">
                      <div class="detail-wrapper" [class.expanded]="isExpanded(row)">
                        <ng-container
                          *ngTemplateOutlet="
                            detailRowTemplate();
                            context: {
                              $implicit: row,
                              row: row,
                              index: actualIndex,
                            }
                          "
                        />
                      </div>
                    </td>
                  </tr>
                }
              }
              @if (virtualScroll()) {
                <tr [style.height.px]="(flatRenderedRows().length - endIndex()) * rowHeight()">
                  <td [attr.colspan]="renderColumnCount()" style="padding:0; border:none; height: inherit;"></td>
                </tr>
              }
            }
          </tbody>
          @if (hasAggregation()) {
            <tfoot>
              <tr class="grid-footer-row">
                @if (rowReorderable()) {
                  <td
                    class="grid-td-reorder pinned-left"
                    [class.pinned-left-last]="isRowReorderableLastPinned()"
                    style="left:0px; width:44px"
                  ></td>
                }
                @if (showDetailToggle()) {
                  <td
                    class="grid-td-toggle pinned-left"
                    [class.pinned-left-last]="isDetailToggleLastPinned()"
                    [style.left.px]="rowReorderable() ? 44 : 0"
                    style="width:44px"
                  ></td>
                }
                @if (selectable()) {
                  <td
                    class="grid-td-check pinned-left"
                    [class.pinned-left-last]="isSelectableLastPinned()"
                    [style.left.px]="(rowReorderable() ? 44 : 0) + (showDetailToggle() ? 44 : 0)"
                    style="width:44px"
                  ></td>
                }
                @for (col of orderedColumns(); track col.field) {
                  <td
                    class="grid-td grid-footer-cell"
                    [class.pinned-left]="col.pinned === 'left'"
                    [class.pinned-left-last]="col.pinned === 'left' && lastPinnedColumnField() === col.field"
                    [class.pinned-right]="col.pinned === 'right'"
                    [class.pinned-right-first]="col.pinned === 'right' && firstPinnedRightColumnField() === col.field"
                    [style.left.px]="col.pinned === 'left' ? columnOffsets()[col.field] : null"
                    [style.right.px]="col.pinned === 'right' ? columnRightOffsets()[col.field] : null"
                    [style.text-align]="col.align ?? 'left'"
                    [style.width.px]="getColumnWidth(col)"
                  >
                    @if (resolveFooterTemplate(col); as activeFooterTemplate) {
                      <ng-container
                        *ngTemplateOutlet="
                          activeFooterTemplate;
                          context: {
                            $implicit: col,
                            column: col,
                            aggregationValue: getAggregationValue(col),
                            data: flatRenderedRows(),
                          }
                        "
                      />
                    } @else if (col.aggregation) {
                      <span class="agg-label">{{ col.aggregation }}: </span>
                      <strong class="agg-value">{{ getAggregationValue(col) }}</strong>
                    }
                  </td>
                }
                @if (editable()) {
                  <td
                    [class.pinned-right]="firstPinnedRightColumnField() !== null"
                    [class.pinned-right-first]="firstPinnedRightColumnField() === null"
                    [style.right.px]="firstPinnedRightColumnField() !== null ? 0 : null"
                  ></td>
                }
              </tr>
            </tfoot>
          }
        </table>
      </div>

      @if (showPager()) {
        <div class="grid-pagination">
          <div class="pagination-left">
            <span class="page-info">
              {{ i18n.pagination.page }}
              <strong class="page-info-highlight">{{ pagerRangeStart() }}–{{ pagerRangeEnd() }}</strong>
              {{ i18n.pagination.of }} <strong class="page-info-highlight">{{ totalItems() }}</strong>
            </span>
            <div class="page-size-selector">
              <span class="page-size-label">{{ i18n.pagination.itemsPerPage }}:</span>
              <select
                [value]="internalPageSize()"
                (change)="changePageSize(+$any($event.target).value)"
                class="page-size-select"
              >
                <option [value]="5">5</option>
                <option [value]="8">8</option>
                <option [value]="10">10</option>
                <option [value]="20">20</option>
                <option [value]="50">50</option>
                <option [value]="100">100</option>
              </select>
            </div>
          </div>
          <div class="page-btns">
            <button
              class="page-btn ctrl"
              [disabled]="currentPage() === 1"
              (click)="goPage(1)"
              [title]="i18n.pagination.firstPage"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
              </svg>
            </button>
            <button
              class="page-btn ctrl"
              [disabled]="currentPage() === 1"
              (click)="goPage(currentPage() - 1)"
              [title]="i18n.pagination.previousPage"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div class="page-numbers">
              @for (p of pageNumbers(); track p) {
                <button class="page-btn number" [class.active]="p === currentPage()" (click)="goPage(p)">
                  {{ p }}
                </button>
              }
            </div>

            <button
              class="page-btn ctrl"
              [disabled]="currentPage() === totalPages()"
              (click)="goPage(currentPage() + 1)"
              [title]="i18n.pagination.nextPage"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <button
              class="page-btn ctrl"
              [disabled]="currentPage() === totalPages()"
              (click)="goPage(totalPages())"
              [title]="i18n.pagination.lastPage"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            </button>
          </div>
        </div>
      }

      <!-- Excel-Style Filter Popover Overlay -->
      @if (activeFilterPopover(); as pop) {
        <div
          class="grid-filter-popover"
          role="dialog"
          [attr.aria-label]="i18n.grid.filterColumn + ': ' + getColumnTitle(pop.field)"
          [style.top.px]="pop.top"
          [style.left.px]="pop.left"
          (click)="$event.stopPropagation()"
        >
          <div class="popover-section pinning-section">
            <label class="popover-label">{{ i18n.grid.pinColumn }}</label>
            <div class="pinning-actions">
              <button
                class="pin-btn"
                [class.active]="getColumnPinnedState(pop.field) === 'left'"
                [attr.aria-pressed]="getColumnPinnedState(pop.field) === 'left'"
                (click)="pinColumnPopover(pop.field, 'left')"
                type="button"
              >
                {{ i18n.grid.pinLeft }}
              </button>
              <button
                class="pin-btn"
                [class.active]="getColumnPinnedState(pop.field) === 'right'"
                [attr.aria-pressed]="getColumnPinnedState(pop.field) === 'right'"
                (click)="pinColumnPopover(pop.field, 'right')"
                type="button"
              >
                {{ i18n.grid.pinRight }}
              </button>
              <button
                class="pin-btn"
                [class.active]="getColumnPinnedState(pop.field) === null"
                [attr.aria-pressed]="getColumnPinnedState(pop.field) === null"
                (click)="pinColumnPopover(pop.field, null)"
                type="button"
              >
                {{ i18n.grid.noPin }}
              </button>
            </div>
          </div>

          <div class="popover-section text-filter-section">
            <label class="popover-label">{{ i18n.grid.textFilter }}</label>
            <div class="text-filter-row">
              <select
                class="popover-select"
                [value]="tempFilterOperator()"
                (change)="tempFilterOperator.set($any($event.target).value)"
              >
                <option value="contains">{{ i18n.grid.contains }}</option>
                <option value="eq">{{ i18n.grid.equals }}</option>
                <option value="startsWith">{{ i18n.grid.startsWith }}</option>
                <option value="endsWith">{{ i18n.grid.endsWith }}</option>
              </select>
              <input
                class="popover-input"
                type="text"
                [value]="tempFilterValue()"
                (input)="tempFilterValue.set($any($event.target).value)"
                [placeholder]="i18n.grid.filterPlaceholder"
              />
            </div>
          </div>

          <div class="popover-section checklist-section">
            <label class="popover-label">{{ i18n.grid.checklistFilter }}</label>
            <input
              class="checklist-search"
              type="text"
              [value]="filterSearchQuery()"
              (input)="filterSearchQuery.set($any($event.target).value)"
              [placeholder]="i18n.common.search"
            />
            <div class="checklist-actions">
              <label class="checklist-item select-all">
                <input
                  type="checkbox"
                  [checked]="tempSelectedValues().size === getFilteredDistinctValues(pop.field).length"
                  [indeterminate]="
                    tempSelectedValues().size > 0 &&
                    tempSelectedValues().size < getFilteredDistinctValues(pop.field).length
                  "
                  (change)="toggleSelectAllChecklist()"
                />
                <span>({{ i18n.grid.selectAll }})</span>
              </label>
            </div>
            <div class="checklist-scroll">
              @for (val of getFilteredDistinctValues(pop.field); track val) {
                <label class="checklist-item">
                  <input
                    type="checkbox"
                    [checked]="tempSelectedValues().has(val)"
                    (change)="toggleChecklistItem(val)"
                  />
                  <span>{{ val }}</span>
                </label>
              }
            </div>
          </div>

          <div class="popover-footer">
            <button class="popover-btn clear" (click)="clearPopoverFilter()">{{ i18n.datePicker.clear }}</button>
            <div class="footer-actions">
              <button class="popover-btn cancel" (click)="closeFilterPopover()">
                {{ i18n.common.cancel }}
              </button>
              <button class="popover-btn apply" (click)="applyPopoverFilter()">{{ i18n.grid.apply }}</button>
            </div>
          </div>
        </div>
      }

      <!-- Column Chooser Popover Overlay -->
      @if (activeColumnChooserPopover(); as pop) {
        <div
          [id]="instanceId + '-column-chooser'"
          class="grid-column-chooser-popover"
          role="region"
          [attr.aria-label]="i18n.grid.chooseColumns"
          [style.top.px]="pop.top"
          [style.left.px]="pop.left"
          (click)="$event.stopPropagation()"
        >
          <div class="popover-section checklist-section" style="border-top: none; padding-top: 0;">
            <span class="popover-label">{{ i18n.grid.visibleColumns }}</span>
            <div class="checklist-scroll">
              @for (col of columns(); track col.field) {
                <div class="column-config-item">
                  <label class="checklist-item">
                    <input
                      #firstColumnToggle
                      type="checkbox"
                      [checked]="!hiddenColumns().has(col.field)"
                      [disabled]="!hiddenColumns().has(col.field) && visibleColumnsCount() === 1"
                      (change)="toggleColumnVisibility(col.field)"
                    />
                    <span>{{ col.title }}</span>
                  </label>
                  <div class="column-config-actions">
                    <button
                      class="column-config-btn"
                      type="button"
                      [attr.aria-label]="i18n.grid.pinLeft + ': ' + col.title"
                      [attr.aria-pressed]="getColumnPinnedState(col.field) === 'left'"
                      [title]="i18n.grid.pinLeft"
                      (click)="pinColumnPopover(col.field, 'left')"
                    >
                      ⇤
                    </button>
                    <button
                      class="column-config-btn"
                      type="button"
                      [attr.aria-label]="i18n.grid.pinRight + ': ' + col.title"
                      [attr.aria-pressed]="getColumnPinnedState(col.field) === 'right'"
                      [title]="i18n.grid.pinRight"
                      (click)="pinColumnPopover(col.field, 'right')"
                    >
                      ⇥
                    </button>
                    <button
                      class="column-config-btn"
                      type="button"
                      [attr.aria-label]="i18n.grid.noPin + ': ' + col.title"
                      [attr.aria-pressed]="getColumnPinnedState(col.field) === null"
                      [title]="i18n.grid.noPin"
                      (click)="pinColumnPopover(col.field, null)"
                    >
                      ×
                    </button>
                    <button
                      class="column-config-btn"
                      type="button"
                      [attr.aria-label]="i18n.grid.moveColumnLeft(col.title)"
                      [title]="i18n.grid.moveColumnLeft(col.title)"
                      [disabled]="columnIndex(col.field) === 0"
                      (click)="moveColumn(col.field, -1)"
                    >
                      ←
                    </button>
                    <button
                      class="column-config-btn"
                      type="button"
                      [attr.aria-label]="i18n.grid.moveColumnRight(col.title)"
                      [title]="i18n.grid.moveColumnRight(col.title)"
                      [disabled]="columnIndex(col.field) === columns().length - 1"
                      (click)="moveColumn(col.field, 1)"
                    >
                      →
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
          <div class="popover-footer">
            <button class="popover-btn apply" type="button" (click)="closeColumnChooser()">
              {{ i18n.grid.closeColumnChooser }}
            </button>
          </div>
        </div>
      }

      <!-- Custom Context Menu Overlay -->
      @if (activeContextMenu(); as menu) {
        <div
          class="grid-context-menu"
          role="group"
          [attr.aria-label]="i18n.grid.contextMenu"
          [style.top.px]="menu.y"
          [style.left.px]="menu.x"
          (click)="$event.stopPropagation()"
        >
          <button class="menu-item" [disabled]="!selectedCellStart()" (click)="contextMenuCopy()">
            <span class="menu-icon">📋</span> Copy Selection
          </button>
          <div class="menu-divider"></div>
          @if (showDetailToggle() && detailRowTemplate() && menu.row) {
            <button class="menu-item" (click)="contextMenuToggleDetail(menu.row)">
              <span class="menu-icon">🔍</span> {{ isExpanded(menu.row) ? 'Collapse Details' : 'Expand Details' }}
            </button>
            <button class="menu-item" (click)="expandAllDetails()">
              <span class="menu-icon">📂</span> Expand All Details
            </button>
            <button class="menu-item" (click)="collapseAllDetails()">
              <span class="menu-icon">📁</span> Collapse All Details
            </button>
            <div class="menu-divider"></div>
          }
          @if (getColumnDef(menu.colField); as columnDef) {
            @if (columnDef.groupable) {
              @if (internalGroupBy()?.field === menu.colField) {
                <button class="menu-item" (click)="contextMenuClearGrouping()">
                  <span class="menu-icon">📁</span> Clear Grouping
                </button>
              } @else {
                <button class="menu-item" (click)="contextMenuGroupBy(menu.colField)">
                  <span class="menu-icon">🗂️</span> Group by {{ columnDef.title }}
                </button>
              }
            }
          }
          @if (hasGrouping()) {
            <button class="menu-item" (click)="expandAllGroups()">
              <span class="menu-icon">↕️</span> Expand All Groups
            </button>
            <button class="menu-item" (click)="collapseAllGroups()">
              <span class="menu-icon">⋯</span> Collapse All Groups
            </button>
          }
          <div class="menu-divider"></div>
          <button class="menu-item" (click)="contextMenuTogglePin(menu.colField)">
            <span class="menu-icon">📌</span> {{ isColumnPinned(menu.colField) ? 'Unpin Column' : 'Pin Column Left' }}
          </button>
          <button class="menu-item" (click)="contextMenuHideColumn(menu.colField)">
            <span class="menu-icon">👁️</span> Hide Column
          </button>
          <div class="menu-divider"></div>
          <button class="menu-item" [disabled]="filterStates().size === 0" (click)="contextMenuClearFilters()">
            <span class="menu-icon">🧹</span> Clear All Filters
          </button>
          <div class="menu-divider"></div>
          <button class="menu-item" (click)="exportToJson(); closeContextMenu()">
            <span class="menu-icon">📄</span> Export to JSON
          </button>
          <button class="menu-item" (click)="exportToCsv(); closeContextMenu()">
            <span class="menu-icon">📊</span> Export to CSV
          </button>
          <button class="menu-item" (click)="exportToExcel(); closeContextMenu()">
            <span class="menu-icon">📈</span> Export to Excel
          </button>
          <button class="menu-item" (click)="exportToPdf(); closeContextMenu()">
            <span class="menu-icon">📕</span> Export to PDF
          </button>
        </div>
      }

      <!-- Status Bar -->
      <ngx-grid-status-bar [aggregates]="selectionAggregates()" [visible]="showStatusBar()" />

      <!-- Advanced Filter Builder Overlay -->
      @if (isFilterBuilderOpen()) {
        <ngx-grid-filter-builder
          [gridInstanceId]="instanceId"
          [columns]="$any(columns())"
          [expression]="internalFilterExpression()"
          (expressionChange)="onFilterExpressionChange($event)"
          (close)="closeFilterBuilder()"
        />
      }
    </div>
  `,
  styleUrl: './data-grid.component.scss',
})
export class DataGridComponent<T extends object = Record<string, unknown>> implements OnInit {
  private static nextInstanceId = 0;
  readonly instanceId = `ngx-data-grid-${DataGridComponent.nextInstanceId++}`;

  @ContentChildren(NgxGridCellTemplateDirective) cellTemplates!: QueryList<NgxGridCellTemplateDirective>;
  @ContentChildren(NgxGridEditCellTemplateDirective) editCellTemplates!: QueryList<NgxGridEditCellTemplateDirective>;
  @ContentChildren(NgxGridHeaderTemplateDirective) headerTemplates!: QueryList<NgxGridHeaderTemplateDirective>;
  @ContentChildren(NgxGridFooterTemplateDirective) footerTemplates!: QueryList<NgxGridFooterTemplateDirective>;

  /**
   * The tabular dataset to render in the grid.
   */
  data = input<T[]>([]);

  /**
   * The column definition metadata specifying header labels, fields, sorting/filtering settings, and templates.
   */
  columns = input<GridColumnDef<T>[]>([]);

  stateKey = input<string>('');
  reorderable = input<boolean>(false);
  multiSort = input<boolean>(false);
  columnReorder = output<{ columns: GridColumnDef<T>[] }>();
  rowReorderable = input<boolean>(false);
  showGlobalSearch = input<boolean>(false);
  globalSearchPlaceholder = input<string>('Search...');
  rowReorder = output<{ previousIndex: number; currentIndex: number; data: T[] }>();

  // Enterprise feature inputs & outputs
  showStatusBar = input<boolean>(false);
  showFilterBuilder = input<boolean>(false);
  treeData = input<TreeDataConfig | null>(null);
  pinnedTopRows = input<T[]>([]);
  pinnedBottomRows = input<T[]>([]);
  infiniteScroll = input<boolean>(false);
  filterExpression = input<FilterExpression | null>(null);
  filterExpressionChange = output<FilterExpression | null>();
  infiniteScrollLoad = output<GridInfiniteScrollEvent>();

  // Injected services
  private xlsxExportService = inject(GridExportXlsxService);

  // Filter builder state
  isFilterBuilderOpen = signal<boolean>(false);
  private filterBuilderTrigger: HTMLElement | null = null;
  internalFilterExpression = signal<FilterExpression | null>(null);

  /** Live selection aggregates for status bar */
  selectionAggregates = computed<GridStatusBarAggregates>(() => {
    const selectedText = this.getSelectedCellsText();
    if (!selectedText) {
      const selRows = this.selectedRows();
      return { count: selRows.size, sum: null, average: null, min: null, max: null };
    }
    const numbers = selectedText
      .split(/[\t\n]/)
      .map(str => str.trim())
      .filter(str => str !== '' && !isNaN(Number(str)))
      .map(str => Number(str));

    const count = numbers.length;
    if (count === 0) return { count: 0, sum: null, average: null, min: null, max: null };
    const sum = numbers.reduce((a, b) => a + b, 0);
    const average = sum / count;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    return { count, sum, average, min, max };
  });

  onFilterExpressionChange(expr: FilterExpression | null): void {
    this.internalFilterExpression.set(expr);
    this.filterExpressionChange.emit(expr);
  }

  exportToXlsx(filename = 'grid-data.xlsx'): void {
    this.xlsxExportService.exportToXlsx(this.clientFilteredData(), this.columns() as GridColumnDef<T>[], filename, {
      groupBy: this.internalGroupBy(),
    });
  }

  /**
   * Number of rows to render per page in paginated mode.
   * @default 10
   */
  pageSize = input<number>(10);

  /**
   * The current active 1-indexed page number.
   * @default 1
   */
  page = input<number>(1);

  total = input<number>(0);

  /**
   * Whether row selection is enabled.
   * @default false
   */
  selectable = input<boolean>(false);

  striped = input<boolean>(true);
  loading = input<boolean>(false);

  /**
   * Whether inline cell/row editing is enabled.
   * @default false
   */
  editable = input<boolean>(false);

  sortMode = input<'client' | 'server'>('client');
  filterMode = input<'client' | 'server'>('client');
  groupMode = input<'client' | 'server'>('client');
  pagingMode = input<'client' | 'server'>('client');

  groupBy = input<GridGroupState | null>(null);
  groupedData = input<GridGroupResult<T>[]>([]);

  headerTemplate = input<TemplateRef<GridHeaderTemplateContext<T>> | null>(null);
  cellTemplate = input<TemplateRef<GridCellTemplateContext<T>> | null>(null);
  editCellTemplate = input<TemplateRef<GridCellTemplateContext<T>> | null>(null);
  rowTemplate = input<TemplateRef<GridRowTemplateContext<T>> | null>(null);
  detailRowTemplate = input<TemplateRef<GridDetailTemplateContext<T>> | null>(null);
  footerTemplate = input<TemplateRef<GridFooterTemplateContext<T>> | null>(null);

  rowClick = output<GridRowClickEvent<T>>();
  selectionChange = output<T[]>();
  sortChange = output<GridSortChangeEvent>();
  filterChange = output<GridFilterChangeEvent>();
  groupChange = output<GridGroupChangeEvent>();
  pageChange = output<GridPageChangeEvent>();
  dataStateChange = output<GridDataStateChangeEvent>();
  rowUpdate = output<GridRowUpdateEvent<T>>();

  // New Enterprise Features
  showColumnChooser = input<boolean>(false);
  cellSelection = input<boolean>(false);
  cellSelectionChange = output<{ start: { row: T; colField: string }; end: { row: T; colField: string } } | null>();
  enableContextMenu = input<boolean>(false);
  keyboardNavigation = input<boolean>(false);
  groupAggregations = input<boolean>(false);
  showGroupingPanel = input<boolean>(false);
  rowClass = input<((row: T) => string) | null>(null);
  compact = input<boolean>(false);

  /**
   * Whether to render only the visible rows using high-performance row virtualization.
   * Useful when rendering large datasets (1,000+ items).
   * @default false
   */
  virtualScroll = input<boolean>(false);

  /**
   * The height of each row in pixels. Required for virtual scrolling viewport calculations.
   * @default 49
   */
  rowHeight = input<number>(49);

  sortState = signal<GridSortState | null>(null);
  currentPage = signal(1);
  selectedRows = signal<Set<string>>(new Set());
  selectionAnnouncement = signal('');
  expandedRows = signal<Set<string>>(new Set());
  collapsedGroups = signal<Set<string>>(new Set());
  editingRowKey = signal<string | null>(null);
  editingDraft = signal<Record<string, unknown>>({});
  internalPageSize = signal<number>(10);
  internalGroupBy = signal<GridGroupState | null>(null);
  isGroupingPanelDragOver = signal<boolean>(false);

  scrollTop = signal<number>(0);
  viewportHeight = signal<number>(400);

  startIndex = computed(() => {
    if (!this.virtualScroll()) return 0;
    return Math.max(0, Math.floor(this.scrollTop() / this.rowHeight()) - 3);
  });

  endIndex = computed(() => {
    const totalCount = this.flatRenderedRows().length;
    if (!this.virtualScroll()) return totalCount;
    return Math.min(totalCount, Math.ceil((this.scrollTop() + this.viewportHeight()) / this.rowHeight()) + 3);
  });

  visibleRows = computed(() => {
    const rendered = this.flatRenderedRows();
    if (!this.virtualScroll()) return rendered;
    return rendered.slice(this.startIndex(), this.endIndex());
  });

  // Enterprise Extensions
  i18n = inject(NGX_CORE_I18N);
  private injector = inject(Injector);
  private elementRef = inject(ElementRef);
  destroyRef = inject(DestroyRef);
  private gridExportService = inject(GridExportService);
  columnWidths = signal<Record<string, number>>({});
  filterStates = signal<Map<string, GridFilterState>>(new Map());
  sortStates = signal<GridSortState[]>([]);
  columnOrder = signal<string[]>([]);

  // Column Chooser state
  hiddenColumns = signal<Set<string>>(new Set());
  activeColumnChooserPopover = signal<{ top: number; left: number } | null>(null);
  visibleColumnsCount = computed(() => this.columns().length - this.hiddenColumns().size);

  // Cell Selection state
  selectedCellStart = signal<{ row: T; colField: string } | null>(null);
  selectedCellEnd = signal<{ row: T; colField: string } | null>(null);
  isCellDragging = signal<boolean>(false);

  // Context Menu state
  activeContextMenu = signal<{ x: number; y: number; row: T | null; colField: string | null } | null>(null);
  columnPinnedOverrides = signal<Record<string, 'left' | 'right' | null>>({});

  // Keyboard Navigation state
  focusedCell = signal<{ row: T; colField: string } | null>(null);
  focusedCellEditActive = signal<boolean>(false);

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
  private filterPopoverTrigger: HTMLElement | null = null;
  private contextMenuTrigger: HTMLElement | null = null;
  tempFilterValue = signal<string>('');
  tempFilterOperator = signal<'contains' | 'startsWith' | 'endsWith' | 'eq'>('contains');
  tempSelectedValues = signal<Set<string>>(new Set());
  filterSearchQuery = signal<string>('');

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
      const externalPageSize = this.pageSize();
      untracked(() => this.internalPageSize.set(externalPageSize));
    });

    effect(() => {
      const externalGroupBy = this.groupBy();
      untracked(() => this.internalGroupBy.set(externalGroupBy));
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

    // Initialize hidden columns from definitions
    effect(
      () => {
        const cols = this.columns();
        untracked(() => {
          const currentHidden = this.hiddenColumns();
          if (currentHidden.size === 0 && !this.stateKey()) {
            const initialHidden = new Set<string>();
            cols.forEach(c => {
              if (c.hidden) {
                initialHidden.add(c.field);
              }
            });
            if (initialHidden.size > 0) {
              this.hiddenColumns.set(initialHidden);
            }
          }
        });
      },
      { allowSignalWrites: true }
    );

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
        searchText: this.searchText(),
        hiddenColumns: Array.from(this.hiddenColumns()),
        columnPinnedOverrides: this.columnPinnedOverrides(),
      };
      try {
        localStorage.setItem(`ngx_grid_state_${key}`, JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to save grid state to localStorage', e);
      }
    });

    // Window event listeners for closing popovers and copy behavior
    if (typeof window !== 'undefined') {
      const clickListener = () => {
        this.closeFilterPopover(false);
        this.closeColumnChooser(false);
        this.closeContextMenu(false);
      };
      const mouseUpListener = () => {
        if (this.isCellDragging()) {
          this.isCellDragging.set(false);
        }
      };
      const keydownListener = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (this.activeFilterPopover()) this.closeFilterPopover();
          if (this.activeColumnChooserPopover()) this.closeColumnChooser();
          if (this.isFilterBuilderOpen()) this.closeFilterBuilder();
          if (this.activeContextMenu()) this.closeContextMenu();
        }
        if (!this.cellSelection()) return;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
          const start = this.selectedCellStart();
          const end = this.selectedCellEnd();
          if (!start || !end) return;

          const text = this.getSelectedCellsText();
          if (text) {
            e.preventDefault();
            navigator.clipboard.writeText(text).catch(err => {
              console.error('Failed to copy grid cell range to clipboard', err);
            });
          }
        }
      };

      window.addEventListener('click', clickListener);
      window.addEventListener('mouseup', mouseUpListener);
      window.addEventListener('keydown', keydownListener);

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('click', clickListener);
        window.removeEventListener('mouseup', mouseUpListener);
        window.removeEventListener('keydown', keydownListener);
      });
    }
  }

  ngOnInit(): void {
    this.internalPageSize.set(this.pageSize());
    this.internalGroupBy.set(this.groupBy());
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
        if (state.hiddenColumns) {
          this.hiddenColumns.set(new Set(state.hiddenColumns));
        }
        if (state.columnPinnedOverrides) {
          this.columnPinnedOverrides.set(state.columnPinnedOverrides);
        }
      }
    } catch (e) {
      console.warn('Failed to load grid state from localStorage', e);
    }
  }

  orderedColumns = computed(() => {
    const cols = this.columns();
    const order = this.columnOrder();
    const hidden = this.hiddenColumns();
    const pinOverrides = this.columnPinnedOverrides();

    let mapped = cols
      .filter(c => !hidden.has(c.field))
      .map(c => {
        const pinOverride = pinOverrides[c.field];
        if (pinOverride !== undefined) {
          return { ...c, pinned: pinOverride === null ? undefined : pinOverride };
        }
        return c;
      });

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

    const pinnedLeft = mapped.filter(c => c.pinned === 'left');
    const pinnedRight = mapped.filter(c => c.pinned === 'right');
    const normal = mapped.filter(c => c.pinned !== 'left' && c.pinned !== 'right');
    return [...pinnedLeft, ...normal, ...pinnedRight];
  });

  hasPinnedColumns = computed(() => this.orderedColumns().some(c => c.pinned === 'left' || c.pinned === 'right'));

  lastPinnedColumnField = computed(() => {
    const pinned = this.orderedColumns().filter(c => c.pinned === 'left');
    return pinned.length > 0 ? pinned[pinned.length - 1].field : null;
  });

  isSelectableLastPinned = computed(() => {
    const hasPinnedCols = this.orderedColumns().some(c => c.pinned === 'left');
    return this.selectable() && !hasPinnedCols;
  });

  isDetailToggleLastPinned = computed(() => {
    const hasPinnedCols = this.orderedColumns().some(c => c.pinned === 'left');
    return this.showDetailToggle() && !this.selectable() && !hasPinnedCols;
  });

  isRowReorderableLastPinned = computed(() => {
    const hasPinnedCols = this.orderedColumns().some(c => c.pinned === 'left');
    return this.rowReorderable() && !this.showDetailToggle() && !this.selectable() && !hasPinnedCols;
  });

  firstPinnedRightColumnField = computed(() => {
    const pinned = this.orderedColumns().filter(c => c.pinned === 'right');
    return pinned.length > 0 ? pinned[0].field : null;
  });

  columnRightOffsets = computed(() => {
    const offsets: Record<string, number> = {};
    let currentOffset = 0;

    if (this.editable()) {
      offsets['__actions'] = currentOffset;
      currentOffset += 120;
    }

    const cols = this.orderedColumns();
    for (let i = cols.length - 1; i >= 0; i--) {
      const col = cols[i];
      if (col.pinned === 'right') {
        offsets[col.field] = currentOffset;
        currentOffset += this.getColumnWidth(col) ?? 120;
      }
    }
    return offsets;
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

  hasColumnCategories = computed(() => {
    return this.orderedColumns().some(c => !!c.category);
  });

  headerRows = computed(() => {
    const cols = this.orderedColumns();
    const hasCat = this.hasColumnCategories();
    if (!hasCat) {
      return {
        row1: cols.map(c => ({
          title: c.title,
          column: c,
          colSpan: 1,
          rowSpan: 1,
          isCategory: false,
          field: c.field,
          pinned: c.pinned,
          leftOffset: c.pinned === 'left' ? this.columnOffsets()[c.field] : null,
          rightOffset: c.pinned === 'right' ? this.columnRightOffsets()[c.field] : null,
          isPinnedLast: c.pinned === 'left' && this.lastPinnedColumnField() === c.field,
          isPinnedFirst: c.pinned === 'right' && this.firstPinnedRightColumnField() === c.field,
        })),
        row2: [] as any[],
      };
    }

    const row1: any[] = [];
    const row2: any[] = [];

    let i = 0;
    while (i < cols.length) {
      const col = cols[i];
      if (!col.category) {
        row1.push({
          title: col.title,
          column: col,
          colSpan: 1,
          rowSpan: 2,
          isCategory: false,
          field: col.field,
          pinned: col.pinned,
          leftOffset: col.pinned === 'left' ? this.columnOffsets()[col.field] : null,
          rightOffset: col.pinned === 'right' ? this.columnRightOffsets()[col.field] : null,
          isPinnedLast: col.pinned === 'left' && this.lastPinnedColumnField() === col.field,
          isPinnedFirst: col.pinned === 'right' && this.firstPinnedRightColumnField() === col.field,
        });
        i++;
      } else {
        const cat = col.category;
        const startIdx = i;
        while (i < cols.length && cols[i].category === cat && cols[i].pinned === col.pinned) {
          const currentCol = cols[i];
          row2.push({
            title: currentCol.title,
            column: currentCol,
            colSpan: 1,
            rowSpan: 1,
            isCategory: false,
            field: currentCol.field,
            pinned: currentCol.pinned,
            leftOffset: currentCol.pinned === 'left' ? this.columnOffsets()[currentCol.field] : null,
            rightOffset: currentCol.pinned === 'right' ? this.columnRightOffsets()[currentCol.field] : null,
            isPinnedLast: currentCol.pinned === 'left' && this.lastPinnedColumnField() === currentCol.field,
            isPinnedFirst: currentCol.pinned === 'right' && this.firstPinnedRightColumnField() === currentCol.field,
          });
          i++;
        }
        const groupCount = i - startIdx;
        const lastColInGroup = cols[i - 1];
        row1.push({
          title: cat,
          colSpan: groupCount,
          rowSpan: 1,
          isCategory: true,
          pinned: col.pinned,
          leftOffset: col.pinned === 'left' ? this.columnOffsets()[col.field] : null,
          rightOffset: col.pinned === 'right' ? this.columnRightOffsets()[lastColInGroup.field] : null,
          isPinnedLast: col.pinned === 'left' && this.lastPinnedColumnField() === lastColInGroup.field,
          isPinnedFirst: col.pinned === 'right' && this.firstPinnedRightColumnField() === col.field,
          field: `__cat_${cat}_${startIdx}`,
        });
      }
    }

    return { row1, row2 };
  });

  hasFilterableColumns = computed(() => this.columns().some(column => column.filterable));
  isAnyServerMode = computed(
    () =>
      this.sortMode() === 'server' ||
      this.filterMode() === 'server' ||
      this.groupMode() === 'server' ||
      this.pagingMode() === 'server'
  );
  showDetailToggle = computed(() => this.detailRowTemplate() !== null);

  activeFilters = computed<GridFilterState[]>(() => Array.from(this.filterStates().values()));

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
    const pageSize = Math.max(1, this.internalPageSize());
    return Math.max(1, Math.ceil(this.totalItems() / pageSize));
  });

  flatRenderedRows = computed(() => {
    if (this.hasGrouping()) {
      return [] as T[];
    }

    if (this.pagingMode() === 'server') {
      return this.data();
    }

    const pageSize = Math.max(1, this.internalPageSize());
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

    const group = this.internalGroupBy();
    if (!group) {
      return [];
    }

    const source = this.pagingMode() === 'server' ? this.data() : this.paginateRows(this.baseFlatData());

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
    return (this.currentPage() - 1) * this.internalPageSize() + 1;
  });

  pagerRangeEnd = computed(() => {
    if (this.totalItems() === 0) {
      return 0;
    }
    return Math.min(this.currentPage() * this.internalPageSize(), this.totalItems());
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

  renderColumnCount = computed(
    () =>
      this.orderedColumns().length +
      (this.selectable() ? 1 : 0) +
      (this.showDetailToggle() ? 1 : 0) +
      (this.rowReorderable() ? 1 : 0) +
      (this.editable() ? 1 : 0)
  );

  showPager = computed(() => this.totalItems() > 0);

  renderedRowsList = computed(() => {
    if (this.hasGrouping()) {
      const list: T[] = [];
      this.groupedRows().forEach(group => {
        if (!this.isGroupCollapsed(group.key)) {
          list.push(...group.items);
        }
      });
      return list;
    }
    return this.flatRenderedRows();
  });

  isCellSelected(row: T, colField: string): boolean {
    const start = this.selectedCellStart();
    const end = this.selectedCellEnd();
    if (!start || !end) return false;

    const rows = this.renderedRowsList();
    const cols = this.orderedColumns();

    const startRowIndex = rows.indexOf(start.row);
    const endRowIndex = rows.indexOf(end.row);
    const rowIndex = rows.indexOf(row);

    const startColIndex = cols.findIndex(c => c.field === start.colField);
    const endColIndex = cols.findIndex(c => c.field === end.colField);
    const colIndex = cols.findIndex(c => c.field === colField);

    if (
      startRowIndex === -1 ||
      endRowIndex === -1 ||
      rowIndex === -1 ||
      startColIndex === -1 ||
      endColIndex === -1 ||
      colIndex === -1
    ) {
      return false;
    }

    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);

    return rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol;
  }

  onCellContextMenu(event: MouseEvent, row: T, colField: string): void {
    if (!this.enableContextMenu()) return;
    event.preventDefault();
    event.stopPropagation();

    const gridEl = this.elementRef.nativeElement.querySelector('.ngx-data-grid') as HTMLElement;
    const gridRect = gridEl.getBoundingClientRect();
    const x = event.clientX - gridRect.left;
    const y = event.clientY - gridRect.top;

    this.closeFilterPopover(false);
    this.closeColumnChooser(false);
    this.focusedCell.set({ row, colField });
    this.contextMenuTrigger = event.currentTarget as HTMLElement;
    this.activeContextMenu.set({
      x: Math.min(x, gridRect.width - 190),
      y,
      row,
      colField,
    });
    afterNextRender(
      () =>
        (this.elementRef.nativeElement as HTMLElement)
          .querySelector<HTMLElement>('.grid-context-menu .menu-item:not(:disabled)')
          ?.focus(),
      { injector: this.injector }
    );
  }

  closeContextMenu(restoreFocus = true): void {
    this.activeContextMenu.set(null);
    const trigger = this.contextMenuTrigger;
    this.contextMenuTrigger = null;
    if (restoreFocus) trigger?.focus();
  }

  isColumnPinned(field: string | null): boolean {
    if (!field) return false;
    const pinOverride = this.columnPinnedOverrides()[field];
    if (pinOverride !== undefined) {
      return pinOverride === 'left';
    }
    const col = this.columns().find(c => c.field === field);
    return col?.pinned === 'left';
  }

  contextMenuTogglePin(field: string | null): void {
    if (!field) return;
    const currentlyPinned = this.isColumnPinned(field);
    const overrides = { ...this.columnPinnedOverrides() };
    overrides[field] = currentlyPinned ? null : 'left';
    this.columnPinnedOverrides.set(overrides);
    this.closeContextMenu();
  }

  contextMenuHideColumn(field: string | null): void {
    if (field) {
      this.toggleColumnVisibility(field);
    }
    this.closeContextMenu();
  }

  contextMenuClearFilters(): void {
    this.filterStates.set(new Map());
    this.currentPage.set(1);
    this.filterChange.emit({ filters: [] });
    this.emitDataState();
    this.closeContextMenu();
  }

  contextMenuCopy(): void {
    const text = this.getSelectedCellsText();
    if (text) {
      navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy to clipboard', err);
      });
    }
    this.closeContextMenu();
  }

  onCellMouseDown(event: MouseEvent, row: T, colField: string): void {
    if (!this.cellSelection()) return;
    if (event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (
      target &&
      (target.closest('.grid-edit-input') ||
        target.closest('.action-btn') ||
        target.closest('.toggle-btn') ||
        target.closest('input[type="checkbox"]'))
    ) {
      return;
    }

    event.preventDefault();

    this.selectedCellStart.set({ row, colField });
    this.selectedCellEnd.set({ row, colField });
    this.isCellDragging.set(true);

    this.cellSelectionChange.emit({
      start: { row, colField },
      end: { row, colField },
    });
  }

  onCellMouseEnter(row: T, colField: string): void {
    if (!this.cellSelection() || !this.isCellDragging()) return;

    this.selectedCellEnd.set({ row, colField });

    const start = this.selectedCellStart();
    if (start) {
      this.cellSelectionChange.emit({
        start,
        end: { row, colField },
      });
    }
  }

  openColumnChooser(event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeColumnChooserPopover()) {
      this.closeColumnChooser();
      return;
    }

    this.closeFilterPopover(false);

    const buttonEl = event.currentTarget as HTMLElement;
    const gridEl = this.elementRef.nativeElement.querySelector('.ngx-data-grid') as HTMLElement;
    const buttonRect = buttonEl.getBoundingClientRect();
    const gridRect = gridEl.getBoundingClientRect();

    const top = buttonRect.bottom - gridRect.top;
    const left = buttonRect.left - gridRect.left;

    this.activeColumnChooserPopover.set({
      top,
      left: Math.max(8, Math.min(left, gridRect.width - 368)),
    });
    afterNextRender(
      () =>
        (
          (this.elementRef.nativeElement as HTMLElement).querySelector(
            `#${this.instanceId}-column-chooser input[type="checkbox"]`
          ) as HTMLInputElement | null
        )?.focus(),
      { injector: this.injector }
    );
  }

  closeColumnChooser(restoreFocus = true): void {
    this.activeColumnChooserPopover.set(null);
    if (restoreFocus) {
      const trigger = (this.elementRef.nativeElement as HTMLElement).querySelector(
        `[aria-controls="${this.instanceId}-column-chooser"]`
      ) as HTMLButtonElement | null;
      trigger?.focus();
    }
  }

  openFilterBuilder(event: MouseEvent): void {
    this.filterBuilderTrigger = event.currentTarget as HTMLElement;
    this.isFilterBuilderOpen.set(true);
    afterNextRender(
      () => (this.elementRef.nativeElement as HTMLElement).querySelector<HTMLElement>('.filter-builder-panel')?.focus(),
      { injector: this.injector }
    );
  }

  closeFilterBuilder(): void {
    this.isFilterBuilderOpen.set(false);
    const trigger = this.filterBuilderTrigger;
    this.filterBuilderTrigger = null;
    trigger?.focus();
  }

  columnIndex(field: string): number {
    return this.fullColumnOrder().indexOf(field);
  }

  moveColumn(field: string, direction: -1 | 1): void {
    const order = this.fullColumnOrder();
    const index = order.indexOf(field);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return;

    [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
    this.columnOrder.set(order);
    const columnsByField = new Map(this.columns().map(column => [column.field, column]));
    const reorderedColumns = order
      .map(columnField => columnsByField.get(columnField))
      .filter((column): column is GridColumnDef<T> => column !== undefined);
    this.columnReorder.emit({ columns: reorderedColumns });
  }

  private fullColumnOrder(): string[] {
    const fields = this.columns().map(column => column.field);
    const currentOrder = this.columnOrder().filter(field => fields.includes(field));
    return [...currentOrder, ...fields.filter(field => !currentOrder.includes(field))];
  }

  toggleColumnVisibility(field: string): void {
    const hidden = new Set(this.hiddenColumns());
    if (hidden.has(field)) {
      hidden.delete(field);
    } else {
      if (hidden.size < this.columns().length - 1) {
        hidden.add(field);
      }
    }
    this.hiddenColumns.set(hidden);
  }

  getSelectedCellsText(): string | null {
    const start = this.selectedCellStart();
    const end = this.selectedCellEnd();
    if (!start || !end) return null;

    const rows = this.renderedRowsList();
    const cols = this.orderedColumns();

    const startRowIndex = rows.indexOf(start.row);
    const endRowIndex = rows.indexOf(end.row);

    const startColIndex = cols.findIndex(c => c.field === start.colField);
    const endColIndex = cols.findIndex(c => c.field === end.colField);

    if (startRowIndex === -1 || endRowIndex === -1 || startColIndex === -1 || endColIndex === -1) {
      return null;
    }

    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);

    const selectedCols = cols.slice(minCol, maxCol + 1);

    const textLines: string[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      if (r >= 0 && r < rows.length) {
        const rowData = rows[r];
        const rowValues = selectedCols.map(col => {
          const val = this.getCellValue(rowData, col.field);
          return val !== null && val !== undefined ? String(val) : '';
        });
        textLines.push(rowValues.join('\t'));
      }
    }

    return textLines.join('\n');
  }

  getFilter(field: string): string {
    return this.filterStates().get(field)?.value ?? '';
  }

  exportToJson(): void {
    this.gridExportService.exportToJson(this.baseFlatData());
  }

  exportToCsv(): void {
    this.gridExportService.exportToCsv(
      this.baseFlatData(),
      this.orderedColumns(),
      'grid-data.csv',
      this.internalGroupBy()
    );
  }

  exportToExcel(): void {
    this.gridExportService.exportToExcel(
      this.baseFlatData(),
      this.orderedColumns(),
      'grid-data.xls',
      this.internalGroupBy()
    );
  }

  exportToPdf(): void {
    this.gridExportService.exportToPdf(
      this.baseFlatData(),
      this.orderedColumns(),
      'Data Grid Export',
      this.internalGroupBy()
    );
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
        [this.resizingField!]: newWidth,
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

  onResizeDoubleClick(event: MouseEvent, col: GridColumnDef<T>): void {
    event.stopPropagation();
    event.preventDefault();
    this.autoSizeColumn(col);
  }

  autoSizeColumn(col: GridColumnDef<T>): void {
    const colField = col.field;
    let longestText = '';

    if (col.title && col.title.length > longestText.length) {
      longestText = col.title;
    }

    const rows = this.clientFilteredData();
    for (const row of rows) {
      const val = this.getCellValue(row, colField);
      const strVal = val != null ? String(val) : '';
      if (strVal.length > longestText.length) {
        longestText = strVal;
      }
    }

    const padding = col.filterable ? 44 : 24;
    const computedWidth = Math.max(60, Math.min(600, longestText.length * 8 + padding));

    this.columnWidths.update(widths => ({
      ...widths,
      [colField]: computedWidth,
    }));
  }

  getColumnPinnedState(field: string): 'left' | 'right' | null {
    const override = this.columnPinnedOverrides()[field];
    if (override !== undefined) {
      return override;
    }
    const col = this.columns().find(c => c.field === field);
    return col?.pinned ?? null;
  }

  pinColumnPopover(field: string, pin: 'left' | 'right' | null): void {
    const nextOverrides = { ...this.columnPinnedOverrides(), [field]: pin };
    this.columnPinnedOverrides.set(nextOverrides);
  }

  getRowCustomClass(row: T): string {
    const fn = this.rowClass();
    return fn ? fn(row) : '';
  }

  openFilterPopover(event: MouseEvent, field: string): void {
    event.stopPropagation();
    if (this.activeFilterPopover()?.field === field) {
      this.closeFilterPopover(false);
      return;
    }

    this.filterSearchQuery.set('');

    const current = this.filterStates().get(field);
    this.tempFilterValue.set(current?.value ?? '');
    this.tempFilterOperator.set((current?.operator === 'in' ? 'contains' : current?.operator) ?? 'contains');

    const distinct = this.getDistinctValues(field);
    if (current?.selectedValues) {
      this.tempSelectedValues.set(new Set(current.selectedValues));
    } else {
      this.tempSelectedValues.set(new Set(distinct));
    }

    const buttonEl = event.currentTarget as HTMLElement;
    this.filterPopoverTrigger = buttonEl;
    const gridEl = this.elementRef.nativeElement.querySelector('.ngx-data-grid') as HTMLElement;
    const buttonRect = buttonEl.getBoundingClientRect();
    const gridRect = gridEl.getBoundingClientRect();

    const top = buttonRect.bottom - gridRect.top;
    const left = buttonRect.left - gridRect.left;

    this.activeFilterPopover.set({
      field,
      top,
      left: Math.min(left, gridRect.width - 260),
    });
    afterNextRender(
      () =>
        (this.elementRef.nativeElement as HTMLElement)
          .querySelector<HTMLSelectElement>('.grid-filter-popover select')
          ?.focus(),
      { injector: this.injector }
    );
  }

  closeFilterPopover(restoreFocus = true): void {
    this.activeFilterPopover.set(null);
    const trigger = this.filterPopoverTrigger;
    this.filterPopoverTrigger = null;
    if (restoreFocus) trigger?.focus();
  }

  getDistinctValues(field: string): string[] {
    const vals = new Set<string>();
    this.data().forEach(row => {
      const val = (row as Record<string, unknown>)[field];
      vals.add(val == null || val === '' ? '(Blank)' : String(val));
    });
    return Array.from(vals).sort();
  }

  getFilteredDistinctValues(field: string): string[] {
    const distinct = this.getDistinctValues(field);
    const search = this.filterSearchQuery().trim().toLowerCase();
    if (!search) return distinct;
    return distinct.filter(v => v.toLowerCase().includes(search));
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
    const distinct = this.getFilteredDistinctValues(pop.field);
    const current = new Set(this.tempSelectedValues());
    const allSelected = distinct.every(val => current.has(val));

    if (allSelected) {
      distinct.forEach(val => current.delete(val));
    } else {
      distinct.forEach(val => current.add(val));
    }
    this.tempSelectedValues.set(current);
  }

  applyPopoverFilter(): void {
    const pop = this.activeFilterPopover();
    if (!pop) return;

    const field = pop.field;
    const distinct = this.getDistinctValues(field);
    const selected = this.tempSelectedValues();
    let filterState: GridFilterState | null = null;

    if (this.tempFilterValue()) {
      filterState = { field, value: this.tempFilterValue(), operator: this.tempFilterOperator() };
    } else if (selected.size < distinct.length) {
      filterState = { field, value: '', operator: 'in', selectedValues: Array.from(selected) };
    }

    const nextStates = new Map(this.filterStates());
    if (filterState) nextStates.set(field, filterState);
    else nextStates.delete(field);

    this.filterStates.set(nextStates);
    this.currentPage.set(1);
    this.closeFilterPopover();
    this.filterChange.emit({ filters: this.activeFilters() });
    this.emitDataState();
  }

  clearPopoverFilter(): void {
    const pop = this.activeFilterPopover();
    if (!pop) return;

    const nextStates = new Map(this.filterStates());
    nextStates.delete(pop.field);
    this.filterStates.set(nextStates);
    this.currentPage.set(1);
    this.closeFilterPopover();
    this.filterChange.emit({ filters: this.activeFilters() });
    this.emitDataState();
  }

  clearAllFilters(): void {
    this.filterStates.set(new Map());
    this.currentPage.set(1);
    this.closeFilterPopover(false);
    this.filterChange.emit({ filters: [] });
    this.emitDataState();
  }

  hasAggregation = computed(() => this.columns().some(col => col.aggregation));

  getAggregationValue(col: GridColumnDef<T>): string {
    const rows = this.clientFilteredData();
    if (rows.length === 0) return '-';

    const values = rows
      .map(r => {
        const val = (r as Record<string, unknown>)[col.field];
        return typeof val === 'number' ? val : Number(val);
      })
      .filter(v => !isNaN(v));

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

  onGroupingPanelDragOver(event: DragEvent): void {
    const field = this.draggingField();
    if (!field) return;
    const col = this.columns().find(c => c.field === field);
    if (col && col.groupable) {
      event.preventDefault();
      this.isGroupingPanelDragOver.set(true);
    }
  }

  onGroupingPanelDragLeave(event: DragEvent): void {
    this.isGroupingPanelDragOver.set(false);
  }

  onGroupingPanelDrop(event: DragEvent): void {
    event.preventDefault();
    this.isGroupingPanelDragOver.set(false);
    const field = this.draggingField();
    if (field) {
      const col = this.columns().find(c => c.field === field);
      if (col && col.groupable) {
        const newGroup = { field, dir: 'asc' as const };
        this.internalGroupBy.set(newGroup);
        this.groupChange.emit({ group: newGroup });
        this.emitDataState();
      }
    }
    this.draggingField.set(null);
  }

  clearGrouping(): void {
    this.internalGroupBy.set(null);
    this.groupChange.emit({ group: null });
    this.emitDataState();
  }

  getColumnTitle(field: string): string {
    const col = this.columns().find(c => c.field === field);
    return col ? col.title : field;
  }

  onDragStart(event: DragEvent, col: GridColumnDef<T>): void {
    if (!this.reorderable() && !col.groupable) return;
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
      const currentOrder = this.columnOrder().length > 0 ? [...this.columnOrder()] : this.columns().map(c => c.field);

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
          data: currentData,
        });
      }
    }
    this.draggingRowIndex.set(null);
    this.dragOverRowIndex.set(null);
  }

  onViewportScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (target && this.virtualScroll()) {
      this.scrollTop.set(target.scrollTop);
      this.viewportHeight.set(target.clientHeight || 400);
    }
  }

  onRowDragEnd(): void {
    this.draggingRowIndex.set(null);
    this.dragOverRowIndex.set(null);
  }

  getRowTranslation(index: number): string {
    const draggingIdx = this.draggingRowIndex();
    const dragOverIdx = this.dragOverRowIndex();

    if (draggingIdx === null || dragOverIdx === null || draggingIdx === dragOverIdx) {
      return '';
    }

    // Disable sliding transforms in grouped mode as group segments render hierarchically.
    if (this.groupedRows().length > 0) {
      return '';
    }

    const rowHeight = 49;

    if (draggingIdx < dragOverIdx) {
      if (index > draggingIdx && index <= dragOverIdx) {
        return `translateY(-${rowHeight}px)`;
      }
      if (index === draggingIdx) {
        return `translateY(${(dragOverIdx - draggingIdx) * rowHeight}px)`;
      }
    } else if (draggingIdx > dragOverIdx) {
      if (index >= dragOverIdx && index < draggingIdx) {
        return `translateY(${rowHeight}px)`;
      }
      if (index === draggingIdx) {
        return `translateY(-${(draggingIdx - dragOverIdx) * rowHeight}px)`;
      }
    }

    return '';
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
    this.pageChange.emit({ page: safePage, pageSize: this.internalPageSize() });
    this.emitDataState();
  }

  changePageSize(size: number): void {
    this.internalPageSize.set(size);
    this.currentPage.set(1);
    this.pageChange.emit({ page: 1, pageSize: size });
    this.emitDataState();
  }

  getColumnDef(field: string | null): GridColumnDef<T> | null {
    if (!field) return null;
    return this.columns().find(c => c.field === field) ?? null;
  }

  contextMenuGroupBy(field: string | null): void {
    if (!field) return;
    const groupState = { field, dir: 'asc' as const };
    this.internalGroupBy.set(groupState);
    this.groupChange.emit({ group: groupState });
    this.emitDataState(groupState);
    this.closeContextMenu();
  }

  contextMenuClearGrouping(): void {
    this.internalGroupBy.set(null);
    this.groupChange.emit({ group: null });
    this.emitDataState(null);
    this.closeContextMenu();
  }

  collapseAllGroups(): void {
    const keys = this.groupedRows().map(g => g.key);
    this.collapsedGroups.set(new Set(keys));
    this.closeContextMenu();
  }

  expandAllGroups(): void {
    this.collapsedGroups.set(new Set());
    this.closeContextMenu();
  }

  contextMenuToggleDetail(row: T): void {
    this.toggleDetail(row);
    this.closeContextMenu();
  }

  expandAllDetails(): void {
    const keys = this.flatRenderedRows().map(r => this.keyOf(r));
    this.expandedRows.set(new Set(keys));
    this.closeContextMenu();
  }

  collapseAllDetails(): void {
    this.expandedRows.set(new Set());
    this.closeContextMenu();
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
    this.selectionAnnouncement.set(this.i18n.grid.selectedRows(next.size));
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
    this.selectionAnnouncement.set(this.i18n.grid.selectedRows(next.size));
    this.selectionChange.emit(this.resolveSelectedRows(next));
  }

  rowSelectionKey(row: T): string {
    return this.keyOf(row);
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
    return Object.prototype.hasOwnProperty.call(draft, field) ? draft[field] : (row as Record<string, unknown>)[field];
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
    if (column.headerTemplate) {
      return column.headerTemplate;
    }
    const match = this.headerTemplates?.find(t => t.columnField === column.field);
    if (match) {
      return match.templateRef;
    }
    return this.headerTemplate();
  }

  resolveCellTemplate(column: GridColumnDef<T>): TemplateRef<GridCellTemplateContext<T>> | null {
    if (column.cellTemplate) {
      return column.cellTemplate;
    }
    const match = this.cellTemplates?.find(t => t.columnField === column.field);
    if (match) {
      return match.templateRef;
    }
    return this.cellTemplate();
  }

  resolveEditCellTemplate(column: GridColumnDef<T>): TemplateRef<GridCellTemplateContext<T>> | null {
    if (column.editCellTemplate) {
      return column.editCellTemplate;
    }
    const match = this.editCellTemplates?.find(t => t.columnField === column.field);
    if (match) {
      return match.templateRef;
    }
    return this.editCellTemplate();
  }

  resolveFooterTemplate(column: GridColumnDef<T>): TemplateRef<GridFooterTemplateContext<T>> | null {
    if (column.footerTemplate) {
      return column.footerTemplate;
    }
    const match = this.footerTemplates?.find(t => t.columnField === column.field);
    if (match) {
      return match.templateRef;
    }
    return this.footerTemplate();
  }

  getUpdateDraftCallback(field: string): (val: unknown) => void {
    return (val: unknown) => this.updateDraft(field, val);
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

  hasGrouping(): boolean {
    return this.internalGroupBy() !== null;
  }

  private paginateRows(rows: T[]): T[] {
    if (this.pagingMode() === 'server') {
      return rows;
    }

    const pageSize = Math.max(1, this.internalPageSize());
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
      pageSize: this.internalPageSize(),
      sort: this.sortState(),
      filters: this.activeFilters(),
      group: overrideGroup === undefined ? this.internalGroupBy() : overrideGroup,
    });
  }

  onCellClick(row: T, colField: string, event?: MouseEvent): void {
    if (!this.keyboardNavigation()) return;
    this.focusCell(row, colField);
    this.focusedCellEditActive.set(this.isEditing(row));
    (event?.currentTarget as HTMLElement | null)?.focus();
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.keyboardNavigation()) return;

    const target = event.target instanceof HTMLElement ? event.target : this.elementRef.nativeElement;
    const grid = this.elementRef.nativeElement as HTMLElement;
    const editInput = target.closest('.grid-edit-input');
    if (target !== grid && !target.closest('.grid-td') && !editInput) return;
    if (target.closest('button, input, select, textarea, [contenteditable="true"]') && !editInput) return;

    const key = event.key;
    const focused = this.focusedCell();
    if (!focused) {
      if (target === grid && ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        const rows = this.flatRenderedRows();
        const cols = this.orderedColumns();
        if (rows.length > 0 && cols.length > 0) {
          this.focusCell(rows[0], cols[0].field);
          event.preventDefault();
        }
      }
      return;
    }

    const rows = this.flatRenderedRows();
    const cols = this.orderedColumns();
    const rowIndex = rows.indexOf(focused.row);
    const colIndex = cols.findIndex(c => c.field === focused.colField);

    if (rowIndex === -1 || colIndex === -1) return;
    const isRtl = this.elementRef.nativeElement.closest('[dir="rtl"]') !== null;

    if (this.focusedCellEditActive()) {
      if (key === 'Enter') {
        this.saveEdit(focused.row, rowIndex);
        this.focusedCellEditActive.set(false);
        if (rowIndex < rows.length - 1) {
          this.focusCell(rows[rowIndex + 1], focused.colField);
        }
        event.preventDefault();
      } else if (key === 'Escape') {
        this.cancelEdit();
        this.focusedCellEditActive.set(false);
        this.focusCell(focused.row, focused.colField);
        event.preventDefault();
      }
      return;
    }

    switch (key) {
      case 'ArrowUp':
        if (rowIndex > 0) {
          this.focusCell(rows[rowIndex - 1], focused.colField);
          event.preventDefault();
        }
        break;
      case 'ArrowDown':
        if (rowIndex < rows.length - 1) {
          this.focusCell(rows[rowIndex + 1], focused.colField);
          event.preventDefault();
        }
        break;
      case 'ArrowLeft': {
        const nextColIndex = isRtl ? colIndex + 1 : colIndex - 1;
        if (nextColIndex >= 0 && nextColIndex < cols.length) {
          this.focusCell(focused.row, cols[nextColIndex].field);
          event.preventDefault();
        }
        break;
      }
      case 'ArrowRight': {
        const nextColIndex = isRtl ? colIndex - 1 : colIndex + 1;
        if (nextColIndex >= 0 && nextColIndex < cols.length) {
          this.focusCell(focused.row, cols[nextColIndex].field);
          event.preventDefault();
        }
        break;
      }
      case 'Tab': {
        const nextRowIndex = event.shiftKey
          ? colIndex === 0
            ? rowIndex - 1
            : rowIndex
          : colIndex === cols.length - 1
            ? rowIndex + 1
            : rowIndex;
        const nextColIndex = event.shiftKey
          ? colIndex === 0
            ? cols.length - 1
            : colIndex - 1
          : colIndex === cols.length - 1
            ? 0
            : colIndex + 1;
        if (nextRowIndex >= 0 && nextRowIndex < rows.length) {
          this.focusCell(rows[nextRowIndex], cols[nextColIndex].field);
          event.preventDefault();
        } else {
          this.focusedCell.set(null);
        }
        break;
      }
      case 'Enter': {
        const col = cols[colIndex];
        if (this.editable() && col.editable) {
          this.beginEdit(focused.row, rowIndex);
          this.focusedCellEditActive.set(true);
          setTimeout(() => {
            const inputEl = grid.querySelector('.grid-edit-input') as HTMLInputElement | null;
            inputEl?.focus();
          }, 0);
          event.preventDefault();
        }
        break;
      }
      case 'Escape':
        this.focusedCell.set(null);
        grid.focus();
        event.preventDefault();
        break;
      default:
        if (key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
          const currentCol = cols[colIndex];
          if (this.editable() && currentCol.editable) {
            this.beginEdit(focused.row, rowIndex);
            this.focusedCellEditActive.set(true);
            this.updateDraft(focused.colField, key);
            setTimeout(() => {
              const inputEl = grid.querySelector('.grid-edit-input') as HTMLInputElement | null;
              if (inputEl) {
                inputEl.focus();
                inputEl.value = key;
              }
            }, 0);
            event.preventDefault();
          }
        }
        break;
    }
  }

  private focusCell(row: T, colField: string): void {
    this.focusedCell.set({ row, colField });
    setTimeout(() => {
      const focusedCell = this.elementRef.nativeElement.querySelector('.grid-td.cell-focused') as HTMLElement | null;
      focusedCell?.focus();
    }, 0);
  }

  getCellRowSpan(row: T, colField: string, rowIndex: number, groupItems?: T[]): number {
    const col = this.columns().find(c => c.field === colField);
    if (!col || !col.mergeRows) {
      return 1;
    }

    const items = groupItems ? groupItems : this.flatRenderedRows();
    const currentValue = this.getCellValue(row, colField);

    if (rowIndex > 0) {
      const prevValue = this.getCellValue(items[rowIndex - 1], colField);
      if (prevValue === currentValue) {
        return 0;
      }
    }

    let span = 1;
    for (let i = rowIndex + 1; i < items.length; i++) {
      if (this.getCellValue(items[i], colField) === currentValue) {
        span++;
      } else {
        break;
      }
    }
    return span;
  }

  isGroupAllSelected(group: GridGroupResult<T>): boolean {
    const rows = group.items;
    if (rows.length === 0) return false;
    const selected = this.selectedRows();
    return rows.every(row => selected.has(this.keyOf(row)));
  }

  toggleGroupSelection(group: GridGroupResult<T>, event: Event): void {
    event.stopPropagation();
    const checked = (event.target as HTMLInputElement).checked;
    const selected = new Set(this.selectedRows());
    group.items.forEach(row => {
      const key = this.keyOf(row);
      if (checked) {
        selected.add(key);
      } else {
        selected.delete(key);
      }
    });
    this.selectedRows.set(selected);
    this.selectionChange.emit(this.resolveSelectedRows(selected));
  }

  getGroupAggregationValue(group: GridGroupResult<T>, col: GridColumnDef<T>): string {
    const rows = group.items;
    if (rows.length === 0) return '-';

    const values = rows
      .map(r => {
        const val = (r as Record<string, unknown>)[col.field];
        return typeof val === 'number' ? val : Number(val);
      })
      .filter(v => !isNaN(v));

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
}
