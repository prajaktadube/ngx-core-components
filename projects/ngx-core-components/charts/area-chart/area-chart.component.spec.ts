import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AreaChartComponent } from './area-chart.component';
import { ChartSeries } from '../shared/chart-utils';

describe('AreaChartComponent', () => {
  let component: AreaChartComponent;
  let fixture: ComponentFixture<AreaChartComponent>;

  const mockCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const mockSeries: ChartSeries[] = [
    { name: 'Visitors', data: [1200, 1500, 1100, 1800, 2100] },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AreaChartComponent] }).compileComponents();
    fixture = TestBed.createComponent(AreaChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categories', mockCategories);
    fixture.componentRef.setInput('series', mockSeries);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render the SVG canvas', () => {
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('should render area and line paths', fakeAsync(() => {
    component.animateState.set(true);
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();
    const linePath = fixture.nativeElement.querySelector('.line-path');
    const areaPath = fixture.nativeElement.querySelector('.area-path');
    expect(linePath).toBeTruthy();
    expect(areaPath).toBeTruthy();
  }));

  it('should render markers when showMarkers is true', fakeAsync(() => {
    component.animateState.set(true);
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();
    const markers = fixture.nativeElement.querySelectorAll('.marker-dot');
    expect(markers.length).toBe(mockCategories.length);
  }));

  it('should show legend with series names', () => {
    const legendItems = fixture.nativeElement.querySelectorAll('.legend-item');
    expect(legendItems.length).toBe(1);
    expect(legendItems[0].textContent).toContain('Visitors');
  });

  it('should hide legend when showLegend is false', () => {
    fixture.componentRef.setInput('showLegend', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-legend')).toBeNull();
  });

  it('should show tooltip on mousemove', () => {
    const chartArea = fixture.nativeElement.querySelector('.ngx-area-chart');
    chartArea.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 80, bubbles: true }));
    fixture.detectChanges();
    expect(component.tooltip()).not.toBeNull();
  });

  it('should clear tooltip on mouseleave', () => {
    const chartArea = fixture.nativeElement.querySelector('.ngx-area-chart');
    chartArea.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 80, bubbles: true }));
    fixture.detectChanges();
    chartArea.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
    expect(component.tooltip()).toBeNull();
  });

  it('should handle empty data without crashing', () => {
    fixture.componentRef.setInput('series', []);
    fixture.componentRef.setInput('categories', []);
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should respect height input', () => {
    fixture.componentRef.setInput('height', 320);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('height')).toBe('320');
  });
});
