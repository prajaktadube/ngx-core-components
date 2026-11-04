import { TestBed } from '@angular/core/testing';
import { StepLineChartComponent } from './step-line-chart.component';

describe('StepLineChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepLineChartComponent],
    }).compileComponents();
  });

  it('names markers, shows category tooltips on focus, and activates with Enter', () => {
    const fixture = TestBed.createComponent(StepLineChartComponent);
    fixture.componentRef.setInput('series', [{ name: 'Revenue', data: [15] }]);
    fixture.componentRef.setInput('categories', ['North']);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const events: unknown[] = [];
    component.pointClick.subscribe(event => events.push(event));
    const marker = fixture.nativeElement.querySelector('.marker-dot') as SVGCircleElement;

    expect(marker.getAttribute('role')).toBe('button');
    expect(marker.getAttribute('aria-label')).toBe('North, Revenue: 15');
    expect(marker.tabIndex).toBe(0);

    marker.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.cat).toBe('North');

    marker.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(events).toEqual([{ category: 'North', value: 15, seriesName: 'Revenue' }]);
  });
});
