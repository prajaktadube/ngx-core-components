import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import {
  DataGridComponent,
  GridColumnDef,
  NgxGridCellTemplateDirective,
  NgxGridEditCellTemplateDirective,
  NgxGridHeaderTemplateDirective,
  NgxGridFooterTemplateDirective,
} from './data-grid.component';
import { provideNgxI18n } from '../../i18n/public-api';

@Component({
  standalone: true,
  imports: [DataGridComponent],
  template: `
    <ngx-data-grid
      [data]="testData()"
      [columns]="testColumns"
      [stateKey]="stateKey()"
      [pageSize]="pageSize()"
      [reorderable]="reorderable()"
      [multiSort]="multiSort()"
      [showGlobalSearch]="showGlobalSearch()"
      [rowReorderable]="rowReorderable()"
      [showColumnChooser]="showColumnChooser()"
      [cellSelection]="cellSelection()"
      [enableContextMenu]="enableContextMenu()"
      [keyboardNavigation]="keyboardNavigation()"
      [groupAggregations]="groupAggregations()"
    />
  `
})
class TestGridWrapperComponent {
  stateKey = signal('');
  pageSize = signal(10);
  reorderable = signal(false);
  multiSort = signal(false);
  showGlobalSearch = signal(false);
  rowReorderable = signal(false);
  showColumnChooser = signal(false);
  cellSelection = signal(false);
  enableContextMenu = signal(false);
  keyboardNavigation = signal(true);
  groupAggregations = signal(true);
  testData = signal<any[]>([
    { id: 1, name: 'Alice', salary: 100 },
    { id: 2, name: 'Bob', salary: 200 },
    { id: 3, name: 'Charlie', salary: 300 }
  ]);

  testColumns: GridColumnDef[] = [
    { field: 'id', title: 'ID', aggregation: 'count' },
    { field: 'name', title: 'Name', filterable: true },
    { field: 'salary', title: 'Salary', aggregation: 'sum' }
  ];
}

