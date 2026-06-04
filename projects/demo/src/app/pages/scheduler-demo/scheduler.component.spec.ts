import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { SchedulerComponent, NgxSchedulerEventTemplateDirective } from 'ngx-core-components/views';
import { SchedulerEvent, SchedulerResource, SchedulerSlotRangeSelectEvent, SchedulerEventChangeEvent } from 'ngx-core-components/views';

@Component({
  standalone: true,
  imports: [SchedulerComponent],
  template: `
    <ngx-scheduler
      [events]="events()"
      [currentDate]="currentDate()"
      [viewMode]="viewMode()"
      [resources]="resources()"
      [enableDragToCreate]="enableDragToCreate()"
      [showSearch]="showSearch()"
      [showWorkHoursOnly]="showWorkHoursOnly()"
      (slotRangeSelect)="onSlotRangeSelect($event)"
      (eventTimeChange)="onEventTimeChange($event)"
      (eventDelete)="onEventDelete($event)"
    />
  `
})
class TestSchedulerWrapperComponent {
  events = signal<SchedulerEvent[]>([]);
  currentDate = signal<Date>(new Date(2026, 5, 10)); // Fixed test date: June 10, 2026
  viewMode = signal<'day' | 'week' | 'month'>('week');
  resources = signal<SchedulerResource[]>([]);
  enableDragToCreate = signal<boolean>(true);
  showSearch = signal<boolean>(true);
  showWorkHoursOnly = signal<boolean>(true);

  lastRangeSelectEvent: SchedulerSlotRangeSelectEvent | null = null;
  lastTimeChangeEvent: SchedulerEventChangeEvent | null = null;
  lastDeletedEvent: SchedulerEvent | null = null;

  onSlotRangeSelect(event: SchedulerSlotRangeSelectEvent) {
    this.lastRangeSelectEvent = event;
  }
  onEventTimeChange(event: SchedulerEventChangeEvent) {
    this.lastTimeChangeEvent = event;
  }
  onEventDelete(event: SchedulerEvent) {
    this.lastDeletedEvent = event;
  }
}

@Component({
  standalone: true,
  imports: [SchedulerComponent, NgxSchedulerEventTemplateDirective],
  template: `
    <ngx-scheduler [events]="events" [currentDate]="testDate" [viewMode]="'week'">
      <ng-template ngxSchedulerEventTemplate let-event="event">
        <div class="custom-test-card">{{ event.title }} -- custom</div>
      </ng-template>
    </ngx-scheduler>
  `
})
class TestSchedulerTemplateComponent {
  testDate = new Date(2026, 5, 10);
  events: SchedulerEvent[] = [
    { id: 't-1', title: 'Template Evt', start: new Date(2026, 5, 10, 10, 0), end: new Date(2026, 5, 10, 11, 0) }
  ];
}

