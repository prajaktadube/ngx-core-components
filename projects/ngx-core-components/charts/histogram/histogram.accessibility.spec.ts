import { TestBed } from '@angular/core/testing';
import { HistogramComponent } from './histogram.component';

describe('HistogramComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistogramComponent],
    }).compileComponents();
  });

  it('names bins and shows the matching frequency tooltip when focused', () => {
    const fixture = TestBed.createComponent(HistogramComponent);
    fixture.componentRef.setInput('data', [1, 2, 9]);
    fixture.componentRef.setInput('binsCount', 2);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const bar = fixture.nativeElement.querySelector('.histogram-bar') as SVGRectElement;

    expect(bar.getAttribute('role')).toBe('img');
    expect(bar.getAttribute('aria-label')).toContain('2 observations');
    expect(bar.getAttribute('aria-label')).toContain('66.7%');
    expect(bar.tabIndex).toBe(0);

    bar.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.count).toBe(2);
    expect(component.tooltip()?.percentage).toBeCloseTo(66.7, 1);
  });
});
