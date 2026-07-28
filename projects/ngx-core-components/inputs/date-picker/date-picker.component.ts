import {
  Component, ChangeDetectionStrategy, input, output, signal, computed, forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface DatePreset {
  label: string;
  getValue: () => Date;
}

@Component({
  selector: 'ngx-date-picker',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="ngx-date-picker" [class.has-error]="status() === 'error'" [class.disabled]="disabled()">
      @if (label()) {
        <label class="ngx-date-label">{{ label() }}</label>
      }
      <div class="ngx-date-wrap" (click)="toggleCalendar()">
        <span class="ngx-date-icon">📅</span>
        <input
          class="ngx-date-input"
          type="text"
          readonly
          [value]="displayValue()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
        />
        @if (clearable() && _resolvedValue() && !disabled()) {
          <button type="button" class="ngx-date-clear" (click)="clearValue($event)">✕</button>
        }
      </div>

      @if (isOpen()) {
        <div class="ngx-date-popover" (click)="$event.stopPropagation()">
          @if (showPresets()) {
            <div class="ngx-date-presets">
              <span class="presets-title">Presets:</span>
              @for (preset of activePresets(); track preset.label) {
                <button type="button" class="preset-chip" (click)="selectPreset(preset)">{{ preset.label }}</button>
              }
            </div>
          }

          <div class="calendar-header">
            <button type="button" class="cal-nav" (click)="prevMonth()">‹</button>
            <span class="cal-title">{{ monthName() }} {{ currentYear() }}</span>
            <button type="button" class="cal-nav" (click)="nextMonth()">›</button>
          </div>

          <div class="calendar-grid">
            <span class="day-header" *ngFor="let d of ['Su','Mo','Tu','We','Th','Fr','Sa']">{{ d }}</span>
            <button
              *ngFor="let cell of calendarDays()"
              type="button"
              class="day-cell"
              [class.other-month]="!cell.inMonth"
              [class.selected]="isSelected(cell.date)"
              [class.today]="isToday(cell.date)"
              (click)="selectDate(cell.date)"
            >
              {{ cell.date.getDate() }}
            </button>
          </div>
        </div>
      }

      @if (error()) {
        <div class="ngx-date-error">{{ error() }}</div>
      } @else if (hint()) {
        <div class="ngx-date-hint">{{ hint() }}</div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }
    .ngx-date-picker { font-family: var(--ngx-font-family, inherit); }
    .ngx-date-label { display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 4px; }
    .ngx-date-wrap { display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 8px; background: #ffffff; padding: 8px 12px; cursor: pointer; gap: 8px; }
    .ngx-date-input { border: none; background: transparent; outline: none; flex: 1; font-size: 13px; color: #0f172a; cursor: pointer; }
    .ngx-date-icon { font-size: 14px; }
    .ngx-date-clear { border: none; background: transparent; cursor: pointer; color: #94a3b8; font-size: 12px; }
    .ngx-date-popover { position: absolute; top: 100%; left: 0; margin-top: 4px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); padding: 14px; z-index: 1000; width: 280px; }
    .ngx-date-presets { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; align-items: center; }
    .presets-title { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-right: 4px; }
    .preset-chip { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 6px; padding: 2px 8px; font-size: 11px; cursor: pointer; color: #334155; transition: all 0.15s; }
    .preset-chip:hover { border-color: #4f46e5; color: #4f46e5; background: #eef2ff; }
    .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .cal-title { font-weight: 700; font-size: 13px; color: #0f172a; }
    .cal-nav { border: none; background: #f8fafc; border-radius: 6px; width: 24px; height: 24px; cursor: pointer; font-size: 14px; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; }
    .day-header { font-size: 10px; font-weight: 700; color: #94a3b8; padding: 4px 0; }
    .day-cell { border: none; background: transparent; padding: 6px 0; font-size: 12px; border-radius: 6px; cursor: pointer; color: #0f172a; }
    .day-cell:hover { background: #f1f5f9; }
    .day-cell.other-month { color: #cbd5e1; }
    .day-cell.selected { background: #4f46e5 !important; color: #ffffff !important; font-weight: 700; }
    .day-cell.today { font-weight: 700; color: #4f46e5; text-decoration: underline; }
    .ngx-date-error { font-size: 11px; color: #ef4444; margin-top: 4px; }
    .ngx-date-hint { font-size: 11px; color: #64748b; margin-top: 4px; }
  `]
})
export class DatePickerComponent implements ControlValueAccessor {
  value = input<Date | string | null>(null);
  label = input<string>('');
  placeholder = input<string>('Select date...');
  disabled = input<boolean>(false);
  status = input<'normal' | 'success' | 'warning' | 'error'>('normal');
  error = input<string>('');
  hint = input<string>('');
  clearable = input<boolean>(true);
  showPresets = input<boolean>(true);

  valueChange = output<any>();

  isOpen = signal<boolean>(false);
  currentMonth = signal<number>(new Date().getMonth());
  currentYear = signal<number>(new Date().getFullYear());

  private _cvaValue = signal<Date | null>(null);
  private _cvaActive = false;

  _resolvedValue = computed<Date | null>(() => {
    const raw = this._cvaActive ? this._cvaValue() : this.value();
    if (!raw) return null;
    return raw instanceof Date ? raw : new Date(raw);
  });

  activePresets = computed<DatePreset[]>(() => [
    { label: 'Today', getValue: () => new Date() },
    { label: 'Yesterday', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; } },
    { label: 'Last 7 Days', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d; } },
    { label: 'First of Month', getValue: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
  ]);

  displayValue = computed(() => {
    const val = this._resolvedValue();
    if (!val) return '';
    return val.toLocaleDateString();
  });

  monthName = computed(() => {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return months[this.currentMonth()];
  });

  calendarDays = computed(() => {
    const m = this.currentMonth();
    const y = this.currentYear();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrevMonth = new Date(y, m, 0).getDate();

    const cells: { date: Date; inMonth: boolean }[] = [];

    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ date: new Date(y, m - 1, daysInPrevMonth - i), inMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ date: new Date(y, m, i), inMonth: true });
    }
    // Next month padding
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ date: new Date(y, m + 1, i), inMonth: false });
    }

    return cells;
  });

  private onChange: (val: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: Date | string | null): void {
    this._cvaActive = true;
    this._cvaValue.set(val ? (val instanceof Date ? val : new Date(val)) : null);
  }

  registerOnChange(fn: (val: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  toggleCalendar(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
  }

  selectDate(d: Date): void {
    this._cvaValue.set(d);
    this.onChange(d);
    this.valueChange.emit(d);
    this.isOpen.set(false);
  }

  selectPreset(preset: DatePreset): void {
    const date = preset.getValue();
    this.currentMonth.set(date.getMonth());
    this.currentYear.set(date.getFullYear());
    this.selectDate(date);
  }

  clearValue(e: MouseEvent): void {
    e.stopPropagation();
    this._cvaValue.set(null);
    this.onChange(null);
    this.valueChange.emit(null);
  }

  prevMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
  }

  isSelected(d: Date): boolean {
    const val = this._resolvedValue();
    if (!val) return false;
    return val.toDateString() === d.toDateString();
  }

  isToday(d: Date): boolean {
    return new Date().toDateString() === d.toDateString();
  }
}
