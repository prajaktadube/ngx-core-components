import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';
import { provideNgxI18n } from '../../i18n/public-api';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent],
      providers: [
        provideNgxI18n({
          dropdown: {
            noResults: 'Keine Ergebnisse',
            selectPlaceholder: 'Bitte wählen...',
            clearSelection: 'Auswahl löschen',
            searchPlaceholder: 'Suchen...'
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display i18n select placeholder by default', () => {
    const triggerEl = fixture.nativeElement.querySelector('.trigger-text');
    expect(triggerEl.textContent.trim()).toBe('Bitte wählen...');
  });

  it('should use placeholder input if provided', () => {
    fixture.componentRef.setInput('placeholder', 'Custom Placeholder');
    fixture.detectChanges();
    const triggerEl = fixture.nativeElement.querySelector('.trigger-text');
    expect(triggerEl.textContent.trim()).toBe('Custom Placeholder');
  });

  it('should toggle options popup on trigger click', () => {
    const trigger = fixture.nativeElement.querySelector('.ngx-dropdown-trigger');
    expect(fixture.nativeElement.querySelector('.ngx-dropdown-popup')).toBeNull();

    trigger.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ngx-dropdown-popup')).toBeTruthy();

    trigger.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ngx-dropdown-popup')).toBeNull();
  });
});
