import { TestBed, ComponentFixture } from '@angular/core/testing';
import {
  DataGridComponent,
  GridColumnDef,
  NgxGridCellTemplateDirective,
  NgxGridEditCellTemplateDirective,
  NgxGridHeaderTemplateDirective,
  NgxGridFooterTemplateDirective,
} from 'ngx-core-components';
import { Component, signal } from '@angular/core';

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
      imports: [TestGridWrapperComponent, DataGridComponent]
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
    newFixture.componentInstance.pageSize.set(1); // Set pageSize to 1 so page 2 is not clamped (3 items total)
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

  it('should select cell range on mouse down and enter', () => {
    component.cellSelection.set(true);
    fixture.detectChanges();

    const rows = gridComponent.renderedRowsList();
    const cols = gridComponent.orderedColumns();

    // Mock mouse down on cell (row 0, 'id')
    const startCell = rows[0];
    const mockEvent = new MouseEvent('mousedown', { button: 0 });
    gridComponent.onCellMouseDown(mockEvent, startCell, 'id');

    // Mock mouse enter on cell (row 1, 'name')
    const endCell = rows[1];
    gridComponent.onCellMouseEnter(endCell, 'name');

    expect(gridComponent.isCellSelected(startCell, 'id')).toBe(true);
    expect(gridComponent.isCellSelected(startCell, 'name')).toBe(true);
    expect(gridComponent.isCellSelected(endCell, 'id')).toBe(true);
    expect(gridComponent.isCellSelected(endCell, 'name')).toBe(true);
    expect(gridComponent.isCellSelected(startCell, 'salary')).toBe(false);
  });

  it('should compile correct tab-separated values on copy text', () => {
    component.cellSelection.set(true);
    fixture.detectChanges();

    const rows = gridComponent.renderedRowsList();
    gridComponent.selectedCellStart.set({ row: rows[0], colField: 'id' });
    gridComponent.selectedCellEnd.set({ row: rows[1], colField: 'name' });

    const text = gridComponent.getSelectedCellsText();
    expect(text).toBe('1\tAlice\n2\tBob');
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

  it('should compute header groups and spans correctly when category is defined', () => {
    component.testColumns = [
      { field: 'id', title: '#', pinned: 'left' },
      { field: 'name', title: 'Name', pinned: 'left' },
      { field: 'title', title: 'Title', category: 'Employee Details' },
      { field: 'department', title: 'Department', category: 'Employee Details' },
      { field: 'city', title: 'City', category: 'Contact & Location' },
      { field: 'email', title: 'Email', category: 'Contact & Location' },
      { field: 'salary', title: 'Salary', category: 'Employment' },
      { field: 'status', title: 'Status', category: 'Employment' }
    ];
    fixture.detectChanges();

    expect(gridComponent.hasColumnCategories()).toBe(true);

    const rows = gridComponent.headerRows();
    // row1 should have 5 items: #, Name, Employee Details, Contact & Location, Employment
    expect(rows.row1.length).toBe(5);

    const row1 = rows.row1;
    expect(row1[0].title).toBe('#');
    expect(row1[0].isCategory).toBe(false);
    expect(row1[0].rowSpan).toBe(2);

    expect(row1[2].title).toBe('Employee Details');
    expect(row1[2].isCategory).toBe(true);
    expect(row1[2].colSpan).toBe(2);
    expect(row1[2].rowSpan).toBe(1);

    // row2 should contain individual subheader columns for the categories
    const row2 = rows.row2;
    expect(row2.length).toBe(6); // title, department, city, email, salary, status
    expect(row2[0].title).toBe('Title');
    expect(row2[1].title).toBe('Department');
    expect(row2[2].title).toBe('City');
    expect(row2[3].title).toBe('Email');
    expect(row2[4].title).toBe('Salary');
    expect(row2[5].title).toBe('Status');
  });

  it('should support column pinning on the right', () => {
    component.testColumns = [
      { field: 'salary', title: 'Salary', pinned: 'right', width: 100 },
      { field: 'id', title: 'ID', pinned: 'left', width: 50 },
      { field: 'name', title: 'Name', width: 150 }
    ];
    fixture.detectChanges();

    // Verification of ordering: left pinned -> unpinned -> right pinned
    const ordered = gridComponent.orderedColumns();
    expect(ordered[0].field).toBe('id');
    expect(ordered[1].field).toBe('name');
    expect(ordered[2].field).toBe('salary');

    // Right offsets: salary should be rightmost (offset 0)
    expect(gridComponent.firstPinnedRightColumnField()).toBe('salary');
    expect(gridComponent.columnRightOffsets()['salary']).toBe(0);
  });

  it('should support Excel-style keyboard navigation', () => {
    component.keyboardNavigation.set(true);
    fixture.detectChanges();

    const rows = gridComponent.flatRenderedRows();
    const cols = gridComponent.orderedColumns();

    // Focus initial cell
    gridComponent.onCellClick(rows[0], 'id');
    expect(gridComponent.focusedCell()).toEqual({ row: rows[0], colField: 'id' });

    // ArrowDown should move focus to row 1, col 'id'
    let downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    gridComponent.handleKeyDown(downEvent);
    expect(gridComponent.focusedCell()).toEqual({ row: rows[1], colField: 'id' });

    // ArrowRight should move focus to row 1, col 'name'
    let rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    gridComponent.handleKeyDown(rightEvent);
    expect(gridComponent.focusedCell()).toEqual({ row: rows[1], colField: 'name' });

    // Tab should move focus to row 1, col 'salary'
    let tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    gridComponent.handleKeyDown(tabEvent);
    expect(gridComponent.focusedCell()).toEqual({ row: rows[1], colField: 'salary' });
  });

  it('should support group aggregation subtotals', () => {
    component.testData.set([
      { id: 1, name: 'Alice', salary: 100 },
      { id: 2, name: 'Alice', salary: 150 },
      { id: 3, name: 'Bob', salary: 200 }
    ]);
    component.testColumns = [
      { field: 'id', title: 'ID', aggregation: 'count' },
      { field: 'name', title: 'Name', groupable: true },
      { field: 'salary', title: 'Salary', aggregation: 'sum' }
    ];
    fixture.detectChanges();

    const groupResult1: any = {
      key: 'Alice',
      value: 'Alice',
      field: 'name',
      count: 2,
      items: [
        { id: 1, name: 'Alice', salary: 100 },
        { id: 2, name: 'Alice', salary: 150 }
      ]
    };

    const countCol = component.testColumns.find(c => c.field === 'id')!;
    const sumCol = component.testColumns.find(c => c.field === 'salary')!;

    expect(gridComponent.getGroupAggregationValue(groupResult1, countCol)).toBe('2');
    expect(gridComponent.getGroupAggregationValue(groupResult1, sumCol)).toBe('250');
  });

  it('should support cell merging / row spanning', () => {
    component.testData.set([
      { id: 1, city: 'London' },
      { id: 2, city: 'London' },
      { id: 3, city: 'Paris' }
    ]);
    component.testColumns = [
      { field: 'id', title: 'ID' },
      { field: 'city', title: 'City', mergeRows: true }
    ];
    fixture.detectChanges();

    const rows = gridComponent.flatRenderedRows();

    // For first London row (index 0), rowspan should be 2
    expect(gridComponent.getCellRowSpan(rows[0], 'city', 0)).toBe(2);
    // For second London row (index 1), rowspan should be 0 (meaning omit td cell)
    expect(gridComponent.getCellRowSpan(rows[1], 'city', 1)).toBe(0);
    // For Paris row (index 2), rowspan should be 1
    expect(gridComponent.getCellRowSpan(rows[2], 'city', 2)).toBe(1);
  });

  it('should resolve edit cell template and footer template overrides', () => {
    const editCellTemplateRef = {} as any;
    const footerTemplateRef = {} as any;
    const col: GridColumnDef = {
      field: 'salary',
      title: 'Salary',
      editCellTemplate: editCellTemplateRef,
      footerTemplate: footerTemplateRef
    };

    expect(gridComponent.resolveEditCellTemplate(col)).toBe(editCellTemplateRef);
    expect(gridComponent.resolveFooterTemplate(col)).toBe(footerTemplateRef);
  });

  it('should auto-size column on double click or autoSizeColumn call', () => {
    const nameCol = component.testColumns.find(c => c.field === 'name')!;
    gridComponent.autoSizeColumn(nameCol);
    expect(gridComponent.columnWidths()['name']).toBe(100);

    const mockEvent = new MouseEvent('dblclick');
    spyOn(mockEvent, 'stopPropagation');
    spyOn(mockEvent, 'preventDefault');
    gridComponent.onResizeDoubleClick(mockEvent, nameCol);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(gridComponent.columnWidths()['name']).toBe(100);
  });

  it('should filter checklist values and handle toggle select all correctly with query', () => {
    gridComponent.activeFilterPopover.set({
      field: 'name',
      top: 0,
      left: 0
    });
    
    gridComponent.filterSearchQuery.set('a');
    const filteredDistinct = gridComponent.getFilteredDistinctValues('name');
    expect(filteredDistinct).toEqual(['Alice', 'Charlie']);
    
    gridComponent.tempSelectedValues.set(new Set());
    gridComponent.toggleSelectAllChecklist();
    expect(gridComponent.tempSelectedValues()).toEqual(new Set(['Alice', 'Charlie']));
    
    gridComponent.toggleSelectAllChecklist();
    expect(gridComponent.tempSelectedValues()).toEqual(new Set());
  });

  it('should generate spreadsheet blob and trigger download on exportToExcel', () => {
    const dummyAnchor = document.createElement('a');
    spyOn(dummyAnchor, 'click');
    spyOn(dummyAnchor, 'setAttribute');
    
    const originalCreateElement = document.createElement;
    spyOn(document, 'createElement').and.callFake((tagName: string) => {
      if (tagName === 'a') {
        return dummyAnchor;
      }
      return originalCreateElement.call(document, tagName);
    });

    const mockObjectUrl = 'blob:mock-url';
    spyOn(URL, 'createObjectURL').and.returnValue(mockObjectUrl);
    
    gridComponent.exportToExcel();
    
    expect(URL.createObjectURL).toHaveBeenCalled();
    const createdBlob: Blob = (URL.createObjectURL as jasmine.Spy).calls.first().args[0];
    expect(createdBlob.type).toBe('application/vnd.ms-excel;charset=utf-8;');
    expect(dummyAnchor.setAttribute).toHaveBeenCalledWith('href', mockObjectUrl);
    expect(dummyAnchor.setAttribute).toHaveBeenCalledWith('download', 'grid-data.xls');
    expect(dummyAnchor.click).toHaveBeenCalled();
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

  it('should compute correct row translation transforms when dragging and hovering', () => {
    // If not dragging, translation should be empty
    expect(gridComponent.getRowTranslation(0)).toBe('');

    // Start dragging row index 0
    gridComponent.draggingRowIndex.set(0);
    // Hovering over row index 2
    gridComponent.dragOverRowIndex.set(2);
    
    // Row 0 is the dragged row, should translate down to position 2 (2 * 49 = 98px)
    expect(gridComponent.getRowTranslation(0)).toBe('translateY(98px)');
    // Row 1 is between dragging and dragOver index, should slide up (-49px)
    expect(gridComponent.getRowTranslation(1)).toBe('translateY(-49px)');
    // Row 2 is the dragOver index, should slide up (-49px)
    expect(gridComponent.getRowTranslation(2)).toBe('translateY(-49px)');
    // Row 3 is outside range, should not translate
    expect(gridComponent.getRowTranslation(3)).toBe('');
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
      imports: [TestGridDirectivesWrapperComponent, DataGridComponent]
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
