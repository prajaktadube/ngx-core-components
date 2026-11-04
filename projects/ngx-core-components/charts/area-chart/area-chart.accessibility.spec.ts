import { TestBed } from '@angular/core/testing';
import { AreaChartComponent } from './area-chart.component';

describe('AreaChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaChartComponent],
    }).compileComponents();
  });

  it('names area markers and shows the category tooltip on focus', () => {
    const fixture = TestBed.createComponent(AreaChartComponent);
    fixture.componentRef.setInput('series', [{ name: 'Revenue', data: [15] }]);
    fixture.componentRef.setInput('categories', ['North']);
    fixture.componentInstance.animateState.set(true);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const marker = fixture.nativeElement.querySelector('.marker-dot') as SVGCircleElement;

    expect(marker.getAttribute('role')).toBe('img');
    expect(marker.getAttribute('aria-label')).toBe('North, Revenue: 15');
    expect(marker.tabIndex).toBe(0);

    marker.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(component.tooltip()?.cat).toBe('North');
    expect(component.tooltip()?.rows).toEqual([jasmine.objectContaining({ name: 'Revenue', value: 15 })]);
  });
});
