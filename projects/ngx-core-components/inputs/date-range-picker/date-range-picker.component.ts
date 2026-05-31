import { Component, computed, effect, input, output, signal } from '@angular/core';

export interface DateRangePreset {
  label: string;
  start: Date | string;
  end: Date | string;
}

interface CalendarDay {
  key: string;
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  isStart: boolean;
  isEnd: boolean;
  inRange: boolean;
  disabled: boolean;
}

@Component({
  selector: 'ngx-date-range-picker',
  standalone: true,
  template: `
    <div class="ngx-date-range-picker">
      @if (label()) { <label class="drp-label">{{ label() }}</label> }
      <div
        class="drp-inputs"
        [class.disabled]="disabled()"
        role="button"
        tabindex="0"
        [attr.aria-expanded]="open()"
        (click)="toggleOpen()"
        (keydown.enter)="toggleOpen()"
        (keydown.space)="toggleOpen(); $event.preventDefault()"
        (keydown.escape)="open.set(false)"
      >
        <input class="drp-input" type="text" readonly [value]="startDate()" placeholder="Start date" [disabled]="disabled()" />
        <span class="drp-sep">&#8594;</span>
        <input class="drp-input" type="text" readonly [value]="endDate()" placeholder="End date" [disabled]="disabled()" />
        <span class="drp-icon">&#128197;</span>
      </div>
      @if (open()) {
        <div class="drp-calendar-wrap" (click)="$event.stopPropagation()">
          @if (presets().length > 0) {
            <div class="drp-presets">
              @for (preset of presets(); track preset.label) {
                <button class="preset-btn" type="button" (click)="applyPreset(preset)">
                  {{ preset.label }}
                </button>
              }
            </div>
          }

          <div class="drp-calendar">
            <div class="cal-header">
              <button class="cal-nav" type="button" (click)="prevMonth($event)" aria-label="Previous month">&#8249;</button>
              <span class="cal-title">{{ monthName(viewMonth()) }} {{ viewYear() }}</span>
              <button class="cal-nav" type="button" (click)="nextMonth($event)" aria-label="Next month">&#8250;</button>
            </div>
            <div class="cal-grid" role="grid">
              @for (day of weekDays(); track day) { <div class="cal-weekday">{{ day }}</div> }
              @for (cell of calendarDays(); track cell.key) {
                <button
                  type="button"
                  class="cal-day"
                  role="gridcell"
                  [class.other-month]="!cell.inMonth"
                  [class.in-range]="cell.inRange"
                  [class.range-start]="cell.isStart"
                  [class.range-end]="cell.isEnd"
                  [class.today]="cell.isToday"
                  [class.disabled]="cell.disabled"
                  [attr.data-date]="cell.key"
                  [attr.aria-selected]="cell.isStart || cell.isEnd"
                  [disabled]="cell.disabled"
                  (click)="selectDay(cell.date, $event)"
                  (keydown)="onDayKeydown($event, cell.date)"
                >{{ cell.date.getDate() }}</button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }
    .drp-label { display: block; font-size: 12px; font-weight: 600; color: var(--ngx-input-label, #475569); margin-bottom: 6px; }
    .drp-inputs { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border: 1px solid var(--ngx-input-border, #cbd5e1); border-radius: var(--ngx-input-radius, 8px); cursor: pointer; background: var(--ngx-input-bg, #fff); transition: all 0.2s; }
    .drp-inputs:hover, .drp-inputs:focus-visible { border-color: var(--primary-color, #4f46e5); outline: none; box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.12)); }
    .drp-inputs.disabled { cursor: not-allowed; opacity: 0.6; background: var(--ngx-input-disabled-bg, #f8fafc); }
    .drp-input { border: none; background: transparent; font-size: 13px; color: var(--ngx-input-text, #0f172a); outline: none; cursor: pointer; width: 85px; font-family: inherit; }
    .drp-input:disabled { cursor: not-allowed; color: var(--text-secondary, #64748b); }
    .drp-sep { color: #94a3b8; font-weight: 650; }
    .drp-icon { font-size: 14px; color: #64748b; margin-left: auto; }
    .drp-calendar-wrap { position: absolute; top: calc(100% + 6px); left: 0; display: flex; gap: 12px; background: var(--bg-secondary, #fff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--ngx-input-radius, 12px); box-shadow: var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.08)); z-index: 1000; padding: 14px; }
    .drp-presets { display: flex; flex-direction: column; gap: 6px; min-width: 112px; padding-right: 12px; border-right: 1px solid var(--border-color, #e2e8f0); }
    .preset-btn { border: 1px solid transparent; border-radius: 6px; background: transparent; color: var(--text-secondary, #64748b); cursor: pointer; font: inherit; font-size: 12px; font-weight: 650; padding: 7px 9px; text-align: left; }
    .preset-btn:hover, .preset-btn:focus-visible { background: var(--border-light, #f1f5f9); color: var(--text-primary, #0f172a); outline: none; }
    .cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .cal-nav { background: none; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px; cursor: pointer; padding: 3px 8px; font-size: 14px; color: #64748b; transition: all 0.15s; }
    .cal-nav:hover, .cal-nav:focus-visible { background: var(--border-light, #f1f5f9); color: var(--text-primary, #0f172a); outline: none; }
    .cal-title { font-weight: 750; font-size: 13px; color: var(--text-primary, #0f172a); font-family: var(--ngx-heading-font-family, inherit); }
    .cal-grid { display: grid; grid-template-columns: repeat(7, 34px); gap: 3px; }
    .cal-weekday { text-align: center; font-size: 10px; font-weight: 700; color: #94a3b8; padding: 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .cal-day { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 550; border-radius: 6px; cursor: pointer; transition: all 0.15s; color: var(--text-primary, #0f172a); border: 0; background: transparent; font-family: inherit; }
    .cal-day:hover:not(.range-start):not(.range-end):not(.disabled), .cal-day:focus-visible:not(.range-start):not(.range-end):not(.disabled) { background: var(--border-light, #f1f5f9); outline: none; }
    .cal-day.other-month { color: #cbd5e1; }
    .cal-day.disabled { color: #cbd5e1; cursor: not-allowed; text-decoration: line-through; }
    .cal-day.in-range { background: var(--primary-glow, rgba(79, 70, 229, 0.08)); color: var(--primary-color, #4f46e5); border-radius: 0; }
    .cal-day.range-start, .cal-day.range-end { background: var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)); color: #fff; font-weight: 700; border-radius: 50%; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.35); }
    .cal-day.today:not(.range-start):not(.range-end) { font-weight: 700; border: 1.5px solid var(--primary-color, #4f46e5); color: var(--primary-color, #4f46e5); }
    @media (max-width: 520px) {
      .drp-calendar-wrap { flex-direction: column; width: max-content; max-width: calc(100vw - 32px); }
      .drp-presets { flex-direction: row; flex-wrap: wrap; min-width: 0; padding: 0 0 10px; border-right: 0; border-bottom: 1px solid var(--border-color, #e2e8f0); }
    }
  `]
})
export class DateRangePickerComponent {
  label = input('');
  start = input<Date | string | null>(null);
  end = input<Date | string | null>(null);
  min = input<Date | string | null>(null);
  max = input<Date | string | null>(null);
  disabledDates = input<Array<Date | string>>([]);
  presets = input<DateRangePreset[]>(DateRangePickerComponent.createDefaultPresets());
  weekStartsOn = input<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  disabled = input(false);

