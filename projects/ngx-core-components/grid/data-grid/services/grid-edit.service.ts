import { Injectable, signal, computed } from '@angular/core';
import { GridCellValidator, GridCellValidationError, GridEditChangeset } from '../models';

export interface EditCommand {
  type: 'cell-edit' | 'row-delete' | 'row-add' | 'cell-clear';
  rowIndex: number;
  field?: string;
  previousValue?: unknown;
  newValue?: unknown;
  row?: Record<string, unknown>;
}

@Injectable()
export class GridEditService {
  // State
  readonly isEditing = signal<boolean>(false);
  readonly editingRowIndex = signal<number | null>(null);
  readonly draftValues = signal<Map<number, Map<string, unknown>>>(new Map());
  readonly dirtyFields = signal<Map<number, Set<string>>>(new Map());
  readonly deletedRows = signal<Set<number>>(new Set());
  readonly validationErrors = signal<GridCellValidationError[]>([]);
  
  // Undo/Redo stacks
  private undoStack: EditCommand[] = [];
  private redoStack: EditCommand[] = [];
  readonly canUndo = signal<boolean>(false);
  readonly canRedo = signal<boolean>(false);
  readonly undoStackSize = signal<number>(0);
  readonly maxUndoDepth = 50;
  
  // Computed
  readonly hasDirtyChanges = computed(() => this.dirtyFields().size > 0 || this.deletedRows().size > 0);
  
  // ==========================================
  // Edit operations
  // ==========================================
  
  beginEdit(rowIndex: number): void {
    this.isEditing.set(true);
    this.editingRowIndex.set(rowIndex);
    
    if (!this.draftValues().has(rowIndex)) {
      const drafts = new Map(this.draftValues());
      drafts.set(rowIndex, new Map<string, unknown>());
      this.draftValues.set(drafts);
    }
  }
  
  updateDraft(rowIndex: number, field: string, value: unknown): void {
    const drafts = new Map(this.draftValues());
    let rowDrafts = drafts.get(rowIndex);
    if (!rowDrafts) {
      rowDrafts = new Map<string, unknown>();
      drafts.set(rowIndex, rowDrafts);
    }
    rowDrafts.set(field, value);
    this.draftValues.set(drafts);
  }
  
  getDraftValue(rowIndex: number, field: string): unknown | undefined {
    return this.draftValues().get(rowIndex)?.get(field);
  }
  
  saveEdit(rowIndex: number): void {
    // Implementer is responsible for merging drafts to data model,
    // this service tracks the change states.
    this.isEditing.set(false);
    this.editingRowIndex.set(null);
  }
  
  cancelEdit(): void {
    const rowIndex = this.editingRowIndex();
    if (rowIndex !== null) {
      const drafts = new Map(this.draftValues());
      drafts.delete(rowIndex);
      this.draftValues.set(drafts);
    }
    this.isEditing.set(false);
    this.editingRowIndex.set(null);
  }
  
  // ==========================================
  // Batch operations
  // ==========================================
  
  markCellDirty(rowIndex: number, field: string, originalValue: unknown, newValue: unknown): void {
    const dirty = new Map(this.dirtyFields());
    let rowDirty = dirty.get(rowIndex);
    
    if (!rowDirty) {
      rowDirty = new Set<string>();
      dirty.set(rowIndex, rowDirty);
    }
    
    if (originalValue !== newValue) {
      rowDirty.add(field);
    } else {
      rowDirty.delete(field);
      if (rowDirty.size === 0) dirty.delete(rowIndex);
    }
    
    this.dirtyFields.set(dirty);
  }
  
  deleteRow(rowIndex: number): void {
    const deleted = new Set(this.deletedRows());
    deleted.add(rowIndex);
    this.deletedRows.set(deleted);
    
    this.pushCommand({
      type: 'row-delete',
      rowIndex
    });
  }
  
  isRowDirty(rowIndex: number): boolean {
    return this.dirtyFields().has(rowIndex);
  }
  
  isFieldDirty(rowIndex: number, field: string): boolean {
    return this.dirtyFields().get(rowIndex)?.has(field) || false;
  }
  
  isRowDeleted(rowIndex: number): boolean {
    return this.deletedRows().has(rowIndex);
  }
  
  // ==========================================
  // Changeset
  // ==========================================
  
  getChangeset<T extends Record<string, unknown>>(originalData: T[]): GridEditChangeset<T> {
    const added: T[] = [];
    const updated: { previous: T; current: T; dirtyFields: string[] }[] = [];
    const deleted: T[] = [];
    
    this.deletedRows().forEach(index => {
      if (originalData[index]) deleted.push(originalData[index]);
    });
    
    this.dirtyFields().forEach((fields, index) => {
      if (this.deletedRows().has(index)) return; // Skip if deleted
      
      const changes: Record<string, unknown> = {};
      const rowDraft = this.draftValues().get(index);
      fields.forEach(field => {
        if (rowDraft?.has(field)) changes[field] = rowDraft.get(field);
      });
      
      if (originalData[index]) {
        updated.push({ previous: originalData[index], current: { ...originalData[index], ...changes } as T, dirtyFields: Array.from(fields) });
      }
    });
    
    return { added, updated, deleted };
  }
  
  discardAllChanges(): void {
    this.draftValues.set(new Map());
    this.dirtyFields.set(new Map());
    this.deletedRows.set(new Set());
    this.undoStack = [];
    this.redoStack = [];
    this.updateUndoRedoState();
  }
  
  // ==========================================
  // Undo/Redo
  // ==========================================
  
  pushCommand(command: EditCommand): void {
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxUndoDepth) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.updateUndoRedoState();
  }
  
  undo(): EditCommand | null {
    if (this.undoStack.length === 0) return null;
    
    const command = this.undoStack.pop()!;
    this.redoStack.push(command);
    this.updateUndoRedoState();
    return command;
  }
  
  redo(): EditCommand | null {
    if (this.redoStack.length === 0) return null;
    
    const command = this.redoStack.pop()!;
    this.undoStack.push(command);
    this.updateUndoRedoState();
    return command;
  }
  
  private updateUndoRedoState(): void {
    this.canUndo.set(this.undoStack.length > 0);
    this.canRedo.set(this.redoStack.length > 0);
    this.undoStackSize.set(this.undoStack.length);
  }
  
  // ==========================================
  // Validation
  // ==========================================
  
  validateCell(value: unknown, row: Record<string, unknown>, validators: GridCellValidator[]): GridCellValidationError[] {
    const errors: GridCellValidationError[] = [];
    for (const v of validators) {
      if (v.validate && !v.validate(value, row)) {
        errors.push({ field: '', rowIndex: -1, message: v.message || 'Validation failed', validator: v });
      }
    }
    return errors;
  }
  
  validateAll<T extends Record<string, unknown>>(data: T[], columns: { field: string; validators?: GridCellValidator[] }[]): GridCellValidationError[] {
    const errors: GridCellValidationError[] = [];
    
    for (let r = 0; r < data.length; r++) {
      if (this.deletedRows().has(r)) continue;
      
      const row = data[r];
      const drafts = this.draftValues().get(r);
      
      for (const col of columns) {
        if (!col.validators || col.validators.length === 0) continue;
        
        const value = drafts?.has(col.field) ? drafts.get(col.field) : row[col.field];
        const cellErrors = this.validateCell(value, row, col.validators);
        
        cellErrors.forEach(err => errors.push({ ...err, rowIndex: r, field: col.field }));
      }
    }
    
    this.validationErrors.set(errors);
    return errors;
  }
}
