import { TestBed } from '@angular/core/testing';
import { NestedDonutChartComponent } from './nested-donut-chart.component';

describe('NestedDonutChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NestedDonutChartComponent],
    }).compileComponents();
  });

  it('names ring slices, shows their tooltip on focus, and activates with Space', () => {
    const fixture = TestBed.createComponent(NestedDonutChartComponent);
    fixture.componentRef.setInput('rings', [{ name: 'Quarter', data: [{ label: 'North', value: 3 }] }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const events: unknown[] = [];
    component.sliceClick.subscribe(event => events.push(event));
    const slice = fixture.nativeElement.querySelector('.arc-path') as SVGPathElement;

    expect(slice.getAttribute('role')).toBe('button');
    expect(slice.getAttribute('aria-label')).toBe('Quarter, North: 3');
    expect(slice.tabIndex).toBe(0);

    slice.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.ring).toBe('Quarter');
    expect(component.tooltip()?.label).toBe('North');

    slice.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    expect(events).toEqual([{ ring: 'Quarter', label: 'North', value: 3 }]);
  });
});
