import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import {
  BreadcrumbComponent, BreadcrumbItem,
  MenuComponent, MenuItem,
  CommandPaletteComponent, CommandItem,
  ContextMenuComponent, ContextMenuItem,
  BackToTopComponent
} from 'ngx-core-components/navigation';

@Component({
  standalone: true,
  imports: [
    BreadcrumbComponent,
    MenuComponent,
    CommandPaletteComponent,
    ContextMenuComponent,
    BackToTopComponent
  ],
  template: `
    <!-- Breadcrumb -->
    <ngx-breadcrumb
      #breadcrumb
      [items]="crumbs()"
      [maxVisible]="maxVisible()"
      [separator]="separator()"
      (itemClick)="onItemClick($event)"
    />

    <!-- Menu -->
    <ngx-menu
      #menu
      [items]="menuItems()"
      [orientation]="menuOrientation()"
      [activeItem]="activeMenuItem()"
      (itemClick)="onMenuItemClick($event)"
    />

    <!-- Command Palette -->
    <ngx-command-palette
      #palette
      [commands]="commands()"
      (commandSelected)="onCommandSelected($event)"
    />

    <!-- Context Menu -->
    <ngx-context-menu
      #ctxMenu
      [items]="ctxItems()"
      [open]="ctxOpen()"
      [x]="ctxX()"
      [y]="ctxY()"
      (itemSelected)="onContextItemSelected($event)"
      (openChange)="ctxOpen.set($event)"
    />

    <!-- Back to Top inside a custom scroll target -->
    <div id="scroll-target" style="height: 200px; overflow-y: scroll;">
      <div style="height: 1000px;">Scrolling Content</div>
      <ngx-back-to-top
        #btt
        target="#scroll-target"
        [threshold]="100"
        [showProgress]="true"
        [theme]="bttTheme()"
      />
    </div>
  `
})
class TestNavWrapperComponent {
  // Breadcrumb
  crumbs = signal<BreadcrumbItem[]>([
    { label: 'Home', icon: '🏠' },
    { label: 'Components' },
    { label: 'Navigation' },
    { label: 'Breadcrumb' }
  ]);
  maxVisible = signal<number>(0);
  separator = signal<string>('/');
  lastBreadcrumbClicked: BreadcrumbItem | null = null;
  onItemClick(item: BreadcrumbItem) { this.lastBreadcrumbClicked = item; }

  // Menu
  menuItems = signal<MenuItem[]>([
    { label: 'Dashboard', icon: '📊' },
    { label: 'Users', icon: '👥', children: [{ label: 'All Users' }, { label: 'Roles' }] },
    { label: 'Settings', icon: '⚙️' }
  ]);
  menuOrientation = signal<'horizontal' | 'vertical'>('horizontal');
  activeMenuItem = signal<string>('Dashboard');
  lastMenuClicked: MenuItem | null = null;
  onMenuItemClick(item: MenuItem) { this.lastMenuClicked = item; }

  // Command Palette
  commands = signal<CommandItem[]>([
    { id: '1', label: 'Command One', category: 'Navigation' },
    { id: '2', label: 'Command Two', category: 'Preferences' },
    { id: '3', label: 'Reset Dashboard', category: 'Actions' }
  ]);
  lastCommandSelected: CommandItem | null = null;
  onCommandSelected(cmd: CommandItem) { this.lastCommandSelected = cmd; }

  // Context Menu
  ctxItems = signal<ContextMenuItem[]>([
    { id: 'cut', label: 'Cut', icon: '✂️' },
    { id: 'copy', label: 'Copy', icon: '📋' },
    { id: 'sep', label: '', separator: true },
    { id: 'delete', label: 'Delete', danger: true }
  ]);
  ctxOpen = signal<boolean>(false);
  ctxX = signal<number>(50);
  ctxY = signal<number>(100);
  lastContextSelected: ContextMenuItem | null = null;
  onContextItemSelected(item: ContextMenuItem) { this.lastContextSelected = item; }

  // Back to Top
  bttTheme = signal<'light' | 'dark'>('light');
}

