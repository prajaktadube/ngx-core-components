/*
 * Public API Surface — secondary entry point: ngx-core-components/grid
 */

// ─── Core Component & Directives ──────────────────────────────────────────
export {
  DataGridComponent,
  NgxGridCellTemplateDirective,
  NgxGridEditCellTemplateDirective,
  NgxGridHeaderTemplateDirective,
  NgxGridFooterTemplateDirective,
} from './data-grid/data-grid.component';

// ─── Models & Interfaces ──────────────────────────────────────────────────
export type {
  // Core models
  GridColumnDef,
  GridFilterState,
  GridGroupState,
  GridGroupResult,
  GridSortState,
  // Event interfaces
  GridPageChangeEvent,
  GridSortChangeEvent,
  GridFilterChangeEvent,
  GridGroupChangeEvent,
  GridDataStateChangeEvent,
  GridRowClickEvent,
  GridRowUpdateEvent,
  // Template contexts
  GridHeaderTemplateContext,
  GridCellTemplateContext,
  GridRowTemplateContext,
  GridDetailTemplateContext,
  GridFooterTemplateContext,
  // Enterprise interfaces
  GridCellValidator,
  TreeDataConfig,
  FilterExpression,
  FilterCondition,
  GridInfiniteScrollEvent,
  GridCellValidationError,
  GridEditChangeset,
  GridStatusBarAggregates,
} from './data-grid/models';

// ─── Services ─────────────────────────────────────────────────────────────
export { GridExportService } from './data-grid/grid-export.service';
export { GridExportXlsxService } from './data-grid/services/grid-export-xlsx.service';
export type { XlsxExportOptions, PdfExportOptions } from './data-grid/services/grid-export-xlsx.service';
export { GridStateService } from './data-grid/services/grid-state.service';
export { GridSelectionService } from './data-grid/services/grid-selection.service';
export { GridEditService } from './data-grid/services/grid-edit.service';
export { GridClipboardService } from './data-grid/services/grid-clipboard.service';
export { GridVirtualizationService } from './data-grid/services/grid-virtualization.service';
export { GridKeyboardService } from './data-grid/services/grid-keyboard.service';
export type { GridKeyboardConfig, GridKeyboardAction, GridKeyboardHandlers } from './data-grid/services/grid-keyboard.service';

// ─── Sub-Components ───────────────────────────────────────────────────────
export { GridStatusBarComponent } from './data-grid/components/grid-status-bar/grid-status-bar.component';
export { GridFilterBuilderComponent } from './data-grid/components/grid-filter-builder/grid-filter-builder.component';

// ─── Utilities ────────────────────────────────────────────────────────────
export { naturalCompare, compareValues, sortByField, sortByMultipleFields } from './data-grid/utils/grid-sort.util';
export type { SortDirection, SortDescriptor } from './data-grid/utils/grid-sort.util';
export { evaluateCondition, evaluateExpression, applyLegacyFilters, applyFilterExpression, applyGlobalSearch } from './data-grid/utils/grid-filter.util';
export { computeAggregate, computeStatusBarAggregates, computeGroupAggregates, formatAggregateValue } from './data-grid/utils/grid-aggregate.util';
export type { AggregateFunction } from './data-grid/utils/grid-aggregate.util';

// ─── Pivot Grid ───────────────────────────────────────────────────────────
export { PivotGridComponent } from './pivot-grid/pivot-grid.component';
export type { PivotValueDef } from './pivot-grid/pivot-grid.component';