describe('DataGridComponent Enterprise Features', () => {
  let component: TestGridWrapperComponent;
  let fixture: ComponentFixture<TestGridWrapperComponent>;
  let gridComponent: DataGridComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestGridWrapperComponent, DataGridComponent],
      providers: [
        provideNgxI18n({
          grid: {
            noData: 'Keine Daten',
            filterPlaceholder: 'Suchen...',
            pageOf: (p, t) => `Seite ${p} von ${t}`,
            sortAscending: 'Aufsteigend',
            sortDescending: 'Absteigend',
            selectAll: 'Alle auswählen',
            deselectAll: 'Alle abwählen',
            exportCsv: 'CSV exportieren',
            groupBy: 'Gruppieren'
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestGridWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    gridComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof DataGridComponent
    ).componentInstance as DataGridComponent;
  });

  it('should compute count and sum aggregations correctly', () => {
    const idColumn = component.testColumns.find(c => c.field === 'id')!;
    const salaryColumn = component.testColumns.find(c => c.field === 'salary')!;

    expect(gridComponent.getAggregationValue(idColumn)).toBe('3');
    expect(gridComponent.getAggregationValue(salaryColumn)).toBe('600');
  });

  it('should compute custom column width when resized', () => {
    const col = component.testColumns[0];
    expect(gridComponent.getColumnWidth(col)).toBeUndefined();

    gridComponent.columnWidths.set({ 'id': 150 });
    expect(gridComponent.getColumnWidth(col)).toBe(150);
  });

  it('should dynamically list distinct checklist values for filtering', () => {
    const distinct = gridComponent.getDistinctValues('name');
    expect(distinct).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should identify pinned columns and reorder them first', () => {
    component.testColumns = [
      { field: 'salary', title: 'Salary' },
      { field: 'id', title: 'ID', pinned: 'left' },
      { field: 'name', title: 'Name' }
    ];
    fixture.detectChanges();

    expect(gridComponent.hasPinnedColumns()).toBe(true);
    expect(gridComponent.orderedColumns()[0].field).toBe('id');
  });

  it('should calculate correct column sticky offsets', () => {
    component.testColumns = [
      { field: 'id', title: 'ID', pinned: 'left', width: 100 },
      { field: 'name', title: 'Name', pinned: 'left', width: 150 }
    ];
    fixture.detectChanges();

    expect(gridComponent.columnOffsets()['id']).toBe(0);
    expect(gridComponent.columnOffsets()['name']).toBe(100);
  });

  it('should load grid state from localStorage on init', () => {
    const store: Record<string, string> = {
      'ngx_grid_state_persistence-spec': JSON.stringify({
        columnWidths: { 'name': 180 },
        sortState: { field: 'name', dir: 'desc' },
        currentPage: 2,
        filters: []
      })
    };
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);

    const newFixture = TestBed.createComponent(TestGridWrapperComponent);
    newFixture.componentInstance.pageSize.set(1);
    newFixture.componentInstance.stateKey.set('persistence-spec');
    newFixture.detectChanges();

    const newGrid = newFixture.debugElement.query(
      el => el.componentInstance instanceof DataGridComponent
    ).componentInstance as DataGridComponent;

    expect(newGrid.columnWidths()['name']).toBe(180);
    expect(newGrid.sortState()?.field).toBe('name');
    expect(newGrid.sortState()?.dir).toBe('desc');
    expect(newGrid.currentPage()).toBe(2);
  });

  it('should reorder columns on column drag and drop', () => {
    component.reorderable.set(true);
    fixture.detectChanges();

    const cols = gridComponent.orderedColumns();
    expect(cols.map(c => c.field)).toEqual(['id', 'name', 'salary']);

    const dragStartEvent = new DragEvent('dragstart');
    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: {
        setData: jasmine.createSpy('setData'),
        effectAllowed: 'move'
      }
    });
    gridComponent.onDragStart(dragStartEvent, cols[0]);

    const dropEvent = new DragEvent('drop');
    gridComponent.onDrop(dropEvent, cols[2]);

    fixture.detectChanges();

    const newCols = gridComponent.orderedColumns();
    expect(newCols.map(c => c.field)).toEqual(['name', 'salary', 'id']);
  });

  it('should not reorder columns if reorderable is false', () => {
    component.reorderable.set(false);
    fixture.detectChanges();

    const cols = gridComponent.orderedColumns();
    const dragStartEvent = new DragEvent('dragstart');
    gridComponent.onDragStart(dragStartEvent, cols[0]);

    const dropEvent = new DragEvent('drop');
    gridComponent.onDrop(dropEvent, cols[2]);

    fixture.detectChanges();

    const newCols = gridComponent.orderedColumns();
    expect(newCols.map(c => c.field)).toEqual(['id', 'name', 'salary']);
  });

  it('should perform multi-column sorting sequentially', () => {
    component.multiSort.set(true);
    component.testData.set([
      { id: 1, name: 'Alice', salary: 300 },
      { id: 2, name: 'Bob', salary: 200 },
      { id: 3, name: 'Alice', salary: 100 },
    ]);
    fixture.detectChanges();

    const cols = gridComponent.orderedColumns();
    const nameCol = cols.find(c => c.field === 'name')!;
    const salaryCol = cols.find(c => c.field === 'salary')!;

    gridComponent.onSort(nameCol);
    fixture.detectChanges();
    expect(gridComponent.sortStates()).toEqual([{ field: 'name', dir: 'asc' }]);

    const ctrlEvent = new MouseEvent('click', { ctrlKey: true });
    gridComponent.onSort(salaryCol, ctrlEvent);
    fixture.detectChanges();

    expect(gridComponent.sortStates()).toEqual([
      { field: 'name', dir: 'asc' },
      { field: 'salary', dir: 'asc' }
    ]);

    const rendered = gridComponent.flatRenderedRows();
    expect(rendered[0]['id']).toBe(3); // Alice, 100
    expect(rendered[1]['id']).toBe(1); // Alice, 300
    expect(rendered[2]['id']).toBe(2); // Bob, 200
  });

  it('should fall back to single-column sorting if Ctrl/Shift is not held', () => {
    component.multiSort.set(true);
    fixture.detectChanges();

    const cols = gridComponent.orderedColumns();
    const nameCol = cols.find(c => c.field === 'name')!;
    const salaryCol = cols.find(c => c.field === 'salary')!;

    gridComponent.onSort(nameCol);
    expect(gridComponent.sortStates()).toEqual([{ field: 'name', dir: 'asc' }]);

    gridComponent.onSort(salaryCol);
    fixture.detectChanges();

    expect(gridComponent.sortStates()).toEqual([{ field: 'salary', dir: 'asc' }]);
  });

  it('should filter rows based on global search text and highlight matches', () => {
    component.showGlobalSearch.set(true);
    fixture.detectChanges();

    gridComponent.searchText.set('Alice');
    fixture.detectChanges();

    const rendered = gridComponent.flatRenderedRows();
    expect(rendered.length).toBe(1);
    expect(rendered[0]['name']).toBe('Alice');

    const highlighted = gridComponent.highlightSearchText(rendered[0]['name']);
    expect(highlighted).toBe('<mark class="search-highlight">Alice</mark>');
  });

  it('should reorder rows on row drag and drop', () => {
    component.rowReorderable.set(true);
    fixture.detectChanges();

    const rendered = gridComponent.flatRenderedRows();
    expect(rendered.map(r => r['name'])).toEqual(['Alice', 'Bob', 'Charlie']);

    let emittedEvent: any = null;
    gridComponent.rowReorder.subscribe(e => emittedEvent = e);

    const dragStartEvent = new DragEvent('dragstart');
    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: {
        setData: jasmine.createSpy('setData'),
        effectAllowed: 'move'
      }
    });
    gridComponent.onRowDragStart(dragStartEvent, 0);

    const dropEvent = new DragEvent('drop');
    gridComponent.onRowDrop(dropEvent, 1);
    fixture.detectChanges();

    expect(emittedEvent).not.toBeNull();
    expect(emittedEvent.previousIndex).toBe(0);
    expect(emittedEvent.currentIndex).toBe(1);
    expect(emittedEvent.data.map((r: any) => r['name'])).toEqual(['Bob', 'Alice', 'Charlie']);
  });

  it('should filter out hidden columns from orderedColumns', () => {
    gridComponent.hiddenColumns.set(new Set(['name']));
    fixture.detectChanges();

    const cols = gridComponent.orderedColumns();
    expect(cols.map(c => c.field)).toEqual(['id', 'salary']);
  });

  it('should hide column initially if hidden is true in column definition', () => {
    component.testColumns = [
      { field: 'id', title: 'ID', aggregation: 'count' },
      { field: 'name', title: 'Name', filterable: true, hidden: true },
      { field: 'salary', title: 'Salary', aggregation: 'sum' }
    ];
    fixture.detectChanges();

    const cols = gridComponent.orderedColumns();
    expect(cols.map(c => c.field)).toEqual(['id', 'salary']);
  });

  it('should position context menu correctly on right click', () => {
    component.enableContextMenu.set(true);
    fixture.detectChanges();

    const rows = gridComponent.renderedRowsList();
    const mockEvent = new MouseEvent('contextmenu', { clientX: 100, clientY: 150 });
    spyOn(mockEvent, 'preventDefault');

    gridComponent.onCellContextMenu(mockEvent, rows[0], 'name');

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    const menu = gridComponent.activeContextMenu();
    expect(menu).not.toBeNull();
    expect(menu?.colField).toBe('name');
  });

  it('should toggle pinning using contextMenuTogglePin override', () => {
    component.enableContextMenu.set(true);
    fixture.detectChanges();

    expect(gridComponent.isColumnPinned('name')).toBe(false);

    gridComponent.contextMenuTogglePin('name');
    fixture.detectChanges();

    expect(gridComponent.isColumnPinned('name')).toBe(true);
    const cols = gridComponent.orderedColumns();
    expect(cols[0].field).toBe('name');

    gridComponent.contextMenuTogglePin('name');
    fixture.detectChanges();
    expect(gridComponent.isColumnPinned('name')).toBe(false);
  });

  it('should support column pinning on the right', () => {
    component.testColumns = [
      { field: 'salary', title: 'Salary', pinned: 'right', width: 100 },
      { field: 'id', title: 'ID', pinned: 'left', width: 50 },
      { field: 'name', title: 'Name', width: 150 }
    ];
    fixture.detectChanges();

    const ordered = gridComponent.orderedColumns();
    expect(ordered[0].field).toBe('id');
    expect(ordered[1].field).toBe('name');
    expect(ordered[2].field).toBe('salary');

    expect(gridComponent.firstPinnedRightColumnField()).toBe('salary');
    expect(gridComponent.columnRightOffsets()['salary']).toBe(0);
  });

  it('should support Excel-style keyboard navigation', () => {
    component.keyboardNavigation.set(true);
    fixture.detectChanges();

    const rows = gridComponent.flatRenderedRows();

    gridComponent.onCellClick(rows[0], 'id');
    expect(gridComponent.focusedCell()).toEqual({ row: rows[0], colField: 'id' });

    let downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    gridComponent.handleKeyDown(downEvent);
    expect(gridComponent.focusedCell()).toEqual({ row: rows[1], colField: 'id' });

    let rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    gridComponent.handleKeyDown(rightEvent);
    expect(gridComponent.focusedCell()).toEqual({ row: rows[1], colField: 'name' });

    let tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    gridComponent.handleKeyDown(tabEvent);
    expect(gridComponent.focusedCell()).toEqual({ row: rows[1], colField: 'salary' });
  });

  it('should toggle detail expanded state on toggleDetail call', () => {
    const row = gridComponent.flatRenderedRows()[0];
    expect(gridComponent.isExpanded(row)).toBe(false);

    gridComponent.toggleDetail(row);
    expect(gridComponent.isExpanded(row)).toBe(true);

    gridComponent.toggleDetail(row);
    expect(gridComponent.isExpanded(row)).toBe(false);
  });

  it('should expand and collapse all details programmatically', () => {
    const rows = gridComponent.flatRenderedRows();
    expect(gridComponent.expandedRows().size).toBe(0);

    gridComponent.expandAllDetails();
    expect(gridComponent.expandedRows().size).toBe(rows.length);

    gridComponent.collapseAllDetails();
    expect(gridComponent.expandedRows().size).toBe(0);
  });
});