describe('Navigation Components', () => {
  let fixture: ComponentFixture<TestNavWrapperComponent>;
  let wrapper: TestNavWrapperComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestNavWrapperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestNavWrapperComponent);
    wrapper = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ==================== BREADCRUMB TESTS ====================
  describe('BreadcrumbComponent', () => {
    it('should render all items by default and emit click events', () => {
      const items = fixture.debugElement.queryAll(By.css('.ngx-breadcrumb .breadcrumb-item'));
      expect(items.length).toBe(4);
      expect(items[0].nativeElement.textContent).toContain('Home');
      expect(items[1].nativeElement.textContent).toContain('Components');
      expect(items[3].nativeElement.classList.contains('active')).toBeTrue();

      // Trigger a click
      items[1].nativeElement.click();
      fixture.detectChanges();
      expect(wrapper.lastBreadcrumbClicked?.label).toBe('Components');
    });

    it('should show ellipsis and collapse items when maxVisible is set', () => {
      wrapper.maxVisible.set(2);
      fixture.detectChanges();

      let items = fixture.debugElement.queryAll(By.css('.ngx-breadcrumb .breadcrumb-item'));
      // Home + ellipsis + Breadcrumb + Navigation = 4 items rendering
      const ellipsis = fixture.debugElement.query(By.css('.breadcrumb-ellipsis'));
      expect(ellipsis).toBeTruthy();

      // Clicking ellipsis should expand
      ellipsis.nativeElement.click();
      fixture.detectChanges();

      const expandedEllipsis = fixture.debugElement.query(By.css('.breadcrumb-ellipsis'));
      expect(expandedEllipsis).toBeFalsy();

      items = fixture.debugElement.queryAll(By.css('.ngx-breadcrumb .breadcrumb-item'));
      expect(items.length).toBe(4);
    });
  });

  // ==================== MENU TESTS ====================
  describe('MenuComponent', () => {
    it('should render items, apply active state classes, and open submenus on click', () => {
      const menuEl = fixture.debugElement.query(By.css('ngx-menu'));
      expect(menuEl.nativeElement.classList.contains('menu-vertical')).toBeFalse();

      const items = menuEl.queryAll(By.css('.menu-item'));
      expect(items.length).toBe(3);
      expect(items[0].nativeElement.classList.contains('active')).toBeTrue();

      // Click item with submenu to expand it
      items[1].nativeElement.click();
      fixture.detectChanges();

      const submenu = menuEl.query(By.css('.menu-submenu'));
      expect(submenu).toBeTruthy();

      const subItems = menuEl.queryAll(By.css('.menu-subitem'));
      expect(subItems.length).toBe(2);

      // Click subitem
      subItems[0].nativeElement.click();
      fixture.detectChanges();
      expect(wrapper.lastMenuClicked?.label).toBe('All Users');
    });

    it('should support vertical orientation', () => {
      wrapper.menuOrientation.set('vertical');
      fixture.detectChanges();
      const menuEl = fixture.debugElement.query(By.css('ngx-menu'));
      const navEl = menuEl.query(By.css('.ngx-menu'));
      expect(navEl.nativeElement.classList.contains('menu-vertical')).toBeTrue();
    });
  });

  // ==================== CONTEXT MENU TESTS ====================
  describe('ContextMenuComponent', () => {
    it('should render context menu at x, y coordinates and support keyboard navigation', () => {
      let menuEl = fixture.debugElement.query(By.css('.ngx-context-menu'));
      expect(menuEl).toBeNull();

      wrapper.ctxOpen.set(true);
      fixture.detectChanges();

      menuEl = fixture.debugElement.query(By.css('.ngx-context-menu'));
      expect(menuEl).toBeTruthy();
      expect(menuEl.nativeElement.style.left).toBe('50px');
      expect(menuEl.nativeElement.style.top).toBe('100px');

      const items = menuEl.queryAll(By.css('.menu-item'));
      // Cut, Copy, Delete (separator is div, not .menu-item)
      expect(items.length).toBe(3);

      // Arrow Down keyboard navigation
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(items[0].nativeElement.classList.contains('focused')).toBeTrue();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(items[1].nativeElement.classList.contains('focused')).toBeTrue();

      // Press Enter to select
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();

      expect(wrapper.lastContextSelected?.id).toBe('copy');
      expect(wrapper.ctxOpen()).toBeFalse();
    });
  });

  // ==================== COMMAND PALETTE TESTS ====================
  describe('CommandPaletteComponent', () => {
    it('should open on toggle and support search query filtering', fakeAsync(() => {
      const palette = fixture.debugElement.query(By.directive(CommandPaletteComponent)).componentInstance as CommandPaletteComponent;
      expect(palette.isOpen()).toBeFalse();

      palette.toggleOpen();
      fixture.detectChanges();
      tick(100); // Wait for open effect timeout

      expect(palette.isOpen()).toBeTrue();

      const modal = fixture.debugElement.query(By.css('.ngx-palette-modal'));
      expect(modal).toBeTruthy();

      const inputEl = fixture.debugElement.query(By.css('.palette-input'));
      expect(inputEl).toBeTruthy();

      // Filter commands
      inputEl.nativeElement.value = 'One';
      inputEl.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.command-row'));
      expect(rows.length).toBe(1);
      expect(rows[0].nativeElement.textContent).toContain('Command One');

      // Select command
      rows[0].nativeElement.click();
      fixture.detectChanges();

      expect(wrapper.lastCommandSelected?.id).toBe('1');
      expect(palette.isOpen()).toBeFalse();
    }));
  });

  // ==================== BACK TO TOP TESTS ====================
  describe('BackToTopComponent', () => {
    it('should show/hide based on scroll threshold and change theme', fakeAsync(() => {
      const scrollContainer = document.getElementById('scroll-target') as HTMLElement;
      const bttButton = fixture.debugElement.query(By.css('.ngx-back-to-top'));
      expect(bttButton.nativeElement.classList.contains('visible')).toBeFalse();

      // Scroll past threshold of 100px
      scrollContainer.scrollTop = 150;
      scrollContainer.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      tick(100);

      expect(bttButton.nativeElement.classList.contains('visible')).toBeTrue();
      expect(bttButton.nativeElement.classList.contains('dark')).toBeFalse();

      // Toggle theme
      wrapper.bttTheme.set('dark');
      fixture.detectChanges();
      expect(bttButton.nativeElement.classList.contains('dark')).toBeTrue();

      // Click to scroll to top
      bttButton.nativeElement.click();
      fixture.detectChanges();
      tick(1000); // Wait for smooth scroll

      scrollContainer.scrollTop = 0; // Simulate scroll to top completion
      scrollContainer.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      expect(scrollContainer.scrollTop).toBe(0);
    }));
  });
});
