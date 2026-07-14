import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { DropdownComponent } from './dropdown.component';
import { provideNgxI18n } from '../../i18n/public-api';

describe('DropdownComponent (Zoneless Mode)', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideNgxI18n({
          dropdown: {
            noResults: 'No matches',
            selectPlaceholder: 'Select...',
            clearSelection: 'Clear',
            searchPlaceholder: 'Search'
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
  });

  it('should compile and function cleanly without zone.js change detection triggers', async () => {
    // In zoneless mode, component creation and initial rendering should work
    await fixture.whenStable();
    expect(component).toBeTruthy();

    const triggerEl = fixture.nativeElement.querySelector('.trigger-text');
    expect(triggerEl.textContent.trim()).toBe('Select...');

    // Change placeholder input and check if UI responds correctly (in zoneless mode via signals)
    fixture.componentRef.setInput('placeholder', 'Zoneless Select');
    await fixture.whenStable();
    expect(triggerEl.textContent.trim()).toBe('Zoneless Select');
  });
});
