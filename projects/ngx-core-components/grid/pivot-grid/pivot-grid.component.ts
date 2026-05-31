import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

export interface PivotValueDef {
  field: string;
  label?: string;
  aggregate?: 'sum' | 'count' | 'avg' | 'min' | 'max';
}

interface PivotColumn {
  key: string;
  label: string;
}

interface PivotRow {
  key: string;
  label: string;
  values: Record<string, unknown>;
}

@Component({
  selector: 'ngx-pivot-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ngx-pivot-grid">
      <table>
        <thead>
          <tr>
            <th class="row-header">{{ rowHeaderLabel() }}</th>
            @for (column of pivotColumns(); track column.key) {
              @for (value of values(); track value.field) {
                <th>{{ column.label }}@if (values().length > 1) { <span> / {{ value.label || value.field }}</span> }</th>
              }
            }
          </tr>
        </thead>
        <tbody>
          @for (row of pivotRows(); track row.key) {
            <tr>
              <th class="row-label">{{ row.label }}</th>
              @for (column of pivotColumns(); track column.key) {
                @for (value of values(); track value.field) {
                  <td>{{ aggregateCell(row, column, value) }}</td>
                }
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ngx-pivot-grid { width: 100%; overflow: auto; border: 1px solid var(--border-color, #dbe3ee); border-radius: 8px; background: var(--bg-secondary, #ffffff); }
    table { width: 100%; border-collapse: collapse; min-width: 520px; font-family: var(--ngx-font-family, inherit); font-size: 13px; color: var(--text-primary, #0f172a); }
    th, td { padding: 10px 12px; border-bottom: 1px solid var(--border-light, #edf2f7); border-right: 1px solid var(--border-light, #edf2f7); text-align: right; white-space: nowrap; }
    thead th { position: sticky; top: 0; z-index: 1; background: var(--border-light, #f8fafc); color: var(--text-secondary, #475569); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; }
    thead th span { color: var(--text-primary, #0f172a); }
    .row-header, .row-label { position: sticky; left: 0; z-index: 2; text-align: left; background: var(--bg-secondary, #ffffff); }
    thead .row-header { z-index: 3; background: var(--border-light, #f8fafc); }
    tbody tr:hover td, tbody tr:hover .row-label { background: var(--primary-glow, rgba(79, 70, 229, 0.04)); }
    tr:last-child th, tr:last-child td { border-bottom: none; }
  `]
})
export class PivotGridComponent {
  data = input<Record<string, unknown>[]>([]);
  rows = input<string[]>([]);
  columns = input<string[]>([]);
  values = input<PivotValueDef[]>([{ field: 'value', aggregate: 'sum' }]);
  emptyValue = input('-');

  pivotColumns = computed<PivotColumn[]>(() => {
    const keys = new Map<string, string>();
    for (const item of this.data()) {
      const key = this.keyFor(item, this.columns());
      keys.set(key, this.labelFor(item, this.columns()));
    }
    return Array.from(keys, ([key, label]) => ({ key, label }));
  });

  pivotRows = computed<PivotRow[]>(() => {
    const rows = new Map<string, PivotRow>();
    for (const item of this.data()) {
      const key = this.keyFor(item, this.rows());
      if (!rows.has(key)) {
        rows.set(key, { key, label: this.labelFor(item, this.rows()), values: item });
      }
    }
    return Array.from(rows.values());
  });

  rowHeaderLabel(): string {
    return this.rows().join(' / ') || 'Rows';
  }

  aggregateCell(row: PivotRow, column: PivotColumn, value: PivotValueDef): string | number {
    const items = this.data().filter(item => this.keyFor(item, this.rows()) === row.key && this.keyFor(item, this.columns()) === column.key);
    if (!items.length) return this.emptyValue();

    const aggregate = value.aggregate ?? 'sum';
    if (aggregate === 'count') return items.length;

    const numbers = items.map(item => Number(item[value.field])).filter(item => Number.isFinite(item));
    if (!numbers.length) return this.emptyValue();
    if (aggregate === 'avg') return this.round(numbers.reduce((sum, item) => sum + item, 0) / numbers.length);
    if (aggregate === 'min') return Math.min(...numbers);
    if (aggregate === 'max') return Math.max(...numbers);
    return this.round(numbers.reduce((sum, item) => sum + item, 0));
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
