import { Injectable, signal, computed } from '@angular/core';

/**
 * Enterprise virtualization engine for the DataGrid.
 * Handles both row (vertical) and column (horizontal) virtualization
 * for high-performance rendering of massive datasets (100K+ rows, 200+ columns).
 *
 * Row virtualization renders only the visible rows plus a configurable buffer,
 * using spacer elements to maintain correct scroll position.
 *
 * Column virtualization renders only the visible columns plus a buffer,
 * using left/right spacer cells to maintain correct horizontal scroll position.
 */
@Injectable()
export class GridVirtualizationService {
  // ─── Configuration ──────────────────────────────────────────────────
  readonly rowHeight = signal<number>(49);
  readonly viewportHeight = signal<number>(600);
  readonly viewportWidth = signal<number>(1200);
  readonly scrollTop = signal<number>(0);
  readonly scrollLeft = signal<number>(0);
  readonly totalRows = signal<number>(0);
  readonly columnWidths = signal<number[]>([]);
  readonly rowBuffer = signal<number>(5);
  readonly colBuffer = signal<number>(2);

  // ─── Variable row height support ────────────────────────────────────
  private readonly rowHeightCache = new Map<number, number>();
  readonly useVariableHeight = signal<boolean>(false);

  // ─── Infinite scroll ────────────────────────────────────────────────
  readonly infiniteScrollEnabled = signal<boolean>(false);
  readonly infiniteScrollThreshold = signal<number>(200); // px from bottom
  readonly isLoadingMore = signal<boolean>(false);
  private loadedBlockRanges: Array<{ start: number; end: number }> = [];

  // ─── Row Virtualization Computed Signals ─────────────────────────────

  /** Index of the first visible row (0-based) */
  readonly startRowIndex = computed(() => {
    if (this.useVariableHeight()) {
      return this.findRowAtOffset(this.scrollTop());
    }
    const idx = Math.floor(this.scrollTop() / this.rowHeight());
    return Math.max(0, idx - this.rowBuffer());
  });

  /** Index of the last visible row (0-based, exclusive) */
  readonly endRowIndex = computed(() => {
    if (this.useVariableHeight()) {
      const startOffset = this.scrollTop();
      const endOffset = startOffset + this.viewportHeight();
      const endIdx = this.findRowAtOffset(endOffset);
      return Math.min(this.totalRows(), endIdx + this.rowBuffer() + 1);
    }
    const visibleCount = Math.ceil(this.viewportHeight() / this.rowHeight());
    const endIdx = this.startRowIndex() + visibleCount + this.rowBuffer() * 2;
    return Math.min(this.totalRows(), endIdx);
  });

  /** Total virtual content height for the scrollbar */
  readonly totalContentHeight = computed(() => {
    if (this.useVariableHeight()) {
      return this.computeTotalVariableHeight();
    }
    return this.totalRows() * this.rowHeight();
  });

  /** Top spacer height (space before the first rendered row) */
  readonly topSpacerHeight = computed(() => {
    if (this.useVariableHeight()) {
      return this.computeHeightRange(0, this.startRowIndex());
    }
    return this.startRowIndex() * this.rowHeight();
  });

  /** Bottom spacer height (space after the last rendered row) */
  readonly bottomSpacerHeight = computed(() => {
    if (this.useVariableHeight()) {
      return this.computeHeightRange(this.endRowIndex(), this.totalRows());
    }
    return Math.max(0, (this.totalRows() - this.endRowIndex()) * this.rowHeight());
  });

  /** Number of rows currently rendered in the DOM */
  readonly renderedRowCount = computed(() => this.endRowIndex() - this.startRowIndex());

  // ─── Column Virtualization Computed Signals ──────────────────────────

  /** Index of the first visible column (0-based) */
  readonly startColIndex = computed(() => {
    const widths = this.columnWidths();
    if (!widths.length) return 0;
    let offset = 0;
    for (let i = 0; i < widths.length; i++) {
      if (offset + widths[i] > this.scrollLeft()) {
        return Math.max(0, i - this.colBuffer());
      }
      offset += widths[i];
    }
    return Math.max(0, widths.length - 1);
  });

  /** Index of the last visible column (0-based, exclusive) */
  readonly endColIndex = computed(() => {
    const widths = this.columnWidths();
    if (!widths.length) return 0;
    const endOffset = this.scrollLeft() + this.viewportWidth();
    let offset = 0;
    for (let i = 0; i < widths.length; i++) {
      offset += widths[i];
      if (offset >= endOffset) {
        return Math.min(widths.length, i + this.colBuffer() + 1);
      }
    }
    return widths.length;
  });

