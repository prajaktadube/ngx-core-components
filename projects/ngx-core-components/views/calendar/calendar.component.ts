import {
  Component, input, output, signal, computed, model, ContentChild, TemplateRef,
  ElementRef, ViewChildren, QueryList, ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CalendarEvent {
  id?: string;
  title: string;
  date: Date | string;
  color?: string;
  description?: string;
}

export interface CalendarCell {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isFocused: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'ngx-calendar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ngx-calendar-container"
      role="application"
      aria-label="Interactive Calendar"
    >
      <!-- HEADER -->
      <div class="ngx-calendar-header">
        <h2 class="ngx-calendar-title" aria-live="polite">
          {{ monthLabel() }}
        </h2>
        <div class="ngx-calendar-actions">
          <button
            class="ngx-cal-btn prev-btn"
            (click)="prevMonth()"
            type="button"
            aria-label="Previous Month"
          >
            ‹
          </button>
          <button
            class="ngx-cal-btn today-btn"
            (click)="goToToday()"
            type="button"
            aria-label="Go to Today"
          >
            Today
          </button>
          <button
            class="ngx-cal-btn next-btn"
            (click)="nextMonth()"
            type="button"
            aria-label="Next Month"
          >
            ›
          </button>
        </div>
      </div>

      <!-- GRID -->
      <div
        class="ngx-calendar-grid"
        role="grid"
        [attr.aria-label]="monthLabel()"
      >
        <!-- WEEKDAYS HEADER -->
        <div class="ngx-calendar-row weekdays-row" role="row">
          @for (day of weekDays(); track day) {
            <div
              class="ngx-calendar-weekday"
              role="columnheader"
              [attr.aria-label]="day"
            >
              {{ day.slice(0, 3) }}
            </div>
          }
        </div>

        <!-- DAYS GRID -->
        <div class="ngx-calendar-body">
          @for (row of gridRows(); track $index) {
            <div class="ngx-calendar-row" role="row">
              @for (cell of row; track cell.date.getTime()) {
                <div
                  #cellEl
                  class="ngx-calendar-cell"
                  [class.current-month]="cell.isCurrentMonth"
                  [class.other-month]="!cell.isCurrentMonth"
                  [class.today]="cell.isToday"
                  [class.selected]="cell.isSelected"
                  [class.focused]="cell.isFocused"
                  [class.has-events]="cell.events.length > 0"
                  role="gridcell"
                  [attr.aria-selected]="cell.isSelected"
                  [attr.aria-label]="cell.date | date:'longDate'"
                  [attr.tabindex]="cell.isFocused && !readonly() ? '0' : '-1'"
                  (click)="selectCell(cell)"
                  (keydown)="onCellKeyDown($event, cell)"
                >
                  <!-- Cell Header (Day Number) -->
                  <div class="cell-header">
                    <span class="day-number">{{ cell.dayNumber }}</span>
                    @if (cell.isToday) {
                      <span class="today-indicator" aria-hidden="true"></span>
                    }
                  </div>

                  <!-- Events List or Custom Day Template -->
                  <div class="cell-content">
                    @if (dayTemplate()) {
                      <ng-container
                        *ngTemplateOutlet="dayTemplate()!; context: { $implicit: cell.date, events: cell.events }"
                      ></ng-container>
                    } @else {
                      @for (event of cell.events.slice(0, 3); track event.title) {
                        <div
                          class="calendar-event-pill"
                          [style.border-left-color]="event.color || '#4f46e5'"
                          [attr.title]="event.title + (event.description ? ': ' + event.description : '')"
                        >
                          {{ event.title }}
                        </div>
                      }
                      @if (cell.events.length > 3) {
                        <div class="events-overflow-indicator">
                          +{{ cell.events.length - 3 }} more
                        </div>
                      }
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      --ngx-calendar-border: #cbd5e1;
      --ngx-calendar-bg: #ffffff;
      --ngx-calendar-header-bg: #f8fafc;
      --ngx-calendar-text: #0f172a;
      --ngx-calendar-text-muted: #64748b;
      --ngx-calendar-cell-other-bg: #f8fafc;
      --ngx-calendar-hover-bg: #f1f5f9;
      --ngx-calendar-focus-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
      --ngx-calendar-active-color: #4f46e5;
      --ngx-calendar-selected-bg: rgba(79, 70, 229, 0.05);
      --ngx-calendar-selected-border: #4f46e5;
      
      --event-pill-bg: #f1f5f9;
      --event-pill-text: #334155;
    }

    :host-context(body.dark),
    :host-context(.dark),
    :host-context(.dark-theme) {
      --ngx-calendar-border: #334155;
      --ngx-calendar-bg: #0f172a;
      --ngx-calendar-header-bg: #1e293b;
      --ngx-calendar-text: #f8fafc;
      --ngx-calendar-text-muted: #94a3b8;
      --ngx-calendar-cell-other-bg: #0b0f19;
      --ngx-calendar-hover-bg: #1e293b;
      --ngx-calendar-focus-shadow: 0 0 0 3px rgba(129, 140, 248, 0.25);
      --ngx-calendar-active-color: #818cf8;
      --ngx-calendar-selected-bg: rgba(129, 140, 248, 0.08);
      --ngx-calendar-selected-border: #818cf8;
      
      --event-pill-bg: #1e293b;
      --event-pill-text: #cbd5e1;
    }

    .ngx-calendar-container {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--ngx-calendar-border);
      border-radius: 12px;
      background: var(--ngx-calendar-bg);
      color: var(--ngx-calendar-text);
      font-family: inherit;
      overflow: hidden;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* HEADER */
    .ngx-calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: var(--ngx-calendar-header-bg);
      border-bottom: 1px solid var(--ngx-calendar-border);
    }

    .ngx-calendar-title {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .ngx-calendar-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ngx-cal-btn {
      background: var(--ngx-calendar-bg);
      border: 1px solid var(--ngx-calendar-border);
      border-radius: 8px;
      color: var(--ngx-calendar-text);
      font-size: 13px;
      font-weight: 600;
      padding: 6px 12px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .ngx-cal-btn:hover {
      background: var(--ngx-calendar-hover-bg);
      border-color: var(--ngx-calendar-active-color);
      color: var(--ngx-calendar-active-color);
    }

    .prev-btn, .next-btn {
      font-size: 16px;
      width: 32px;
      height: 32px;
      padding: 0;
    }

    /* GRID */
    .ngx-calendar-grid {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .ngx-calendar-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      width: 100%;
    }

    /* WEEKDAYS */
    .weekdays-row {
      border-bottom: 1px solid var(--ngx-calendar-border);
      background: var(--ngx-calendar-header-bg);
    }

    .ngx-calendar-weekday {
      padding: 12px 6px;
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--ngx-calendar-text-muted);
    }

    /* CELLS */
    .ngx-calendar-body {
      display: flex;
      flex-direction: column;
    }

    .ngx-calendar-cell {
      min-height: 100px;
      border-right: 1px solid var(--ngx-calendar-border);
      border-bottom: 1px solid var(--ngx-calendar-border);
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      outline: none;
      background: var(--ngx-calendar-bg);
    }

    .ngx-calendar-row .ngx-calendar-cell:last-child {
      border-right: none;
    }

    .ngx-calendar-body .ngx-calendar-row:last-child .ngx-calendar-cell {
      border-bottom: none;
    }

    .ngx-calendar-cell.other-month {
      background: var(--ngx-calendar-cell-other-bg);
    }

    .ngx-calendar-cell.other-month .day-number {
      color: var(--ngx-calendar-text-muted);
      opacity: 0.6;
    }

    .ngx-calendar-cell:not(.selected):hover {
      background: var(--ngx-calendar-hover-bg);
      cursor: pointer;
    }

    /* Selection & Focus States */
    .ngx-calendar-cell.selected {
      background: var(--ngx-calendar-selected-bg);
    }

    .ngx-calendar-cell.selected::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 2px solid var(--ngx-calendar-selected-border);
      border-radius: 4px;
      pointer-events: none;
      animation: select-pulse 0.25s ease-out;
    }

    .ngx-calendar-cell.focused {
      z-index: 2;
    }
    
    .ngx-calendar-cell.focused:focus-visible {
      box-shadow: var(--ngx-calendar-focus-shadow);
      border-color: var(--ngx-calendar-active-color);
    }

    .cell-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .day-number {
      font-size: 13px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .today .day-number {
      background: var(--ngx-calendar-active-color);
      color: #ffffff !important;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
    }

    .today-indicator {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--ngx-calendar-active-color);
      margin-right: 4px;
    }

    /* Events Content */
    .cell-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      overflow: hidden;
    }

    .calendar-event-pill {
      font-size: 11px;
      font-weight: 550;
      padding: 3px 6px;
      border-radius: 4px;
      border-left: 3px solid #4f46e5;
      background: var(--event-pill-bg);
      color: var(--event-pill-text);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      transition: transform 0.15s ease, background-color 0.15s ease;
    }

    .calendar-event-pill:hover {
      transform: translateX(2px);
      background: var(--ngx-calendar-hover-bg);
    }

    .events-overflow-indicator {
      font-size: 10px;
      font-weight: 700;
      color: var(--ngx-calendar-active-color);
      padding-left: 6px;
      margin-top: 2px;
    }

    @keyframes select-pulse {
      0% { transform: scale(0.98); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }

    @media (max-width: 768px) {
      .ngx-calendar-cell {
        min-height: 70px;
        padding: 4px;
      }
      .calendar-event-pill {
        display: none; /* Only show dots or just day number on small screens */
      }
      .ngx-calendar-cell.has-events::after {
        content: '•';
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        color: var(--ngx-calendar-active-color);
        font-size: 16px;
      }
    }
  `]
})
export class CalendarComponent {
  value = model<Date | null>(null);
  events = input<CalendarEvent[]>([]);
  readonly = input(false);

  // Content Projection for custom cell
  @ContentChild('dayTemplate') dayTemplateSignal?: TemplateRef<{ $implicit: Date, events: CalendarEvent[] }>;

  dayTemplate = computed(() => this.dayTemplateSignal);

  activeMonthDate = signal<Date>(new Date());
  focusedDate = signal<Date>(new Date());

  dateSelect = output<Date>();
  monthChange = output<{ year: number; month: number }>();

  weekDays = signal<string[]>([
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]);

  @ViewChildren('cellEl') cellElements!: QueryList<ElementRef<HTMLDivElement>>;

  monthLabel = computed(() => {
    return this.activeMonthDate().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  });

  // Flat 42 cell list computed signal
  gridCells = computed(() => {
    const activeDate = this.activeMonthDate();
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const cells: CalendarCell[] = [];
    const selectedVal = this.value();
    const focusedVal = this.focusedDate();

    // Previous month cells
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthTotalDays - i;
      const date = new Date(year, month - 1, day);
      cells.push(this.createCellObj(date, day, false, selectedVal, focusedVal));
    }

    // Current month cells
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      cells.push(this.createCellObj(date, day, true, selectedVal, focusedVal));
    }

    // Next month cells
    const remainingCells = 42 - cells.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      cells.push(this.createCellObj(date, day, false, selectedVal, focusedVal));
    }

    return cells;
  });

  // Group cells by 7 for visual rows
  gridRows = computed(() => {
    const cells = this.gridCells();
    const rows: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  });

  private createCellObj(
    date: Date,
    dayNumber: number,
    isCurrentMonth: boolean,
    selectedVal: Date | null,
    focusedVal: Date
  ): CalendarCell {
    return {
      date,
      dayNumber,
      isCurrentMonth,
      isToday: this.isSameDay(date, new Date()),
      isSelected: selectedVal ? this.isSameDay(date, selectedVal) : false,
      isFocused: this.isSameDay(date, focusedVal),
      events: this.getEventsForDate(date)
    };
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  private getEventsForDate(date: Date): CalendarEvent[] {
    return this.events().filter(e => {
      const eDate = typeof e.date === 'string' ? new Date(e.date) : e.date;
      return this.isSameDay(date, eDate);
    });
  }

  prevMonth(): void {
    const current = this.activeMonthDate();
    const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.activeMonthDate.set(prev);
    // Align focus with 1st of the new active month
    this.focusedDate.set(prev);
    this.emitMonthChange();
  }

  nextMonth(): void {
    const current = this.activeMonthDate();
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.activeMonthDate.set(next);
    // Align focus with 1st of the new active month
    this.focusedDate.set(next);
    this.emitMonthChange();
  }

  goToToday(): void {
    const today = new Date();
    this.activeMonthDate.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.focusedDate.set(today);
    this.emitMonthChange();
  }

  selectCell(cell: CalendarCell): void {
    if (this.readonly()) return;
    this.value.set(cell.date);
    this.focusedDate.set(cell.date);
    this.dateSelect.emit(cell.date);

    // If clicked other month day, snap page view
    if (!cell.isCurrentMonth) {
      this.activeMonthDate.set(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
      this.emitMonthChange();
    }
  }

  private emitMonthChange(): void {
    const active = this.activeMonthDate();
    this.monthChange.emit({
      year: active.getFullYear(),
      month: active.getMonth()
    });
  }

  // Keyboard navigation
  onCellKeyDown(event: KeyboardEvent, cell: CalendarCell): void {
    if (this.readonly()) return;

    let handled = false;
    const currentFocus = new Date(this.focusedDate());

    switch (event.key) {
      case 'ArrowLeft':
        currentFocus.setDate(currentFocus.getDate() - 1);
        handled = true;
        break;
      case 'ArrowRight':
        currentFocus.setDate(currentFocus.getDate() + 1);
        handled = true;
        break;
      case 'ArrowUp':
        currentFocus.setDate(currentFocus.getDate() - 7);
        handled = true;
        break;
      case 'ArrowDown':
        currentFocus.setDate(currentFocus.getDate() + 7);
        handled = true;
        break;
      case 'Enter':
      case ' ':
        this.selectCell(cell);
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
      this.focusedDate.set(currentFocus);

      // Check if we navigated to a date outside the current active month, and auto-snap activeMonth
      const active = this.activeMonthDate();
      if (
        currentFocus.getFullYear() !== active.getFullYear() ||
        currentFocus.getMonth() !== active.getMonth()
      ) {
        this.activeMonthDate.set(new Date(currentFocus.getFullYear(), currentFocus.getMonth(), 1));
        this.emitMonthChange();
      }

      // Delay focus slightly so angular updates DOM tab-indices
      setTimeout(() => {
        const activeCellEl = this.cellElements.find(el => 
          el.nativeElement.getAttribute('tabindex') === '0'
        );
        if (activeCellEl) {
          activeCellEl.nativeElement.focus();
        }
      }, 0);
    }
  }
}
