import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, effect, input, output, signal } from '@angular/core';
import { SchedulerEvent, SchedulerEventChangeEvent, SchedulerSlotClickEvent } from './models';

interface TimeSlot {
  hour: number;
  minute: number;
  key: string;
}

interface ResolvedSchedulerEvent {
  id: string;
  event: SchedulerEvent;
  start: Date;
  end: Date;
}

interface SchedulerEventLayout extends ResolvedSchedulerEvent {
  top: number;
  height: number;
  left: number;
  width: number;
}

interface ResizeState {
  event: SchedulerEvent;
  edge: 'start' | 'end';
  start: Date;
  end: Date;
  originY: number;
}

@Component({
  selector: 'ngx-scheduler',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ngx-scheduler-wrapper" [class.dark]="theme() === 'dark'">
      <div class="scheduler-toolbar">
        <div class="nav-controls">
          <button class="tool-btn" type="button" (click)="navigate(-1)" aria-label="Previous period">&lt;</button>
          <button class="tool-btn today-btn" type="button" (click)="goToToday()">Today</button>
          <button class="tool-btn" type="button" (click)="navigate(1)" aria-label="Next period">&gt;</button>
          <h2 class="current-period-label">{{ periodLabel() }}</h2>
        </div>

        <div class="view-switch-controls">
          @for (mode of viewModes; track mode) {
            <button
              type="button"
              class="view-btn"
              [class.active]="activeMode() === mode"
              (click)="activeMode.set(mode)"
            >
              {{ mode | titlecase }}
            </button>
          }
        </div>
      </div>

      <div class="scheduler-body">
        @if (activeMode() === 'day' || activeMode() === 'week') {
          <div class="time-grid-container">
            <div class="time-grid-header">
              <div class="time-axis-header"></div>
              <div class="columns-headers-wrap">
                @for (col of activeColumns(); track dateKey(col)) {
                  <div class="column-header-cell" [class.today]="isToday(col)">
                    <span class="day-name">{{ formatDate(col, { weekday: 'short' }) }}</span>
                    <span class="day-num">{{ formatDate(col, { day: 'numeric' }) }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="time-grid-body">
              <div class="time-axis-labels">
                @for (h of hours(); track h) {
                  <div class="time-label">{{ formatHour(h) }}</div>
                }
              </div>

              <div class="columns-body-wrap" [style.min-height.px]="hours().length * hourHeight">
                <div class="hourly-grid-lines">
                  @for (h of hours(); track h) {
                    <div class="grid-line"></div>
                  }
                </div>

                @for (col of activeColumns(); track dateKey(col)) {
                  <div class="column-body-cell">
                    <div class="interactive-slots-overlay">
                      @for (slot of timeSlots(); track slot.key) {
                        <div
                          class="slot-trigger"
                          [style.height.px]="slotHeight()"
                          (click)="clickSlot(col, slot.hour, slot.minute)"
                          (dragover)="onSlotDragOver($event)"
                          (drop)="onSlotDrop($event, col, slot.hour, slot.minute)"
                        ></div>
                      }
                    </div>

                    @for (layout of getEventLayoutsForDate(col); track layout.id) {
                      <div
                        class="scheduler-event-card"
                        [class.meeting]="layout.event.category === 'meeting'"
                        [class.task]="layout.event.category === 'task'"
                        [class.important]="layout.event.category === 'important'"
                        [class.warning]="layout.event.category === 'warning'"
                        [class.milestone]="layout.event.category === 'milestone'"
                        [class.personal]="layout.event.category === 'personal'"
                        [style.top.%]="layout.top"
                        [style.height.%]="layout.height"
                        [style.left.%]="layout.left"
                        [style.width.%]="layout.width"
                        [style.background-color]="layout.event.color || null"
                        draggable="true"
                        (dragstart)="onEventDragStart($event, layout)"
                        (dragend)="onEventDragEnd()"
                        (click)="clickEvent(layout.event)"
                        [title]="eventTitle(layout)"
                      >
                        <button
                          class="resize-handle resize-start"
                          type="button"
                          aria-label="Resize event start"
                          (click)="$event.stopPropagation()"
                          (pointerdown)="startResize($event, layout, 'start')"
                        ></button>
                        <div class="event-color-indicator"></div>
                        <div class="event-details">
                          <span class="event-title">{{ layout.event.title }}</span>
                          <span class="event-time">{{ formatEventTime(layout.start, layout.end) }}</span>
                        </div>
                        <button
                          class="resize-handle resize-end"
                          type="button"
                          aria-label="Resize event end"
                          (click)="$event.stopPropagation()"
                          (pointerdown)="startResize($event, layout, 'end')"
                        ></button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }

        @if (activeMode() === 'month') {
          <div class="month-grid-container">
            <div class="month-grid-header">
              @for (dayName of weekDayLabels(); track dayName) {
                <div class="month-header-cell">{{ dayName }}</div>
              }
            </div>

            <div class="month-grid-body">
              @for (cell of activeColumns(); track dateKey(cell)) {
                <div
                  class="month-day-cell"
                  [class.today]="isToday(cell)"
                  [class.other-month]="isOtherMonth(cell)"
                  (click)="clickSlot(cell, 9, 0)"
                >
                  <span class="month-day-number">{{ formatDate(cell, { day: 'numeric' }) }}</span>

                  <div class="month-day-events-list">
                    @for (evt of getEventsForDate(cell); track evt.id) {
                      <div
                        class="month-event-item"
                        [class.meeting]="evt.event.category === 'meeting'"
                        [class.task]="evt.event.category === 'task'"
                        [class.important]="evt.event.category === 'important'"
                        [class.warning]="evt.event.category === 'warning'"
                        [class.milestone]="evt.event.category === 'milestone'"
                        [class.personal]="evt.event.category === 'personal'"
                        (click)="clickEvent(evt.event); $event.stopPropagation()"
                        [title]="evt.event.title"
                      >
                        {{ evt.event.title }}
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
    :host { display: block; width: 100%; height: 100%; }
    .ngx-scheduler-wrapper { display: flex; flex-direction: column; height: 100%; min-height: 500px; border: 1px solid var(--border-color, #cbd5e1); border-radius: var(--radius-md, 12px); background: var(--bg-secondary, #ffffff); color: var(--text-primary, #0f172a); box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.08)); font-family: var(--ngx-font-family, sans-serif); overflow: hidden; transition: all 0.25s; }
    .scheduler-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: var(--border-light, #f1f5f9); border-bottom: 1px solid var(--border-color, #cbd5e1); gap: 16px; flex-wrap: wrap; }
    .nav-controls { display: flex; align-items: center; gap: 10px; }
    .current-period-label { margin: 0; font-size: 16px; font-weight: 750; min-width: 180px; }
    .tool-btn { background: var(--bg-secondary, #ffffff); border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 650; cursor: pointer; color: var(--text-primary, #0f172a); transition: all 0.2s; }
    .tool-btn:hover, .tool-btn:focus-visible { background: var(--border-light, #f1f5f9); border-color: var(--primary-color, #4f46e5); outline: none; }
    .today-btn { font-weight: 750; }
    .view-switch-controls { display: flex; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; overflow: hidden; }
    .view-btn { background: var(--bg-secondary, #ffffff); border: none; border-right: 1px solid var(--border-color, #cbd5e1); padding: 6px 14px; font-size: 12px; font-weight: 650; color: var(--text-secondary, #475569); cursor: pointer; transition: all 0.2s; }
    .view-btn:last-child { border-right: none; }
    .view-btn.active { background: var(--primary-color, #4f46e5); color: #ffffff; }
    .scheduler-body { flex: 1; overflow: auto; background: var(--bg-secondary, #ffffff); display: flex; flex-direction: column; }
    .time-grid-container { display: flex; flex-direction: column; flex: 1; min-width: 600px; }
    .time-grid-header { display: flex; background: var(--border-light, #f8fafc); border-bottom: 1px solid var(--border-color, #cbd5e1); position: sticky; top: 0; z-index: 10; }
    .time-axis-header { width: 70px; flex-shrink: 0; border-right: 1px solid var(--border-color, #cbd5e1); }
    .columns-headers-wrap { flex: 1; display: flex; }
    .column-header-cell { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10px 0; border-right: 1px solid var(--border-color, #e2e8f0); }
    .column-header-cell:last-child { border-right: none; }
    .column-header-cell.today { background: var(--primary-glow, rgba(79, 70, 229, 0.03)); }
    .column-header-cell.today .day-num { background: var(--primary-color, #4f46e5); color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-top: 2px; }
    .day-name { font-size: 11px; font-weight: 650; color: var(--text-secondary, #64748b); text-transform: uppercase; letter-spacing: 0.5px; }
    .day-num { font-size: 14px; margin-top: 4px; color: var(--text-primary, #0f172a); }
    .time-grid-body { display: flex; flex: 1; position: relative; }
    .time-axis-labels { width: 70px; flex-shrink: 0; border-right: 1px solid var(--border-color, #cbd5e1); background: var(--border-light, #f8fafc); user-select: none; }
    .time-label { height: 60px; font-size: 11px; font-weight: 650; color: var(--text-secondary, #64748b); text-align: right; padding-right: 10px; margin-top: -6px; }
    .columns-body-wrap { flex: 1; display: flex; position: relative; }
    .hourly-grid-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
    .grid-line { height: 60px; border-bottom: 1px solid var(--border-light, #e2e8f0); }
    .column-body-cell { flex: 1; border-right: 1px solid var(--border-light, #e2e8f0); position: relative; z-index: 2; min-width: 120px; }
    .column-body-cell:last-child { border-right: none; }
    .interactive-slots-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; z-index: 1; }
    .slot-trigger { flex: 0 0 auto; cursor: cell; transition: background 0.15s; }
    .slot-trigger:hover { background: var(--primary-glow, rgba(79, 70, 229, 0.02)); }
    .scheduler-event-card { position: absolute; right: auto; border-radius: 8px; padding: 8px 10px; font-size: 12px; line-height: 1.4; cursor: grab; display: flex; gap: 8px; z-index: 3; box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05)); transition: transform 0.2s, box-shadow 0.2s; overflow: hidden; border: 1px solid transparent; min-height: 28px; }
    .scheduler-event-card:hover { transform: translateY(-1px); box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1)); z-index: 4; }
    .event-color-indicator { width: 3px; height: 100%; border-radius: 2px; flex-shrink: 0; background: currentColor; }
    .event-details { display: flex; flex-direction: column; gap: 2px; overflow: hidden; min-width: 0; }
    .event-title { font-weight: 750; color: inherit; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .event-time { font-size: 10px; opacity: 0.82; white-space: nowrap; }
    .resize-handle { position: absolute; left: 0; right: 0; height: 6px; border: 0; background: transparent; cursor: ns-resize; }
    .resize-start { top: 0; }
    .resize-end { bottom: 0; }
    .month-grid-container { display: flex; flex-direction: column; flex: 1; min-height: 500px; }
    .month-grid-header { display: flex; background: var(--border-light, #f8fafc); border-bottom: 1px solid var(--border-color, #cbd5e1); position: sticky; top: 0; z-index: 10; }
    .month-header-cell { flex: 1; text-align: center; padding: 10px 0; font-size: 11px; font-weight: 750; color: var(--text-secondary, #64748b); text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid var(--border-color, #cbd5e1); }
    .month-header-cell:last-child { border-right: none; }
    .month-grid-body { display: grid; grid-template-columns: repeat(7, minmax(110px, 1fr)); grid-auto-rows: minmax(100px, 1fr); flex: 1; }
    .month-day-cell { border-right: 1px solid var(--border-light, #e2e8f0); border-bottom: 1px solid var(--border-light, #e2e8f0); padding: 6px; display: flex; flex-direction: column; gap: 6px; cursor: pointer; position: relative; transition: background 0.15s; }
    .month-day-cell:nth-child(7n) { border-right: none; }
    .month-day-cell:hover { background: var(--primary-glow, rgba(79, 70, 229, 0.01)); }
    .month-day-cell.today { background: var(--primary-glow, rgba(79, 70, 229, 0.02)); }
    .month-day-cell.today .month-day-number { background: var(--primary-color, #4f46e5); color: #ffffff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .month-day-cell.other-month { opacity: 0.45; }
    .month-day-number { font-size: 11px; font-weight: 650; color: var(--text-secondary, #475569); width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
    .month-day-events-list { display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 90px; }
    .month-event-item { font-size: 10px; font-weight: 650; padding: 2px 6px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; transition: transform 0.1s; }
    .month-event-item:hover { transform: scale(1.02); }
    .meeting { background-color: var(--ngx-schedule-meeting-bg, hsl(207, 95%, 97%)); border-color: var(--ngx-schedule-meeting-border, hsl(207, 90%, 88%)); color: var(--ngx-schedule-meeting-text, hsl(207, 90%, 30%)); }
    .task { background-color: var(--ngx-schedule-task-bg, hsl(142, 70%, 97%)); border-color: var(--ngx-schedule-task-border, hsl(142, 60%, 88%)); color: var(--ngx-schedule-task-text, hsl(142, 60%, 25%)); }
    .important { background-color: var(--ngx-schedule-important-bg, hsl(0, 90%, 97%)); border-color: var(--ngx-schedule-important-border, hsl(0, 80%, 88%)); color: var(--ngx-schedule-important-text, hsl(0, 80%, 35%)); }
    .warning { background-color: var(--ngx-schedule-warning-bg, hsl(38, 90%, 97%)); border-color: var(--ngx-schedule-warning-border, hsl(38, 80%, 88%)); color: var(--ngx-schedule-warning-text, hsl(38, 80%, 28%)); }
    .milestone { background-color: var(--ngx-schedule-milestone-bg, hsl(271, 80%, 97%)); border-color: var(--ngx-schedule-milestone-border, hsl(271, 70%, 88%)); color: var(--ngx-schedule-milestone-text, hsl(271, 70%, 35%)); }
    .personal { background-color: var(--ngx-schedule-personal-bg, hsl(180, 70%, 96%)); border-color: var(--ngx-schedule-personal-border, hsl(180, 60%, 85%)); color: var(--ngx-schedule-personal-text, hsl(180, 60%, 28%)); }
    .ngx-scheduler-wrapper.dark { border-color: #1f2937; background: #0f172a; color: #f8fafc; }
    .ngx-scheduler-wrapper.dark .scheduler-toolbar, .ngx-scheduler-wrapper.dark .time-grid-header, .ngx-scheduler-wrapper.dark .time-axis-labels, .ngx-scheduler-wrapper.dark .month-grid-header { background: #1e293b; border-color: #1f2937; }
    .ngx-scheduler-wrapper.dark .tool-btn, .ngx-scheduler-wrapper.dark .view-btn { background: #0f172a; border-color: #1f2937; color: #94a3b8; }
    .ngx-scheduler-wrapper.dark .view-btn.active { background: var(--primary-color, #6366f1); color: #ffffff; }
    .ngx-scheduler-wrapper.dark .grid-line, .ngx-scheduler-wrapper.dark .column-body-cell, .ngx-scheduler-wrapper.dark .month-day-cell { border-color: #1f2937; }
  `]
})
export class SchedulerComponent {
  readonly hourHeight = 60;
  viewModes: ('day' | 'week' | 'month')[] = ['day', 'week', 'month'];

  events = input<SchedulerEvent[]>([]);
  currentDate = input<Date>(new Date());
  viewMode = input<'day' | 'week' | 'month'>('week');
  theme = input<'light' | 'dark'>('light');
  businessHoursStart = input<number>(8);
  businessHoursEnd = input<number>(20);
  weekStartsOn = input<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  timeZone = input<string | undefined>(undefined);
  slotMinutes = input<number>(60);

  eventClick = output<SchedulerEvent>();
  slotClick = output<SchedulerSlotClickEvent>();
  eventTimeChange = output<SchedulerEventChangeEvent>();

  activeDate = signal<Date>(new Date());
  activeMode = signal<'day' | 'week' | 'month'>('week');
  private activeDragEvent = signal<ResolvedSchedulerEvent | null>(null);
  private resizeState: ResizeState | null = null;

  constructor() {
    effect(() => {
      this.activeDate.set(this.currentDate());
    }, { allowSignalWrites: true });

    effect(() => {
      this.activeMode.set(this.viewMode());
    }, { allowSignalWrites: true });
  }

  hours = computed(() => {
    const start = this.normalizedStartHour();
    const end = this.normalizedEndHour();
    const list: number[] = [];
    for (let i = start; i < end; i++) list.push(i);
    return list;
  });

  timeSlots = computed<TimeSlot[]>(() => {
    const slots: TimeSlot[] = [];
    const minutes = this.normalizedSlotMinutes();
    for (const hour of this.hours()) {
      for (let minute = 0; minute < 60; minute += minutes) {
        slots.push({ hour, minute, key: `${hour}:${minute}` });
      }
    }
    return slots;
  });

  activeColumns = computed(() => {
    const mode = this.activeMode();
    const date = this.activeDate();

    if (mode === 'day') return [date];
    if (mode === 'week') return this.getWeekDays(this.getStartOfWeek(date));
    return this.getMonthDays(date);
  });

  weekDayLabels = computed(() => {
    const base = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const start = this.weekStartsOn();
    return [...base.slice(start), ...base.slice(0, start)];
  });

  periodLabel = computed(() => {
    const mode = this.activeMode();
    const date = this.activeDate();

    if (mode === 'day') {
      return this.formatDate(date, { month: 'long', day: 'numeric', year: 'numeric' });
    }

    if (mode === 'week') {
      const cols = this.activeColumns();
      const start = cols[0];
      const end = cols[6];
      if (start.getMonth() === end.getMonth()) {
        return `${this.formatDate(start, { month: 'long' })} ${this.formatDate(start, { year: 'numeric' })}`;
      }
      return `${this.formatDate(start, { month: 'short' })} - ${this.formatDate(end, { month: 'short', year: 'numeric' })}`;
    }

    return this.formatDate(date, { month: 'long', year: 'numeric' });
  });

  slotHeight(): number {
    return this.hourHeight * (this.normalizedSlotMinutes() / 60);
  }

  navigate(direction: number): void {
    const mode = this.activeMode();
    const current = new Date(this.activeDate());
    if (mode === 'day') current.setDate(current.getDate() + direction);
    else if (mode === 'week') current.setDate(current.getDate() + direction * 7);
    else current.setMonth(current.getMonth() + direction);
    this.activeDate.set(current);
  }

  goToToday(): void {
    this.activeDate.set(new Date());
  }

  getEventsForDate(date: Date): ResolvedSchedulerEvent[] {
    return this.events()
      .flatMap(event => this.resolveEventForDate(event, date))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  getEventLayoutsForDate(date: Date): SchedulerEventLayout[] {
    const events = this.getEventsForDate(date);
    const groups: ResolvedSchedulerEvent[][] = [];
    let group: ResolvedSchedulerEvent[] = [];
    let groupEnd = 0;

    for (const event of events) {
      if (!group.length || event.start.getTime() < groupEnd) {
        group.push(event);
        groupEnd = Math.max(groupEnd, event.end.getTime());
      } else {
        groups.push(group);
        group = [event];
        groupEnd = event.end.getTime();
      }
    }
    if (group.length) groups.push(group);

    return groups.flatMap(eventsGroup => this.layoutOverlapGroup(eventsGroup));
  }

  clickEvent(event: SchedulerEvent): void {
    this.eventClick.emit(event);
  }

  clickSlot(date: Date, hour: number, minute = 0): void {
    const targetDate = new Date(date);
    targetDate.setHours(hour, minute, 0, 0);
    this.slotClick.emit({ date: targetDate, hour, minute });
  }

  onSlotDragOver(event: DragEvent): void {
    if (this.activeDragEvent()) event.preventDefault();
  }

  onEventDragStart(event: DragEvent, layout: SchedulerEventLayout): void {
    this.activeDragEvent.set(layout);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', layout.event.id);
    }
  }

  onEventDragEnd(): void {
    this.activeDragEvent.set(null);
  }

  onSlotDrop(event: DragEvent, date: Date, hour: number, minute = 0): void {
    event.preventDefault();
    const dragged = this.activeDragEvent();
    if (!dragged) return;

    const duration = dragged.end.getTime() - dragged.start.getTime();
    const start = new Date(date);
    start.setHours(hour, minute, 0, 0);
    const end = new Date(start.getTime() + duration);

    this.eventTimeChange.emit({
      event: dragged.event,
      start,
      end,
      occurrenceStart: dragged.start,
      occurrenceEnd: dragged.end,
    });
    this.activeDragEvent.set(null);
  }

  startResize(event: PointerEvent, layout: SchedulerEventLayout, edge: 'start' | 'end'): void {
    event.preventDefault();
    event.stopPropagation();
    this.resizeState = {
      event: layout.event,
      edge,
      start: layout.start,
      end: layout.end,
      originY: event.clientY,
    };
  }

  @HostListener('window:pointerup', ['$event'])
  finishResize(event: PointerEvent): void {
    if (!this.resizeState) return;
    const state = this.resizeState;
    const deltaSlots = Math.round((event.clientY - state.originY) / this.slotHeight());
    const deltaMs = deltaSlots * this.normalizedSlotMinutes() * 60 * 1000;
    const minDuration = this.normalizedSlotMinutes() * 60 * 1000;
    let start = new Date(state.start);
    let end = new Date(state.end);

    if (state.edge === 'start') {
      start = new Date(Math.min(state.start.getTime() + deltaMs, state.end.getTime() - minDuration));
    } else {
      end = new Date(Math.max(state.end.getTime() + deltaMs, state.start.getTime() + minDuration));
    }

    this.eventTimeChange.emit({
      event: state.event,
      start,
      end,
      occurrenceStart: state.start,
      occurrenceEnd: state.end,
    });
    this.resizeState = null;
  }

  @HostListener('window:pointercancel')
  cancelResize(): void {
    this.resizeState = null;
  }

  isToday(date: Date): boolean {
    return this.isSameDate(date, new Date());
  }

  isOtherMonth(date: Date): boolean {
    return date.getMonth() !== this.activeDate().getMonth();
  }

  formatHour(hour: number): string {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hr = hour % 12 === 0 ? 12 : hour % 12;
    return `${hr} ${ampm}`;
  }

  formatDate(date: Date, options: Intl.DateTimeFormatOptions): string {
    try {
      return new Intl.DateTimeFormat('en-US', { ...options, timeZone: this.timeZone() }).format(date);
    } catch {
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  }

  formatEventTime(start: Date, end: Date): string {
    return `${this.formatDate(start, { hour: 'numeric', minute: '2-digit' })} - ${this.formatDate(end, { hour: 'numeric', minute: '2-digit' })}`;
  }

  eventTitle(layout: SchedulerEventLayout): string {
    const description = layout.event.description ? ` (${layout.event.description})` : '';
    return `${layout.event.title}${description}`;
  }

  dateKey(date: Date): string {
    if (!this.timeZone()) {
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: this.timeZone(),
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(date);
      const get = (type: string) => parts.find(part => part.type === type)?.value ?? '';
      return `${get('year')}-${get('month')}-${get('day')}`;
    } catch {
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
  }

  private layoutOverlapGroup(events: ResolvedSchedulerEvent[]): SchedulerEventLayout[] {
    const columnEnds: Date[] = [];
    const placements = events.map(event => {
      let column = columnEnds.findIndex(end => event.start >= end);
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(event.end);
      } else {
        columnEnds[column] = event.end;
      }
      return { event, column };
    });

    const columnCount = Math.max(1, columnEnds.length);
    return placements.map(({ event, column }) => ({
      ...event,
      top: this.getEventTop(event.start),
      height: this.getEventHeight(event.start, event.end),
      left: column * (100 / columnCount) + 1,
      width: Math.max(8, 100 / columnCount - 2),
    }));
  }

  private resolveEventForDate(event: SchedulerEvent, date: Date): ResolvedSchedulerEvent[] {
    if (event.recurrence) {
      const occurrence = this.resolveRecurringOccurrence(event, date);
      return occurrence ? [occurrence] : [];
    }

    const dayStart = this.startOfDay(date);
    const dayEnd = this.endOfDay(date);
    if (!this.rangesOverlap(event.start, event.end, dayStart, dayEnd)) return [];

    return [{
      id: `${event.id}-${this.dateKey(date)}`,
      event,
      start: new Date(Math.max(event.start.getTime(), dayStart.getTime())),
      end: new Date(Math.min(event.end.getTime(), dayEnd.getTime())),
    }];
  }

  private resolveRecurringOccurrence(event: SchedulerEvent, date: Date): ResolvedSchedulerEvent | null {
    const recurrence = event.recurrence;
    if (!recurrence) return null;

    const startDay = this.startOfDay(event.start);
    const targetDay = this.startOfDay(date);
    if (targetDay < startDay) return null;
    if (recurrence.until && targetDay > this.startOfDay(recurrence.until)) return null;

    const interval = Math.max(1, recurrence.interval ?? 1);
    const diffDays = Math.floor((targetDay.getTime() - startDay.getTime()) / 86400000);
    let occurrenceIndex = 0;
    let occurs = false;

    if (recurrence.frequency === 'daily') {
      occurs = diffDays % interval === 0;
      occurrenceIndex = Math.floor(diffDays / interval);
    } else if (recurrence.frequency === 'weekly') {
      const days = recurrence.daysOfWeek?.length ? recurrence.daysOfWeek : [event.start.getDay()];
      const diffWeeks = Math.floor(diffDays / 7);
      occurs = diffWeeks % interval === 0 && days.includes(targetDay.getDay());
      occurrenceIndex = diffWeeks;
    } else {
      const diffMonths = (targetDay.getFullYear() - startDay.getFullYear()) * 12 + targetDay.getMonth() - startDay.getMonth();
      occurs = diffMonths % interval === 0 && targetDay.getDate() === startDay.getDate();
      occurrenceIndex = diffMonths;
    }

    if (!occurs || (recurrence.count && occurrenceIndex >= recurrence.count)) return null;

    const duration = event.end.getTime() - event.start.getTime();
    const start = new Date(targetDay);
    start.setHours(event.start.getHours(), event.start.getMinutes(), event.start.getSeconds(), event.start.getMilliseconds());
    const end = new Date(start.getTime() + duration);

    return {
      id: `${event.id}-r-${this.dateKey(targetDay)}`,
      event,
      start,
      end,
    };
  }

  private getEventTop(start: Date): number {
    const startHour = start.getHours() + start.getMinutes() / 60;
    const totalHours = this.normalizedEndHour() - this.normalizedStartHour();
    const pct = ((startHour - this.normalizedStartHour()) / totalHours) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  private getEventHeight(start: Date, end: Date): number {
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const totalHours = this.normalizedEndHour() - this.normalizedStartHour();
    const pct = ((endHour - startHour) / totalHours) * 100;
    return Math.max(8, Math.min(100 - this.getEventTop(start), pct));
  }

  private getStartOfWeek(date: Date): Date {
    const res = new Date(date);
    const day = res.getDay();
    const diff = (day - this.weekStartsOn() + 7) % 7;
    res.setDate(res.getDate() - diff);
    res.setHours(0, 0, 0, 0);
    return res;
  }

  private getWeekDays(start: Date): Date[] {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  }

  private getMonthDays(date: Date): Date[] {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const startOfWeek = this.getStartOfWeek(firstDay);
    return Array.from({ length: 42 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  }

  private isSameDate(d1: Date, d2: Date): boolean {
    return this.dateKey(d1) === this.dateKey(d2);
  }

  private startOfDay(date: Date): Date {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private endOfDay(date: Date): Date {
    const next = new Date(date);
    next.setHours(23, 59, 59, 999);
    return next;
  }

  private rangesOverlap(start: Date, end: Date, rangeStart: Date, rangeEnd: Date): boolean {
    return start <= rangeEnd && end >= rangeStart;
  }

  private normalizedStartHour(): number {
    return Math.max(0, Math.min(23, Math.floor(this.businessHoursStart())));
  }

  private normalizedEndHour(): number {
    return Math.max(this.normalizedStartHour() + 1, Math.min(24, Math.ceil(this.businessHoursEnd())));
  }

  private normalizedSlotMinutes(): number {
    const minutes = Math.floor(this.slotMinutes());
    return [5, 10, 15, 20, 30, 60].includes(minutes) ? minutes : 60;
  }
}
