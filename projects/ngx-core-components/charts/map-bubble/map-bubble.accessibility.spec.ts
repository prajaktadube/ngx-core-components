import { TestBed } from '@angular/core/testing';
import { MapBubbleComponent } from './map-bubble.component';

describe('MapBubbleComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapBubbleComponent],
    }).compileComponents();
  });

  it('names location bubbles with their values and coordinates and shows the tooltip on focus', () => {
    const fixture = TestBed.createComponent(MapBubbleComponent);
    fixture.componentRef.setInput('data', [
      { lat: 40.7, lng: -74, value: 12, label: 'New York', group: 'North America' },
    ]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const bubble = fixture.nativeElement.querySelector('.bubble-node') as SVGCircleElement;

    expect(bubble.getAttribute('role')).toBe('img');
    expect(bubble.getAttribute('aria-label')).toContain('New York');
    expect(bubble.getAttribute('aria-label')).toContain('12');
    expect(bubble.getAttribute('aria-label')).toContain('North America');
    expect(bubble.tabIndex).toBe(0);

    bubble.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.label).toBe('New York');
    expect(component.tooltip()?.value).toBe(12);
    expect(component.tooltip()?.lat).toBe(40.7);
    expect(component.tooltip()?.lng).toBe(-74);
  });
});
