import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListViewComponent } from './list-view.component';
import { provideNgxI18n } from '../../i18n/public-api';

interface TestItem {
  id: string;
  name: string;
}

describe('ListViewComponent', () => {
  let component: ListViewComponent<TestItem>;
  let fixture: ComponentFixture<ListViewComponent<TestItem>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListViewComponent],
      providers: [
        provideNgxI18n({
          pagination: {
            page: 'Seite',
            of: 'von',
            nextPage: 'Nächste',
            previousPage: 'Vorherige',
            firstPage: 'Erste',
            lastPage: 'Letzte',
            itemsPerPage: 'Einträge pro Seite'
          },
          common: {
            loading: 'Wird geladen...',
            noData: 'Keine Daten vorhanden',
            error: 'Fehler',
            retry: 'Wiederholen',
            save: 'Speichern',
            delete: 'Löschen',
            edit: 'Bearbeiten',
            cancel: 'Abbrechen',
            ok: 'OK',
            close: 'Schließen',
            search: 'Suchen...',
            required: 'Pflichtfeld'
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListViewComponent) as ComponentFixture<ListViewComponent<TestItem>>;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display empty message when items is empty', () => {
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    const emptyEl = fixture.nativeElement.querySelector('.lv-empty');
    expect(emptyEl.textContent.trim()).toBe('Keine Daten vorhanden');
  });

  it('should display loading spinner when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const loadingEl = fixture.nativeElement.querySelector('.lv-loading');
    expect(loadingEl.textContent.trim()).toBe('Wird geladen...');
  });

  it('should render items list using labelField', () => {
    fixture.componentRef.setInput('items', [
      { id: '1', name: 'Item One' },
      { id: '2', name: 'Item Two' }
    ]);
    fixture.componentRef.setInput('labelField', 'name');
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.lv-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent.trim()).toBe('Item One');
    expect(items[1].textContent.trim()).toBe('Item Two');
  });

  it('should select item on click in single selection mode', () => {
    const data = [
      { id: '1', name: 'Item One' },
      { id: '2', name: 'Item Two' }
    ];
    fixture.componentRef.setInput('items', data);
    fixture.componentRef.setInput('labelField', 'name');
    fixture.componentRef.setInput('multiselect', false);
    fixture.detectChanges();

    spyOn(component.selectionChange, 'emit');

    const items = fixture.nativeElement.querySelectorAll('.lv-item');
    items[0].click();
    fixture.detectChanges();

    expect(items[0].classList.contains('lv-selected')).toBeTrue();
    expect(component.selectionChange.emit).toHaveBeenCalledWith({ selectedItems: [data[0]] });

    items[1].click();
    fixture.detectChanges();

    expect(items[0].classList.contains('lv-selected')).toBeFalse();
    expect(items[1].classList.contains('lv-selected')).toBeTrue();
    expect(component.selectionChange.emit).toHaveBeenCalledWith({ selectedItems: [data[1]] });
  });

  it('should support multi-selection mode', () => {
    const data = [
      { id: '1', name: 'Item One' },
      { id: '2', name: 'Item Two' }
    ];
    fixture.componentRef.setInput('items', data);
    fixture.componentRef.setInput('labelField', 'name');
    fixture.componentRef.setInput('multiselect', true);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.lv-item');
    items[0].click();
    items[1].click();
    fixture.detectChanges();

    expect(items[0].classList.contains('lv-selected')).toBeTrue();
    expect(items[1].classList.contains('lv-selected')).toBeTrue();
  });

  it('should support pagination controls', () => {
    const data = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' },
      { id: '4', name: 'Item 4' }
    ];
    fixture.componentRef.setInput('items', data);
    fixture.componentRef.setInput('labelField', 'name');
    fixture.componentRef.setInput('pageSize', 2);
    fixture.detectChanges();

    // Page 1 should display Item 1 and Item 2
    let items = fixture.nativeElement.querySelectorAll('.lv-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent.trim()).toBe('Item 1');

    const meta = fixture.nativeElement.querySelector('.lv-pager-meta');
    expect(meta.textContent.trim()).toContain('Seite 1 von 2');

    // Click Next button
    const nextBtn = fixture.nativeElement.querySelectorAll('.lv-pager-btn')[1] as HTMLButtonElement;
    expect(nextBtn.textContent?.trim()).toBe('Nächste');
    nextBtn.click();
    fixture.detectChanges();

    // Page 2 should display Item 3 and Item 4
    items = fixture.nativeElement.querySelectorAll('.lv-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent.trim()).toBe('Item 3');
  });
});
