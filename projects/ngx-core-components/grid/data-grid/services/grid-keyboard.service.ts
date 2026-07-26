import { Injectable, signal } from '@angular/core';

/**
 * Enterprise keyboard navigation service for the DataGrid.
 * Centralizes all keyboard event handling including:
 * - Arrow key cell navigation
 * - Tab / Shift+Tab traversal
 * - Enter/Escape for edit mode
 * - Ctrl+Z/Y for undo/redo
 * - Ctrl+A for select all
 * - Ctrl+C/X/V for clipboard
 * - F2 for edit mode
 * - Delete for clearing cells
 */
@Injectable()
export class GridKeyboardService {
  /** Currently focused cell coordinates */
  readonly focusedRow = signal<number>(-1);
  readonly focusedCol = signal<number>(-1);

  /** Whether the grid is in keyboard navigation mode */
  readonly isNavigating = signal<boolean>(false);

  /** Whether we're currently in cell edit mode */
  readonly isEditMode = signal<boolean>(false);

  /** Grid boundaries */
  private maxRow = 0;
  private maxCol = 0;
  private editableFields: Set<string> = new Set();
  private columnFields: string[] = [];

  /** Callbacks registered by the grid component */
  private handlers: GridKeyboardHandlers = {};

  /** Initialize the keyboard service with grid dimensions and handlers */
  initialize(config: GridKeyboardConfig): void {
    this.maxRow = config.maxRow;
    this.maxCol = config.maxCol;
    this.columnFields = config.columnFields;
    this.editableFields = new Set(config.editableFields ?? []);
    this.handlers = config.handlers ?? {};
  }

  /** Update grid dimensions (e.g., after data change) */
  updateDimensions(maxRow: number, maxCol: number): void {
    this.maxRow = maxRow;
    this.maxCol = maxCol;

    // Clamp focused cell within bounds
    if (this.focusedRow() >= maxRow) this.focusedRow.set(Math.max(0, maxRow - 1));
    if (this.focusedCol() >= maxCol) this.focusedCol.set(Math.max(0, maxCol - 1));
  }

  /** Handle keydown events from the grid */
  handleKeyDown(event: KeyboardEvent): GridKeyboardAction | null {
    const key = event.key;
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;

    // ─── Edit Mode Shortcuts ───────────────────────────────────────
    if (this.isEditMode()) {
      switch (key) {
        case 'Escape':
          event.preventDefault();
          this.isEditMode.set(false);
          return { type: 'cancel-edit' };
        case 'Enter':
          event.preventDefault();
          this.isEditMode.set(false);
          return { type: 'save-edit' };
        case 'Tab':
          event.preventDefault();
          this.isEditMode.set(false);
          if (shift) {
            this.moveFocus('left');
          } else {
            this.moveFocus('right');
          }
          return { type: 'save-edit-and-move', direction: shift ? 'left' : 'right' };
        default:
          return null; // Let the input handle the key
      }
    }

    // ─── Navigation Keys ───────────────────────────────────────────
    switch (key) {
      case 'ArrowUp':
        event.preventDefault();
        if (shift) return this.extendSelection('up');
        this.moveFocus('up');
        return { type: 'navigate', row: this.focusedRow(), col: this.focusedCol() };

      case 'ArrowDown':
        event.preventDefault();
        if (shift) return this.extendSelection('down');
        this.moveFocus('down');
        return { type: 'navigate', row: this.focusedRow(), col: this.focusedCol() };

      case 'ArrowLeft':
        event.preventDefault();
        if (shift) return this.extendSelection('left');
        this.moveFocus('left');
        return { type: 'navigate', row: this.focusedRow(), col: this.focusedCol() };

      case 'ArrowRight':
        event.preventDefault();
        if (shift) return this.extendSelection('right');
        this.moveFocus('right');
        return { type: 'navigate', row: this.focusedRow(), col: this.focusedCol() };

      case 'Tab':
        event.preventDefault();
        this.moveFocus(shift ? 'left' : 'right');
        return { type: 'navigate', row: this.focusedRow(), col: this.focusedCol() };

      case 'Home':
        event.preventDefault();
        if (ctrl) {
          this.focusedRow.set(0);
          this.focusedCol.set(0);
        } else {
          this.focusedCol.set(0);
        }
        return { type: 'navigate', row: this.focusedRow(), col: this.focusedCol() };

      case 'End':
        event.preventDefault();
        if (ctrl) {
          this.focusedRow.set(this.maxRow - 1);
          this.focusedCol.set(this.maxCol - 1);
        } else {
          this.focusedCol.set(this.maxCol - 1);
        }
        return { type: 'navigate', row: this.focusedRow(), col: this.focusedCol() };

      case 'PageUp':
        event.preventDefault();
        this.focusedRow.update(r => Math.max(0, r - 10));
        return { type: 'navigate', row: this.focusedRow(), col: this.focusedCol() };

      case 'PageDown':
        event.preventDefault();
        this.focusedRow.update(r => Math.min(this.maxRow - 1, r + 10));
        return { type: 'navigate', row: this.focusedRow(), col: this.focusedCol() };

      // ─── Edit Mode Entry ───────────────────────────────────────
      case 'Enter':
        event.preventDefault();
        if (this.canEditCurrentCell()) {
          this.isEditMode.set(true);
          return { type: 'begin-edit', row: this.focusedRow(), col: this.focusedCol() };
        }
        return null;

      case 'F2':
        event.preventDefault();
        if (this.canEditCurrentCell()) {
          this.isEditMode.set(true);
          return { type: 'begin-edit', row: this.focusedRow(), col: this.focusedCol() };
        }
        return null;

      // ─── Deletion ──────────────────────────────────────────────
      case 'Delete':
      case 'Backspace':
        if (ctrl) return null;
        event.preventDefault();
        return { type: 'clear-cells' };

      // ─── Clipboard & Undo ──────────────────────────────────────
      default:
        break;
    }

    // ─── Ctrl Shortcuts ──────────────────────────────────────────
    if (ctrl) {
      switch (key.toLowerCase()) {
        case 'c':
          return { type: 'copy' };
        case 'x':
          return { type: 'cut' };
        case 'v':
          return { type: 'paste' };
        case 'z':
          event.preventDefault();
          return shift ? { type: 'redo' } : { type: 'undo' };
        case 'y':
          event.preventDefault();
          return { type: 'redo' };
        case 'a':
          event.preventDefault();
          return { type: 'select-all' };
        default:
          return null;
      }
    }

    // ─── Quick Edit: printable character starts edit mode ─────────
    if (key.length === 1 && !ctrl && this.canEditCurrentCell()) {
      this.isEditMode.set(true);
      return { type: 'quick-edit', row: this.focusedRow(), col: this.focusedCol(), char: key };
    }

    return null;
  }

