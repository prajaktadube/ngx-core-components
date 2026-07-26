import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TreeViewComponent, TreeNode } from './tree-view.component';

describe('TreeViewComponent', () => {
  beforeEach(async () => {
    spyOn(window, 'open').and.returnValue({
      document: {
        write: () => {},
        close: () => {}
      }
    } as any);
    spyOn(window, 'alert').and.stub();

    await TestBed.configureTestingModule({
      imports: [TreeViewComponent],
    }).compileComponents();
  });

  it('should create and render with mock data', () => {
    const fixture = TestBed.createComponent(TreeViewComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('nodes', [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }]);

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should support toggle expansion, selection and action clicks', () => {
    const fixture = TestBed.createComponent(TreeViewComponent);
    const component = fixture.componentInstance;
    const mockNodes: TreeNode[] = [
      {
        id: '1',
        label: 'Root Node',
        children: [
          { id: '1-1', label: 'Child Node 1' },
          { id: '1-2', label: 'Child Node 2' }
        ]
      }
    ];
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();

    // Test expanding/collapsing
    const event = new MouseEvent('click');
    component.toggleExpand(mockNodes[0], event);
    expect(component.isExpanded('1')).toBeTrue();

    component.toggleExpand(mockNodes[0], event);
    expect(component.isExpanded('1')).toBeFalse();

    // Test select click
    component.onNodeClick(mockNodes[0], event);
    expect(component.focusedId()).toBe('1');

    // Test actions click
    let actionEmitted: any = null;
    component.actionClick.subscribe(val => actionEmitted = val);
    component.onAction(mockNodes[0], 'add');
    expect(actionEmitted).toEqual({ node: mockNodes[0], action: 'add' });
  });

  it('should support checkable nodes and tri-state checkbox evaluations', () => {
    const fixture = TestBed.createComponent(TreeViewComponent);
    const component = fixture.componentInstance;
    const mockNodes: TreeNode[] = [
      {
        id: '1',
        label: 'Parent Node',
        children: [
          { id: '1-1', label: 'Child A' },
          { id: '1-2', label: 'Child B' }
        ]
      }
    ];
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.componentRef.setInput('checkable', true);
    fixture.detectChanges();

    // Check one child
    const childA = mockNodes[0].children![0];
    component.onCheck(childA);
    expect(component.isChecked('1-1')).toBeTrue();
    expect(component.isIndeterminate('1')).toBeTrue();
    expect(component.isChecked('1')).toBeFalse();

    // Check the other child -> parent should become checked and not indeterminate
    const childB = mockNodes[0].children![1];
    component.onCheck(childB);
    expect(component.isChecked('1-2')).toBeTrue();
    expect(component.isChecked('1')).toBeTrue();
    expect(component.isIndeterminate('1')).toBeFalse();
  });

  it('should support search querying and auto-expanding filtered matches', fakeAsync(() => {
    const fixture = TestBed.createComponent(TreeViewComponent);
    const component = fixture.componentInstance;
    const mockNodes: TreeNode[] = [
      {
        id: '1',
        label: 'Engineering',
        children: [
          { id: '1-1', label: 'Angular component design' },
          { id: '1-2', label: 'React component designs' }
        ]
      },
      {
        id: '2',
        label: 'Marketing'
      }
    ];
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.componentRef.setInput('showSearch', true);
    fixture.detectChanges();

    // Set search query
    component.searchQuery.set('design');
    fixture.detectChanges();
    tick(); // flush the setTimeout in computed filteredNodes
    fixture.detectChanges();

    const filtered = component.filteredNodes();
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
    expect(component.isExpanded('1')).toBeTrue(); // Auto-expanded parent
  }));

  it('should support expandAll and collapseAll', () => {
    const fixture = TestBed.createComponent(TreeViewComponent);
    const component = fixture.componentInstance;
    const mockNodes: TreeNode[] = [
      {
        id: '1',
        label: 'Engineering',
        children: [{ id: '1-1', label: 'design' }]
      }
    ];
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();

    component.expandAll();
    expect(component.isExpanded('1')).toBeTrue();

    component.collapseAll();
    expect(component.isExpanded('1')).toBeFalse();
  });
});
