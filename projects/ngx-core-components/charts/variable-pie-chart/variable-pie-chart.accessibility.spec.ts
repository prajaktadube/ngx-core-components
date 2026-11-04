import { TestBed } from '@angular/core/testing';
import { VariablePieChartComponent } from './variable-pie-chart.component';

describe('VariablePieChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariablePieChartComponent],
    }).compileComponents();
  });

  it('names value, share, and radius and displays the slice tooltip on focus', () => {
    const fixture = TestBed.createComponent(VariablePieChartComponent);
    fixture.componentRef.setInput('data', [{ label: 'North', value: 3, radiusValue: 8 }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const slice = fixture.nativeElement.querySelector('.pie-slice') as SVGPathElement;

    expect(slice.getAttribute('role')).toBe('img');
    expect(slice.getAttribute('aria-label')).toBe('North: 3, 100%, radius 8');
    expect(slice.tabIndex).toBe(0);

    slice.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(component.tooltip()?.label).toBe('North');
    expect(component.tooltip()?.radiusValue).toBe(8);
  });
});
