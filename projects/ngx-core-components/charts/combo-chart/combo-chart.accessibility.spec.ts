import { TestBed } from '@angular/core/testing';
import { ComboChartComponent } from './combo-chart.component';

describe('ComboChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComboChartComponent],
    }).compileComponents();
  });

  it('names bar and line marks and shows the combined category tooltip on focus', () => {
    const fixture = TestBed.createComponent(ComboChartComponent);
    fixture.componentRef.setInput('barSeries', [{ name: 'Revenue', data: [15] }]);
    fixture.componentRef.setInput('lineSeries', [{ name: 'Rate', data: [80] }]);
    fixture.componentRef.setInput('categories', ['North']);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const bar = fixture.nativeElement.querySelector('.bar-rect') as SVGRectElement;
    const line = fixture.nativeElement.querySelector('.line-marker') as SVGCircleElement;

    expect(bar.getAttribute('role')).toBe('img');
    expect(bar.getAttribute('aria-label')).toBe('North, Revenue: 15 Volume');
    expect(line.getAttribute('role')).toBe('img');
    expect(line.getAttribute('aria-label')).toBe('North, Rate: 80 Percentage');

    bar.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.category).toBe('North');
    expect(component.tooltip()?.items.map(item => item.name)).toEqual(['Revenue', 'Rate']);

    line.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.items.map(item => item.value)).toEqual([15, 80]);
  });
});
