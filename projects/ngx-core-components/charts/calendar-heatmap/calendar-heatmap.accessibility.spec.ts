import { TestBed } from '@angular/core/testing';
import { CalendarHeatmapComponent } from './calendar-heatmap.component';

describe('CalendarHeatmapComponent accessibility', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarHeatmapComponent],
    }).compileComponents();
  });

  it('labels cells and supports focus tooltips and keyboard activation', () => {
    const fixture = TestBed.createComponent(CalendarHeatmapComponent);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = today.toISOString().slice(0, 10);
    fixture.componentRef.setInput('data', [{ date, value: 3 }]);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const cells = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.heatmap-cell'
    ) as NodeListOf<SVGRectElement>;
    const cell = Array.from(cells).find(candidate => candidate.getAttribute('aria-label')?.includes(date))!;
    const selected: { date: string; value: number }[] = [];
    component.cellClick.subscribe(value => selected.push(value));

    expect(cell.getAttribute('role')).toBe('button');
    expect(cell.getAttribute('aria-label')).toContain(date);
    expect(cell.getAttribute('aria-label')).toContain('3 contributions');
    expect(cell.tabIndex).toBe(0);

    cell.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.tooltip()?.date).toBe(date);
    expect(component.tooltip()?.value).toBe(3);

    cell.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(selected).toEqual([{ date, value: 3 }]);
  });
});
