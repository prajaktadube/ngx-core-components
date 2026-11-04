import { TestBed } from '@angular/core/testing';
import { PictorialChartComponent } from './pictorial-chart.component';

describe('PictorialChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PictorialChartComponent],
    }).compileComponents();
  });

  it('names icon thresholds and fill levels and shows the matching tooltip on focus', () => {
    const fixture = TestBed.createComponent(PictorialChartComponent);
    fixture.componentRef.setInput('value', 15);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('iconCount', 10);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const icon = fixture.nativeElement.querySelector('.icon-group') as SVGGElement;

    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toContain('Icon 1');
    expect(icon.getAttribute('aria-label')).toContain('10');
    expect(icon.getAttribute('aria-label')).toContain('100%');
    expect(icon.tabIndex).toBe(0);

    icon.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.index).toBe(0);
    expect(component.tooltip()?.threshold).toBe(10);
    expect(component.tooltip()?.fraction).toBe(1);
  });
});
