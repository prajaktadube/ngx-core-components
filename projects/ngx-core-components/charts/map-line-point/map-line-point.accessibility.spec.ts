import { TestBed } from '@angular/core/testing';
import { MapLinePointComponent } from './map-line-point.component';

describe('MapLinePointComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapLinePointComponent],
    }).compileComponents();
  });

  it('names geographic points and routes and shows their tooltips on focus', () => {
    const fixture = TestBed.createComponent(MapLinePointComponent);
    fixture.componentRef.setInput('points', [
      { lat: 40.7, lng: -74, label: 'New York' },
      { lat: 51.5, lng: -0.1, label: 'London' },
    ]);
    fixture.componentRef.setInput('lines', [{ fromIndex: 0, toIndex: 1, label: 'Flight' }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const point = fixture.nativeElement.querySelector('.network-point') as SVGCircleElement;
    const line = fixture.nativeElement.querySelector('.network-line') as SVGLineElement;

    expect(point.getAttribute('role')).toBe('img');
    expect(point.getAttribute('aria-label')).toContain('New York');
    expect(point.getAttribute('aria-label')).toContain('40.7');
    point.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.type).toBe('point');
    expect(component.tooltip()?.label).toBe('New York');

    expect(line.getAttribute('role')).toBe('img');
    expect(line.getAttribute('aria-label')).toBe('Flight: from New York to London');
    line.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.type).toBe('line');
    expect(component.tooltip()?.fromLabel).toBe('New York');
    expect(component.tooltip()?.toLabel).toBe('London');
  });
});
