import { TestBed } from '@angular/core/testing';
import { TimelineChartComponent, TimelineEvent } from './timeline-chart.component';

describe('TimelineChartComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineChartComponent],
    }).compileComponents();
  });

  it('labels events, exposes them to the keyboard, and activates them with Enter and Space', () => {
    const fixture = TestBed.createComponent(TimelineChartComponent);
    const event = {
      id: 'release',
      title: 'Release',
      category: 'Delivery',
      startDate: '2026-01-02T00:00:00.000Z',
      endDate: '2026-01-03T00:00:00.000Z',
      status: 'completed' as const,
    };
    fixture.componentRef.setInput('events', [event]);
    fixture.detectChanges();

    const chart = fixture.componentInstance;
    const group = fixture.nativeElement.querySelector('.event-group') as SVGGElement;
    const clicked: TimelineEvent[] = [];
    chart.eventClick.subscribe(value => clicked.push(value));

    expect(group.getAttribute('role')).toBe('button');
    expect(group.getAttribute('aria-label')).toContain('Release');
    expect(group.getAttribute('aria-label')).toContain('Delivery');
    expect(group.tabIndex).toBe(0);

    group.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(chart.hoverEvent()?.raw).toBe(event);

    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    group.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(clicked).toEqual([event, event]);
  });
});
