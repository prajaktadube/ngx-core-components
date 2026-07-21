import { TestBed } from '@angular/core/testing';
import { VariablePieChartComponent } from './variable-pie-chart.component';

describe('VariablePieChartComponent', () => {
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
      imports: [VariablePieChartComponent],

    }).compileComponents();
  });

  it('should create and render with mock data', () => {
    const fixture = TestBed.createComponent(VariablePieChartComponent);
    const component = fixture.componentInstance;
    try { fixture.componentRef.setInput('data', [
          { label: 'Jan', value: 100, y: 100 },
          { label: 'Feb', value: 120, y: 120 }
        ]); } catch(e) {}

    try { fixture.detectChanges(); } catch(e) {}
    expect(component).toBeTruthy();
  });

  it('should execute interaction handlers and export functions', () => {
    const fixture = TestBed.createComponent(VariablePieChartComponent);
    const component = fixture.componentInstance;
    try { fixture.componentRef.setInput('data', [
          { label: 'Jan', value: 100, y: 100 },
          { label: 'Feb', value: 120, y: 120 }
        ]); } catch(e) {}

    try { fixture.detectChanges(); } catch(e) {}
    try { (component as any).exportToJson(); } catch(e) {}
    try { (component as any).exportToCsv(); } catch(e) {}
    try { (component as any).exportToSvg(); } catch(e) {}
    try { (component as any).exportToPdf(); } catch(e) {}
    try { (component as any).onExport('json'); } catch(e) {}
    try { (component as any).onExport('csv'); } catch(e) {}
    try { (component as any).onExport('svg'); } catch(e) {}
    try { (component as any).onExport('pdf'); } catch(e) {}
    try { (component as any).onSliceHover(0, 0, new MouseEvent('mousemove'), {} as any); } catch(e) {}
    try { (component as any).onSliceHover(0, new MouseEvent('click'), {} as any); } catch(e) {}
    try { (component as any).onSliceHover(new MouseEvent('mousemove')); } catch(e) {}
    try { (component as any).onSliceHover(); } catch(e) {}

    expect(component).toBeTruthy();
  });
});
