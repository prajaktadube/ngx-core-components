import { TestBed } from '@angular/core/testing';
import { KagiChartComponent } from './kagi-chart.component';

describe('KagiChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KagiChartComponent],
    }).compileComponents();
  });

  it('exposes keyboard-focusable segments and their tooltip values', () => {
    const fixture = TestBed.createComponent(KagiChartComponent);
    fixture.componentRef.setInput('data', [100, 120]);
    fixture.componentRef.setInput('reversalAmount', 10);
    fixture.detectChanges();

    const chart = fixture.componentInstance;
    const segment = fixture.nativeElement.querySelector('.kagi-line') as SVGLineElement;

    expect(segment.getAttribute('role')).toBe('img');
    expect(segment.getAttribute('aria-label')).toBe('Kagi vertical segment 1: bearish, 100 to 120');
    expect(segment.tabIndex).toBe(0);

    segment.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(chart.tooltip()?.val1).toBe(100);
    expect(chart.tooltip()?.val2).toBe(120);

    segment.dispatchEvent(new FocusEvent('blur'));
    expect(chart.tooltip()).toBeNull();
  });
});
