import { TestBed } from '@angular/core/testing';
import { HeikinAshiChartComponent } from './heikin-ashi-chart.component';

describe('HeikinAshiChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeikinAshiChartComponent],
    }).compileComponents();
  });

  it('exposes calculated Heikin-Ashi values and shows original values on focus', () => {
    const fixture = TestBed.createComponent(HeikinAshiChartComponent);
    fixture.componentRef.setInput('data', [{ date: '2026-01-02', open: 10, high: 18, low: 8, close: 15 }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const candle = fixture.nativeElement.querySelector('.candle-rect') as SVGRectElement;

    expect(candle.getAttribute('role')).toBe('img');
    expect(candle.getAttribute('aria-label')).toContain('Heikin-Ashi open 12.5');
    expect(candle.getAttribute('aria-label')).toContain('close 12.8');
    expect(candle.tabIndex).toBe(0);

    candle.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.date).toBe('2026-01-02');
    expect(component.tooltip()?.orig.close).toBe(15);
    expect(component.tooltip()?.ha.close).toBe(12.75);
  });
});