  startDate = signal<string>('');
  endDate = signal<string>('');
  open = signal(false);
  private picking = signal<'start' | 'end'>('start');
  viewMonth = signal(new Date().getMonth());
  viewYear = signal(new Date().getFullYear());

  rangeChange = output<{ start: string; end: string }>();
  openChange = output<boolean>();

  private monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private baseWeekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  private syncInputs = effect(() => {
    const start = this.toDateString(this.start());
    const end = this.toDateString(this.end());
    this.startDate.set(start);
    this.endDate.set(end);
    const initialView = this.parseLocalDate(start || end);
    if (initialView) {
      this.viewMonth.set(initialView.getMonth());
      this.viewYear.set(initialView.getFullYear());
    }
  });

  weekDays = computed(() => {
    const start = this.weekStartsOn();
    return [...this.baseWeekDays.slice(start), ...this.baseWeekDays.slice(0, start)];
  });

  calendarDays = computed<CalendarDay[]>(() => {
    const y = this.viewYear();
    const m = this.viewMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const offset = (firstDay - this.weekStartsOn() + 7) % 7;
    const days: CalendarDay[] = [];
    const today = this.startOfDay(new Date());
    const s = this.parseLocalDate(this.startDate());
    const e = this.parseLocalDate(this.endDate());

    for (let i = 0; i < 42; i++) {
      const date = this.startOfDay(new Date(y, m, i - offset + 1));
      const key = this.formatLocalDate(date);
      days.push({
        key,
        date,
        inMonth: date.getMonth() === m,
        isToday: date.getTime() === today.getTime(),
        isStart: s ? date.getTime() === s.getTime() : false,
        isEnd: e ? date.getTime() === e.getTime() : false,
        inRange: !!(s && e && date > s && date < e),
        disabled: this.isDateDisabled(date),
      });
    }
    return days;
  });

