import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DataGridComponent } from './data-grid.component';
import { GridExportService } from '../data-grid/grid-export.service';
import { GridColumnDef } from './data-grid.component';

describe('DataGridComponent', () => {
  let component: DataGridComponent<any>;
  let fixture: ComponentFixture<DataGridComponent<any>>;

  const mockData = [
    { id: '1', name: 'Alice', age: 25, role: 'Admin' },
    { id: '2', name: 'Bob', age: 30, role: 'User' },
    { id: '3', name: 'Charlie', age: 35, role: 'User' },
  ];

  const mockColumns: GridColumnDef<any>[] = [
    { field: 'id', title: 'ID', sortable: true, filterable: true, editable: false, groupable: true },
    { field: 'name', title: 'Name', sortable: true, filterable: true, editable: true, groupable: true },
    { field: 'age', title: 'Age', sortable: true, filterable: true, editable: true, groupable: false },
    { field: 'role', title: 'Role', sortable: true, filterable: true, editable: true, groupable: true },
  ];

  beforeEach(async () => {
    spyOn(window, 'open').and.returnValue({
      document: {
        write: () => {},
        close: () => {}
      }
    } as any);
    spyOn(window, 'alert').and.stub();

    await TestBed.configureTestingModule({
      imports: [DataGridComponent],
      providers: [
        {
          provide: GridExportService,
          useValue: jasmine.createSpyObj('GridExportService', ['exportToJson', 'exportToCsv', 'exportToExcel', 'exportToPdf'])
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.detectChanges();
  });

  it('should render with initial data and columns', () => {
    expect(component).toBeTruthy();
    expect(component.flatRenderedRows().length).toBe(3);
  });

  it('should handle single and multiple row selection', () => {
    fixture.componentRef.setInput('selectable', true);
    fixture.detectChanges();

    expect(component.isRowSelected(mockData[0])).toBe(false);

    component.toggleRow(mockData[0]);
    expect(component.isRowSelected(mockData[0])).toBe(true);

    component.toggleRow(mockData[0]);
    expect(component.isRowSelected(mockData[0])).toBe(false);

    // Toggle all
    component.toggleAll();
    expect(component.allSelected()).toBe(true);

    component.toggleAll();
    expect(component.allSelected()).toBe(false);
  });

  it('should handle sorting on columns', () => {
    // Sort ascending
    component.onSort(mockColumns[1]); // Sort Name
    fixture.detectChanges();
    expect(component.flatRenderedRows()[0].name).toBe('Alice');

    // Sort descending
    component.onSort(mockColumns[1]); // Sort Name again
    fixture.detectChanges();
    expect(component.flatRenderedRows()[0].name).toBe('Charlie');

    // Clear sort
    component.onSort(mockColumns[1]);
    fixture.detectChanges();
  });

  it('should handle inline row editing', () => {
    fixture.componentRef.setInput('editable', true);
    fixture.detectChanges();

    expect(component.isEditing(mockData[0])).toBe(false);

    component.beginEdit(mockData[0], 0);
    expect(component.isEditing(mockData[0])).toBe(true);

    component.updateDraft('name', 'Alice In Wonderland');
    expect(component.getDraftValue(mockData[0], 'name')).toBe('Alice In Wonderland');

    spyOn(component.rowUpdate, 'emit');
    component.saveEdit(mockData[0], 0);
    expect(component.rowUpdate.emit).toHaveBeenCalled();
    expect(component.isEditing(mockData[0])).toBe(false);

    component.beginEdit(mockData[0], 0);
    component.cancelEdit();
    expect(component.isEditing(mockData[0])).toBe(false);
  });

  it('should handle pagination', () => {
    fixture.componentRef.setInput('pageSize', 2);
    fixture.detectChanges();

    expect(component.totalPages()).toBe(2);
    expect(component.currentPage()).toBe(1);

    component.goPage(2);
    expect(component.currentPage()).toBe(2);

    component.changePageSize(5);
    expect(component.currentPage()).toBe(1);
  });

  it('should handle details section expansion', () => {
    expect(component.isExpanded(mockData[0])).toBe(false);

    component.toggleDetail(mockData[0]);
    expect(component.isExpanded(mockData[0])).toBe(true);

    component.toggleDetail(mockData[0]);
    expect(component.isExpanded(mockData[0])).toBe(false);

    component.expandAllDetails();
    expect(component.isExpanded(mockData[0])).toBe(true);

    component.collapseAllDetails();
    expect(component.isExpanded(mockData[0])).toBe(false);
  });

  it('should handle group collapse/expansion', () => {
    component.toggleGroup('Admin');
    expect(component.isGroupCollapsed('Admin')).toBe(true);

    component.toggleGroup('Admin');
    expect(component.isGroupCollapsed('Admin')).toBe(false);

    component.expandAllGroups();
    expect(component.isGroupCollapsed('Admin')).toBe(false);
  });

  it('should execute export methods through service', () => {
    const exportSvc = TestBed.inject(GridExportService);

    component.exportToJson();
    expect(exportSvc.exportToJson).toHaveBeenCalled();

    component.exportToCsv();
    expect(exportSvc.exportToCsv).toHaveBeenCalled();

    component.exportToExcel();
    expect(exportSvc.exportToExcel).toHaveBeenCalled();

    component.exportToPdf();
    expect(exportSvc.exportToPdf).toHaveBeenCalled();
  });

  it('should handle column visibility chooser popover', () => {
    expect(component.activeColumnChooserPopover()).toBeNull();

    const dummyEl = document.createElement('button');
    spyOn(dummyEl, 'getBoundingClientRect').and.returnValue({
      top: 10, left: 10, bottom: 20, right: 20, width: 10, height: 10
    } as any);

    spyOn(fixture.nativeElement, 'querySelector').and.returnValue(dummyEl);

    const mouseEvent = {
      stopPropagation: () => {},
      currentTarget: dummyEl
    } as any;

    component.openColumnChooser(mouseEvent);
    expect(component.activeColumnChooserPopover()).not.toBeNull();

    component.toggleColumnVisibility('name');
    expect(component.hiddenColumns().has('name')).toBe(true);

    component.toggleColumnVisibility('name');
    expect(component.hiddenColumns().has('name')).toBe(false);
  });

  it('should handle column filtering popovers and values', () => {
    component.setFilter('name', 'Alice');
    expect(component.getFilter('name')).toBe('Alice');

    // Set active filter popover state
    component.activeFilterPopover.set({ field: 'name', top: 10, left: 10 });
    component.tempFilterValue.set('Bob');
    component.tempFilterOperator.set('contains');

    // Apply popover filter
    component.applyPopoverFilter();
    fixture.detectChanges();
    expect(component.getFilter('name')).toBe('Bob');

    // Clear popover filter
    component.activeFilterPopover.set({ field: 'name', top: 10, left: 10 });
    component.clearPopoverFilter();
    fixture.detectChanges();
    expect(component.getFilter('name')).toBe('');
  });

  it('should execute drag and drop events safely', () => {
    const dragEvent = new DragEvent('dragover');
    component.onGroupingPanelDragOver(dragEvent);
    component.onGroupingPanelDragLeave(dragEvent);

    const dragStartEvent = new DragEvent('dragstart');
    component.onDragStart(dragStartEvent, mockColumns[1]);
    component.onDragOver(dragEvent, mockColumns[2]);
    component.onDrop(dragEvent, mockColumns[2]);
    component.onDragEnd();

    expect(component).toBeTruthy();
  });
});
