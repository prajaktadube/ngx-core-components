import { TestBed } from '@angular/core/testing';
import { OHLCChartComponent } from './ohlc-chart.component';

describe('OHLCChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OHLCChartComponent],
    }).compileComponents();
  });

  it('labels each OHLC interval and reveals its tooltip on focus', () => {
    const fixture = TestBed.createComponent(OHLCChartComponent);
    fixture.componentRef.setInput('data', [{ date: '2026-01-02', open: 10, high: 18, low: 8, close: 15 }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const interval = fixture.nativeElement.querySelector('.ohlc-hitbox') as SVGRectElement;

    expect(interval.getAttribute('role')).toBe('img');
    expect(interval.getAttribute('aria-label')).toBe('2026-01-02: Open 10, high 18, low 8, close 15');
    expect(interval.tabIndex).toBe(0);

    interval.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.date).toBe('2026-01-02');
    expect(component.tooltip()?.high).toBe(18);
  });
});
