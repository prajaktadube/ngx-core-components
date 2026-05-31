import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DataGridComponent, GridColumnDef } from 'ngx-core-components';
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
});
