import { TemplateRef } from '@angular/core';

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
  editCellTemplate?: TemplateRef<GridCellTemplateContext<T>>;
  footerTemplate?: TemplateRef<GridFooterTemplateContext<T>>;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  pinned?: 'left' | 'right' | null;
  hidden?: boolean;
  category?: string;
  mergeRows?: boolean;
  minWidth?: number;
  maxWidth?: number;
  columnType?: 'text' | 'number' | 'date' | 'boolean' | 'enum';
  enumValues?: string[];
  validators?: GridCellValidator[];
  resizable?: boolean;
  lockPosition?: boolean;
  cellClass?: string | ((params: { value: unknown; row: T }) => string);
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
  subGroups?: GridGroupResult<T>[];
  level?: number;
  aggregates?: Record<string, number | string>;
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
  draftValue?: unknown;
  updateDraft?: (val: unknown) => void;
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

export interface GridFooterTemplateContext<T = Record<string, unknown>> {
  $implicit: GridColumnDef<T>;
  column: GridColumnDef<T>;
  aggregationValue: string;
  data: T[];
}

export interface GridCellValidator {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
  validate?: (value: unknown, row: Record<string, unknown>) => boolean;
}

export interface TreeDataConfig {
  childrenField: string;
  hasChildrenField?: string;
  levelField?: string;
  expandedByDefault?: boolean;
}

export interface FilterExpression {
  operator: 'AND' | 'OR';
  conditions: (FilterCondition | FilterExpression)[];
}

export interface FilterCondition {
  field: string;
  type: 'contains' | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' |
        'startsWith' | 'endsWith' | 'in' | 'before' | 'after' | 'isTrue' | 'isFalse' |
        'isEmpty' | 'isNotEmpty';
  value: unknown;
  valueTo?: unknown;
}

export interface GridInfiniteScrollEvent {
  startRow: number;
  endRow: number;
  sortModel: GridSortState[];
  filterModel: GridFilterState[];
  groupModel: GridGroupState[];
}

export interface GridCellValidationError {
  field: string;
  rowIndex: number;
  message: string;
  validator: GridCellValidator;
}

export interface GridEditChangeset<T = Record<string, unknown>> {
  added: T[];
  updated: { previous: T; current: T; dirtyFields: string[] }[];
  deleted: T[];
}

export interface GridStatusBarAggregates {
  count: number;
  sum: number | null;
  average: number | null;
  min: number | null;
  max: number | null;
}
