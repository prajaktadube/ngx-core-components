import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterExpression, FilterCondition, GridColumnDef } from '../../models';

/**
 * Enterprise Filter Builder component for the DataGrid.
 * Provides a visual AND/OR condition tree builder UI for constructing
 * complex filter expressions with nested groups.
 *
 * @selector ngx-grid-filter-builder
 * @usage
 * ```html
 * <ngx-grid-filter-builder
 *   [columns]="filterableColumns()"
 *   [expression]="currentFilterExpression()"
 *   (expressionChange)="onFilterExpressionChange($event)"
 *   (close)="closeFilterBuilder()"
 * />
 * ```
 */
@Component({
  selector: 'ngx-grid-filter-builder',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-builder-overlay" (click)="close.emit()">
      <div class="filter-builder-panel" (click)="$event.stopPropagation()">
        <div class="fb-header">
          <div class="fb-title">
            <span class="fb-icon">🔍</span>
            <span>Advanced Filter Builder</span>
          </div>
          <button type="button" class="fb-close" (click)="close.emit()">✕</button>
        </div>

        <div class="fb-body">
          <ng-container *ngTemplateOutlet="groupTpl; context: { group: editExpression(), path: [] }" />
        </div>

        <div class="fb-footer">
          <button type="button" class="fb-btn fb-btn-clear" (click)="clearAll()">Clear All</button>
          <div class="fb-footer-actions">
            <button type="button" class="fb-btn fb-btn-cancel" (click)="close.emit()">Cancel</button>
            <button type="button" class="fb-btn fb-btn-apply" (click)="applyFilter()">Apply Filter</button>
          </div>
        </div>
      </div>
    </div>

    <ng-template #groupTpl let-group="group" let-path="path">
      <div class="fb-group">
        <div class="fb-group-header">
          <div class="fb-operator-toggle">
            <button type="button"
              class="op-btn"
              [class.active]="group.operator === 'AND'"
              (click)="setGroupOperator(path, 'AND')"
            >AND</button>
            <button type="button"
              class="op-btn"
              [class.active]="group.operator === 'OR'"
              (click)="setGroupOperator(path, 'OR')"
            >OR</button>
          </div>
          <div class="fb-group-actions">
            <button type="button" class="fb-add-btn" (click)="addCondition(path)">+ Condition</button>
            <button type="button" class="fb-add-btn fb-add-group" (click)="addGroup(path)">+ Group</button>
            @if (path.length > 0) {
              <button type="button" class="fb-remove-group" (click)="removeItem(path)">✕</button>
            }
          </div>
        </div>

        <div class="fb-conditions">
          @for (item of group.conditions; track $index) {
            @if (isGroup(item)) {
              <ng-container *ngTemplateOutlet="groupTpl; context: { group: item, path: path.concat($index) }" />
            } @else {
              <div class="fb-condition-row">
                <select class="fb-select fb-field-select" [value]="asCondition(item).field" (change)="updateConditionField(path.concat($index), $any($event.target).value)">
                  @for (col of filterableColumnsList(); track col.field) {
                    <option [value]="col.field" [selected]="col.field === asCondition(item).field">{{ col.title }}</option>
                  }
                </select>

                <select class="fb-select fb-operator-select" [value]="asCondition(item).type" (change)="updateConditionType(path.concat($index), $any($event.target).value)">
                  @for (op of getOperatorsForField(asCondition(item).field); track op.value) {
                    <option [value]="op.value" [selected]="op.value === asCondition(item).type">{{ op.label }}</option>
                  }
                </select>

                @if (!isUnaryOperator(asCondition(item).type)) {
                  <input class="fb-input" [value]="asCondition(item).value ?? ''" (input)="updateConditionValue(path.concat($index), $any($event.target).value)" placeholder="Value...">
                  @if (asCondition(item).type === 'between') {
                    <span class="fb-between-label">and</span>
                    <input class="fb-input" [value]="asCondition(item).valueTo ?? ''" (input)="updateConditionValueTo(path.concat($index), $any($event.target).value)" placeholder="To...">
                  }
                }

                <button type="button" class="fb-remove-condition" (click)="removeItem(path.concat($index))">✕</button>
              </div>
            }
          }

          @if (group.conditions.length === 0) {
            <div class="fb-empty">No conditions. Click "+ Condition" to add one.</div>
          }
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }

    .filter-builder-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(4px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fbFadeIn 0.2s ease;
    }

    @keyframes fbFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .filter-builder-panel {
      background: var(--ngx-grid-bg, #ffffff);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 720px;
      max-width: 95vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: fbSlideIn 0.25s ease;
      font-family: var(--ngx-font-family, inherit);
    }

    @keyframes fbSlideIn {
      from { transform: scale(0.95) translateY(10px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }

    .fb-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--ngx-grid-border, #e2e8f0);
      background: var(--ngx-grid-header-bg, #f8fafc);
    }

    .fb-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 15px;
      color: var(--ngx-grid-text, #0f172a);
    }

    .fb-icon { font-size: 16px; }

    .fb-close {
      background: transparent;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: var(--ngx-grid-text-secondary, #64748b);
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.15s;
    }
    .fb-close:hover { background: #f1f5f9; color: #ef4444; }

    .fb-body {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
    }

    .fb-group {
      border: 1.5px solid var(--ngx-grid-border, #e2e8f0);
      border-radius: 12px;
      padding: 12px;
      background: rgba(248, 250, 252, 0.5);
    }

    .fb-group .fb-group {
      margin-top: 8px;
      border-color: #c7d2fe;
      background: rgba(238, 242, 255, 0.3);
    }

    .fb-group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .fb-operator-toggle {
      display: flex;
      gap: 0;
      border: 1px solid var(--ngx-grid-border, #cbd5e1);
      border-radius: 8px;
      overflow: hidden;
    }

    .op-btn {
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      border: none;
      background: var(--ngx-grid-bg, #ffffff);
      cursor: pointer;
      color: var(--ngx-grid-text-secondary, #64748b);
      transition: all 0.15s;
    }
    .op-btn.active {
      background: var(--ngx-btn-primary-bg, #4f46e5);
      color: #ffffff;
    }

    .fb-group-actions {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .fb-add-btn {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid var(--ngx-grid-border, #cbd5e1);
      background: var(--ngx-grid-bg, #ffffff);
      border-radius: 6px;
      cursor: pointer;
      color: var(--ngx-grid-text, #334155);
      transition: all 0.15s;
    }
    .fb-add-btn:hover {
      border-color: var(--ngx-input-focus, #4f46e5);
      color: var(--ngx-input-focus, #4f46e5);
    }
    .fb-add-group {
      border-style: dashed;
    }

    .fb-remove-group, .fb-remove-condition {
      background: transparent;
      border: none;
      font-size: 12px;
      cursor: pointer;
      color: #94a3b8;
      padding: 2px 6px;
      border-radius: 4px;
      transition: all 0.15s;
    }
    .fb-remove-group:hover, .fb-remove-condition:hover {
      color: #ef4444;
      background: #fef2f2;
    }

    .fb-conditions {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .fb-condition-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      background: var(--ngx-grid-bg, #ffffff);
      border: 1px solid var(--ngx-grid-border, #e2e8f0);
      border-radius: 8px;
      transition: all 0.15s;
    }
    .fb-condition-row:hover {
      border-color: var(--ngx-input-focus, #4f46e5);
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.06);
    }

    .fb-select, .fb-input {
      padding: 5px 8px;
      font-size: 12px;
      border: 1px solid var(--ngx-grid-border, #cbd5e1);
      border-radius: 6px;
      background: var(--ngx-grid-bg, #ffffff);
      color: var(--ngx-grid-text, #0f172a);
      font-family: inherit;
      outline: none;
      transition: all 0.15s;
    }
    .fb-select:focus, .fb-input:focus {
      border-color: var(--ngx-input-focus, #4f46e5);
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.12);
    }

    .fb-field-select { min-width: 140px; flex: 1; }
    .fb-operator-select { min-width: 120px; }
    .fb-input { flex: 1; min-width: 80px; }

    .fb-between-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-grid-text-secondary, #94a3b8);
      flex-shrink: 0;
    }

    .fb-empty {
      padding: 16px;
      text-align: center;
      color: var(--ngx-grid-text-secondary, #94a3b8);
      font-size: 12px;
      font-style: italic;
    }

    .fb-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-top: 1px solid var(--ngx-grid-border, #e2e8f0);
      background: var(--ngx-grid-header-bg, #f8fafc);
    }

    .fb-footer-actions {
      display: flex;
      gap: 8px;
    }

    .fb-btn {
      padding: 7px 16px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid var(--ngx-grid-border, #cbd5e1);
      background: var(--ngx-grid-bg, #ffffff);
      color: var(--ngx-grid-text, #334155);
      font-family: inherit;
      transition: all 0.2s;
    }
    .fb-btn:hover {
      border-color: var(--ngx-input-border-hover, #94a3b8);
    }

    .fb-btn-clear {
      border-color: transparent;
      background: transparent;
      color: #ef4444;
    }
    .fb-btn-clear:hover {
      background: #fef2f2;
    }

    .fb-btn-apply {
      background: var(--ngx-btn-primary-bg, #4f46e5);
      color: #ffffff;
      border-color: var(--ngx-btn-primary-bg, #4f46e5);
    }
    .fb-btn-apply:hover {
      background: var(--ngx-btn-primary-hover, #4338ca);
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.25);
    }
  `]
})
export class GridFilterBuilderComponent {
  /** Available columns for filter field selection */
  columns = input<GridColumnDef[]>([]);

  /** Current filter expression to edit */
  expression = input<FilterExpression | null>(null);

  /** Emitted when the user applies the filter */
  expressionChange = output<FilterExpression | null>();

  /** Emitted when the panel is closed */
  close = output<void>();

  /** Internal editable copy of the expression */
  editExpression = signal<FilterExpression>(this.createEmptyGroup());

  /** Filterable columns for the dropdown */
  filterableColumnsList = computed(() =>
    this.columns().filter(c => c.filterable !== false)
  );

  constructor() {
    // Initialize from input expression when available
    const expr = this.expression();
    if (expr) {
      this.editExpression.set(this.deepClone(expr));
    }
  }

  /** Type guard for filter groups */
  isGroup(item: FilterCondition | FilterExpression): item is FilterExpression {
    return 'operator' in item && 'conditions' in item;
  }

  /** Cast helper for template */
  asCondition(item: FilterCondition | FilterExpression): FilterCondition {
    return item as FilterCondition;
  }

  /** Check if an operator doesn't need a value input */
  isUnaryOperator(type: string): boolean {
    return ['isTrue', 'isFalse', 'isEmpty', 'isNotEmpty'].includes(type);
  }

  /** Get available operators based on column type */
  getOperatorsForField(field: string): { value: string; label: string }[] {
    const col = this.columns().find(c => c.field === field);
    const colType = col?.columnType ?? 'text';

    const common = [
      { value: 'isEmpty', label: 'Is Empty' },
      { value: 'isNotEmpty', label: 'Is Not Empty' },
    ];

    switch (colType) {
      case 'number':
        return [
          { value: 'eq', label: 'Equals' },
          { value: 'neq', label: 'Not Equals' },
          { value: 'gt', label: 'Greater Than' },
          { value: 'gte', label: 'Greater or Equal' },
          { value: 'lt', label: 'Less Than' },
          { value: 'lte', label: 'Less or Equal' },
          { value: 'between', label: 'Between' },
          ...common,
        ];
      case 'date':
        return [
          { value: 'eq', label: 'Equals' },
          { value: 'before', label: 'Before' },
          { value: 'after', label: 'After' },
          { value: 'between', label: 'Between' },
          ...common,
        ];
      case 'boolean':
        return [
          { value: 'isTrue', label: 'Is True' },
          { value: 'isFalse', label: 'Is False' },
        ];
      default:
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'eq', label: 'Equals' },
          { value: 'neq', label: 'Not Equals' },
          { value: 'startsWith', label: 'Starts With' },
          { value: 'endsWith', label: 'Ends With' },
          ...common,
        ];
    }
  }

  /** Set the AND/OR operator for a group at the given path */
  setGroupOperator(path: number[], operator: 'AND' | 'OR'): void {
    this.editExpression.update(expr => {
      const clone = this.deepClone(expr);
      const group = this.getGroupAtPath(clone, path);
      if (group) group.operator = operator;
      return clone;
    });
  }

  /** Add a new condition to the group at the given path */
  addCondition(path: number[]): void {
    this.editExpression.update(expr => {
      const clone = this.deepClone(expr);
      const group = this.getGroupAtPath(clone, path);
      if (group) {
        const firstCol = this.filterableColumnsList()[0];
        const condition: FilterCondition = {
          field: firstCol?.field ?? '',
          type: 'contains',
          value: '',
        };
        group.conditions.push(condition);
      }
      return clone;
    });
  }

  /** Add a nested group to the group at the given path */
  addGroup(path: number[]): void {
    this.editExpression.update(expr => {
      const clone = this.deepClone(expr);
      const group = this.getGroupAtPath(clone, path);
      if (group) {
        group.conditions.push(this.createEmptyGroup());
      }
      return clone;
    });
  }

  /** Remove an item (condition or group) at the given path */
  removeItem(path: number[]): void {
    if (path.length === 0) return;
    this.editExpression.update(expr => {
      const clone = this.deepClone(expr);
      const parentPath = path.slice(0, -1);
      const index = path[path.length - 1];
      const parent = this.getGroupAtPath(clone, parentPath);
      if (parent) {
        parent.conditions.splice(index, 1);
      }
      return clone;
    });
  }

  /** Update condition field */
  updateConditionField(path: number[], field: string): void {
    this.updateConditionProp(path, 'field', field);
  }

  /** Update condition operator type */
  updateConditionType(path: number[], type: string): void {
    this.updateConditionProp(path, 'type', type);
  }

  /** Update condition value */
  updateConditionValue(path: number[], value: string): void {
    this.updateConditionProp(path, 'value', value);
  }

  /** Update condition valueTo (for between) */
  updateConditionValueTo(path: number[], value: string): void {
    this.updateConditionProp(path, 'valueTo', value);
  }

  /** Apply the current filter expression */
  applyFilter(): void {
    const expr = this.editExpression();
    if (expr.conditions.length === 0) {
      this.expressionChange.emit(null);
    } else {
      this.expressionChange.emit(this.deepClone(expr));
    }
    this.close.emit();
  }

  /** Clear all conditions */
  clearAll(): void {
    this.editExpression.set(this.createEmptyGroup());
  }

  // ─── Private helpers ──────────────────────────────────────────────

  private createEmptyGroup(): FilterExpression {
    return { operator: 'AND', conditions: [] };
  }

  private getGroupAtPath(root: FilterExpression, path: number[]): FilterExpression | null {
    let current: FilterExpression = root;
    for (const index of path) {
      const item = current.conditions[index];
      if (!item || !this.isGroup(item)) return null;
      current = item;
    }
    return current;
  }

  private updateConditionProp(path: number[], prop: string, value: unknown): void {
    if (path.length === 0) return;
    this.editExpression.update(expr => {
      const clone = this.deepClone(expr);
      const parentPath = path.slice(0, -1);
      const index = path[path.length - 1];
      const parent = this.getGroupAtPath(clone, parentPath);
      if (parent) {
        const condition = parent.conditions[index] as unknown as Record<string, unknown>;
        if (condition) condition[prop] = value;
      }
      return clone;
    });
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
