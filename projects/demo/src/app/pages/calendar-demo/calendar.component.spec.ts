import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CalendarComponent, CalendarEvent } from 'ngx-core-components';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create calendar component', () => {
    expect(component).toBeTruthy();
  });

  it('should render 42 grid cell items representing 6 weeks', () => {
    const cells = fixture.debugElement.queryAll(By.css('.ngx-calendar-cell'));
    expect(cells.length).toBe(42);
  });

  it('should change navigated month when clicking next and prev buttons', () => {
    const initialMonth = component.activeMonthDate();
    
    // Click next month
    const nextBtn = fixture.debugElement.query(By.css('.next-btn')).nativeElement;
    nextBtn.click();
    fixture.detectChanges();

    const nextMonth = component.activeMonthDate();
    expect(nextMonth.getMonth()).toBe((initialMonth.getMonth() + 1) % 12);

    // Click prev month
    const prevBtn = fixture.debugElement.query(By.css('.prev-btn')).nativeElement;
    prevBtn.click();
    fixture.detectChanges();

    const prevMonth = component.activeMonthDate();
    expect(prevMonth.getMonth()).toBe(initialMonth.getMonth());
  });

  it('should emit selected date on cell click', () => {
    spyOn(component.dateSelect, 'emit');
    
    // Click a current month day cell (e.g. 15th cell)
    const cells = fixture.debugElement.queryAll(By.css('.current-month'));
    const targetCell = cells[Math.floor(cells.length / 2)];
    targetCell.nativeElement.click();
    fixture.detectChanges();

    expect(component.dateSelect.emit).toHaveBeenCalled();
    expect(component.value()).not.toBeNull();
  });

  it('should render events inside cells matching their date', () => {
    const today = new Date();
    const mockEvents: CalendarEvent[] = [
      { title: 'Release Party', date: today, color: '#ff0000' }
    ];
    
    fixture.componentRef.setInput('events', mockEvents);
    fixture.detectChanges();

    const eventPill = fixture.debugElement.query(By.css('.calendar-event-pill'));
    expect(eventPill).toBeTruthy();
    expect(eventPill.nativeElement.textContent.trim()).toBe('Release Party');
  });

  it('should navigate focused cell using arrow keyboard controls', fakeAsync(() => {
    const today = new Date();
    component.focusedDate.set(new Date(today.getFullYear(), today.getMonth(), 15));
    fixture.detectChanges();

    // Trigger keydown ArrowRight on focused cell
    const cellEl = fixture.debugElement.query(By.css('.ngx-calendar-cell.focused'));
    
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    cellEl.nativeElement.dispatchEvent(event);
    tick();
    fixture.detectChanges();

    const updatedFocus = component.focusedDate();
    expect(updatedFocus.getDate()).toBe(16);
  }));
});
