import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScatterPlotComponent, ScatterPoint } from './scatter-plot.component';

describe('ScatterPlotComponent', () => {
  let component: ScatterPlotComponent;
  let fixture: ComponentFixture<ScatterPlotComponent>;

  const mockData: ScatterPoint[] = [
    { x: 10, y: 20, label: 'Alpha', group: 'Group A' },
    { x: 30, y: 50, label: 'Beta', group: 'Group B' },
    { x: 60, y: 35, label: 'Gamma', group: 'Group A' },
    { x: 80, y: 90, label: 'Delta', group: 'Group B' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ScatterPlotComponent] }).compileComponents();
    fixture = TestBed.createComponent(ScatterPlotComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render the SVG canvas', () => {
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('should render one circle per data point', () => {
    const circles = fixture.nativeElement.querySelectorAll('.scatter-point');
    expect(circles.length).toBe(mockData.length);
  });

  it('should compute unique groups', () => {
    expect(component.uniqueGroups()).toEqual(jasmine.arrayContaining(['Group A', 'Group B']));
    expect(component.uniqueGroups().length).toBe(2);
  });

  it('should render legend items for unique groups', () => {
    const legendItems = fixture.nativeElement.querySelectorAll('.legend-item');
    expect(legendItems.length).toBe(2);
  });

  it('should hide legend when showLegend is false', () => {
    fixture.componentRef.setInput('showLegend', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-legend')).toBeNull();
  });

  it('should set hoveredPointIndex on point hover', () => {
    const firstCircle = fixture.nativeElement.querySelector('.scatter-point');
    firstCircle.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: 50, clientY: 50 }));
    fixture.detectChanges();
    expect(component.hoveredPointIndex()).toBe(0);
  });

  it('should clear tooltip on mouseleave', () => {
    const chart = fixture.nativeElement.querySelector('.ngx-scatter-plot');
    chart.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
    expect(component.tooltip()).toBeNull();
    expect(component.hoveredPointIndex()).toBeNull();
  });

  it('should handle empty data without crashing', () => {
    fixture.componentRef.setInput('data', []);
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should respect height input', () => {
    fixture.componentRef.setInput('height', 400);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('height')).toBe('400');
  });
});
