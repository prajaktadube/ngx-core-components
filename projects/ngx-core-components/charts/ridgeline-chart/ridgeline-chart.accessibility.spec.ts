import { TestBed } from '@angular/core/testing';
import { RidgelineChartComponent } from './ridgeline-chart.component';

describe('RidgelineChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RidgelineChartComponent],
    }).compileComponents();
  });

  it('describes sample statistics and shows row details on focus', () => {
    const fixture = TestBed.createComponent(RidgelineChartComponent);
    fixture.componentRef.setInput('data', [{ label: 'North', values: [2, 4, 8] }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const row = fixture.nativeElement.querySelector('.ridgeline-row') as SVGGElement;

    expect(row.getAttribute('role')).toBe('img');
    expect(row.getAttribute('aria-label')).toBe('North: 3 samples, median 4, range 2 to 8');
    expect(row.tabIndex).toBe(0);

    row.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(component.tooltip()?.label).toBe('North');
    expect(component.tooltip()?.median).toBe(4);
  });
});
