import { Component, input, output, signal, computed } from '@angular/core';

@Component({
  selector: 'ngx-date-range-picker',
  standalone: true,
  template: `
    <div class="ngx-date-range-picker">
      @if (label()) { <label class="drp-label">{{ label() }}</label> }
      <div class="drp-inputs" (click)="toggleOpen()">
        <input class="drp-input" type="text" readonly [value]="startDate()" placeholder="Start date" />
        <span class="drp-sep">&#8594;</span>
        <input class="drp-input" type="text" readonly [value]="endDate()" placeholder="End date" />
        <span class="drp-icon">&#128197;</span>
      </div>
      @if (open()) {
        <div class="drp-calendar-wrap">
          <div class="drp-calendar">
            <div class="cal-header">
              <button class="cal-nav" (click)="prevMonth($event)">&#8249;</button>
              <span class="cal-title">{{ monthName(viewMonth()) }} {{ viewYear() }}</span>
              <button class="cal-nav" (click)="nextMonth($event)">&#8250;</button>
            </div>
            <div class="cal-grid">
              @for (day of weekDays; track day) { <div class="cal-weekday">{{ day }}</div> }
              @for (cell of calendarDays(); track cell.key) {
                <div
                  class="cal-day"
                  [class.other-month]="!cell.inMonth"
                  [class.in-range]="cell.inRange"
                  [class.range-start]="cell.isStart"
                  [class.range-end]="cell.isEnd"
                  [class.today]="cell.isToday"
                  (click)="selectDay(cell.date, $event)"
                >{{ cell.date.getDate() }}</div>
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
    .drp-inputs:hover { border-color: var(--primary-color, #4f46e5); }
    .drp-input { border: none; background: transparent; font-size: 13px; color: var(--ngx-input-text, #0f172a); outline: none; cursor: pointer; width: 85px; font-family: inherit; }
    .drp-sep { color: #94a3b8; font-weight: 650; }
    .drp-icon { font-size: 14px; color: #64748b; margin-left: auto; }
    .drp-calendar-wrap { position: absolute; top: calc(100% + 6px); left: 0; background: var(--bg-secondary, #fff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--ngx-input-radius, 12px); box-shadow: var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.08)); z-index: 1000; padding: 14px; }
    .cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .cal-nav { background: none; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px; cursor: pointer; padding: 3px 8px; font-size: 14px; color: #64748b; transition: all 0.15s; }
    .cal-nav:hover { background: var(--border-light, #f1f5f9); color: var(--text-primary, #0f172a); }
    .cal-title { font-weight: 750; font-size: 13px; color: var(--text-primary, #0f172a); font-family: var(--ngx-heading-font-family, inherit); }
    .cal-grid { display: grid; grid-template-columns: repeat(7, 34px); gap: 3px; }
    .cal-weekday { text-align: center; font-size: 10px; font-weight: 700; color: #94a3b8; padding: 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .cal-day { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 550; border-radius: 6px; cursor: pointer; transition: all 0.15s; color: var(--text-primary, #0f172a); }
    .cal-day:hover:not(.range-start):not(.range-end) { background: var(--border-light, #f1f5f9); }
    .cal-day.other-month { color: #cbd5e1; }
    .cal-day.in-range { background: var(--primary-glow, rgba(79, 70, 229, 0.08)); color: var(--primary-color, #4f46e5); border-radius: 0; }
    .cal-day.range-start, .cal-day.range-end { background: var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)); color: #fff; font-weight: 700; border-radius: 50%; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.35); }
    .cal-day.today:not(.range-start):not(.range-end) { font-weight: 700; border: 1.5px solid var(--primary-color, #4f46e5); color: var(--primary-color, #4f46e5); }
  `]
})
export class DateRangePickerComponent {
  label = input('');
  startDate = signal<string>('');
  endDate = signal<string>('');
  open = signal(false);
  private picking = signal<'start' | 'end'>('start');
  viewMonth = signal(new Date().getMonth());
  viewYear = signal(new Date().getFullYear());
  rangeChange = output<{ start: string; end: string }>();

  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  monthName(m: number) { return this.monthNames[m]; }
  toggleOpen(): void { this.open.update(v => !v); }
  prevMonth(e: Event): void { e.stopPropagation(); if (this.viewMonth() === 0) { this.viewMonth.set(11); this.viewYear.update(y => y - 1); } else this.viewMonth.update(m => m - 1); }
  nextMonth(e: Event): void { e.stopPropagation(); if (this.viewMonth() === 11) { this.viewMonth.set(0); this.viewYear.update(y => y + 1); } else this.viewMonth.update(m => m + 1); }

  calendarDays = computed(() => {
    const y = this.viewYear(), m = this.viewMonth();
    const first = new Date(y, m, 1).getDay();
    const days: any[] = [];
    const today = new Date(); today.setHours(0,0,0,0);
    const s = this.startDate() ? new Date(this.startDate()) : null;
    const e = this.endDate() ? new Date(this.endDate()) : null;
    for (let i = 0; i < 42; i++) {
      const date = new Date(y, m, i - first + 1);
      date.setHours(0,0,0,0);
      const ds = date.toISOString().split('T')[0];
      days.push({
        key: ds, date, inMonth: date.getMonth() === m,
        isToday: date.getTime() === today.getTime(),
        isStart: s ? date.getTime() === s.getTime() : false,
        isEnd: e ? date.getTime() === e.getTime() : false,
        inRange: s && e ? date > s && date < e : false
      });
    }
    return days;
  });

  selectDay(date: Date, e: Event): void {
    e.stopPropagation();
    const ds = date.toISOString().split('T')[0];
    if (this.picking() === 'start') { this.startDate.set(ds); this.endDate.set(''); this.picking.set('end'); }
    else { if (ds >= this.startDate()) { this.endDate.set(ds); this.picking.set('start'); this.rangeChange.emit({ start: this.startDate(), end: ds }); this.open.set(false); } else { this.startDate.set(ds); } }
  }
}