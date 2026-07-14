import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AutocompleteComponent } from './autocomplete.component';
import { provideNgxI18n } from '../../i18n/public-api';
import { DropdownOption } from '../dropdown/dropdown.component';

describe('AutocompleteComponent', () => {
  let component: AutocompleteComponent;
  let fixture: ComponentFixture<AutocompleteComponent>;

  const mockOptions: DropdownOption[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry', disabled: true },
    { label: 'Date', value: 'date' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteComponent],
      providers: [
        provideNgxI18n({
          autocomplete: {
            clearSelection: 'Clear',
            noResults: 'No matches',
            loading: 'Loading...'
          },
          common: {
            search: 'Search items...',
            loading: 'Loading...',
            error: 'Error',
            retry: 'Retry',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            cancel: 'Cancel',
            ok: 'OK',
            close: 'Close',
            noData: 'No data',
            required: 'Required'
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AutocompleteComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', mockOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label and localized placeholder', () => {
    fixture.componentRef.setInput('label', 'Fruit Search');
    fixture.detectChanges();

    const labelEl = fixture.nativeElement.querySelector('.ngx-ac-label');
    expect(labelEl.textContent.trim()).toBe('Fruit Search');

    const inputEl = fixture.nativeElement.querySelector('.ngx-ac-input');
    expect(inputEl.getAttribute('placeholder')).toBe('Search items...');
  });

  it('should open and filter options based on input character matches', () => {
    const inputEl = fixture.nativeElement.querySelector('.ngx-ac-input');
    inputEl.value = 'ba';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.isOpen()).toBeTrue();
    expect(component.filteredOptions()).toEqual([{ label: 'Banana', value: 'banana' }]);

    const items = fixture.nativeElement.querySelectorAll('.ngx-ac-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent.trim()).toBe('Banana');
  });

  it('should display noResults message if filtering yields empty array', () => {
    const inputEl = fixture.nativeElement.querySelector('.ngx-ac-input');
    inputEl.value = 'xyz';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.isOpen()).toBeTrue();
    const emptyMsg = fixture.nativeElement.querySelector('.ngx-ac-empty');
    expect(emptyMsg.textContent.trim()).toBe('No matches');
  });

  it('should select option on click/mousedown and close panel', () => {
    spyOn(component.valueChange, 'emit');

    const inputEl = fixture.nativeElement.querySelector('.ngx-ac-input');
    inputEl.value = 'ap';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.ngx-ac-item');
    expect(items.length).toBe(1);

    items[0].dispatchEvent(new MouseEvent('mousedown'));
    fixture.detectChanges();

    expect(component.isOpen()).toBeFalse();
    expect(component._inputText()).toBe('Apple');
    expect(component._selectedValue()).toBe('apple');
    expect(component.valueChange.emit).toHaveBeenCalledWith('apple');
  });

  it('should ignore selection when option is disabled', () => {
    const inputEl = fixture.nativeElement.querySelector('.ngx-ac-input');
    inputEl.value = 'ch';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.ngx-ac-item');
    expect(items.length).toBe(1);

    items[0].dispatchEvent(new MouseEvent('mousedown'));
    fixture.detectChanges();

    expect(component.isOpen()).toBeTrue(); // Panel remains open
    expect(component._selectedValue()).toBeNull(); // No value change
  });

  it('should clear selection when clear button is clicked', () => {
    component.writeValue('apple');
    fixture.detectChanges();

    const clearBtn = fixture.nativeElement.querySelector('.ngx-ac-clear');
    expect(clearBtn).toBeTruthy();

    clearBtn.click();
    fixture.detectChanges();

    expect(component._inputText()).toBe('');
    expect(component._selectedValue()).toBeNull();
  });

  it('should handle keydown events (ArrowDown, ArrowUp, Enter, Escape)', () => {
    const inputEl = fixture.nativeElement.querySelector('.ngx-ac-input') as HTMLInputElement;
    inputEl.value = 'a';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // ArrowDown -> highlights first option ('Apple')
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    inputEl.dispatchEvent(downEvent);
    fixture.detectChanges();
    expect(component.focusedIndex()).toBe(0);

    // ArrowDown again -> highlights second option ('Banana')
    inputEl.dispatchEvent(downEvent);
    fixture.detectChanges();
    expect(component.focusedIndex()).toBe(1);

    // ArrowUp -> highlights first option ('Apple')
    const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    inputEl.dispatchEvent(upEvent);
    fixture.detectChanges();
    expect(component.focusedIndex()).toBe(0);

    // Enter -> selects first option
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    inputEl.dispatchEvent(enterEvent);
    fixture.detectChanges();

    expect(component.isOpen()).toBeFalse();
    expect(component._selectedValue()).toBe('apple');
  });

  it('should support ControlValueAccessor operations', () => {
    component.writeValue('date');
    fixture.detectChanges();
    expect(component._inputText()).toBe('Date');
    expect(component._selectedValue()).toBe('date');

    const onChangeSpy = jasmine.createSpy('onChange');
    component.registerOnChange(onChangeSpy);

    component.selectOption(mockOptions[0]); // Select Apple
    expect(onChangeSpy).toHaveBeenCalledWith('apple');
  });

  it('should close panel on doc click outside component', () => {
    const inputEl = fixture.nativeElement.querySelector('.ngx-ac-input');
    inputEl.value = 'ap';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.isOpen()).toBeTrue();

    // Click on document outside element
    document.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
  });
});
