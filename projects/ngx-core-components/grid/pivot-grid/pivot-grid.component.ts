import { CommonModule } from '@angular/common';
import { Component, computed, input, signal, effect } from '@angular/core';

export interface PivotValueDef {
  field: string;
  label?: string;
  aggregate?: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'custom';
  customAggregate?: (items: Record<string, unknown>[]) => number | string;
  formatter?: (value: number | string) => string;
}

interface PivotColumn {
  key: string;
  label: string;
  isTotal?: boolean;
}

interface PivotRow {
  key: string;
  label: string;
  values: Record<string, unknown>;
  isTotal?: boolean;
}

@Component({
  selector: 'ngx-pivot-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ngx-pivot-grid-wrapper">
      <!-- Toolbar & Field Chooser Header -->
      <div class="pivot-toolbar" *ngIf="showFieldChooser()">
        <div class="toolbar-title">
          <span class="pivot-icon">📊</span>
          <span class="title-text">Pivot Analysis Studio</span>
        </div>
        <button type="button" class="field-chooser-toggle" (click)="isChooserOpen.set(!isChooserOpen())">
          ⚙ Field Chooser
        </button>
      </div>

      <!-- Collapsible Field Chooser Drawer -->
      <div class="field-chooser-drawer" *ngIf="showFieldChooser() && isChooserOpen()">
        <div class="chooser-grid">
          <div class="chooser-section">
            <span class="section-label">Row Dimensions</span>
            <div class="field-chips-list">
              @for (field of activeRows(); track field) {
                <span class="field-chip row-chip">
                  {{ field }}
                  <button type="button" class="remove-chip" (click)="removeRowField(field)">✕</button>
                </span>
              }
            </div>
          </div>

          <div class="chooser-section">
            <span class="section-label">Column Dimensions</span>
            <div class="field-chips-list">
              @for (field of activeCols(); track field) {
                <span class="field-chip col-chip">
                  {{ field }}
                  <button type="button" class="remove-chip" (click)="removeColField(field)">✕</button>
                </span>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Pivot Data Table -->
      <div class="ngx-pivot-grid">
        <table>
          <thead>
            <tr>
              <th class="row-header">{{ rowHeaderLabel() }}</th>
              @for (column of pivotColumns(); track column.key) {
                @for (value of activeValues(); track value.field) {
                  <th [class.total-col-header]="column.isTotal">
                    {{ column.label }}@if (activeValues().length > 1) { <span> / {{ value.label || value.field }}</span> }
                  </th>
                }
              }
            </tr>
          </thead>
          <tbody>
            @for (row of pivotRows(); track row.key) {
              <tr [class.grand-total-row]="row.isTotal">
                <th class="row-label" [class.grand-total-header]="row.isTotal">{{ row.label }}</th>
                @for (column of pivotColumns(); track column.key) {
                  @for (value of activeValues(); track value.field) {
                    <td [class.grand-total-cell]="row.isTotal || column.isTotal">
                      {{ aggregateCell(row, column, value) }}
                    </td>
                  }
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .ngx-pivot-grid-wrapper {
      width: 100%;
      border: 1px solid var(--border-color, #dbe3ee);
      border-radius: 12px;
      background: var(--bg-secondary, #ffffff);
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      font-family: var(--ngx-font-family, inherit);
    }

    .pivot-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--border-light, #f8fafc);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
    }
    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 14px;
      color: var(--text-primary, #0f172a);
    }
    .field-chooser-toggle {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      color: var(--text-primary, #334155);
      transition: all 0.2s;
    }
    .field-chooser-toggle:hover {
      background: #f1f5f9;
    }

    .field-chooser-drawer {
      padding: 14px 16px;
      background: #f1f5f9;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
    }
    .chooser-grid {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .chooser-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      min-width: 180px;
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
    }
    .field-chips-list {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .field-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      background: #ffffff;
      border: 1px solid #cbd5e1;
    }
    .row-chip { border-color: #3b82f6; color: #1d4ed8; }
    .col-chip { border-color: #10b981; color: #047857; }
    .remove-chip {
      background: transparent;
      border: none;
      font-size: 10px;
      cursor: pointer;
      color: #94a3b8;
      padding: 0;
    }
    .remove-chip:hover { color: #ef4444; }

    .ngx-pivot-grid {
      width: 100%;
      overflow: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 520px;
      font-size: 13px;
      color: var(--text-primary, #0f172a);
    }
    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-light, #edf2f7);
      border-right: 1px solid var(--border-light, #edf2f7);
      text-align: right;
      white-space: nowrap;
    }
    thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--border-light, #f8fafc);
      color: var(--text-secondary, #475569);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    thead th span { color: var(--text-primary, #0f172a); }
    .row-header, .row-label {
      position: sticky;
      left: 0;
      z-index: 2;
      text-align: left;
      background: var(--bg-secondary, #ffffff);
    }
    thead .row-header { z-index: 3; background: var(--border-light, #f8fafc); }
    tbody tr:hover td, tbody tr:hover .row-label {
      background: var(--primary-glow, rgba(79, 70, 229, 0.04));
    }
    tr:last-child th, tr:last-child td { border-bottom: none; }

    /* Grand Total Row & Column styles */
    .grand-total-row {
      background: rgba(79, 70, 229, 0.06) !important;
      font-weight: 700;
    }
    .grand-total-header {
      background: #f1f5f9 !important;
      font-weight: 800;
    }
    .grand-total-cell {
      font-weight: 700;
      background: rgba(79, 70, 229, 0.03);
    }
    .total-col-header {
      background: #e2e8f0 !important;
      color: #1e293b !important;
      font-weight: 800 !important;
    }
  `]
})
export class PivotGridComponent {
  data = input<Record<string, unknown>[]>([]);
  rows = input<string[]>([]);
  columns = input<string[]>([]);
  values = input<PivotValueDef[]>([{ field: 'value', aggregate: 'sum' }]);
  emptyValue = input('-');
  showGrandTotals = input<boolean>(true);
  showFieldChooser = input<boolean>(true);

  isChooserOpen = signal(false);
  activeRows = signal<string[]>([]);
  activeCols = signal<string[]>([]);
  activeValues = signal<PivotValueDef[]>([]);

  constructor() {
    effect(() => {
      this.activeRows.set([...this.rows()]);
      this.activeCols.set([...this.columns()]);
      this.activeValues.set([...this.values()]);
    }, { allowSignalWrites: true });
  }

  pivotColumns = computed<PivotColumn[]>(() => {
    const keys = new Map<string, string>();
    const cols = this.activeCols();
    for (const item of this.data()) {
      const key = this.keyFor(item, cols);
      keys.set(key, this.labelFor(item, cols));
    }
    const colsList: PivotColumn[] = Array.from(keys, ([key, label]) => ({ key, label }));

    if (this.showGrandTotals()) {
      colsList.push({ key: '__GRAND_TOTAL__', label: 'Grand Total', isTotal: true });
    }

    return colsList;
  });

  pivotRows = computed<PivotRow[]>(() => {
    const rowsMap = new Map<string, PivotRow>();
    const rowFields = this.activeRows();
    for (const item of this.data()) {
      const key = this.keyFor(item, rowFields);
      if (!rowsMap.has(key)) {
        rowsMap.set(key, { key, label: this.labelFor(item, rowFields), values: item });
      }
    }
    const rowsList: PivotRow[] = Array.from(rowsMap.values());

    if (this.showGrandTotals()) {
      rowsList.push({ key: '__GRAND_TOTAL__', label: 'Grand Total', values: {}, isTotal: true });
    }

    return rowsList;
  });

  rowHeaderLabel(): string {
    return this.activeRows().join(' / ') || 'Rows';
  }

  removeRowField(field: string): void {
    this.activeRows.update(r => r.filter(f => f !== field));
  }

  removeColField(field: string): void {
    this.activeCols.update(c => c.filter(f => f !== field));
  }

  aggregateCell(row: PivotRow, column: PivotColumn, value: PivotValueDef): string | number {
    let items = this.data();

    // Filter by row keys (unless Grand Total row)
    if (!row.isTotal) {
      items = items.filter(item => this.keyFor(item, this.activeRows()) === row.key);
    }

    // Filter by column keys (unless Grand Total column)
    if (!column.isTotal) {
      items = items.filter(item => this.keyFor(item, this.activeCols()) === column.key);
    }

    if (!items.length) return this.emptyValue();

    let computedVal: number | string = 0;
    const aggregate = value.aggregate ?? 'sum';

    if (aggregate === 'custom' && value.customAggregate) {
      computedVal = value.customAggregate(items);
    } else if (aggregate === 'count') {
      computedVal = items.length;
    } else {
      const numbers = items.map(item => Number(item[value.field])).filter(item => Number.isFinite(item));
      if (!numbers.length) return this.emptyValue();
      if (aggregate === 'avg') computedVal = this.round(numbers.reduce((sum, item) => sum + item, 0) / numbers.length);
      else if (aggregate === 'min') computedVal = Math.min(...numbers);
      else if (aggregate === 'max') computedVal = Math.max(...numbers);
      else computedVal = this.round(numbers.reduce((sum, item) => sum + item, 0));
    }

    if (value.formatter && typeof computedVal === 'number') {
      return value.formatter(computedVal);
    }

    return computedVal;
  }

  private keyFor(item: Record<string, unknown>, fields: string[]): string {
    return fields.map(field => String(item[field] ?? '')).join('||') || '__total__';
  }

  private labelFor(item: Record<string, unknown>, fields: string[]): string {
    return fields.map(field => String(item[field] ?? '')).filter(Boolean).join(' / ') || 'Total';
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
