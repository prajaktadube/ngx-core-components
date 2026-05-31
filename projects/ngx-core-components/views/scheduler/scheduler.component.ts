import { Component, input, signal, output, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchedulerEvent, SchedulerSlotClickEvent, SchedulerEventChangeEvent } from './models';

@Component({
  selector: 'ngx-scheduler',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ngx-scheduler-wrapper" [class.dark]="theme() === 'dark'">
      
      <!-- Scheduler Toolbar Header -->
      <div class="scheduler-toolbar">
        <div class="nav-controls">
          <button class="tool-btn" (click)="navigate(-1)">◀</button>
          <button class="tool-btn today-btn" (click)="goToToday()">Today</button>
          <button class="tool-btn" (click)="navigate(1)">▶</button>
          <h2 class="current-period-label">{{ periodLabel() }}</h2>
        </div>

        <div class="view-switch-controls">
          @for (mode of viewModes; track mode) {
            <button
              class="view-btn"
              [class.active]="activeMode() === mode"
              (click)="activeMode.set(mode)"
            >
              {{ mode | titlecase }}
            </button>
          }
        </div>
      </div>

      <!-- Scheduler Body Grid -->
      <div class="scheduler-body">

        <!-- WEEK / DAY VIEWS LAYER -->
        @if (activeMode() === 'day' || activeMode() === 'week') {
          <div class="time-grid-container">
            <div class="time-grid-header">
              <div class="time-axis-header"></div>
              <div class="columns-headers-wrap">
                @for (col of activeColumns(); track col.getTime()) {
                  <div class="column-header-cell" [class.today]="isToday(col)">
                    <span class="day-name">{{ col | date:'EEE' }}</span>
                    <span class="day-num">{{ col | date:'d' }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="time-grid-body">
              <!-- Left Hour Axis labels -->
              <div class="time-axis-labels">
                @for (h of hours(); track h) {
                  <div class="time-label">{{ formatHour(h) }}</div>
                }
              </div>

              <!-- Day columns contents -->
              <div class="columns-body-wrap">
                <!-- Hourly horizontal line grids -->
                <div class="hourly-grid-lines">
                  @for (h of hours(); track h) {
                    <div class="grid-line"></div>
                  }
                </div>

                <!-- Event overlays columns -->
                @for (col of activeColumns(); track col.getTime()) {
                  <div class="column-body-cell">
                    <!-- Transparent interactive slots -->
                    <div class="interactive-slots-overlay">
                      @for (h of hours(); track h) {
                        <div class="slot-trigger" (click)="clickSlot(col, h)"></div>
                      }
                    </div>

                    <!-- Events positioned overlays -->
                    @for (evt of getEventsForDate(col); track evt.id) {
                      <div
                        class="scheduler-event-card"
                        [class]="evt.category"
                        [style.top.%]="getEventTop(evt.start)"
                        [style.height.%]="getEventHeight(evt.start, evt.end)"
                        [style.background-color]="evt.color"
                        (click)="clickEvent(evt)"
                        [title]="evt.title + ' (' + evt.description + ')'"
                      >
                        <div class="event-color-indicator"></div>
                        <div class="event-details">
                          <span class="event-title">{{ evt.title }}</span>
                          <span class="event-time">
                            {{ evt.start | date:'shortTime' }} - {{ evt.end | date:'shortTime' }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- MONTH VIEW GRID LAYER -->
        @if (activeMode() === 'month') {
          <div class="month-grid-container">
            <div class="month-grid-header">
              @for (dayName of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; track dayName) {
                <div class="month-header-cell">{{ dayName }}</div>
              }
            </div>

            <div class="month-grid-body">
              @for (cell of activeColumns(); track cell.getTime()) {
                <div 
                  class="month-day-cell" 
                  [class.today]="isToday(cell)"
                  [class.other-month]="isOtherMonth(cell)"
                  (click)="clickSlot(cell, 9)"
                >
                  <span class="month-day-number">{{ cell | date:'d' }}</span>

                  <div class="month-day-events-list">
                    @for (evt of getEventsForDate(cell); track evt.id) {
                      <div
                        class="month-event-item"
                        [class]="evt.category"
                        (click)="clickEvent(evt); $event.stopPropagation()"
                        [title]="evt.title"
                      >
                        {{ evt.title }}
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ngx-scheduler-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 500px;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: var(--radius-md, 12px);
      background: var(--bg-secondary, #ffffff);
      color: var(--text-primary, #0f172a);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.08));
      font-family: var(--ngx-font-family, sans-serif);
      overflow: hidden;
      transition: all 0.25s;
    }

    /* Toolbar styling */
    .scheduler-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      background: var(--border-light, #f1f5f9);
      border-bottom: 1px solid var(--border-color, #cbd5e1);
      gap: 16px;
      flex-wrap: wrap;
    }

    .nav-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .current-period-label {
      margin: 0;
      font-size: 16px;
      font-weight: 750;
      min-width: 180px;
    }

    .tool-btn {
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      color: var(--text-primary, #0f172a);
      transition: all 0.2s;
    }
    .tool-btn:hover {
      background: var(--border-light, #f1f5f9);
      border-color: var(--primary-color, #4f46e5);
    }
    .today-btn {
      font-weight: 700;
    }

    .view-switch-controls {
      display: flex;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 6px;
      overflow: hidden;
    }

    .view-btn {
      background: var(--bg-secondary, #ffffff);
      border: none;
      border-right: 1px solid var(--border-color, #cbd5e1);
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary, #475569);
      cursor: pointer;
      transition: all 0.2s;
    }
    .view-btn:last-child {
      border-right: none;
    }
    .view-btn.active {
      background: var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%));
      color: #ffffff;
    }

    /* Main body layout */
    .scheduler-body {
      flex: 1;
      overflow-y: auto;
      background: var(--bg-secondary, #ffffff);
      display: flex;
      flex-direction: column;
    }

    /* Day & Week grid layer styles */
    .time-grid-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 600px;
    }

    .time-grid-header {
      display: flex;
      background: var(--border-light, #f8fafc);
      border-bottom: 1px solid var(--border-color, #cbd5e1);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .time-axis-header {
      width: 70px;
      flex-shrink: 0;
      border-right: 1px solid var(--border-color, #cbd5e1);
    }

    .columns-headers-wrap {
      flex: 1;
      display: flex;
    }

    .column-header-cell {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 0;
      border-right: 1px solid var(--border-color, #e2e8f0);
    }
    .column-header-cell:last-child {
      border-right: none;
    }
    .column-header-cell.today {
      background: var(--primary-glow, rgba(79, 70, 229, 0.03));
    }
    .column-header-cell.today .day-num {
      background: var(--primary-color, #4f46e5);
      color: #ffffff;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      margin-top: 2px;
    }

    .day-name {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .day-num {
      font-size: 14px;
      margin-top: 4px;
      color: var(--text-primary, #0f172a);
    }

    .time-grid-body {
      display: flex;
      flex: 1;
      position: relative;
    }

    .time-axis-labels {
      width: 70px;
      flex-shrink: 0;
      border-right: 1px solid var(--border-color, #cbd5e1);
      background: var(--border-light, #f8fafc);
      user-select: none;
    }

    .time-label {
      height: 60px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary, #64748b);
      text-align: right;
      padding-right: 10px;
      margin-top: -6px; /* center align labels above the grid line */
    }

    .columns-body-wrap {
      flex: 1;
      display: flex;
      position: relative;
      min-height: 780px; /* hoursCount * 60px */
    }

    .hourly-grid-lines {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .grid-line {
      height: 60px;
      border-bottom: 1px solid var(--border-light, #e2e8f0);
    }

    .column-body-cell {
      flex: 1;
      border-right: 1px solid var(--border-light, #e2e8f0);
      position: relative;
      z-index: 2;
    }
    .column-body-cell:last-child {
      border-right: none;
    }

    .interactive-slots-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      z-index: 1;
    }

    .slot-trigger {
      flex: 1;
      height: 60px;
      cursor: cell;
      transition: background 0.15s;
    }
    .slot-trigger:hover {
      background: var(--primary-glow, rgba(79, 70, 229, 0.02));
    }

    /* Event card style */
    .scheduler-event-card {
      position: absolute;
      left: 6px;
      right: 6px;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 12px;
      line-height: 1.4;
      cursor: pointer;
      display: flex;
      gap: 8px;
      z-index: 3;
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05));
      transition: transform 0.2s, box-shadow 0.2s;
      overflow: hidden;
      border: 1px solid transparent;
    }
    .scheduler-event-card:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
      z-index: 4;
    }

    .event-color-indicator {
      width: 3px;
      height: 100%;
      border-radius: 2px;
      flex-shrink: 0;
      background: currentColor;
    }

    .event-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }

    .event-title {
      font-weight: 700;
      color: inherit;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .event-time {
      font-size: 10px;
      opacity: 0.8;
      white-space: nowrap;
    }

    /* Month view layout styling */
    .month-grid-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 500px;
    }

    .month-grid-header {
      display: flex;
      background: var(--border-light, #f8fafc);
      border-bottom: 1px solid var(--border-color, #cbd5e1);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .month-header-cell {
      flex: 1;
      text-align: center;
      padding: 10px 0;
      font-size: 11px;
      font-weight: 750;
      color: var(--text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-right: 1px solid var(--border-color, #cbd5e1);
    }
    .month-header-cell:last-child {
      border-right: none;
    }

    .month-grid-body {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-auto-rows: minmax(100px, 1fr);
      flex: 1;
    }

    .month-day-cell {
      border-right: 1px solid var(--border-light, #e2e8f0);
      border-bottom: 1px solid var(--border-light, #e2e8f0);
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      cursor: pointer;
      position: relative;
      transition: background 0.15s;
    }
    .month-day-cell:nth-child(7n) {
      border-right: none;
    }
    .month-day-cell:hover {
      background: var(--primary-glow, rgba(79, 70, 229, 0.01));
    }
    .month-day-cell.today {
      background: var(--primary-glow, rgba(79, 70, 229, 0.02));
    }
    .month-day-cell.today .month-day-number {
      background: var(--primary-color, #4f46e5);
      color: #ffffff;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
    .month-day-cell.other-month {
      opacity: 0.45;
    }

    .month-day-number {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary, #475569);
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .month-day-events-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
      max-height: 90px;
    }

    .month-event-item {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      transition: transform 0.1s;
    }
    .month-event-item:hover {
      transform: scale(1.02);
    }

    /* Harmonious Categorized Styles */
    .meeting {
      background-color: var(--ngx-schedule-meeting-bg, hsl(207, 95%, 97%));
      border-color: var(--ngx-schedule-meeting-border, hsl(207, 90%, 88%));
      color: var(--ngx-schedule-meeting-text, hsl(207, 90%, 30%));
    }
    .task {
      background-color: var(--ngx-schedule-task-bg, hsl(142, 70%, 97%));
      border-color: var(--ngx-schedule-task-border, hsl(142, 60%, 88%));
      color: var(--ngx-schedule-task-text, hsl(142, 60%, 25%));
    }
    .important {
      background-color: var(--ngx-schedule-important-bg, hsl(0, 90%, 97%));
      border-color: var(--ngx-schedule-important-border, hsl(0, 80%, 88%));
      color: var(--ngx-schedule-important-text, hsl(0, 80%, 35%));
    }
    .warning {
      background-color: var(--ngx-schedule-warning-bg, hsl(38, 90%, 97%));
      border-color: var(--ngx-schedule-warning-border, hsl(38, 80%, 88%));
      color: var(--ngx-schedule-warning-text, hsl(38, 80%, 28%));
    }
    .milestone {
      background-color: var(--ngx-schedule-milestone-bg, hsl(271, 80%, 97%));
      border-color: var(--ngx-schedule-milestone-border, hsl(271, 70%, 88%));
      color: var(--ngx-schedule-milestone-text, hsl(271, 70%, 35%));
    }
    .personal {
      background-color: var(--ngx-schedule-personal-bg, hsl(180, 70%, 96%));
      border-color: var(--ngx-schedule-personal-border, hsl(180, 60%, 85%));
      color: var(--ngx-schedule-personal-text, hsl(180, 60%, 28%));
    }

    /* Dark Mode styling */
    .ngx-scheduler-wrapper.dark {
      border-color: #1f2937;
      background: #0f172a;
      color: #f8fafc;
    }
    .ngx-scheduler-wrapper.dark .scheduler-toolbar {
      background: #1e293b;
      border-bottom-color: #1f2937;
    }
    .ngx-scheduler-wrapper.dark .tool-btn,
    .ngx-scheduler-wrapper.dark .view-btn {
      background: #0f172a;
      border-color: #1f2937;
      color: #94a3b8;
    }
    .ngx-scheduler-wrapper.dark .tool-btn:hover {
      background: #1e293b;
      color: #f8fafc;
    }
    .ngx-scheduler-wrapper.dark .view-btn.active {
      background: var(--primary-gradient, linear-gradient(135deg, #6366f1 0%, #a855f7 100%));
      color: #ffffff;
    }
    .ngx-scheduler-wrapper.dark .time-grid-header,
    .ngx-scheduler-wrapper.dark .time-axis-labels,
    .ngx-scheduler-wrapper.dark .month-grid-header {
      background: #1e293b;
      border-color: #1f2937;
    }
    .ngx-scheduler-wrapper.dark .column-header-cell,
    .ngx-scheduler-wrapper.dark .time-axis-header,
    .ngx-scheduler-wrapper.dark .time-label {
      border-color: #1f2937;
      color: #94a3b8;
    }
    .ngx-scheduler-wrapper.dark .column-header-cell.today {
      background: rgba(99, 102, 241, 0.05);
    }
    .ngx-scheduler-wrapper.dark .day-num {
      color: #e2e8f0;
    }
    .ngx-scheduler-wrapper.dark .grid-line {
      border-bottom-color: #1f2937;
    }
    .ngx-scheduler-wrapper.dark .column-body-cell {
      border-right-color: #1f2937;
    }
    .ngx-scheduler-wrapper.dark .month-header-cell {
      border-right-color: #1f2937;
      color: #94a3b8;
    }
    .ngx-scheduler-wrapper.dark .month-day-cell {
      border-right-color: #1f2937;
      border-bottom-color: #1f2937;
    }
    .ngx-scheduler-wrapper.dark .month-day-cell:hover {
      background: rgba(99, 102, 241, 0.02);
    }
    .ngx-scheduler-wrapper.dark .month-day-cell.today {
      background: rgba(99, 102, 241, 0.05);
    }
    .ngx-scheduler-wrapper.dark .month-day-number {
      color: #94a3b8;
    }

    /* Dark Mode Categorized overrides */
    .ngx-scheduler-wrapper.dark .meeting {
      background-color: var(--ngx-schedule-meeting-dark-bg, hsl(207, 80%, 10%));
      border-color: var(--ngx-schedule-meeting-dark-border, hsl(207, 70%, 18%));
      color: var(--ngx-schedule-meeting-dark-text, hsl(207, 90%, 75%));
    }
    .ngx-scheduler-wrapper.dark .task {
      background-color: var(--ngx-schedule-task-dark-bg, hsl(142, 60%, 8%));
      border-color: var(--ngx-schedule-task-dark-border, hsl(142, 50%, 16%));
      color: var(--ngx-schedule-task-dark-text, hsl(142, 70%, 70%));
    }
    .ngx-scheduler-wrapper.dark .important {
      background-color: var(--ngx-schedule-important-dark-bg, hsl(0, 70%, 9%));
      border-color: var(--ngx-schedule-important-dark-border, hsl(0, 60%, 18%));
      color: var(--ngx-schedule-important-dark-text, hsl(0, 80%, 75%));
    }
    .ngx-scheduler-wrapper.dark .warning {
      background-color: var(--ngx-schedule-warning-dark-bg, hsl(38, 70%, 8%));
      border-color: var(--ngx-schedule-warning-dark-border, hsl(38, 60%, 16%));
      color: var(--ngx-schedule-warning-dark-text, hsl(38, 80%, 70%));
    }
    .ngx-scheduler-wrapper.dark .milestone {
      background-color: var(--ngx-schedule-milestone-dark-bg, hsl(271, 70%, 10%));
      border-color: var(--ngx-schedule-milestone-dark-border, hsl(271, 60%, 18%));
      color: var(--ngx-schedule-milestone-dark-text, hsl(271, 80%, 75%));
    }
    .ngx-scheduler-wrapper.dark .personal {
      background-color: var(--ngx-schedule-personal-dark-bg, hsl(180, 60%, 8%));
      border-color: var(--ngx-schedule-personal-dark-border, hsl(180, 50%, 16%));
      color: var(--ngx-schedule-personal-dark-text, hsl(180, 70%, 70%));
    }
  `]
})
export class SchedulerComponent {
  viewModes: ('day' | 'week' | 'month')[] = ['day', 'week', 'month'];

  // Inputs
  events = input<SchedulerEvent[]>([]);
  currentDate = input<Date>(new Date());
  viewMode = input<'day' | 'week' | 'month'>('week');
  theme = input<'light' | 'dark'>('light');
  businessHoursStart = input<number>(8); // 8 AM
  businessHoursEnd = input<number>(20);   // 8 PM

  // Outputs
  eventClick = output<SchedulerEvent>();
  slotClick = output<SchedulerSlotClickEvent>();
  eventTimeChange = output<SchedulerEventChangeEvent>();

  // State Signals
  activeDate = signal<Date>(new Date());
  activeMode = signal<'day' | 'week' | 'month'>('week');

  constructor() {
    // Sync initial inputs
    effect(() => {
      this.activeDate.set(this.currentDate());
    }, { allowSignalWrites: true });

    effect(() => {
      this.activeMode.set(this.viewMode());
    }, { allowSignalWrites: true });
  }

  // Range of hours count computed
  hours = computed(() => {
    const list: number[] = [];
    const start = this.businessHoursStart();
    const end = this.businessHoursEnd();
    for (let i = start; i < end; i++) {
      list.push(i);
    }
    return list;
  });

  // Calculate day headers and cells depending on Mode
  activeColumns = computed(() => {
    const mode = this.activeMode();
    const date = this.activeDate();

    if (mode === 'day') {
      return [date];
    } else if (mode === 'week') {
      const start = this.getStartOfWeek(date);
      return this.getWeekDays(start);
    } else {
      // Month view days cell lists (42 cells)
      return this.getMonthDays(date);
    }
  });

  // period header formatting
  periodLabel = computed(() => {
    const mode = this.activeMode();
    const date = this.activeDate();

    if (mode === 'day') {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else if (mode === 'week') {
      const cols = this.activeColumns();
      const start = cols[0];
      const end = cols[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getFullYear()}`;
      }
      return `${start.toLocaleDateString('en-US', { month: 'short' })} – ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  });

  // Date Navigation handler
  navigate(direction: number): void {
    const mode = this.activeMode();
    const current = new Date(this.activeDate());

    if (mode === 'day') {
      current.setDate(current.getDate() + direction);
    } else if (mode === 'week') {
      current.setDate(current.getDate() + direction * 7);
    } else {
      current.setMonth(current.getMonth() + direction);
    }
    this.activeDate.set(current);
  }

  goToToday(): void {
    this.activeDate.set(new Date());
  }

  // Get matching events for vertical day column
  getEventsForDate(d: Date): SchedulerEvent[] {
    return this.events().filter(evt => this.isSameDate(evt.start, d));
  }

  clickEvent(evt: SchedulerEvent): void {
    this.eventClick.emit(evt);
  }

  clickSlot(date: Date, hour: number): void {
    const targetDate = new Date(date);
    targetDate.setHours(hour, 0, 0, 0);
    this.slotClick.emit({ date: targetDate, hour });
  }

  // Helpers
  isToday(d: Date): boolean {
    return this.isSameDate(d, new Date());
  }

  isOtherMonth(d: Date): boolean {
    return d.getMonth() !== this.activeDate().getMonth();
  }

  formatHour(h: number): string {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr} ${ampm}`;
  }

  getEventTop(start: Date): number {
    const startHour = start.getHours() + start.getMinutes() / 60;
    const bStart = this.businessHoursStart();
    const bEnd = this.businessHoursEnd();
    const totalHours = bEnd - bStart;
    const pct = ((startHour - bStart) / totalHours) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  getEventHeight(start: Date, end: Date): number {
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const bStart = this.businessHoursStart();
    const bEnd = this.businessHoursEnd();
    const totalHours = bEnd - bStart;
    const duration = endHour - startHour;
    const pct = (duration / totalHours) * 100;
    return Math.max(10, Math.min(100 - this.getEventTop(start), pct));
  }

  private getStartOfWeek(d: Date): Date {
    const res = new Date(d);
    const day = res.getDay();
    res.setDate(res.getDate() - day);
    res.setHours(0, 0, 0, 0);
    return res;
  }

  private getWeekDays(start: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }

  private getMonthDays(d: Date): Date[] {
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOfWeek = this.getStartOfWeek(firstDay);
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }

  private isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }
}
