import { Injectable } from '@angular/core';
import { CellCoordinate, CellRange } from './grid-selection.service';

@Injectable()
export class GridClipboardService {
  
  /** Copy selected cell values as TSV to clipboard */
  async copyToClipboard<T extends Record<string, unknown>>(
    data: T[], 
    ranges: CellRange[], 
    fields: string[]
  ): Promise<void> {
    if (ranges.length === 0) return;
    
    const { minRow, maxRow, minCol, maxCol } = this.getBounds(ranges, fields);
    
    const gridData: unknown[][] = [];
    for (let r = minRow; r <= maxRow; r++) {
      const rowData = data[r];
      const rowArr: unknown[] = [];
      for (let c = minCol; c <= maxCol; c++) {
        rowArr.push(rowData ? rowData[fields[c]] : '');
      }
      gridData.push(rowArr);
    }
    
    const tsvText = this.formatAsTsv(gridData);
    try {
      await navigator.clipboard.writeText(tsvText);
    } catch (err) {
      console.warn('GridClipboardService: Failed to copy to clipboard', err);
    }
  }
  
  /** Cut selected cells (copy + clear values) */
  async cutToClipboard<T extends Record<string, unknown>>(
    data: T[], 
    ranges: CellRange[], 
    fields: string[]
  ): Promise<{ clearedCells: { rowIndex: number; field: string; previousValue: unknown }[] }> {
    await this.copyToClipboard(data, ranges, fields);
    
    const clearedCells: { rowIndex: number; field: string; previousValue: unknown }[] = [];
    
    const { minRow, maxRow, minCol, maxCol } = this.getBounds(ranges, fields);
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const field = fields[c];
        if (data[r] && field) {
          clearedCells.push({ rowIndex: r, field, previousValue: data[r][field] });
          // Note: State mutation logic belongs to the controller/edit service.
        }
      }
    }
    
    return { clearedCells };
  }
  
  /** Parse clipboard TSV/CSV text into a 2D cell matrix */
  parseClipboardText(text: string): string[][] {
    if (!text) return [];
    
    const isCsv = text.includes(',') && !text.includes('\t');
    const delimiter = isCsv ? ',' : '\t';
    
    // Basic CSV/TSV parser handling quotes
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        currentRow.push(currentCell);
        currentCell = '';
      } else if (char === '\n' && !inQuotes) {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else if (char === '\r' && !inQuotes) {
        // ignore carriage return
      } else {
        currentCell += char;
      }
    }
    
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell);
      rows.push(currentRow);
    }
    
    return rows;
  }
  
  /** Paste clipboard data into grid starting from a coordinate */
  async pasteFromClipboard<T extends Record<string, unknown>>(
    data: T[],
    startCoord: CellCoordinate,
    editableFields: string[]
  ): Promise<{ pastedCells: { rowIndex: number; field: string; previousValue: unknown; newValue: string }[] }> {
    try {
      const text = await navigator.clipboard.readText();
      const matrix = this.parseClipboardText(text);
      
      const pastedCells: { rowIndex: number; field: string; previousValue: unknown; newValue: string }[] = [];
      const startColIndex = editableFields.indexOf(startCoord.colField);
      
      if (startColIndex === -1) return { pastedCells };
      
      for (let r = 0; r < matrix.length; r++) {
        const targetRow = startCoord.rowIndex + r;
        if (targetRow >= data.length) break;
        
        const sourceRow = matrix[r];
        for (let c = 0; c < sourceRow.length; c++) {
          const targetCol = startColIndex + c;
          if (targetCol >= editableFields.length) break;
          
          const field = editableFields[targetCol];
          pastedCells.push({
            rowIndex: targetRow,
            field,
            previousValue: data[targetRow]?.[field],
            newValue: sourceRow[c]
          });
        }
      }
      return { pastedCells };
    } catch (err) {
      console.warn('GridClipboardService: Failed to read from clipboard', err);
      return { pastedCells: [] };
    }
  }
  
  /** Fill handle: extend values from source range into target range */
  fillRange<T extends Record<string, unknown>>(
    data: T[],
    sourceRange: CellRange,
    targetRange: CellRange,
    fields: string[]
  ): { filledCells: { rowIndex: number; field: string; previousValue: unknown; newValue: unknown }[] } {
    const filledCells: { rowIndex: number; field: string; previousValue: unknown; newValue: unknown }[] = [];
    
    const src = this.getBounds([sourceRange], fields);
    const tgt = this.getBounds([targetRange], fields);
    
    const srcHeight = src.maxRow - src.minRow + 1;
    const srcWidth = src.maxCol - src.minCol + 1;
    
    // Repeat source pattern into target
    for (let r = tgt.minRow; r <= tgt.maxRow; r++) {
      for (let c = tgt.minCol; c <= tgt.maxCol; c++) {
        // Skip if inside source
        if (r >= src.minRow && r <= src.maxRow && c >= src.minCol && c <= src.maxCol) {
          continue;
        }
        
        const srcR = src.minRow + ((r - tgt.minRow) % srcHeight);
        const srcC = src.minCol + ((c - tgt.minCol) % srcWidth);
        
        const field = fields[c];
        const srcField = fields[srcC];
        
        if (data[r] && data[srcR]) {
          filledCells.push({
            rowIndex: r,
            field,
            previousValue: data[r][field],
            newValue: data[srcR][srcField]
          });
        }
      }
    }
    
    return { filledCells };
  }
  
  /** Format a 2D array of values as TSV string */
  formatAsTsv(values: unknown[][]): string {
    return values.map(row => {
      return row.map(val => {
        if (val === null || val === undefined) return '';
        let str = String(val);
        // Escape quotes and wrap in quotes if contains delimiter or newline
        if (str.includes('\t') || str.includes('\n') || str.includes('"')) {
          str = `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join('\t');
    }).join('\n');
  }

  /** Helper to get min/max row and col indices from ranges */
  private getBounds(ranges: CellRange[], fields: string[]) {
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    for (const range of ranges) {
      minRow = Math.min(minRow, range.start.rowIndex, range.end.rowIndex);
      maxRow = Math.max(maxRow, range.start.rowIndex, range.end.rowIndex);
      
      const startCol = fields.indexOf(range.start.colField);
      const endCol = fields.indexOf(range.end.colField);
      
      if (startCol !== -1 && endCol !== -1) {
        minCol = Math.min(minCol, startCol, endCol);
        maxCol = Math.max(maxCol, startCol, endCol);
      }
    }
    
    return { minRow, maxRow, minCol, maxCol };
  }
}
