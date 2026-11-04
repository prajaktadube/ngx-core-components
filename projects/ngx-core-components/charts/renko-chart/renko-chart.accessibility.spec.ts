import { TestBed } from '@angular/core/testing';
import { RenkoChartComponent } from './renko-chart.component';

describe('RenkoChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenkoChartComponent],
    }).compileComponents();
  });

  it('exposes keyboard-focusable bricks and their tooltip values', () => {
    const fixture = TestBed.createComponent(RenkoChartComponent);
    fixture.componentRef.setInput('data', [100, 110]);
    fixture.componentRef.setInput('boxSize', 5);
    fixture.detectChanges();

    const chart = fixture.componentInstance;
    const brick = fixture.nativeElement.querySelector('.renko-brick') as SVGRectElement;

    expect(brick.getAttribute('role')).toBe('img');
    expect(brick.getAttribute('aria-label')).toBe('Renko brick 1: bullish from 100 to 105');
    expect(brick.tabIndex).toBe(0);

    brick.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(chart.tooltip()?.open).toBe(100);
    expect(chart.tooltip()?.close).toBe(105);

    brick.dispatchEvent(new FocusEvent('blur'));
    expect(chart.tooltip()).toBeNull();
  });
});