  monthName(m: number): string {
    return this.monthNames[m] ?? '';
  }

  toggleOpen(): void {
    if (this.disabled()) return;
    this.open.update(v => {
      const next = !v;
      this.openChange.emit(next);
      return next;
    });
  }

  prevMonth(e: Event): void {
    e.stopPropagation();
    if (this.viewMonth() === 0) {
      this.viewMonth.set(11);
      this.viewYear.update(y => y - 1);
    } else {
      this.viewMonth.update(m => m - 1);
    }
  }

  nextMonth(e: Event): void {
    e.stopPropagation();
    if (this.viewMonth() === 11) {
      this.viewMonth.set(0);
      this.viewYear.update(y => y + 1);
    } else {
      this.viewMonth.update(m => m + 1);
    }
  }

  selectDay(date: Date, e?: Event): void {
    e?.stopPropagation();
    if (this.disabled() || this.isDateDisabled(date)) return;

    const ds = this.formatLocalDate(date);
    if (this.picking() === 'start' || !this.startDate()) {
      this.startDate.set(ds);
      this.endDate.set('');
      this.picking.set('end');
      return;
    }

    if (ds >= this.startDate()) {
      this.endDate.set(ds);
      this.picking.set('start');
      this.emitRange(ds);
      this.open.set(false);
      this.openChange.emit(false);
    } else {
      this.startDate.set(ds);
      this.endDate.set('');
    }
  }

  applyPreset(preset: DateRangePreset): void {
    const start = this.toDateString(preset.start);
    const end = this.toDateString(preset.end);
    if (!start || !end) return;

    this.startDate.set(start);
    this.endDate.set(end);
    this.picking.set('start');
    const view = this.parseLocalDate(start);
    if (view) {
      this.viewMonth.set(view.getMonth());
      this.viewYear.set(view.getFullYear());
    }
    this.rangeChange.emit({ start, end });
    this.open.set(false);
    this.openChange.emit(false);
  }

  onDayKeydown(event: KeyboardEvent, date: Date): void {
    const deltas: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectDay(date, event);
      return;
    }

    const delta = deltas[event.key];
    if (!delta) return;

    event.preventDefault();
    const next = new Date(date);
    next.setDate(date.getDate() + delta);
    this.viewMonth.set(next.getMonth());
    this.viewYear.set(next.getFullYear());
    queueMicrotask(() => {
      const target = document.querySelector<HTMLButtonElement>(`.cal-day[data-date="${this.formatLocalDate(next)}"]:not(:disabled)`);
      target?.focus();
    });
  }

  private emitRange(end: string): void {
    this.rangeChange.emit({ start: this.startDate(), end });
  }

  private isDateDisabled(date: Date): boolean {
    const min = this.parseLocalDate(this.toDateString(this.min()));
    const max = this.parseLocalDate(this.toDateString(this.max()));
    const key = this.formatLocalDate(date);
    const disabledSet = new Set(this.disabledDates().map(item => this.toDateString(item)).filter(Boolean));

    return !!((min && date < min) || (max && date > max) || disabledSet.has(key));
  }

  private parseLocalDate(value: string): Date | null {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return this.startOfDay(new Date(year, month - 1, day));
  }

  private toDateString(value: Date | string | null): string {
    if (!value) return '';
    if (value instanceof Date) return this.formatLocalDate(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '' : this.formatLocalDate(parsed);
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private startOfDay(date: Date): Date {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private static createDefaultPresets(): DateRangePreset[] {
    const today = new Date();
    const lastSevenStart = new Date(today);
    lastSevenStart.setDate(today.getDate() - 6);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return [
      { label: 'Today', start: today, end: today },
      { label: 'Last 7 days', start: lastSevenStart, end: today },
      { label: 'This month', start: monthStart, end: monthEnd },
    ];
  }
}
