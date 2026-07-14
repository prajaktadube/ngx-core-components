import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuComponent, MenuItem } from './menu.component';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  const mockItems: MenuItem[] = [
    { label: 'File', children: [{ label: 'New' }, { label: 'Open' }] },
    { label: 'Edit', children: [], disabled: true },
    { label: 'Help' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render top-level menu items', () => {
    const items = fixture.nativeElement.querySelectorAll('.menu-item');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain('File');
    expect(items[1].classList.contains('disabled')).toBe(true);
    expect(items[2].textContent).toContain('Help');
  });

  it('should toggle submenu on click of item with children', () => {
    const items = fixture.nativeElement.querySelectorAll('.menu-item');
    expect(fixture.nativeElement.querySelector('.menu-submenu')).toBeNull();

    items[0].click();
    fixture.detectChanges();

    const submenu = fixture.nativeElement.querySelector('.menu-submenu');
    expect(submenu).toBeTruthy();
    expect(component.openIndex()).toBe(0);

    const subitems = submenu.querySelectorAll('.menu-subitem');
    expect(subitems.length).toBe(2);
    expect(subitems[0].textContent).toContain('New');

    // Click again to close
    items[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.menu-submenu')).toBeNull();
  });

  it('should emit itemClick when a leaf item or submenu item is clicked', () => {
    spyOn(component.itemClick, 'emit');
    const items = fixture.nativeElement.querySelectorAll('.menu-item');

    // Click standalone leaf item
    items[2].click();
    fixture.detectChanges();
    expect(component.itemClick.emit).toHaveBeenCalledWith(mockItems[2]);

    // Click submenu item
    items[0].click();
    fixture.detectChanges();

    const subitems = fixture.nativeElement.querySelectorAll('.menu-subitem');
    subitems[1].click();
    fixture.detectChanges();
    expect(component.itemClick.emit).toHaveBeenCalledWith(mockItems[0].children![1]);
  });

  it('should close submenu on document click', () => {
    const items = fixture.nativeElement.querySelectorAll('.menu-item');
    items[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.menu-submenu')).toBeTruthy();

    document.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.menu-submenu')).toBeNull();
  });

  it('should highlight activeItem correctly', () => {
    fixture.componentRef.setInput('activeItem', 'Help');
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.menu-item');
    expect(items[2].classList.contains('active')).toBe(true);
  });
});
