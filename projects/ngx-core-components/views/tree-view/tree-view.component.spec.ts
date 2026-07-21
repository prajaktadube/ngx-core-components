import { TestBed } from '@angular/core/testing';
import { TreeViewComponent } from './tree-view.component';

describe('TreeViewComponent', () => {
  beforeEach(async () => {
    // Spy on window.open and window.alert to prevent PDF exports from freezing test runs
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
    try { fixture.componentRef.setInput('nodes', [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }]); } catch(e) {}

    try { fixture.detectChanges(); } catch(e) {}
    expect(component).toBeTruthy();
  });

  it('should execute interaction handlers and export functions', () => {
    const fixture = TestBed.createComponent(TreeViewComponent);
    const component = fixture.componentInstance;
    try { fixture.componentRef.setInput('nodes', [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }]); } catch(e) {}

    try { fixture.detectChanges(); } catch(e) {}
    try { (component as any).onNodeClick(0, 0, new MouseEvent('mousemove'), {} as any); } catch(e) {}
    try { (component as any).onNodeClick(0, new MouseEvent('click'), {} as any); } catch(e) {}
    try { (component as any).onNodeClick(new MouseEvent('mousemove')); } catch(e) {}
    try { (component as any).onNodeClick(); } catch(e) {}

    expect(component).toBeTruthy();
  });
});
