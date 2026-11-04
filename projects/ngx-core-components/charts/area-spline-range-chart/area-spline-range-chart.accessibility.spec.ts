import { TestBed } from '@angular/core/testing';
import { AreaSplineRangeChartComponent } from './area-spline-range-chart.component';

describe('AreaSplineRangeChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaSplineRangeChartComponent],
    }).compileComponents();
  });

  it('exposes range boundaries and opens the category tooltip on focus', () => {
    const fixture = TestBed.createComponent(AreaSplineRangeChartComponent);
    fixture.componentRef.setInput('series', [
      { name: 'Temperature', data: [{ category: 'Monday', low: 12, high: 20 }] },
    ]);
    fixture.componentRef.setInput('showMarkers', false);
    fixture.componentInstance.animateState.set(true);
    fixture.detectChanges();

    const chart = fixture.componentInstance;
    const low = fixture.nativeElement.querySelector('.range-mark-low') as SVGCircleElement;

    expect(low.getAttribute('role')).toBe('img');
    expect(low.getAttribute('aria-label')).toBe('Temperature at Monday: low boundary 12, range 12 to 20');
    expect(low.tabIndex).toBe(0);
    expect(low.classList.contains('markers-hidden')).toBeTrue();

    low.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(chart.tooltip()?.cat).toBe('Monday');
    expect(chart.tooltip()?.rows[0].high).toBe(20);
    expect(chart.tooltip()?.rows[0].low).toBe(12);

    low.dispatchEvent(new FocusEvent('blur'));
    expect(chart.tooltip()).toBeNull();
  });
});