describe('SchedulerComponent', () => {
  let fixture: ComponentFixture<TestSchedulerWrapperComponent>;
  let wrapper: TestSchedulerWrapperComponent;
  let component: SchedulerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSchedulerWrapperComponent, SchedulerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestSchedulerWrapperComponent);
    wrapper = fixture.componentInstance;
    fixture.detectChanges();

    component = fixture.debugElement.query(
      el => el.componentInstance instanceof SchedulerComponent
    ).componentInstance as SchedulerComponent;
  });

  it('should initialize with default view mode and base toolbar buttons', () => {
    expect(component).toBeTruthy();
    expect(component.activeMode()).toBe('week');

    const toolbar = fixture.debugElement.query(By.css('.scheduler-toolbar'));
    expect(toolbar).toBeTruthy();

    const viewButtons = fixture.debugElement.queryAll(By.css('.view-btn'));
    expect(viewButtons.length).toBe(3); // Day, Week, Month
  });

  it('should toggle view mode when view mode buttons are clicked', () => {
    const viewButtons = fixture.debugElement.queryAll(By.css('.view-btn'));
    
    // Find day button (normally first)
    const dayBtn = viewButtons.find(btn => btn.nativeElement.textContent.trim().toLowerCase().includes('day'));
    if (dayBtn) {
      dayBtn.nativeElement.click();
      fixture.detectChanges();
      expect(component.activeMode()).toBe('day');
    }

    const monthBtn = viewButtons.find(btn => btn.nativeElement.textContent.trim().toLowerCase().includes('month'));
    if (monthBtn) {
      monthBtn.nativeElement.click();
      fixture.detectChanges();
      expect(component.activeMode()).toBe('month');
    }
  });

  it('should render side-by-side columns per resource in Day view when resources are supplied', () => {
    const mockResources: SchedulerResource[] = [
      { id: 'dev-alice', name: 'Alice Vance', description: 'UX Designer' },
      { id: 'dev-bob', name: 'Bob Smith', description: 'Lead Developer' }
    ];

    wrapper.resources.set(mockResources);
    wrapper.viewMode.set('day');
    fixture.detectChanges();

    // In day view, we group by resources side-by-side
    const colHeaders = fixture.debugElement.queryAll(By.css('.time-grid-header .column-header-cell'));
    
    // Since there are 2 resources, there should be 2 headers
    // Plus potentially an empty corner/axis spacer (depending on HTML structure)
    // Let's filter for text matching resource names
    const textContents = colHeaders.map(h => h.nativeElement.textContent.trim());
    expect(textContents.some(t => t.includes('Alice Vance'))).toBeTrue();
    expect(textContents.some(t => t.includes('Bob Smith'))).toBeTrue();
  });

  it('should render a single date column header in Day view when resources are empty', () => {
    wrapper.resources.set([]);
    wrapper.viewMode.set('day');
    fixture.detectChanges();

    const colHeaders = fixture.debugElement.queryAll(By.css('.time-grid-header .column-header-cell'));
    expect(colHeaders.length).toBeGreaterThanOrEqual(1);
    
    // Verify it doesn't display resource badges since they are empty
    const resourceHeaderEl = fixture.debugElement.query(By.css('.resource-header-card'));
    expect(resourceHeaderEl).toBeNull();
  });

  it('should place events with isAllDay: true in the all-day events row', () => {
    const allDayEvent: SchedulerEvent = {
      id: 'allday-1',
      title: 'Full Day Outage Sync',
      start: new Date(2026, 5, 10, 9, 0),
      end: new Date(2026, 5, 10, 10, 0),
      category: 'important',
      isAllDay: true
    };

    wrapper.events.set([allDayEvent]);
    fixture.detectChanges();

    // Verify all-day block container is rendered
    const allDayRow = fixture.debugElement.query(By.css('.all-day-row-container'));
    expect(allDayRow).toBeTruthy();

    const eventBlock = fixture.debugElement.query(By.css('.all-day-event-block'));
    expect(eventBlock).toBeTruthy();
    expect(eventBlock.nativeElement.textContent).toContain('Full Day Outage Sync');
  });

  it('should emit eventTimeChange with completed: true when task completion checkbox is toggled', () => {
    const taskEvent: SchedulerEvent = {
      id: 'task-1',
      title: 'Write core tests',
      start: new Date(2026, 5, 10, 10, 0),
      end: new Date(2026, 5, 10, 11, 0),
      category: 'task',
      completed: false
    };

    wrapper.events.set([taskEvent]);
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('.task-completion-checkbox'));
    expect(checkbox).toBeTruthy();

    // Toggle the checkbox
    checkbox.nativeElement.checked = true;
    checkbox.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(wrapper.lastTimeChangeEvent).not.toBeNull();
    expect(wrapper.lastTimeChangeEvent?.event.completed).toBeTrue();
    expect(wrapper.lastTimeChangeEvent?.event.id).toBe('task-1');
  });

  it('should compute translucent glassmorphic styles for custom hex colors', () => {
    const customColorEvent: SchedulerEvent = {
      id: 'custom-1',
      title: 'Custom Color Meet',
      start: new Date(2026, 5, 10, 14, 0),
      end: new Date(2026, 5, 10, 15, 0),
      category: 'personal',
      color: '#ff007f'
    };

    const styles = component.getEventStyles(customColorEvent);
    expect(styles['background-color']).toBe('#ff007f12');
    expect(styles['border-color']).toBe('#ff007f33');
    expect(styles['color']).toBe('#ff007f');
    expect(styles['border-left']).toBe('4px solid #ff007f');
  });

  it('should simulate drag-to-create range selections correctly', () => {
    wrapper.enableDragToCreate.set(true);
    fixture.detectChanges();

    const testDate = new Date(2026, 5, 10);
    
    // Simulate pointer interactions directly using component handlers
    const dummySlotDiv = document.createElement('div');
    spyOn(dummySlotDiv, 'setPointerCapture');
    spyOn(dummySlotDiv, 'releasePointerCapture');
    const pointerDownEvent = new PointerEvent('pointerdown', { button: 0 });
    Object.defineProperty(pointerDownEvent, 'target', { value: dummySlotDiv, enumerable: true });
    spyOn(pointerDownEvent, 'preventDefault');

    // Drag start at 9:00 AM
    component.onSlotPointerDown(pointerDownEvent, testDate, 9, 0, 'resource-1');
    expect(component.dragSelectStart()).toEqual({ date: testDate, hour: 9, minute: 0, resourceId: 'resource-1' });

    // Drag enter at 10:30 AM in same resource column
    const pointerEnterEvent = new PointerEvent('pointerenter');
    component.onSlotPointerEnter(pointerEnterEvent, testDate, 10, 30, 'resource-1');
    expect(component.dragSelectCurrent()).toEqual({ date: testDate, hour: 10, minute: 30, resourceId: 'resource-1' });

    // Release pointer on window
    const pointerUpEvent = new PointerEvent('pointerup');
    component.onWindowPointerUp(pointerUpEvent);

    // Verify emission bounds
    expect(wrapper.lastRangeSelectEvent).not.toBeNull();
    
    // Starts at 9:00 AM
    const expectedStart = new Date(testDate);
    expectedStart.setHours(9, 0, 0, 0);
    expect(wrapper.lastRangeSelectEvent?.start.getTime()).toBe(expectedStart.getTime());

    // Ends at max (10:30) + 1 slot (60 mins) = 11:30 AM
    const expectedEnd = new Date(testDate);
    expectedEnd.setHours(11, 30, 0, 0);
    expect(wrapper.lastRangeSelectEvent?.end.getTime()).toBe(expectedEnd.getTime());
    expect(wrapper.lastRangeSelectEvent?.resourceId).toBe('resource-1');
  });

  it('should invoke file downloads when calling export methods', () => {
    // Set up mock events to export
    const events: SchedulerEvent[] = [
      { id: '1', title: 'Task Alpha', start: new Date(2026, 5, 10, 10, 0), end: new Date(2026, 5, 10, 11, 0), category: 'task' }
    ];
    wrapper.events.set(events);
    fixture.detectChanges();

    // Spy on browser globals to avoid downloads firing in window
    const blobSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob-mock-url');
    spyOn(URL, 'revokeObjectURL');
    
    const mockLink = document.createElement('a');
    spyOn(mockLink, 'click');
    spyOn(document, 'createElement').and.callFake((tagName: string) => {
      if (tagName === 'a') return mockLink;
      return document.createElement(tagName);
    });

    component.exportToJSON();
    expect(blobSpy).toHaveBeenCalled();
    expect(mockLink.download).toBe('calendar_events.json');

    component.exportToCSV();
    expect(mockLink.download).toBe('calendar_events.csv');

    component.exportToICS();
    expect(mockLink.download).toBe('calendar.ics');
  });

  it('should render custom event templating when provided via NgxSchedulerEventTemplateDirective', async () => {
    const templFixture = TestBed.createComponent(TestSchedulerTemplateComponent);
    templFixture.detectChanges();

    const card = templFixture.debugElement.query(By.css('.custom-test-card'));
    expect(card).toBeTruthy();
    expect(card.nativeElement.textContent.trim()).toBe('Template Evt -- custom');
  });

  it('should cap month day events at 2 and render a +X more button for remaining events', () => {
    const mockEvents: SchedulerEvent[] = [
      { id: 'm-1', title: 'Evt 1', start: new Date(2026, 5, 10, 9, 0), end: new Date(2026, 5, 10, 10, 0) },
      { id: 'm-2', title: 'Evt 2', start: new Date(2026, 5, 10, 11, 0), end: new Date(2026, 5, 10, 12, 0) },
      { id: 'm-3', title: 'Evt 3', start: new Date(2026, 5, 10, 13, 0), end: new Date(2026, 5, 10, 14, 0) }
    ];
    wrapper.events.set(mockEvents);
    wrapper.viewMode.set('month');
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.css('.month-event-item'));
    expect(items.length).toBe(2);

    const moreBtn = fixture.debugElement.query(By.css('.month-more-indicator'));
    expect(moreBtn).toBeTruthy();
    expect(moreBtn.nativeElement.textContent.trim()).toBe('+1 more');
  });

  it('should open month popover dialog when +X more indicator is clicked', () => {
    const mockEvents: SchedulerEvent[] = [
      { id: 'm-1', title: 'Evt 1', start: new Date(2026, 5, 10, 9, 0), end: new Date(2026, 5, 10, 10, 0) },
      { id: 'm-2', title: 'Evt 2', start: new Date(2026, 5, 10, 11, 0), end: new Date(2026, 5, 10, 12, 0) },
      { id: 'm-3', title: 'Evt 3', start: new Date(2026, 5, 10, 13, 0), end: new Date(2026, 5, 10, 14, 0) }
    ];
    wrapper.events.set(mockEvents);
    wrapper.viewMode.set('month');
    fixture.detectChanges();

    const moreBtn = fixture.debugElement.query(By.css('.month-more-indicator'));
    moreBtn.nativeElement.click();
    fixture.detectChanges();

    expect(component.activeMonthPopoverDate()).not.toBeNull();
    const popover = fixture.debugElement.query(By.css('.month-events-popover'));
    expect(popover).toBeTruthy();

    const popoverEvents = popover.queryAll(By.css('.popover-event-item'));
    expect(popoverEvents.length).toBe(3);

    const closeBtn = popover.query(By.css('.popover-close'));
    closeBtn.nativeElement.click();
    fixture.detectChanges();
    expect(component.activeMonthPopoverDate()).toBeNull();
  });

  it('should navigate views and dates on keyboard shortcut presses', () => {
    const dispatchKey = (key: string) => {
      const e = new KeyboardEvent('keydown', { key });
      window.dispatchEvent(e);
      fixture.detectChanges();
    };

    dispatchKey('d');
    expect(component.activeMode()).toBe('day');

    dispatchKey('m');
    expect(component.activeMode()).toBe('month');

    dispatchKey('w');
    expect(component.activeMode()).toBe('week');

    const initialDate = new Date(component.activeDate());
    dispatchKey('ArrowRight');
    
    const nextDate = component.activeDate();
    const diff = Math.round((nextDate.getTime() - initialDate.getTime()) / 86400000);
    expect(diff).toBe(7);
  });
});
