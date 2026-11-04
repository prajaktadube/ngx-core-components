import { TestBed } from '@angular/core/testing';
import { WindRoseChartComponent } from './wind-rose.component';

describe('WindRoseChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WindRoseChartComponent],
    }).compileComponents();
  });

  it('names wind direction and speed bins and shows the matching tooltip on focus', () => {
    const fixture = TestBed.createComponent(WindRoseChartComponent);
    fixture.componentRef.setInput('data', [
      {
        direction: 'N',
        speedBins: [
          { label: '0-5', value: 10 },
          { label: '5-10', value: 20 },
        ],
      },
    ]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const wedge = fixture.nativeElement.querySelector('.rose-wedge') as SVGPathElement;

    expect(wedge.getAttribute('role')).toBe('img');
    expect(wedge.getAttribute('aria-label')).toContain('Direction N');
    expect(wedge.getAttribute('aria-label')).toContain('0-5');
    expect(wedge.getAttribute('aria-label')).toContain('10.0%');
    expect(wedge.tabIndex).toBe(0);

    wedge.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.value).toBe(10);
    expect(component.tooltip()?.cumValue).toBe(10);
  });
});
