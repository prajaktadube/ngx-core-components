import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LineChartComponent } from './line-chart.component';
import { ChartSeries } from '../shared/chart-utils';

describe('LineChartComponent', () => {
  let component: LineChartComponent;
  let fixture: ComponentFixture<LineChartComponent>;

  const mockCategories = ['Jan', 'Feb', 'Mar', 'Apr'];
  const mockSeries: ChartSeries[] = [
    { name: 'Revenue', data: [100, 200, 150, 300], color: '#3b82f6' },
    { name: 'Expenses', data: [80, 120, 110, 150], color: '#ef4444' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LineChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categories', mockCategories);
    fixture.componentRef.setInput('series', mockSeries);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render legends for series', () => {
    const legendItems = fixture.nativeElement.querySelectorAll('.legend-item');
    expect(legendItems.length).toBe(2);
    expect(legendItems[0].textContent).toContain('Revenue');
    expect(legendItems[1].textContent).toContain('Expenses');
  });

  it('should render SVG lines for each series data', fakeAsync(() => {
    // Wait for animateState timer to trigger markers rendering
    component.animateState.set(true);
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();

    const linePaths = fixture.nativeElement.querySelectorAll('.line-path');
    expect(linePaths.length).toBe(2);

    const markerDots = fixture.nativeElement.querySelectorAll('.marker-dot');
    // 2 series * 4 values = 8 marker circles
    expect(markerDots.length).toBe(8);
  }));

  it('should render reference lines if input is provided', () => {
    fixture.componentRef.setInput('referenceLines', [
      { value: 200, label: 'Target', color: '#10b981' }
    ]);
    fixture.detectChanges();

    const refLabels = fixture.nativeElement.querySelectorAll('.reference-line-label');
    expect(refLabels.length).toBe(1);
    expect(refLabels[0].textContent).toContain('Target: 200');
  });

  it('should emit pointClick when marker circle is clicked', fakeAsync(() => {
    spyOn(component.pointClick, 'emit');
    component.animateState.set(true);
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();

    const firstMarker = fixture.nativeElement.querySelector('.marker-dot');
    expect(firstMarker).toBeTruthy();
    firstMarker.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.pointClick.emit).toHaveBeenCalledWith({
      category: 'Jan',
      value: 100,
      seriesName: 'Revenue'
    });
  }));

  it('should update tooltip and crosshair on mousemove', () => {
    const chartArea = fixture.nativeElement.querySelector('.ngx-line-chart');
    
    // Dispatch mousemove on chart container
    const mousemoveEvent = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 100,
      bubbles: true
    });
    chartArea.dispatchEvent(mousemoveEvent);
    fixture.detectChanges();

    expect(component.crosshair()).toBeTruthy();
    expect(component.activeCategoryIndex()).not.toBeNull();
    expect(component.tooltip()).toBeTruthy();

    const tooltipEl = fixture.nativeElement.querySelector('.chart-tooltip');
    expect(tooltipEl).toBeTruthy();
    expect(tooltipEl.textContent).toContain('Revenue');
    expect(tooltipEl.textContent).toContain('Expenses');

    // Trigger mouseleave
    const mouseleaveEvent = new MouseEvent('mouseleave', { bubbles: true });
    chartArea.dispatchEvent(mouseleaveEvent);
    fixture.detectChanges();

    expect(component.crosshair()).toBeNull();
    expect(component.tooltip()).toBeNull();
    expect(fixture.nativeElement.querySelector('.chart-tooltip')).toBeNull();
  });

  it('should support export menu toggling', () => {
    fixture.componentRef.setInput('showExport', true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.export-trigger');
    expect(trigger).toBeTruthy();
    expect(component.exportMenuOpen()).toBe(false);

    trigger.click();
    fixture.detectChanges();
    expect(component.exportMenuOpen()).toBe(true);

    // Click outside to close
    document.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(component.exportMenuOpen()).toBe(false);
  });

  it('should trigger JSON export successfully', () => {
    spyOn(component, 'exportToJson').and.callThrough();
    // Spy on document anchor click to avoid download during test
    const dummyAnchor = document.createElement('a');
    spyOn(dummyAnchor, 'click');
    spyOn(document, 'createElement').and.callFake((tagName: string) => {
      if (tagName === 'a') {
        return dummyAnchor;
      }
      return document.createElement(tagName);
    });

    component.onExport('json');
    expect(component.exportToJson).toHaveBeenCalled();
    expect(dummyAnchor.click).toHaveBeenCalled();
  });
});