  /** Total virtual content width for horizontal scrollbar */
  readonly totalContentWidth = computed(() => {
    return this.columnWidths().reduce((sum, w) => sum + w, 0);
  });

  /** Left spacer width (space before first rendered column) */
  readonly leftSpacerWidth = computed(() => {
    const widths = this.columnWidths();
    let total = 0;
    for (let i = 0; i < this.startColIndex() && i < widths.length; i++) {
      total += widths[i];
    }
    return total;
  });

  /** Right spacer width (space after last rendered column) */
  readonly rightSpacerWidth = computed(() => {
    const widths = this.columnWidths();
    let total = 0;
    for (let i = this.endColIndex(); i < widths.length; i++) {
      total += widths[i];
    }
    return total;
  });

  // ─── Public Methods ──────────────────────────────────────────────────

  /** Update scroll position from the viewport scroll event */
  onScroll(scrollTop: number, scrollLeft: number): void {
    this.scrollTop.set(scrollTop);
    this.scrollLeft.set(scrollLeft);
  }

  /** Update viewport dimensions (e.g., on resize) */
  updateViewportSize(width: number, height: number): void {
    this.viewportWidth.set(width);
    this.viewportHeight.set(height);
  }

  /** Set or update the measured height for a specific row (variable height mode) */
  setRowHeight(rowIndex: number, height: number): void {
    this.rowHeightCache.set(rowIndex, height);
  }

  /** Get the height of a specific row */
  getRowHeight(rowIndex: number): number {
    if (this.useVariableHeight()) {
      return this.rowHeightCache.get(rowIndex) ?? this.rowHeight();
    }
    return this.rowHeight();
  }

  /** Clear the variable row height cache */
  clearHeightCache(): void {
    this.rowHeightCache.clear();
  }

  /** Scroll to a specific row index */
  scrollToRow(rowIndex: number): number {
    if (this.useVariableHeight()) {
      return this.computeHeightRange(0, rowIndex);
    }
    return rowIndex * this.rowHeight();
  }

  /** Scroll to a specific column index */
  scrollToColumn(colIndex: number): number {
    const widths = this.columnWidths();
    let offset = 0;
    for (let i = 0; i < colIndex && i < widths.length; i++) {
      offset += widths[i];
    }
    return offset;
  }

  // ─── Infinite Scroll ─────────────────────────────────────────────────

  /** Check if we should trigger loading more data */
  shouldLoadMore(): boolean {
    if (!this.infiniteScrollEnabled() || this.isLoadingMore()) return false;
    const distanceFromBottom = this.totalContentHeight() - (this.scrollTop() + this.viewportHeight());
    return distanceFromBottom < this.infiniteScrollThreshold();
  }

  /** Register a loaded block range */
  registerLoadedBlock(start: number, end: number): void {
    this.loadedBlockRanges.push({ start, end });
    this.isLoadingMore.set(false);
  }

  /** Check if a row index has been loaded */
  isRowLoaded(rowIndex: number): boolean {
    return this.loadedBlockRanges.some(block => rowIndex >= block.start && rowIndex < block.end);
  }

  /** Reset infinite scroll state */
  resetInfiniteScroll(): void {
    this.loadedBlockRanges = [];
    this.isLoadingMore.set(false);
  }

  // ─── Private Methods ─────────────────────────────────────────────────

  /** Find the row index at a given pixel offset (variable height) */
  private findRowAtOffset(offset: number): number {
    let accumulated = 0;
    const total = this.totalRows();
    for (let i = 0; i < total; i++) {
      accumulated += this.getRowHeight(i);
      if (accumulated >= offset) return i;
    }
    return Math.max(0, total - 1);
  }

  /** Compute the total height of all rows (variable height) */
  private computeTotalVariableHeight(): number {
    let total = 0;
    const rowCount = this.totalRows();
    const defaultH = this.rowHeight();
    for (let i = 0; i < rowCount; i++) {
      total += this.rowHeightCache.get(i) ?? defaultH;
    }
    return total;
  }

  /** Compute the combined height of rows in a range [startIdx, endIdx) */
  private computeHeightRange(startIdx: number, endIdx: number): number {
    let total = 0;
    const defaultH = this.rowHeight();
    for (let i = startIdx; i < endIdx; i++) {
      total += this.rowHeightCache.get(i) ?? defaultH;
    }
    return total;
  }
}
