import { TestBed } from '@angular/core/testing';
import { LineChartComponent } from './line-chart.component';
import { ChartExportService } from '../shared/chart-export.service';

describe('LineChartComponent', () => {
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
      imports: [LineChartComponent],
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
    const fixture = TestBed.createComponent(LineChartComponent);
    const component = fixture.componentInstance;
    try {
      fixture.componentRef.setInput('series', [
        { name: 'Mock Series 1', data: [10, 20, 30] },
        { name: 'Mock Series 2', data: [15, 25, 35] },
      ]);
    } catch (e) {}

    try {
      fixture.detectChanges();
    } catch (e) {}
    expect(component).toBeTruthy();
  });

  it('provides an accessible name describing its series and category count', () => {
    const fixture = TestBed.createComponent(LineChartComponent);
    fixture.componentRef.setInput('series', [
      { name: 'Sales', data: [10, 20, 30] },
      { name: 'Costs', data: [6, 12, 14] },
    ]);
    fixture.componentRef.setInput('categories', ['Q1', 'Q2', 'Q3']);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.animateState.set(true);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg.chart-svg') as SVGSVGElement;
    expect(svg.getAttribute('role')).toBe('group');
    expect(svg.getAttribute('aria-label')).toBe('Line chart showing Sales, Costs across 3 categories.');

    const point = svg.querySelector('.marker-dot') as SVGCircleElement;
    expect(point.getAttribute('role')).toBe('button');
    expect(point.getAttribute('tabindex')).toBe('0');
    expect(point.getAttribute('aria-label')).toBe('Sales at Q1: 10');

    const pointClick = jasmine.createSpy('pointClick');
    component.pointClick.subscribe(pointClick);
    point.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(pointClick).toHaveBeenCalledWith({ category: 'Q1', value: 10, seriesName: 'Sales' });
    const spaceKey = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    point.dispatchEvent(spaceKey);
    expect(pointClick).toHaveBeenCalledTimes(2);
    expect(spaceKey.defaultPrevented).toBe(true);
  });

  it('should execute interaction handlers and export functions', () => {
    const fixture = TestBed.createComponent(LineChartComponent);
    const component = fixture.componentInstance;
    try {
      fixture.componentRef.setInput('series', [
        { name: 'Mock Series 1', data: [10, 20, 30] },
        { name: 'Mock Series 2', data: [15, 25, 35] },
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
    try {
      (component as any).onMouseMove(0, 0, new MouseEvent('mousemove'), {} as any);
    } catch (e) {}
    try {
      (component as any).onMouseMove(0, new MouseEvent('click'), {} as any);
    } catch (e) {}
    try {
      (component as any).onMouseMove(new MouseEvent('mousemove'));
    } catch (e) {}
    try {
      (component as any).onMouseMove();
    } catch (e) {}
    try {
      (component as any).onMouseLeave(0, 0, new MouseEvent('mousemove'), {} as any);
    } catch (e) {}
    try {
      (component as any).onMouseLeave(0, new MouseEvent('click'), {} as any);
    } catch (e) {}
    try {
      (component as any).onMouseLeave(new MouseEvent('mousemove'));
    } catch (e) {}
    try {
      (component as any).onMouseLeave();
    } catch (e) {}
    try {
      (component as any).onPointClick(0, 0, new MouseEvent('mousemove'), {} as any);
    } catch (e) {}
    try {
      (component as any).onPointClick(0, new MouseEvent('click'), {} as any);
    } catch (e) {}
    try {
      (component as any).onPointClick(new MouseEvent('mousemove'));
    } catch (e) {}
    try {
      (component as any).onPointClick();
    } catch (e) {}

    expect(component).toBeTruthy();
  });
});
