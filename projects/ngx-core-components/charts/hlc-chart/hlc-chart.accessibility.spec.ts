import { TestBed } from '@angular/core/testing';
import { HLCChartComponent } from './hlc-chart.component';

describe('HLCChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HLCChartComponent],
    }).compileComponents();
  });

  it('exposes an accessible tick and shows its tooltip on focus', () => {
    const fixture = TestBed.createComponent(HLCChartComponent);
    fixture.componentRef.setInput('data', [{ date: '2026-01-02', high: 18, low: 8, close: 15 }]);
    fixture.detectChanges();

    const chart = fixture.componentInstance;
    const tick = fixture.nativeElement.querySelector('.hlc-hit-area') as SVGRectElement;

    expect(tick.getAttribute('role')).toBe('img');
    expect(tick.getAttribute('aria-label')).toBe('2026-01-02: High 18, low 8, close 15');
    expect(tick.tabIndex).toBe(0);

    tick.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(chart.tooltip()?.date).toBe('2026-01-02');
    expect(chart.tooltip()?.high).toBe(18);
    expect(chart.tooltip()?.low).toBe(8);
    expect(chart.tooltip()?.close).toBe(15);

    tick.dispatchEvent(new FocusEvent('blur'));
    expect(chart.tooltip()).toBeNull();
  });
});
