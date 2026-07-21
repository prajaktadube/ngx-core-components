import { TestBed } from '@angular/core/testing';
import { ChartExportMenuComponent } from './chart-export-menu.component';

describe('ChartExportMenuComponent', () => {
  beforeEach(async () => {
    spyOn(window, 'open').and.returnValue({
      document: {
        write: () => {},
        close: () => {}
      }
    } as any);
    spyOn(window, 'alert').and.stub();

    await TestBed.configureTestingModule({
      imports: [ChartExportMenuComponent]
    }).compileComponents();
  });

  it('should create and render', () => {
    const fixture = TestBed.createComponent(ChartExportMenuComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.isOpen()).toBe(false);
  });

  it('should open and close on toggle', () => {
    const fixture = TestBed.createComponent(ChartExportMenuComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.toggle(new MouseEvent('click'));
    expect(component.isOpen()).toBe(true);

    component.toggle(new MouseEvent('click'));
    expect(component.isOpen()).toBe(false);
  });

  it('should select format and close', () => {
    const fixture = TestBed.createComponent(ChartExportMenuComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component.exportClicked, 'emit');
    component.isOpen.set(true);

    component.select('json');
    expect(component.isOpen()).toBe(false);
    expect(component.exportClicked.emit).toHaveBeenCalledWith('json');
  });

  it('should handle keyboard navigation', () => {
    const fixture = TestBed.createComponent(ChartExportMenuComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.isOpen.set(true);
    fixture.detectChanges();

    const arrowDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    const arrowUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });

    component.onArrowDown(arrowDown);
    expect(component.focusedIndex()).toBe(0);

    component.onArrowDown(arrowDown);
    expect(component.focusedIndex()).toBe(1);

    component.onArrowUp(arrowUp);
    expect(component.focusedIndex()).toBe(0);
  });

  it('should close on escape and outside click', () => {
    const fixture = TestBed.createComponent(ChartExportMenuComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.isOpen.set(true);
    component.closeOnEscape();
    expect(component.isOpen()).toBe(false);

    component.isOpen.set(true);
    component.closeOnOutsideClick();
    expect(component.isOpen()).toBe(false);
  });
});
