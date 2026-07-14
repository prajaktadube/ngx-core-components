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
