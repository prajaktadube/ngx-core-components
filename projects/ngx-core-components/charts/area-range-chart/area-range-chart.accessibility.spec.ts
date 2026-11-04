import { TestBed } from '@angular/core/testing';
import { AreaRangeChartComponent } from './area-range-chart.component';

describe('AreaRangeChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaRangeChartComponent],
    }).compileComponents();
  });

  it('exposes range boundaries and opens the category tooltip on focus', () => {
    const fixture = TestBed.createComponent(AreaRangeChartComponent);
    fixture.componentRef.setInput('series', [
      { name: 'Temperature', data: [{ category: 'Monday', low: 12, high: 20 }] },
    ]);
    fixture.componentRef.setInput('showMarkers', false);
    fixture.componentInstance.animateState.set(true);
    fixture.detectChanges();

    const chart = fixture.componentInstance;
    const high = fixture.nativeElement.querySelector('.range-mark-high') as SVGCircleElement;

    expect(high.getAttribute('role')).toBe('img');
    expect(high.getAttribute('aria-label')).toBe('Temperature at Monday: high boundary 20, range 12 to 20');
    expect(high.tabIndex).toBe(0);
    expect(high.classList.contains('markers-hidden')).toBeTrue();

    high.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(chart.tooltip()?.cat).toBe('Monday');
    expect(chart.tooltip()?.rows[0].high).toBe(20);
    expect(chart.tooltip()?.rows[0].low).toBe(12);

    high.dispatchEvent(new FocusEvent('blur'));
    expect(chart.tooltip()).toBeNull();
  });
});
