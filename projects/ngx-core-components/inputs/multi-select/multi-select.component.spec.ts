import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiSelectComponent } from './multi-select.component';
import { provideNgxI18n } from '../../i18n/public-api';
import { DropdownOption } from '../dropdown/dropdown.component';

describe('MultiSelectComponent', () => {
  let component: MultiSelectComponent;
  let fixture: ComponentFixture<MultiSelectComponent>;

  const mockOptions: DropdownOption[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry', disabled: true },
    { label: 'Date', value: 'date' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectComponent],
      providers: [
        provideNgxI18n({
          multiSelect: {
            selectAll: 'Select All',
            deselectAll: 'Deselect All',
            selectedCount: (count) => `${count} selected`,
            searchPlaceholder: 'Search...'
          },
          dropdown: {
            noResults: 'No matches',
            selectPlaceholder: 'Select options...',
            clearSelection: 'Clear',
            searchPlaceholder: 'Search'
          },
          common: {
            search: 'Search...',
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

    fixture = TestBed.createComponent(MultiSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', mockOptions);
    component.writeValue([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label and placeholder', () => {
    fixture.componentRef.setInput('label', 'Fruits Select');
    fixture.detectChanges();

    const labelEl = fixture.nativeElement.querySelector('.ms-label');
    expect(labelEl.textContent.trim()).toBe('Fruits Select');

    const placeholderEl = fixture.nativeElement.querySelector('.ms-placeholder');
    expect(placeholderEl.textContent.trim()).toBe('Select options...');
  });

  it('should toggle popup display on click', () => {
    expect(component.isOpen()).toBeFalse();

    const triggerEl = fixture.nativeElement.querySelector('.ms-trigger');
    triggerEl.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBeTrue();

    triggerEl.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
  });

  it('should display selected items as tags', () => {
    component.writeValue(['apple', 'banana']);
    fixture.detectChanges();

    const tags = fixture.nativeElement.querySelectorAll('.ms-tag');
    expect(tags.length).toBe(2);
    expect(tags[0].textContent.trim()).toContain('Apple');
    expect(tags[1].textContent.trim()).toContain('Banana');
  });

  it('should toggle selection when checkbox option is clicked', () => {
    spyOn(component.valuesChange, 'emit');
    component.isOpen.set(true);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.ms-item input[type="checkbox"]');
    // Index 0: Select All, Index 1: Apple
    items[1].dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component._activeValues()).toEqual(['apple']);
    expect(component.valuesChange.emit).toHaveBeenCalledWith(['apple']);

    items[1].dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component._activeValues()).toEqual([]);
  });

  it('should support Select All checkbox option click', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.ms-item input[type="checkbox"]');
    // Index 0: Select All
    items[0].dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component._activeValues()).toEqual(['apple', 'banana', 'date']); // disabled 'cherry' ignored
  });

  it('should remove value when tag remove button is clicked', () => {
    component.writeValue(['apple', 'banana']);
    fixture.detectChanges();

    const removeBtn = fixture.nativeElement.querySelector('.ms-tag-remove');
    removeBtn.click();
    fixture.detectChanges();

    expect(component._activeValues()).toEqual(['banana']);
  });

  it('should filter options on input if filterable is true', () => {
    fixture.componentRef.setInput('filterable', true);
    component.isOpen.set(true);
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('.ms-search-input');
    expect(searchInput).toBeTruthy();
    expect(searchInput.getAttribute('placeholder')).toBe('Search...');

    searchInput.value = 'ba';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.ms-item');
    // Select All is always visible
    expect(items.length).toBe(2); // Select All + Banana
    expect(items[1].textContent.trim()).toContain('Banana');
  });

  it('should support keyboard navigation triggers (Space, Enter, Escape)', () => {
    const triggerEl = fixture.nativeElement.querySelector('.ms-trigger');
    expect(component.isOpen()).toBeFalse();

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    triggerEl.dispatchEvent(spaceEvent);
    fixture.detectChanges();
    expect(component.isOpen()).toBeTrue();

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    triggerEl.dispatchEvent(escEvent);
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
  });
});
