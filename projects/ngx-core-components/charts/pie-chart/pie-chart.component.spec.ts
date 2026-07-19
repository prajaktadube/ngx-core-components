import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PieChartComponent } from './pie-chart.component';

describe('PieChartComponent', () => {
  let component: PieChartComponent;
  let fixture: ComponentFixture<PieChartComponent>;

  const mockSlices = [
    { label: 'Chrome', value: 65 },
    { label: 'Firefox', value: 20 },
    { label: 'Safari', value: 10 },
    { label: 'Other', value: 5 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PieChartComponent] }).compileComponents();
    fixture = TestBed.createComponent(PieChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('slices', mockSlices);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render SVG canvas', () => {
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('should render one path per slice', () => {
    const paths = fixture.nativeElement.querySelectorAll('path.pie-slice');
    expect(paths.length).toBe(mockSlices.length);
  });

  it('should render legend with correct labels', () => {
    const legendItems = fixture.nativeElement.querySelectorAll('.legend-item');
    expect(legendItems.length).toBe(4);
    expect(legendItems[0].textContent).toContain('Chrome');
  });

  it('should hide legend when showLegend is false', () => {
    fixture.componentRef.setInput('showLegend', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chart-legend')).toBeNull();
  });

  it('should handle empty slices gracefully', () => {
    fixture.componentRef.setInput('slices', []);
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should respect height input', () => {
    fixture.componentRef.setInput('height', 350);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('height')).toBe('350');
  });
});
