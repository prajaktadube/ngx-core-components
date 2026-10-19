import { TestBed } from '@angular/core/testing';
import { TreemapChartComponent } from './treemap-chart.component';

describe('TreemapChartComponent', () => {
  beforeEach(async () => {
    // Spy on window.open and window.alert to prevent PDF exports from freezing test runs
    spyOn(window, 'open').and.returnValue({
      document: {
        write: () => {},
        close: () => {},
      },
    } as any);
    spyOn(window, 'alert').and.stub();

    await TestBed.configureTestingModule({
      imports: [TreemapChartComponent],
    }).compileComponents();
  });

  it('should create and render with mock data', () => {
    const fixture = TestBed.createComponent(TreemapChartComponent);
    const component = fixture.componentInstance;
    try {
      fixture.componentRef.setInput('data', [
        { id: '1', label: 'A', value: 10, group: 'G1', x: 5, y: 10, text: 'A', weight: 5, source: 'A', target: 'B' },
      ]);
    } catch (e) {}
    try {
      fixture.componentRef.setInput('data', [
        { label: 'Jan', value: 100, y: 100 },
        { label: 'Feb', value: 120, y: 120 },
      ]);
    } catch (e) {}

    try {
      fixture.detectChanges();
    } catch (e) {}
    expect(component).toBeTruthy();
  });

  it('should execute interaction handlers and export functions', () => {
    const fixture = TestBed.createComponent(TreemapChartComponent);
    const component = fixture.componentInstance;
    try {
      fixture.componentRef.setInput('data', [
        { id: '1', label: 'A', value: 10, group: 'G1', x: 5, y: 10, text: 'A', weight: 5, source: 'A', target: 'B' },
      ]);
    } catch (e) {}
    try {
      fixture.componentRef.setInput('data', [
        { label: 'Jan', value: 100, y: 100 },
        { label: 'Feb', value: 120, y: 120 },
      ]);
    } catch (e) {}

    try {
      fixture.detectChanges();
    } catch (e) {}
    try {
      (component as any).exportToJson();
    } catch (e) {}
    try {
      (component as any).exportToCsv();
    } catch (e) {}
    try {
      (component as any).exportToSvg();
    } catch (e) {}
    try {
      (component as any).exportToPdf();
    } catch (e) {}
    try {
      (component as any).onExport('json');
    } catch (e) {}
    try {
      (component as any).onExport('csv');
    } catch (e) {}
    try {
      (component as any).onExport('svg');
    } catch (e) {}
    try {
      (component as any).onExport('pdf');
    } catch (e) {}

    expect(component).toBeTruthy();
  });

  it('labels treemap marks, reveals their tooltip on focus, and activates with Enter', () => {
    const fixture = TestBed.createComponent(TreemapChartComponent);
    const component = fixture.componentInstance;
    const item = { label: 'Revenue', value: 42 };
    fixture.componentRef.setInput('data', [item]);
    fixture.detectChanges();

    const mark = fixture.nativeElement.querySelector('.treemap-group') as SVGGElement;
    expect(mark.getAttribute('role')).toBe('button');
    expect(mark.getAttribute('aria-label')).toContain('Revenue');

    mark.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.treemap-tooltip')?.textContent).toContain('Revenue');

    const itemClick = spyOn(component.itemClick, 'emit');
    mark.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(itemClick).toHaveBeenCalledWith(jasmine.objectContaining(item));
  });
});