@Component({
  standalone: true,
  imports: [
    DataGridComponent,
    NgxGridCellTemplateDirective,
    NgxGridEditCellTemplateDirective,
    NgxGridHeaderTemplateDirective,
    NgxGridFooterTemplateDirective
  ],
  template: `
    <ngx-data-grid [data]="testData()" [columns]="testColumns">
      <ng-template ngxGridCellTemplate="name" let-value>
        <span>CustomName: {{ value }}</span>
      </ng-template>
      <ng-template ngxGridEditCellTemplate="name" let-value>
        <input class="custom-edit" [value]="value" />
      </ng-template>
      <ng-template ngxGridHeaderTemplate="name">
        <span>CustomHeader</span>
      </ng-template>
      <ng-template ngxGridFooterTemplate="name">
        <span>CustomFooter</span>
      </ng-template>
    </ngx-data-grid>
  `
})
class TestGridDirectivesWrapperComponent {
  testData = signal([{ id: 1, name: 'Alice' }]);
  testColumns: GridColumnDef[] = [
    { field: 'id', title: 'ID' },
    { field: 'name', title: 'Name' }
  ];
}

describe('DataGridComponent Declarative Templates', () => {
  let component: TestGridDirectivesWrapperComponent;
  let fixture: ComponentFixture<TestGridDirectivesWrapperComponent>;
  let gridComponent: DataGridComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestGridDirectivesWrapperComponent, DataGridComponent],
      providers: [
        provideNgxI18n({
          grid: {
            noData: 'Keine Daten',
            filterPlaceholder: 'Suchen...',
            pageOf: (p, t) => `Seite ${p} von ${t}`,
            sortAscending: 'Aufsteigend',
            sortDescending: 'Absteigend',
            selectAll: 'Alle auswählen',
            deselectAll: 'Alle abwählen',
            exportCsv: 'CSV exportieren',
            groupBy: 'Gruppieren'
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestGridDirectivesWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    gridComponent = fixture.debugElement.query(
      el => el.componentInstance instanceof DataGridComponent
    ).componentInstance as DataGridComponent;
  });

  it('should pick up cell, edit cell, header and footer templates from content children directives', () => {
    const nameCol = component.testColumns.find(c => c.field === 'name')!;

    const cellTpl = gridComponent.resolveCellTemplate(nameCol);
    expect(cellTpl).toBeTruthy();

    const editCellTpl = gridComponent.resolveEditCellTemplate(nameCol);
    expect(editCellTpl).toBeTruthy();

    const headerTpl = gridComponent.resolveHeaderTemplate(nameCol);
    expect(headerTpl).toBeTruthy();

    const footerTpl = gridComponent.resolveFooterTemplate(nameCol);
    expect(footerTpl).toBeTruthy();
  });
});
