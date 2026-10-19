import { Injectable } from '@angular/core';
import { GridColumnDef, GridSortState, GridFilterState, GridGroupState } from '../models';

export interface GridPersistedState {
  columnWidths: Record<string, number>;
  columnOrder: string[];
  sorts: GridSortState[];
  filters: GridFilterState[];
  groups: GridGroupState[];
  page: number;
  pageSize: number;
  hiddenColumns: string[];
  pinnedColumns: Record<string, 'left' | 'right' | null>;
}

export interface GridSavedView {
  version: 1;
  name: string;
  state: GridPersistedState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGridPersistedState(value: unknown): value is GridPersistedState {
  if (!isRecord(value)) return false;
  const page = value['page'];
  const pageSize = value['pageSize'];
  const pinnedColumns = value['pinnedColumns'];

  return (
    Number.isInteger(page) &&
    Number(page) >= 1 &&
    Number.isInteger(pageSize) &&
    Number(pageSize) > 0 &&
    Array.isArray(value['columnOrder']) &&
    value['columnOrder'].every(column => typeof column === 'string') &&
    Array.isArray(value['sorts']) &&
    value['sorts'].every(
      sort => isRecord(sort) && typeof sort['field'] === 'string' && (sort['dir'] === 'asc' || sort['dir'] === 'desc')
    ) &&
    Array.isArray(value['filters']) &&
    value['filters'].every(filter => isRecord(filter) && typeof filter['field'] === 'string') &&
    Array.isArray(value['groups']) &&
    value['groups'].every(group => isRecord(group) && typeof group['field'] === 'string') &&
    Array.isArray(value['hiddenColumns']) &&
    value['hiddenColumns'].every(column => typeof column === 'string') &&
    isRecord(value['columnWidths']) &&
    Object.values(value['columnWidths']).every(
      width => typeof width === 'number' && Number.isFinite(width) && width > 0
    ) &&
    isRecord(pinnedColumns) &&
    Object.values(pinnedColumns).every(pin => pin === 'left' || pin === 'right' || pin === null)
  );
}

@Injectable()
export class GridStateService {
  exportSavedView(name: string, state: GridPersistedState): string {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new TypeError('A saved grid view must have a non-empty name.');
    }
    if (!isGridPersistedState(state)) {
      throw new TypeError('Cannot export an invalid grid state.');
    }

    const savedView: GridSavedView = { version: 1, name: trimmedName, state };
    return JSON.stringify(savedView);
  }

  importSavedView(serialized: string): GridSavedView {
    const parsed: unknown = JSON.parse(serialized);
    if (
      !isRecord(parsed) ||
      parsed['version'] !== 1 ||
      typeof parsed['name'] !== 'string' ||
      !parsed['name'].trim() ||
      !isGridPersistedState(parsed['state'])
    ) {
      throw new TypeError('Saved grid view is invalid or uses an unsupported version.');
    }

    return {
      version: 1,
      name: parsed['name'],
      state: parsed['state'],
    };
  }

  /**
   * Save grid state to localStorage
   * @param key Storage key
   * @param state The state object to persist
   */
  saveState(key: string, state: GridPersistedState): void {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn('GridStateService: Failed to save state to localStorage', e);
    }
  }

  /**
   * Load grid state from localStorage
   * @param key Storage key
   * @returns The persisted state or null if not found
   */
  loadState(key: string): GridPersistedState | null {
    try {
      const stateStr = localStorage.getItem(key);
      if (stateStr) {
        return JSON.parse(stateStr) as GridPersistedState;
      }
    } catch (e) {
      console.warn('GridStateService: Failed to load state from localStorage', e);
    }
    return null;
  }

  /**
   * Clear persisted state
   * @param key Storage key
   */
  clearState(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('GridStateService: Failed to clear state', e);
    }
  }

  /**
   * Merge loaded state with current column definitions
   * @param state The loaded state
   * @param columns The default column definitions
   * @returns Array of column definitions updated with the state
   */
  applyState(state: GridPersistedState, columns: GridColumnDef[]): GridColumnDef[] {
    if (!state || !columns || columns.length === 0) {
      return columns;
    }

    const colMap = new Map<string, GridColumnDef>();
    columns.forEach(col => colMap.set(col.field, { ...col }));

    // Apply widths, hidden state, and pinned state
    for (const col of colMap.values()) {
      if (state.columnWidths && state.columnWidths[col.field] !== undefined) {
        col.width = state.columnWidths[col.field];
      }

      if (state.hiddenColumns) {
        col.hidden = state.hiddenColumns.includes(col.field);
      }

      if (state.pinnedColumns && state.pinnedColumns[col.field] !== undefined) {
        col.pinned = state.pinnedColumns[col.field];
      }
    }

    // Apply column ordering
    if (state.columnOrder && state.columnOrder.length > 0) {
      const orderedCols: GridColumnDef[] = [];
      const orderSet = new Set(state.columnOrder);

      // Add columns in the saved order
      for (const field of state.columnOrder) {
        if (colMap.has(field)) {
          orderedCols.push(colMap.get(field)!);
        }
      }

      // Add any new columns that weren't in the saved order
      for (const col of columns) {
        if (!orderSet.has(col.field) && colMap.has(col.field)) {
          orderedCols.push(colMap.get(col.field)!);
        }
      }

      return orderedCols;
    }

    return Array.from(colMap.values());
  }
}
