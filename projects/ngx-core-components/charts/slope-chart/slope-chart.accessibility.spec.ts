import { TestBed } from '@angular/core/testing';
import { SlopeChartComponent } from './slope-chart.component';

describe('SlopeChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlopeChartComponent],
    }).compileComponents();
  });

  it('exposes endpoint values and change and shows the tooltip on focus', () => {
    const fixture = TestBed.createComponent(SlopeChartComponent);
    fixture.componentRef.setInput('data', [{ label: 'North', startValue: 10, endValue: 15 }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const group = fixture.nativeElement.querySelector('.slope-group') as SVGGElement;

    expect(group.getAttribute('role')).toBe('img');
    expect(group.getAttribute('aria-label')).toBe('North: Before 10, After 15, change +5');
    expect(group.tabIndex).toBe(0);

    group.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(component.tooltip()?.label).toBe('North');
    expect(component.tooltip()?.delta).toBe(5);
  });
});
