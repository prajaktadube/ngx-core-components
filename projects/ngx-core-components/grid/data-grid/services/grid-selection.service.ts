import { Injectable, signal, computed } from '@angular/core';
import { GridStatusBarAggregates } from '../models';

export interface CellCoordinate {
  rowIndex: number;
  colField: string;
}

export interface CellRange {
  start: CellCoordinate;
  end: CellCoordinate;
}

@Injectable()
export class GridSelectionService {
  // Row selection
  readonly selectedRows = signal<Set<unknown>>(new Set());
  
  // Cell range selection (supports multiple disjoint ranges)
  readonly cellRanges = signal<CellRange[]>([]);
  readonly activeCellRange = signal<CellRange | null>(null);
  readonly focusedCell = signal<CellCoordinate | null>(null);
  readonly isDragging = signal<boolean>(false);
  
  // Status bar aggregates computed from selected cells
  readonly selectionAggregates = signal<GridStatusBarAggregates>({
    count: 0, sum: null, average: null, min: null, max: null
  });
  
  // ==========================================
  // Row selection methods
  // ==========================================
  
  selectRow(rowId: unknown): void {
    const current = new Set(this.selectedRows());
    current.add(rowId);
    this.selectedRows.set(current);
  }
  
  deselectRow(rowId: unknown): void {
    const current = new Set(this.selectedRows());
    current.delete(rowId);
    this.selectedRows.set(current);
  }
  
  toggleRow(rowId: unknown): void {
    const current = new Set(this.selectedRows());
    if (current.has(rowId)) {
      current.delete(rowId);
    } else {
      current.add(rowId);
    }
    this.selectedRows.set(current);
  }
  
  selectAll(rowIds: unknown[]): void {
    this.selectedRows.set(new Set(rowIds));
  }
  
  deselectAll(): void {
    this.selectedRows.set(new Set());
  }
  
  isRowSelected(rowId: unknown): boolean {
    return this.selectedRows().has(rowId);
  }
  
  // ==========================================
  // Cell selection methods
  // ==========================================
  
  startCellSelection(coord: CellCoordinate): void {
    const range: CellRange = { start: { ...coord }, end: { ...coord } };
    this.activeCellRange.set(range);
    this.cellRanges.set([range]);
    this.setFocusedCell(coord);
    this.isDragging.set(true);
  }
  
  extendCellSelection(coord: CellCoordinate): void {
    const active = this.activeCellRange();
    if (!active) return;
    
    const updatedRange = { ...active, end: { ...coord } };
    this.activeCellRange.set(updatedRange);
    
    const ranges = [...this.cellRanges()];
    if (ranges.length > 0) {
      ranges[ranges.length - 1] = updatedRange;
      this.cellRanges.set(ranges);
    }
  }
  
  endCellSelection(): void {
    this.isDragging.set(false);
  }
  
  addCellRange(range: CellRange): void {
    this.cellRanges.update(ranges => [...ranges, range]);
    this.activeCellRange.set(range);
    this.setFocusedCell(range.end);
  }
  
  clearCellSelection(): void {
    this.cellRanges.set([]);
    this.activeCellRange.set(null);
  }
  
  /** Simplistic check assuming contiguous field indices are managed externally if needed */
  isCellSelected(rowIndex: number, colField: string): boolean {
    // For robust 2D selection, the caller needs to provide column field index mapping.
    // Without column layout, we match exactly on the field strings of start/end boundaries, 
    // or treat start and end field as boundaries if fields match.
    // In a real scenario, grid maps colField to colIndex and checks bounds.
    for (const range of this.cellRanges()) {
      const minRow = Math.min(range.start.rowIndex, range.end.rowIndex);
      const maxRow = Math.max(range.start.rowIndex, range.end.rowIndex);
      
      // Basic check: row is in bounds and field matches either start or end.
      // (Full horizontal range implementation requires column ordinals)
      if (rowIndex >= minRow && rowIndex <= maxRow) {
        if (colField === range.start.colField || colField === range.end.colField) {
          return true;
        }
      }
    }
    return false;
  }
  
  // ==========================================
  // Focus management
  // ==========================================
  
  setFocusedCell(coord: CellCoordinate): void {
    this.focusedCell.set({ ...coord });
  }
  
  moveFocus(direction: 'up' | 'down' | 'left' | 'right', maxRow: number, fields: string[]): void {
    const current = this.focusedCell();
    if (!current) return;
    
    let { rowIndex, colField } = current;
    const colIndex = fields.indexOf(colField);
    if (colIndex === -1) return;
    
    switch (direction) {
      case 'up':
        rowIndex = Math.max(0, rowIndex - 1);
        break;
      case 'down':
        rowIndex = Math.min(maxRow, rowIndex + 1);
        break;
      case 'left':
        colField = fields[Math.max(0, colIndex - 1)];
        break;
      case 'right':
        colField = fields[Math.min(fields.length - 1, colIndex + 1)];
        break;
    }
    
    const newCoord = { rowIndex, colField };
    this.setFocusedCell(newCoord);
    
    if (!this.isDragging()) {
      this.clearCellSelection();
      this.startCellSelection(newCoord);
      this.endCellSelection();
    } else {
      this.extendCellSelection(newCoord);
    }
  }
  
  // ==========================================
  // Aggregation
  // ==========================================
  
  updateSelectionAggregates<T extends Record<string, unknown>>(data: T[], fields: string[]): void {
    let count = 0;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    let numericCount = 0;
    
    const ranges = this.cellRanges();
    if (ranges.length === 0) {
      this.selectionAggregates.set({ count: 0, sum: null, average: null, min: null, max: null });
      return;
    }
    
    // Note: robust 2D selection aggregates need to iterate all cells in range.
    // Simplifying: we'll aggregate over start & end cells as placeholders without a full layout matrix.
    for (const range of ranges) {
      const minRow = Math.min(range.start.rowIndex, range.end.rowIndex);
      const maxRow = Math.max(range.start.rowIndex, range.end.rowIndex);
      
      const startColIdx = fields.indexOf(range.start.colField);
      const endColIdx = fields.indexOf(range.end.colField);
      if (startColIdx === -1 || endColIdx === -1) continue;
      
      const minCol = Math.min(startColIdx, endColIdx);
      const maxCol = Math.max(startColIdx, endColIdx);
      
      for (let r = minRow; r <= maxRow; r++) {
        const rowData = data[r];
        if (!rowData) continue;
        
        for (let c = minCol; c <= maxCol; c++) {
          count++;
          const val = rowData[fields[c]];
          
          if (typeof val === 'number' && !isNaN(val)) {
            sum += val;
            min = Math.min(min, val);
            max = Math.max(max, val);
            numericCount++;
          }
        }
      }
    }
    
    this.selectionAggregates.set({
      count,
      sum: numericCount > 0 ? sum : null,
      average: numericCount > 0 ? sum / numericCount : null,
      min: numericCount > 0 ? min : null,
      max: numericCount > 0 ? max : null
    });
  }
}
