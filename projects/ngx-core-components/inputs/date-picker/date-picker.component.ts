import {
  Component, ChangeDetectionStrategy, input, output, signal, computed,
  HostListener, ElementRef, inject, forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NGX_CORE_I18N } from 'ngx-core-components/i18n';

@Component({
  selector: 'ngx-date-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="ngx-date-picker" [class.open]="isOpen()" [class.disabled]="disabled()">
      @if (label()) {
        <label class="dp-label">{{ label() }}</label>
      }
      <!-- Input trigger -->
      <div
        class="dp-input-wrap"
        (click)="toggle()"
        (keydown)="onInputKeyDown($event)"
        [attr.tabindex]="disabled() ? -1 : 0"
        role="combobox"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="grid"
      >
        <input
          class="dp-input"
          readonly
          [value]="displayValue()"
          [placeholder]="effectivePlaceholder()"
          [disabled]="disabled()"
          tabindex="-1"
        />
        <span class="dp-icon">&#128197;</span>
      </div>

      <!-- Calendar popup -->
      @if (isOpen()) {
        <div class="dp-popup" (click)="$event.stopPropagation()">
          <!-- Month/Year nav -->
          <div class="dp-nav">
            <button class="dp-nav-btn" (click)="prevMonth()" aria-label="Previous month">&#8249;</button>
            <span class="dp-nav-title" aria-live="polite">{{ monthTitle() }}</span>
            <button class="dp-nav-btn" (click)="nextMonth()" aria-label="Next month">&#8250;</button>
          </div>
          <!-- Weekday headers -->
          <div class="dp-weekdays">
            @for (d of i18n.datePicker.shortWeekdays; track d) {
              <span class="dp-wd">{{ d }}</span>
            }
          </div>
          <!-- Days grid -->
          <div class="dp-days" role="grid">
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
            <button class="dp-today-btn" (click)="selectToday()">{{ i18n.datePicker.today }}</button>
            <button class="dp-clear-btn" (click)="clearValue()">{{ i18n.datePicker.clear }}</button>
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
    .dp-label { display: block; font-size: 12px; font-weight: 600; color: var(--ngx-input-label, #475569); margin-bottom: 6px; }
    .dp-input-wrap {
      display: flex; align-items: center;
      border: 1px solid var(--ngx-input-border, #cbd5e1); border-radius: var(--ngx-input-radius, 8px);
      background: var(--ngx-input-bg, #fff); cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .dp-input-wrap:focus-visible {
      border-color: var(--primary-color, #4f46e5);
      box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.15));
    }
    .dp-input-wrap:hover { border-color: var(--primary-color, #4f46e5); }
    .open .dp-input-wrap { border-color: var(--primary-color, #4f46e5); box-shadow: 0 0 0 3px var(--primary-glow, rgba(79, 70, 229, 0.15)); }
    .disabled .dp-input-wrap { background: var(--ngx-input-disabled-bg, #f8f9fa); cursor: not-allowed; opacity: 0.7; }
    .dp-input {
      flex: 1; padding: 10px 14px; border: none; outline: none; background: transparent;
      font-size: 14px; color: var(--ngx-input-text, #0f172a); cursor: pointer; font-family: inherit;
    }
    .dp-input:disabled { cursor: not-allowed; color: var(--ngx-color-text-disabled, #767b83); }
    .dp-icon { padding: 0 12px; color: #64748b; font-size: 14px; }
    .dp-popup {
      position: absolute; top: calc(100% + 6px); left: 0; z-index: 1000;
      background: var(--bg-secondary, #fff); border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--ngx-input-radius, 12px); box-shadow: var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.08));
      padding: 16px; width: 280px;
    }
    .dp-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .dp-nav-btn {
      background: none; border: none; cursor: pointer; font-size: 20px; color: #64748b;
      padding: 2px 8px; border-radius: 6px; line-height: 1; transition: background 0.15s;
    }
    .dp-nav-btn:hover { background: var(--border-light, #f1f5f9); color: var(--text-primary, #0f172a); }
    .dp-nav-title { font-size: 14px; font-weight: 750; color: var(--text-primary, #0f172a); font-family: var(--ngx-heading-font-family, inherit); }
    .dp-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 6px; }
    .dp-wd { text-align: center; font-size: 11px; color: var(--ngx-color-text-secondary, #657080); font-weight: 700; padding: 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .dp-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
    .dp-day {
      aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 500; border: none; background: none; cursor: pointer; border-radius: 50%;
      color: var(--text-primary, #0f172a); transition: all 0.15s;
    }
    .dp-day:hover:not(.disabled):not(.selected) { background: var(--border-light, #f1f5f9); }
    .dp-day.other-month { color: var(--ngx-color-text-disabled, #767b83); }
    .dp-day.today { font-weight: 700; color: var(--primary-color, #4f46e5); border: 1.5px solid var(--primary-color, #4f46e5); }
    .dp-day.selected { background: var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)); color: #fff; font-weight: 600; box-shadow: 0 3px 8px rgba(79, 70, 229, 0.3); }
    .dp-day.disabled { color: var(--ngx-color-text-disabled, #767b83); cursor: not-allowed; text-decoration: line-through; }
    .dp-footer { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-color, #e2e8f0); }
    .dp-today-btn, .dp-clear-btn {
      background: none; border: none; cursor: pointer; font-size: 12px; font-weight: 700; color: var(--primary-color, #4f46e5);
      padding: 6px 12px; border-radius: 6px; font-family: inherit; transition: background 0.15s;
    }
    .dp-today-btn:hover { background: var(--primary-glow, rgba(79, 70, 229, 0.08)); }
    .dp-clear-btn { color: var(--text-secondary, #64748b); }
    .dp-clear-btn:hover { background: var(--border-light, #f1f5f9); }
  `]
})
export class DatePickerComponent implements ControlValueAccessor {
  value = input<Date | null>(null);
  label = input<string>('');
  placeholder = input<string | null>(null);
  disabled = input<boolean>(false);
  min = input<Date | null>(null);
  max = input<Date | null>(null);
  format = input<string>('MM/dd/yyyy');

  valueChange = output<Date | null>();

  i18n = inject(NGX_CORE_I18N);
  effectivePlaceholder = computed(() => this.placeholder() ?? 'Select date...');

  isOpen = signal(false);
  viewYear = signal(new Date().getFullYear());
  viewMonth = signal(new Date().getMonth());
  _cvaValue = signal<Date | null>(null);
  private _cvaActive = signal(false);
  private _onChange: (v: Date | null) => void = () => {};
  private _onTouched: () => void = () => {};

  private el = inject(ElementRef);

  _activeValue = computed(() => this._cvaActive() ? this._cvaValue() : this.value());

  displayValue = computed(() => {
    const v = this._activeValue();
    if (!v) return '';
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    const y = v.getFullYear();
    return `${m}/${d}/${y}`;
  });

  monthTitle = computed(() => {
    const mName = this.i18n.datePicker.months[this.viewMonth()];
    const y = this.viewYear();
    return `${mName} ${y}`;
  });

  calendarDays = computed(() => {
    const y = this.viewYear(), m = this.viewMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const selectedTime = this._activeValue()?.setHours(0, 0, 0, 0) ?? -1;
    const days: { date: Date | null; label: string; current: boolean; isToday: boolean; isSelected: boolean; disabled: boolean }[] = [];

    // Leading blanks
    for (let i = 0; i < first.getDay(); i++) {
      const d = new Date(y, m, -first.getDay() + i + 1);
      const isDisabled = (this.min() && d < this.min()!) || (this.max() && d > this.max()!) || false;
      days.push({
        date: d, label: d.getDate().toString(), current: false,
        isToday: false,
        isSelected: d.setHours(0,0,0,0) === selectedTime,
        disabled: isDisabled
      });
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
      const isDisabled = (this.min() && d < this.min()!) || (this.max() && d > this.max()!) || false;
      days.push({
        date: d, label: i.toString(), current: false,
        isToday: false,
        isSelected: d.setHours(0,0,0,0) === selectedTime,
        disabled: isDisabled
      });
    }
    return days;
  });

  toggle(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
    if (this.isOpen() && this._activeValue()) {
      this.viewYear.set(this._activeValue()!.getFullYear());
      this.viewMonth.set(this._activeValue()!.getMonth());
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

  onInputKeyDown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.isOpen.set(false);
    }
  }

  selectDay(date: Date | null): void {
    if (!date) return;
    this._cvaValue.set(date);
    this._onChange(date);
    this._onTouched();
    this.valueChange.emit(date);
    this.isOpen.set(false);
  }

  selectToday(): void { this.selectDay(new Date()); }

  clearValue(): void {
    this._cvaValue.set(null);
    this._onChange(null);
    this.valueChange.emit(null);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) this.isOpen.set(false);
  }

  writeValue(val: Date | null): void {
    this._cvaActive.set(true);
    this._cvaValue.set(val instanceof Date ? val : null);
  }

  registerOnChange(fn: (v: Date | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // disabled is controlled via input() for template usage.
  }
}
