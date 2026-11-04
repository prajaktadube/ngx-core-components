import { TestBed } from '@angular/core/testing';
import { VariwideChartComponent } from './variwide-chart.component';

describe('VariwideChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariwideChartComponent],
    }).compileComponents();
  });

  it('exposes height, width share, and tooltip information on keyboard focus', () => {
    const fixture = TestBed.createComponent(VariwideChartComponent);
    fixture.componentRef.setInput('data', [{ label: 'North', y: 12, w: 3 }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const mark = fixture.nativeElement.querySelector('.variwide-rect') as SVGRectElement;

    expect(mark.getAttribute('role')).toBe('img');
    expect(mark.getAttribute('aria-label')).toBe('North: height 12, width 3 (100.0% of total width)');
    expect(mark.tabIndex).toBe(0);

    mark.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(component.tooltip()?.label).toBe('North');
    expect(component.tooltip()?.pct).toBe('100.0%');
  });
});
