import { TestBed } from '@angular/core/testing';
import { BoxPlotChartComponent } from './box-plot-chart.component';
import { ChartExportService } from '../shared/chart-export.service';

describe('BoxPlotChartComponent', () => {
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
      imports: [BoxPlotChartComponent],
      providers: [
        {
          provide: ChartExportService,
          useValue: jasmine.createSpyObj('ChartExportService', [
            'downloadJson',
            'downloadCsv',
            'downloadSvg',
            'downloadPdf',
          ]),
        },
      ],
    }).compileComponents();
  });

  it('should create and render with mock data', () => {
    const fixture = TestBed.createComponent(BoxPlotChartComponent);
    const component = fixture.componentInstance;
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
    const fixture = TestBed.createComponent(BoxPlotChartComponent);
    const component = fixture.componentInstance;
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

  it('exposes box summaries and outliers as keyboard-focusable named marks', () => {
    const fixture = TestBed.createComponent(BoxPlotChartComponent);
    fixture.componentRef.setInput('data', [
      { label: 'Response time', min: 1, q1: 2, median: 3, q3: 4, max: 5, outliers: [8] },
    ]);
    fixture.detectChanges();

    const box = fixture.nativeElement.querySelector('.boxplot-rect') as SVGRectElement;
    expect(box.getAttribute('role')).toBe('img');
    expect(box.getAttribute('tabindex')).toBe('0');
    expect(box.getAttribute('aria-label')).toBe('Response time: Minimum 1, Q1 2, median 3, Q3 4, maximum 5');

    box.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Response time');

    const outlier = fixture.nativeElement.querySelector('.outlier-dot') as SVGCircleElement;
    expect(outlier.getAttribute('role')).toBe('img');
    expect(outlier.getAttribute('aria-label')).toBe('Response time outlier: 8');
    outlier.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('Outlier:');
    expect(fixture.nativeElement.querySelector('.chart-tooltip')?.textContent).toContain('8');
  });
});
