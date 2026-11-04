import { TestBed } from '@angular/core/testing';
import { GaugeChartComponent } from './gauge-chart.component';

describe('GaugeChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaugeChartComponent],
    }).compileComponents();
  });

  it('exposes value and range and shows the tooltip when focused', () => {
    const fixture = TestBed.createComponent(GaugeChartComponent);
    fixture.componentRef.setInput('value', 72);
    fixture.componentRef.setInput('label', 'Completion');
    fixture.componentRef.setInput('min', 10);
    fixture.componentRef.setInput('max', 90);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const svg = fixture.nativeElement.querySelector('.ngx-gauge-svg') as SVGSVGElement;

    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Completion: 72 (range 10 to 90)');
    expect(svg.tabIndex).toBe(0);

    svg.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.hovered()).toBe(true);
    expect(fixture.nativeElement.querySelector('.chart-tooltip')).not.toBeNull();
  });
});
