import { TestBed } from '@angular/core/testing';
import { PackedBubbleChartComponent } from './packed-bubble-chart.component';

describe('PackedBubbleChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackedBubbleChartComponent],
    }).compileComponents();
  });

  it('names bubbles with their group and value and shows their tooltip on focus', () => {
    const fixture = TestBed.createComponent(PackedBubbleChartComponent);
    fixture.componentRef.setInput('data', [{ id: 'item-a', label: 'Item A', value: 7, group: 'Group 1' }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const bubble = fixture.nativeElement.querySelector('.bubble') as SVGCircleElement;

    expect(bubble.getAttribute('role')).toBe('img');
    expect(bubble.getAttribute('aria-label')).toContain('Item A');
    expect(bubble.getAttribute('aria-label')).toContain('Group 1');
    expect(bubble.getAttribute('aria-label')).toContain('7');
    expect(bubble.tabIndex).toBe(0);

    bubble.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.label).toBe('Item A');
    expect(component.tooltip()?.value).toBe(7);
    expect(component.tooltip()?.group).toBe('Group 1');
  });
});
