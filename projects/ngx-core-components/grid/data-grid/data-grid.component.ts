import {
  Component, ChangeDetectionStrategy, input, output, signal, computed
} from '@angular/core';

export interface GridColumnDef {
  field: string;
  title: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface GridSortState { field: string; dir: 'asc' | 'desc'; }
export interface GridPageChangeEvent { page: number; pageSize: number; }
export interface GridSortChangeEvent { sort: GridSortState | null; }
export interface GridRowClickEvent<T = Record<string, unknown>> { row: T; index: number; }

@Component({
  selector: 'ngx-data-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-data-grid" [class.loading]="loading()">

      <!-- Filter row (above table) if any column is filterable -->
      @if (hasFilterableColumns()) {
        <div class="grid-filter-bar">
          @for (col of columns(); track col.field) {
            @if (col.filterable) {
              <input
                class="grid-filter-input"
                [placeholder]="'Filter ' + col.title"
                [value]="getFilter(col.field)"
                (input)="setFilter(col.field, $any($event.target).value)"
                [style.width.px]="col.width ?? 120"
              />
            } @else {
              <div [style.width.px]="col.width ?? 120" class="grid-filter-spacer"></div>
            }
          }
        </div>
      }

      <!-- Table -->
      <div class="grid-table-wrap">
        <table class="grid-table" [class.striped]="striped()">
          <thead>
            <tr>
              @if (selectable()) {
                <th class="grid-th grid-th-check" style="width:40px">
                  <input type="checkbox" [checked]="allSelected()" [indeterminate]="someSelected() && !allSelected()" (change)="toggleAll()" />
                </th>
              }
              @for (col of columns(); track col.field) {
                <th
                  class="grid-th"
                  [style.width.px]="col.width"
                  [class.sortable]="col.sortable"
                  [class.sort-asc]="sortState()?.field === col.field && sortState()?.dir === 'asc'"
                  [class.sort-desc]="sortState()?.field === col.field && sortState()?.dir === 'desc'"
                  (click)="col.sortable ? onSort(col) : null"
                >
                  <span class="th-text">{{ col.title }}</span>
                  @if (col.sortable) {
                    <span class="sort-icon">
                      @if (sortState()?.field === col.field) {
                        {{ sortState()?.dir === 'asc' ? '↑' : '↓' }}
                      } @else { ↕ }
                    </span>
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              <tr>
                <td [attr.colspan]="columns().length + (selectable() ? 1 : 0)" class="grid-loading-cell">
                  <div class="grid-spinner"></div>
                </td>
              </tr>
            } @else if (pagedData().length === 0) {
              <tr>
                <td [attr.colspan]="columns().length + (selectable() ? 1 : 0)" class="grid-empty-cell">No data found.</td>
              </tr>
            } @else {
              @for (row of pagedData(); track getKey(row, $index); let i = $index) {
                <tr
                  class="grid-row"
                  [class.selected]="isRowSelected(row)"
                  (click)="onRowClick(row, i)"
                >
                  @if (selectable()) {
                    <td class="grid-td grid-td-check">
                      <input type="checkbox" [checked]="isRowSelected(row)" (change)="toggleRow(row)" (click)="$event.stopPropagation()" />
                    </td>
                  }
                  @for (col of columns(); track col.field) {
                    <td class="grid-td" [style.text-align]="col.align ?? 'left'">
                      {{ getCellValue(row, col.field) }}
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (pagedData().length > 0 || totalFiltered() > 0) {
        <div class="grid-pagination">
          <span class="page-info">
            {{ (currentPage() - 1) * pageSize() + 1 }}–{{ Math.min(currentPage() * pageSize(), totalFiltered()) }}
            of {{ totalFiltered() }}
          </span>
          <div class="page-btns">
            <button class="page-btn" [disabled]="currentPage() === 1" (click)="goPage(1)">&#171;</button>
            <button class="page-btn" [disabled]="currentPage() === 1" (click)="goPage(currentPage() - 1)">&#8249;</button>
            @for (p of pageNumbers(); track p) {
              <button class="page-btn" [class.active]="p === currentPage()" (click)="goPage(p)">{{ p }}</button>
            }
            <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goPage(currentPage() + 1)">&#8250;</button>
            <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goPage(totalPages())">&#187;</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-data-grid {
      font-family: inherit; border: 1px solid var(--ngx-grid-border, #dee2e6);
      border-radius: var(--ngx-grid-radius, 4px); overflow: hidden; background: var(--ngx-grid-bg, #fff);
    }
    .grid-filter-bar {
      display: flex; gap: 8px; padding: 8px 12px;
      background: var(--ngx-grid-header-bg, #f1f3f5); border-bottom: 1px solid var(--ngx-grid-border, #dee2e6);
    }
    .grid-filter-input {
      padding: 4px 8px; border: 1px solid var(--ngx-grid-border, #dee2e6); border-radius: 3px;
      font-size: 12px; outline: none; font-family: inherit;
    }
    .grid-filter-input:focus { border-color: #4a90d9; }
    .grid-filter-spacer { flex-shrink: 0; }
    .grid-table-wrap { overflow-x: auto; }
    .grid-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .grid-th {
      padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600;
      color: var(--ngx-grid-text-secondary, #6c757d); background: var(--ngx-grid-header-bg, #f1f3f5);
      border-bottom: 2px solid var(--ngx-grid-border, #dee2e6); white-space: nowrap; user-select: none;
    }
    .grid-th.sortable { cursor: pointer; }
    .grid-th.sortable:hover { background: #e9ecef; }
    .grid-th.sort-asc, .grid-th.sort-desc { color: #4a90d9; }
    .th-text { margin-right: 4px; }
    .sort-icon { font-size: 10px; color: #adb5bd; }
    .sort-asc .sort-icon, .sort-desc .sort-icon { color: #4a90d9; }
    .grid-row { border-bottom: 1px solid var(--ngx-grid-border, #dee2e6); cursor: default; transition: background 0.1s; }
    .grid-row:hover { background: var(--ngx-grid-hover-bg, #f8f9fa); }
    .grid-row.selected { background: var(--ngx-grid-selected-bg, #e8f0fe); }
    .grid-table.striped .grid-row:nth-child(even) { background: #f8f9fa; }
    .grid-table.striped .grid-row:nth-child(even):hover { background: var(--ngx-grid-hover-bg, #f8f9fa); }
    .grid-table.striped .grid-row.selected { background: var(--ngx-grid-selected-bg, #e8f0fe) !important; }
    .grid-td { padding: 9px 12px; color: var(--ngx-grid-text, #212529); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .grid-th-check, .grid-td-check { width: 40px !important; text-align: center; }
    .grid-loading-cell, .grid-empty-cell { padding: 32px; text-align: center; color: var(--ngx-grid-text-secondary, #6c757d); }
    .grid-spinner {
      width: 24px; height: 24px; border: 3px solid #dee2e6; border-top-color: #4a90d9;
      border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .grid-pagination {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; border-top: 1px solid var(--ngx-grid-border, #dee2e6);
      background: var(--ngx-grid-bg, #fff); flex-wrap: wrap; gap: 8px;
    }
    .page-info { font-size: 12px; color: var(--ngx-grid-text-secondary, #6c757d); }
    .page-btns { display: flex; gap: 2px; }
    .page-btn {
      min-width: 28px; height: 28px; padding: 0 6px; font-size: 13px;
      border: 1px solid var(--ngx-grid-border, #dee2e6); background: var(--ngx-grid-bg, #fff);
      border-radius: 3px; cursor: pointer; font-family: inherit;
      color: var(--ngx-grid-text, #212529); transition: background 0.1s;
    }
    .page-btn:hover:not(:disabled) { background: #f1f3f5; }
    .page-btn.active { background: #4a90d9; color: #fff; border-color: #4a90d9; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class DataGridComponent<T extends object = Record<string, unknown>> {
  data = input<T[]>([]);
  columns = input<GridColumnDef[]>([]);
  pageSize = input<number>(10);
  selectable = input<boolean>(false);
  striped = input<boolean>(true);
  loading = input<boolean>(false);

  rowClick = output<GridRowClickEvent<T>>();
  selectionChange = output<T[]>();
  sortChange = output<GridSortChangeEvent>();
  pageChange = output<GridPageChangeEvent>();

  sortState = signal<GridSortState | null>(null);
  currentPage = signal(1);
  selectedRows = signal<Set<T>>(new Set());
  private filters = signal<Map<string, string>>(new Map());

  readonly Math = Math;

  hasFilterableColumns = computed(() => this.columns().some(c => c.filterable));

  private filteredData = computed(() => {
    let d = this.data() as T[];
    const fs = this.filters();
    fs.forEach((val, field) => {
      if (val) d = d.filter(row => String((row as Record<string,unknown>)[field] ?? '').toLowerCase().includes(val.toLowerCase()));
    });
    const s = this.sortState();
    if (s) {
      d = [...d].sort((a, b) => {
        const av = (a as Record<string,unknown>)[s.field];
        const bv = (b as Record<string,unknown>)[s.field];
        const cmp = av == null ? -1 : bv == null ? 1 : String(av).localeCompare(String(bv), undefined, { numeric: true });
        return s.dir === 'asc' ? cmp : -cmp;
      });
    }
    return d;
  });

  totalFiltered = computed(() => this.filteredData().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalFiltered() / this.pageSize())));

  pagedData = computed(() => {
    const p = this.currentPage();
    const sz = this.pageSize();
    return this.filteredData().slice((p - 1) * sz, p * sz);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const cur = this.currentPage();
    const pages: number[] = [];
    for (let i = Math.max(1, cur - 2); i <= Math.min(total, cur + 2); i++) pages.push(i);
    return pages;
  });

  allSelected = computed(() => this.pagedData().length > 0 && this.pagedData().every(r => this.selectedRows().has(r)));
  someSelected = computed(() => this.pagedData().some(r => this.selectedRows().has(r)));

  getFilter(field: string): string { return this.filters().get(field) ?? ''; }
  setFilter(field: string, val: string): void {
    const m = new Map(this.filters());
    if (val) m.set(field, val); else m.delete(field);
    this.filters.set(m);
    this.currentPage.set(1);
  }

  onSort(col: GridColumnDef): void {
    const s = this.sortState();
    if (s?.field === col.field) {
      this.sortState.set(s.dir === 'asc' ? { field: col.field, dir: 'desc' } : null);
    } else {
      this.sortState.set({ field: col.field, dir: 'asc' });
    }
    this.currentPage.set(1);
    this.sortChange.emit({ sort: this.sortState() });
  }

  goPage(p: number): void {
    this.currentPage.set(p);
    this.pageChange.emit({ page: p, pageSize: this.pageSize() });
  }

  onRowClick(row: T, index: number): void { this.rowClick.emit({ row, index }); }

  isRowSelected(row: T): boolean { return this.selectedRows().has(row); }

  toggleRow(row: T): void {
    const s = new Set(this.selectedRows());
    s.has(row) ? s.delete(row) : s.add(row);
    this.selectedRows.set(s);
    this.selectionChange.emit([...s]);
  }

  toggleAll(): void {
    const cur = this.allSelected();
    const s = new Set(this.selectedRows());
    this.pagedData().forEach(r => cur ? s.delete(r) : s.add(r));
    this.selectedRows.set(s);
    this.selectionChange.emit([...s]);
  }

  getCellValue(row: T, field: string): string {
    const val = (row as Record<string, unknown>)[field];
    return val == null ? '' : String(val);
  }

  getKey(row: T, i: number): string {
    const r = row as Record<string, unknown>;
    return String(r['id'] ?? r['key'] ?? i);
  }
}
