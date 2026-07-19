import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BarChartComponent } from './bar-chart.component';
import { ChartSeries } from '../shared/chart-utils';

describe('BarChartComponent', () => {
  let component: BarChartComponent;
  let fixture: ComponentFixture<BarChartComponent>;

  const mockCategories = ['Q1', 'Q2', 'Q3', 'Q4'];
  const mockSeries: ChartSeries[] = [
    { name: 'Sales', data: [500, 700, 400, 900] },
    { name: 'Target', data: [600, 600, 600, 600] },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categories', mockCategories);
    fixture.componentRef.setInput('series', mockSeries);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the SVG canvas', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should render legend items for each series', () => {
    const legendItems = fixture.nativeElement.querySelectorAll('.legend-item');
    expect(legendItems.length).toBe(2);
    expect(legendItems[0].textContent).toContain('Sales');
    expect(legendItems[1].textContent).toContain('Target');
  });

  it('should render bar rects after animation', fakeAsync(() => {
    component.animateState.set(true);
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();

    const bars = fixture.nativeElement.querySelectorAll('.bar-rect');
    // 2 series × 4 categories = 8 bars
    expect(bars.length).toBe(8);
  }));

  it('should show tooltip on mousemove', () => {
    const chartArea = fixture.nativeElement.querySelector('.ngx-bar-chart');
    chartArea.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 80, bubbles: true }));
    fixture.detectChanges();
    expect(component.tooltip()).not.toBeNull();
    const tooltipEl = fixture.nativeElement.querySelector('.chart-tooltip');
    expect(tooltipEl).toBeTruthy();
    expect(tooltipEl.textContent).toContain('Sales');
  });

  it('should clear tooltip on mouseleave', () => {
    const chartArea = fixture.nativeElement.querySelector('.ngx-bar-chart');
    chartArea.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 80, bubbles: true }));
    fixture.detectChanges();
    chartArea.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
    expect(component.tooltip()).toBeNull();
  });

  it('should emit barClick when a bar is clicked', fakeAsync(() => {
    spyOn(component.barClick, 'emit');
    component.animateState.set(true);
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();

    const firstBar = fixture.nativeElement.querySelector('.bar-rect');
    expect(firstBar).toBeTruthy();
    firstBar.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.barClick.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({ value: 500, seriesName: 'Sales' })
    );
  }));

  it('should respect the height input', () => {
    fixture.componentRef.setInput('height', 400);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('height')).toBe('400');
  });

  it('should hide legend when showLegend is false', () => {
    fixture.componentRef.setInput('showLegend', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-legend')).toBeNull();
  });

  it('should render value labels when showLabels is true', fakeAsync(() => {
    fixture.componentRef.setInput('showLabels', true);
    component.animateState.set(true);
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelectorAll('.bar-label');
    expect(labels.length).toBeGreaterThan(0);
  }));

  it('should handle empty data without crashing', () => {
    fixture.componentRef.setInput('series', []);
    fixture.componentRef.setInput('categories', []);
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
