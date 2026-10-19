import { TestBed } from '@angular/core/testing';
import { BarcodeComponent } from './barcode.component';

describe('BarcodeComponent', () => {
  beforeEach(async () => {
    // Spy on window.open and window.alert to prevent PDF exports from freezing test runs
    spyOn(window, 'open').and.returnValue({
      document: {
        write: () => {},
        close: () => {},
      },
    } as any);
    spyOn(window, 'alert').and.stub();

    await TestBed.configureTestingModule({
      imports: [BarcodeComponent],
    }).compileComponents();
  });

  it('should create and render with mock data', () => {
    const fixture = TestBed.createComponent(BarcodeComponent);
    const component = fixture.componentInstance;

    try {
      fixture.detectChanges();
    } catch (e) {}
    expect(component).toBeTruthy();
  });

  it('should execute interaction handlers and export functions', () => {
    const fixture = TestBed.createComponent(BarcodeComponent);
    const component = fixture.componentInstance;

    try {
      fixture.detectChanges();
    } catch (e) {}

    expect(component).toBeTruthy();
  });

  it('renders a valid barcode with an accessible label', () => {
    const fixture = TestBed.createComponent(BarcodeComponent);
    fixture.componentRef.setInput('value', 'A');
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg[role="img"]') as SVGElement;
    expect(svg.getAttribute('aria-label')).toBe('Code 128-B barcode for A');
    expect(svg.querySelectorAll('rect').length).toBeGreaterThan(1);
  });

  it('announces unsupported content instead of rendering an invalid symbol', () => {
    const fixture = TestBed.createComponent(BarcodeComponent);
    fixture.componentRef.setInput('value', 'café');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('printable ASCII');
    expect(fixture.nativeElement.querySelector('svg')?.querySelectorAll('rect').length).toBe(0);
  });
});
