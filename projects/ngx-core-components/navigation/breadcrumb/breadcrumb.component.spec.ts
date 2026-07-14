import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreadcrumbComponent, BreadcrumbItem } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;

  const mockItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/home', icon: '🏠' },
    { label: 'Products', url: '/products' },
    { label: 'Software', url: '/products/software' },
    { label: 'IDE' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all items when not collapsed', () => {
    const itemEls = fixture.nativeElement.querySelectorAll('.breadcrumb-item');
    expect(itemEls.length).toBe(4);
    expect(itemEls[0].textContent).toContain('Home');
    expect(itemEls[0].textContent).toContain('🏠');
    expect(itemEls[1].textContent.trim()).toBe('Products');
    expect(itemEls[3].classList.contains('active')).toBe(true); // Last item is active
  });

  it('should support custom separator character', () => {
    fixture.componentRef.setInput('separator', '>');
    fixture.detectChanges();
    const separators = fixture.nativeElement.querySelectorAll('.breadcrumb-separator');
    expect(separators[0].textContent).toBe('>');
  });

  it('should emit itemClick when a link is clicked', () => {
    spyOn(component.itemClick, 'emit');
    const links = fixture.nativeElement.querySelectorAll('a.breadcrumb-item');
    links[0].click();
    fixture.detectChanges();
    expect(component.itemClick.emit).toHaveBeenCalledWith(mockItems[0]);
  });

  it('should collapse breadcrumbs if items exceed maxVisible threshold', () => {
    fixture.componentRef.setInput('maxVisible', 2);
    fixture.detectChanges();

    // With maxVisible=2:
    // It should render: First item ('Home'), then ellipsis ('...'), then last 2 items ('Software', 'IDE')
    const itemEls = fixture.nativeElement.querySelectorAll('.breadcrumb-item');
    const ellipsis = fixture.nativeElement.querySelector('.breadcrumb-ellipsis');
    
    expect(ellipsis).toBeTruthy();
    // 1 (visibleItems) + 1 (ellipsis) + 2 (tailItems) = 4 items
    expect(itemEls.length).toBe(4);
    expect(itemEls[0].textContent).toContain('Home');
    expect(itemEls[1].textContent.trim()).toBe('…');
    expect(itemEls[2].textContent.trim()).toBe('Software');
    expect(itemEls[3].textContent.trim()).toBe('IDE');
  });

  it('should expand collapsed breadcrumbs when ellipsis is clicked', () => {
    fixture.componentRef.setInput('maxVisible', 2);
    fixture.detectChanges();

    const ellipsis = fixture.nativeElement.querySelector('.breadcrumb-ellipsis') as HTMLButtonElement;
    ellipsis.click();
    fixture.detectChanges();

    const ellipsisAfter = fixture.nativeElement.querySelector('.breadcrumb-ellipsis');
    expect(ellipsisAfter).toBeNull(); // Ellipsis is hidden now

    const itemEls = fixture.nativeElement.querySelectorAll('.breadcrumb-item');
    expect(itemEls.length).toBe(4); // All items visible
    expect(itemEls[1].textContent.trim()).toBe('Products');
  });
});
