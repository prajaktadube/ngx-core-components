import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeatmapChartComponent } from './heatmap-chart.component';

describe('HeatmapChartComponent', () => {
  let component: HeatmapChartComponent;
  let fixture: ComponentFixture<HeatmapChartComponent>;

  const mockData = [
    [10, 25, 5, 80],
    [45, 60, 30, 15],
    [70, 20, 90, 40],
  ];

  const mockXLabels = ['Mon', 'Tue', 'Wed', 'Thu'];
  const mockYLabels = ['Morning', 'Afternoon', 'Evening'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HeatmapChartComponent] }).compileComponents();
    fixture = TestBed.createComponent(HeatmapChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('xAxisLabels', mockXLabels);
    fixture.componentRef.setInput('yAxisLabels', mockYLabels);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render the SVG canvas', () => {
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('should render correct number of heatmap cells', () => {
    const cells = fixture.nativeElement.querySelectorAll('.heatmap-cell');
    // 3 rows × 4 cols = 12 cells
    expect(cells.length).toBe(12);
  });

  it('should render X-axis labels', () => {
    const xLabels = fixture.nativeElement.querySelectorAll('.x-axis-label');
    expect(xLabels.length).toBe(4);
    expect(xLabels[0].textContent.trim()).toBe('Mon');
  });

  it('should render Y-axis labels', () => {
    const yLabels = fixture.nativeElement.querySelectorAll('.y-axis-label');
    expect(yLabels.length).toBe(3);
    expect(yLabels[0].textContent.trim()).toBe('Morning');
  });

  it('should emit cellClick with correct data when a cell is clicked', () => {
    spyOn(component.cellClick, 'emit');
    const cells = fixture.nativeElement.querySelectorAll('.heatmap-cell');
    cells[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(component.cellClick.emit).toHaveBeenCalledWith({ row: 0, col: 0, value: 10 });
  });

  it('should show tooltip on cell mouseenter', () => {
    const firstCell = fixture.nativeElement.querySelector('.heatmap-cell');
    firstCell.dispatchEvent(new MouseEvent('mouseenter', {
      bubbles: true,
      clientX: 100,
      clientY: 100,
    }));
    fixture.detectChanges();
    expect(component.tooltip().show).toBe(true);
    const tooltipEl = fixture.nativeElement.querySelector('.heatmap-tooltip');
    expect(tooltipEl).toBeTruthy();
  });

  it('should hide tooltip on cell mouseleave', () => {
    component.tooltip.set({ show: true, title: 'Test', value: '10', x: 0, y: 0, rawVal: 10 });
    fixture.detectChanges();
    const firstCell = fixture.nativeElement.querySelector('.heatmap-cell');
    firstCell.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
    expect(component.tooltip().show).toBe(false);
  });

  it('should interpolate cell colors based on value range', () => {
    const minColor = component.getCellColor(0);
    const maxColor = component.getCellColor(100);
    // Min should be lighter (start color), max should be darker (end color)
    expect(minColor).not.toBe(maxColor);
  });

  it('should handle empty data without crashing', () => {
    fixture.componentRef.setInput('data', []);
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
