import {
  Component, ChangeDetectionStrategy, input, output, signal, computed,
  HostListener, ElementRef, inject
} from '@angular/core';

@Component({
  selector: 'ngx-date-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-date-picker" [class.open]="isOpen()" [class.disabled]="disabled()">
      @if (label()) {
        <label class="dp-label">{{ label() }}</label>
      }
      <!-- Input trigger -->
      <div class="dp-input-wrap" (click)="toggle()">
        <input
          class="dp-input"
          readonly
          [value]="displayValue()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
        />
        <span class="dp-icon">&#128197;</span>
      </div>

      <!-- Calendar popup -->
      @if (isOpen()) {
        <div class="dp-popup" (click)="$event.stopPropagation()">
          <!-- Month/Year nav -->
          <div class="dp-nav">
            <button class="dp-nav-btn" (click)="prevMonth()">&#8249;</button>
            <span class="dp-nav-title">{{ monthTitle() }}</span>
            <button class="dp-nav-btn" (click)="nextMonth()">&#8250;</button>
          </div>
          <!-- Weekday headers -->
          <div class="dp-weekdays">
            @for (d of WEEKDAYS; track d) {
              <span class="dp-wd">{{ d }}</span>
            }
          </div>
          <!-- Days grid -->
          <div class="dp-days">
            @for (day of calendarDays(); track day.date?.getTime() ?? $index) {
              <button
                class="dp-day"
                [class.other-month]="!day.current"
                [class.today]="day.isToday"
                [class.selected]="day.isSelected"
                [class.disabled]="day.disabled"
                [disabled]="day.disabled || !day.date"
                (click)="selectDay(day.date)"
              >{{ day.label }}</button>
            }
          </div>
          <!-- Footer -->
          <div class="dp-footer">
            <button class="dp-today-btn" (click)="selectToday()">Today</button>
            <button class="dp-clear-btn" (click)="clearValue()">Clear</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ngx-date-picker { position: relative; font-family: inherit; }
    .dp-label { display: block; font-size: 13px; color: var(--ngx-input-label, #6c757d); margin-bottom: 4px; font-weight: 500; }
    .dp-input-wrap {
      display: flex; align-items: center;
      border: 1px solid var(--ngx-input-border, #ced4da); border-radius: var(--ngx-input-radius, 4px);
      background: var(--ngx-input-bg, #fff); cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .dp-input-wrap:hover { border-color: #adb5bd; }
    .open .dp-input-wrap { border-color: var(--ngx-input-focus, #4a90d9); box-shadow: 0 0 0 2px rgba(74,144,217,0.18); }
    .disabled .dp-input-wrap { background: #f8f9fa; cursor: not-allowed; }
    .dp-input {
      flex: 1; padding: 8px 12px; border: none; outline: none; background: transparent;
      font-size: 14px; color: var(--ngx-input-text, #212529); cursor: pointer; font-family: inherit;
    }
    .dp-icon { padding: 0 12px; color: #6c757d; }
    .dp-popup {
      position: absolute; top: calc(100% + 4px); left: 0; z-index: 1000;
      background: var(--ngx-input-bg, #fff); border: 1px solid var(--ngx-input-border, #ced4da);
      border-radius: var(--ngx-input-radius, 4px); box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      padding: 12px; width: 260px;
    }
    .dp-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .dp-nav-btn {
      background: none; border: none; cursor: pointer; font-size: 20px; color: #6c757d;
      padding: 2px 8px; border-radius: 3px; line-height: 1;
    }
    .dp-nav-btn:hover { background: #f1f3f5; }
    .dp-nav-title { font-size: 14px; font-weight: 600; color: var(--ngx-input-text, #212529); }
    .dp-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 4px; }
    .dp-wd { text-align: center; font-size: 11px; color: #adb5bd; font-weight: 600; padding: 4px 0; }
    .dp-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
    .dp-day {
      aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
      font-size: 13px; border: none; background: none; cursor: pointer; border-radius: 50%;
      color: var(--ngx-input-text, #212529); transition: background 0.1s;
    }
    .dp-day:hover:not(.disabled):not(.selected) { background: #f1f3f5; }
    .dp-day.other-month { color: #ced4da; }
    .dp-day.today { font-weight: 700; color: var(--ngx-input-focus, #4a90d9); }
    .dp-day.selected { background: var(--ngx-input-focus, #4a90d9); color: #fff; }
    .dp-day.disabled { color: #ced4da; cursor: not-allowed; }
    .dp-footer { display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f1f3f5; }
    .dp-today-btn, .dp-clear-btn {
      background: none; border: none; cursor: pointer; font-size: 12px; color: var(--ngx-input-focus, #4a90d9);
      padding: 4px 8px; border-radius: 3px; font-family: inherit;
    }
    .dp-today-btn:hover, .dp-clear-btn:hover { background: #f1f3f5; }
    .dp-clear-btn { color: #6c757d; }
  `]
})
export class DatePickerComponent {
  value = input<Date | null>(null);
  label = input<string>('');
  placeholder = input<string>('Select date...');
  disabled = input<boolean>(false);
  min = input<Date | null>(null);
  max = input<Date | null>(null);
  format = input<string>('MM/dd/yyyy');

  valueChange = output<Date | null>();

  readonly WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  isOpen = signal(false);
  viewYear = signal(new Date().getFullYear());
  viewMonth = signal(new Date().getMonth());

  private el = inject(ElementRef);

  displayValue = computed(() => {
    const v = this.value();
    if (!v) return '';
    return v.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  });

  monthTitle = computed(() => {
    const d = new Date(this.viewYear(), this.viewMonth(), 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  calendarDays = computed(() => {
    const y = this.viewYear(), m = this.viewMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const selectedTime = this.value()?.setHours(0, 0, 0, 0) ?? -1;
    const days: { date: Date | null; label: string; current: boolean; isToday: boolean; isSelected: boolean; disabled: boolean }[] = [];

    // Leading blanks
    for (let i = 0; i < first.getDay(); i++) {
      const d = new Date(y, m, -first.getDay() + i + 1);
      days.push({ date: d, label: d.getDate().toString(), current: false, isToday: false, isSelected: false, disabled: true });
    }
    // Days in month
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(y, m, d);
      const isDisabled = (this.min() && date < this.min()!) || (this.max() && date > this.max()!) || false;
      days.push({
        date, label: d.toString(), current: true,
        isToday: date.getTime() === today.getTime(),
        isSelected: date.setHours(0,0,0,0) === selectedTime,
        disabled: isDisabled,
      });
    }
    // Trailing blanks
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(y, m + 1, i);
      days.push({ date: d, label: i.toString(), current: false, isToday: false, isSelected: false, disabled: true });
    }
    return days;
  });

  toggle(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
    if (this.isOpen() && this.value()) {
      this.viewYear.set(this.value()!.getFullYear());
      this.viewMonth.set(this.value()!.getMonth());
    }
  }

  prevMonth(): void {
    if (this.viewMonth() === 0) { this.viewMonth.set(11); this.viewYear.update(y => y - 1); }
    else this.viewMonth.update(m => m - 1);
  }

  nextMonth(): void {
    if (this.viewMonth() === 11) { this.viewMonth.set(0); this.viewYear.update(y => y + 1); }
    else this.viewMonth.update(m => m + 1);
  }

  selectDay(date: Date | null): void {
    if (!date) return;
    this.valueChange.emit(date);
    this.isOpen.set(false);
  }

  selectToday(): void { this.selectDay(new Date()); }
  clearValue(): void { this.valueChange.emit(null); this.isOpen.set(false); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) this.isOpen.set(false);
  }
}
