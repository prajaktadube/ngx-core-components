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
        close: () => {},
      },
    } as any);
    spyOn(window, 'alert').and.stub();

    await TestBed.configureTestingModule({
      imports: [DataGridComponent],
      providers: [
        {
          provide: GridExportService,
          useValue: jasmine.createSpyObj('GridExportService', [
            'exportToJson',
            'exportToCsv',
            'exportToExcel',
            'exportToPdf',
          ]),
        },
      ],
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

  it('moves between columns according to visual direction in RTL layouts', () => {
    fixture.componentRef.setInput('keyboardNavigation', true);
    fixture.nativeElement.setAttribute('dir', 'rtl');
    component.focusedCell.set({ row: mockData[0], colField: 'age' });

    fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(component.focusedCell()?.colField).toBe('role');

    fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(component.focusedCell()?.colField).toBe('age');
  });

  it('moves DOM focus with grid keyboard navigation and lets Tab leave at grid edges', async () => {
    fixture.componentRef.setInput('keyboardNavigation', true);
    fixture.detectChanges();
    const firstCell = fixture.nativeElement.querySelector('.grid-td:not(.grid-td-check)') as HTMLElement;
    firstCell.dispatchEvent(new KeyboardEvent('click', { bubbles: true }));
    fixture.detectChanges();
    firstCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.textContent).toContain('Alice');
    expect(component.focusedCell()?.colField).toBe('name');

    component.focusedCell.set({ row: mockData[2], colField: 'role' });
    fixture.detectChanges();
    const lastCell = fixture.nativeElement.querySelector('.grid-td.cell-focused') as HTMLElement;
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    lastCell.dispatchEvent(tabEvent);
    expect(tabEvent.defaultPrevented).toBe(false);
    expect(component.focusedCell()).toBeNull();
  });

  it('does not consume toolbar arrow keys as grid navigation', () => {
    fixture.componentRef.setInput('keyboardNavigation', true);
    component.focusedCell.set({ row: mockData[0], colField: 'age' });
    fixture.detectChanges();
    const toolbarButton = fixture.nativeElement.querySelector('.grid-toolbar button') as HTMLButtonElement;
    toolbarButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    expect(component.focusedCell()?.colField).toBe('age');
  });

  it('restores focus to a filter trigger after Escape closes its popover', async () => {
    const trigger = fixture.nativeElement.querySelector('.grid-filter-btn') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.tagName).toBe('SELECT');

    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    );
    fixture.detectChanges();
    expect(component.activeFilterPopover()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('opens the advanced filter builder as a dialog and restores focus on Escape', async () => {
    fixture.componentRef.setInput('showFilterBuilder', true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[aria-label="Advanced Filter Builder"]') as HTMLButtonElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);
    expect(dialog.querySelector('.fb-add-btn')?.textContent).toContain('Add condition');
    expect(document.activeElement).toBe(dialog);

    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button, input, select'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(last);
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(first);

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    dialog.dispatchEvent(escapeEvent);
    expect(escapeEvent.defaultPrevented).toBe(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('focuses the context menu on open and restores its cell on Escape', async () => {
    fixture.componentRef.setInput('enableContextMenu', true);
    fixture.detectChanges();
    const cell = fixture.nativeElement.querySelector('.grid-td:not(.grid-td-check)') as HTMLElement;
    cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 20 }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.classList.contains('menu-item')).toBe(true);

    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    );
    fixture.detectChanges();
    expect(component.activeContextMenu()).toBeNull();
    expect(document.activeElement).toBe(cell);
  });

  it('focuses the column chooser on open and restores focus when Escape closes it', async () => {
    fixture.componentRef.setInput('showColumnChooser', true);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector(
      '[aria-label="Choose columns"]'
    ) as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.tagName).toBe('INPUT');

    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    );
    fixture.detectChanges();
    expect(component.activeColumnChooserPopover()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('announces the updated row selection count', () => {
    fixture.componentRef.setInput('selectable', true);
    fixture.detectChanges();

    component.toggleRow(mockData[0]);
    fixture.detectChanges();

    expect(component.selectionAnnouncement()).toBe('1 row selected');
    expect(fixture.nativeElement.querySelector('.visually-hidden[aria-live="polite"]').textContent.trim()).toBe(
      '1 row selected'
    );
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
      top: 10,
      left: 10,
      bottom: 20,
      right: 20,
      width: 10,
      height: 10,
    } as any);

    spyOn(fixture.nativeElement, 'querySelector').and.returnValue(dummyEl);

    const mouseEvent = {
      stopPropagation: () => {},
      currentTarget: dummyEl,
    } as any;

    component.openColumnChooser(mouseEvent);
    expect(component.activeColumnChooserPopover()).not.toBeNull();

    component.toggleColumnVisibility('name');
    expect(component.hiddenColumns().has('name')).toBe(true);

    component.toggleColumnVisibility('name');
    expect(component.hiddenColumns().has('name')).toBe(false);
  });

  it('supports keyboard-accessible column reordering and pinning', () => {
    const reordered = jasmine.createSpy('reordered');
    component.columnReorder.subscribe(reordered);

    component.moveColumn('age', -1);
    component.pinColumnPopover('age', 'left');
    fixture.detectChanges();

    expect(component.orderedColumns().map(column => column.field)).toEqual(['age', 'id', 'name', 'role']);
    expect(component.getColumnPinnedState('age')).toBe('left');
    expect(reordered.calls.mostRecent().args[0].columns.map((column: GridColumnDef<any>) => column.field)).toEqual([
      'id',
      'age',
      'name',
      'role',
    ]);

    component.moveColumn('age', -1);
    expect(component.columnOrder()).toEqual(['age', 'id', 'name', 'role']);
  });

  it('renders labelled column-chooser controls with unique ids and keyboard actions', () => {
    fixture.componentRef.setInput('showColumnChooser', true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[aria-controls]');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    component.activeColumnChooserPopover.set({ top: 0, left: 0 });
    fixture.detectChanges();

    const chooser = fixture.nativeElement.querySelector('[role="region"][id$="-column-chooser"]');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(chooser.id);
    expect(chooser.querySelectorAll('button[aria-label^="Move "]').length).toBe(mockColumns.length * 2);
    expect(chooser.querySelectorAll('button[aria-pressed]').length).toBe(mockColumns.length * 3);
    expect(chooser.querySelector('label.checklist-item input[type="checkbox"]')).not.toBeNull();
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
