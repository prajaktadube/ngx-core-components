import { TestBed } from '@angular/core/testing';
import { CandlestickChartComponent } from './candlestick-chart.component';

describe('CandlestickChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandlestickChartComponent],
    }).compileComponents();
  });

  it('names the OHLC values and shows the candle tooltip on focus', () => {
    const fixture = TestBed.createComponent(CandlestickChartComponent);
    fixture.componentRef.setInput('data', [{ date: '2026-01-02', open: 10, high: 18, low: 8, close: 15 }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const candle = fixture.nativeElement.querySelector('.candle-rect') as SVGRectElement;

    expect(candle.getAttribute('role')).toBe('img');
    expect(candle.getAttribute('aria-label')).toBe('2026-01-02: Open 10, high 18, low 8, close 15');
    expect(candle.tabIndex).toBe(0);

    candle.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.date).toBe('2026-01-02');
    expect(component.tooltip()?.close).toBe(15);
  });
});