  /** Set focus to a specific cell */
  setFocus(row: number, col: number): void {
    this.focusedRow.set(Math.max(0, Math.min(row, this.maxRow - 1)));
    this.focusedCol.set(Math.max(0, Math.min(col, this.maxCol - 1)));
    this.isNavigating.set(true);
  }

  /** Clear focus */
  clearFocus(): void {
    this.focusedRow.set(-1);
    this.focusedCol.set(-1);
    this.isNavigating.set(false);
    this.isEditMode.set(false);
  }

  /** Get the field name of the currently focused column */
  getFocusedField(): string | null {
    const col = this.focusedCol();
    return col >= 0 && col < this.columnFields.length ? this.columnFields[col] : null;
  }

  // ─── Private Methods ────────────────────────────────────────────────

  private moveFocus(direction: 'up' | 'down' | 'left' | 'right'): void {
    switch (direction) {
      case 'up':
        this.focusedRow.update(r => Math.max(0, r - 1));
        break;
      case 'down':
        this.focusedRow.update(r => Math.min(this.maxRow - 1, r + 1));
        break;
      case 'left':
        this.focusedCol.update(c => {
          if (c > 0) return c - 1;
          // Wrap to previous row
          const row = this.focusedRow();
          if (row > 0) {
            this.focusedRow.set(row - 1);
            return this.maxCol - 1;
          }
          return 0;
        });
        break;
      case 'right':
        this.focusedCol.update(c => {
          if (c < this.maxCol - 1) return c + 1;
          // Wrap to next row
          const row = this.focusedRow();
          if (row < this.maxRow - 1) {
            this.focusedRow.set(row + 1);
            return 0;
          }
          return this.maxCol - 1;
        });
        break;
    }
  }

  private extendSelection(direction: 'up' | 'down' | 'left' | 'right'): GridKeyboardAction {
    this.moveFocus(direction);
    return {
      type: 'extend-selection',
      row: this.focusedRow(),
      col: this.focusedCol(),
      direction
    };
  }

  private canEditCurrentCell(): boolean {
    const field = this.getFocusedField();
    return field !== null && this.editableFields.has(field);
  }
}

// ─── Interfaces ──────────────────────────────────────────────────────────

export interface GridKeyboardConfig {
  maxRow: number;
  maxCol: number;
  columnFields: string[];
  editableFields?: string[];
  handlers?: GridKeyboardHandlers;
}

export interface GridKeyboardHandlers {
  onNavigate?: (row: number, col: number) => void;
  onBeginEdit?: (row: number, col: number) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export interface GridKeyboardAction {
  type:
    | 'navigate'
    | 'begin-edit'
    | 'quick-edit'
    | 'save-edit'
    | 'cancel-edit'
    | 'save-edit-and-move'
    | 'extend-selection'
    | 'copy'
    | 'cut'
    | 'paste'
    | 'undo'
    | 'redo'
    | 'select-all'
    | 'clear-cells';
  row?: number;
  col?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  char?: string;
}
