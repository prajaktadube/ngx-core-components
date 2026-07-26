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

@Injectable()
export class GridStateService {
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
