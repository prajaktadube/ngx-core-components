import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePickerComponent } from './date-picker.component';
import { provideNgxI18n } from '../../i18n/public-api';

describe('DatePickerComponent', () => {
  let component: DatePickerComponent;
  let fixture: ComponentFixture<DatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerComponent],
      providers: [
        provideNgxI18n({
          datePicker: {
            today: 'Heute',
            clear: 'Löschen',
            cancel: 'Abbrechen',
            ok: 'OK',
            months: [
              'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
              'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
            ],
            shortMonths: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            shortWeekdays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display placeholder by default', () => {
    const inputEl = fixture.nativeElement.querySelector('.dp-input');
    expect(inputEl.placeholder).toBe('Select date...');
  });

  it('should show custom placeholder if input is set', () => {
    fixture.componentRef.setInput('placeholder', 'Custom Date Holder');
    fixture.detectChanges();
    const inputEl = fixture.nativeElement.querySelector('.dp-input');
    expect(inputEl.placeholder).toBe('Custom Date Holder');
  });

  it('should open popup on trigger click', () => {
    const trigger = fixture.nativeElement.querySelector('.dp-input-wrap');
    expect(fixture.nativeElement.querySelector('.dp-popup')).toBeNull();

    trigger.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dp-popup')).toBeTruthy();

    trigger.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dp-popup')).toBeNull();
  });

  it('should prevent opening when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.dp-input-wrap');
    trigger.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dp-popup')).toBeNull();
  });

  it('should select day, emit valueChange, and close popup on day click', () => {
    const trigger = fixture.nativeElement.querySelector('.dp-input-wrap');
    trigger.click();
    fixture.detectChanges();

    spyOn(component.valueChange, 'emit');

    const dayBtns = fixture.nativeElement.querySelectorAll('.dp-day');
    // Click one of the day buttons
    const dayToClick = Array.from(dayBtns).find((btn: any) => btn.textContent.trim() === '15') as HTMLButtonElement;
    expect(dayToClick).toBeTruthy();
    dayToClick.click();
    fixture.detectChanges();

    expect(component.valueChange.emit).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.dp-popup')).toBeNull();
  });

  it('should select today on today button click', () => {
    const trigger = fixture.nativeElement.querySelector('.dp-input-wrap');
    trigger.click();
    fixture.detectChanges();

    spyOn(component.valueChange, 'emit');
    const todayBtn = fixture.nativeElement.querySelector('.dp-today-btn');
    expect(todayBtn.textContent.trim()).toBe('Heute');
    todayBtn.click();
    fixture.detectChanges();

    expect(component.valueChange.emit).toHaveBeenCalled();
  });

  it('should clear value on clear button click', () => {
    const trigger = fixture.nativeElement.querySelector('.dp-input-wrap');
    trigger.click();
    fixture.detectChanges();

    spyOn(component.valueChange, 'emit');
    const clearBtn = fixture.nativeElement.querySelector('.dp-clear-btn');
    expect(clearBtn.textContent.trim()).toBe('Löschen');
    clearBtn.click();
    fixture.detectChanges();

    expect(component.valueChange.emit).toHaveBeenCalledWith(null);
  });

  it('should support Space and Enter keys to toggle popup', () => {
    const trigger = fixture.nativeElement.querySelector('.dp-input-wrap');
    
    // Space key down
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    trigger.dispatchEvent(spaceEvent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dp-popup')).toBeTruthy();

    // Escape key to close
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    trigger.dispatchEvent(escapeEvent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dp-popup')).toBeNull();

    // Enter key down
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    trigger.dispatchEvent(enterEvent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dp-popup')).toBeTruthy();
  });

  it('should support ControlValueAccessor integrations (writeValue and registerOnChange)', () => {
    const testDate = new Date(2026, 6, 20);
    component.writeValue(testDate);
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.querySelector('.dp-input');
    expect(inputEl.value).toBe('07/20/2026');
    expect(component._activeValue()).toEqual(testDate);

    const onChangeSpy = jasmine.createSpy('onChange');
    component.registerOnChange(onChangeSpy);

    component.selectDay(new Date(2026, 6, 15));
    fixture.detectChanges();

    expect(onChangeSpy).toHaveBeenCalled();
    const emittedDate: Date = onChangeSpy.calls.first().args[0];
    expect(emittedDate.getDate()).toBe(15);
  });
});
