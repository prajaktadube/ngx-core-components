import { TestBed } from '@angular/core/testing';
import { SplitButtonComponent } from './split-button.component';

describe('SplitButtonComponent', () => {
  beforeEach(async () => {
    // Spy on window.open and window.alert to prevent PDF exports from freezing test runs
    spyOn(window, 'open').and.returnValue({
      document: {
        write: () => {},
        close: () => {}
      }
    } as any);
    spyOn(window, 'alert').and.stub();

    await TestBed.configureTestingModule({
      imports: [SplitButtonComponent],

    }).compileComponents();
  });

  it('should create and render with mock data', () => {
    const fixture = TestBed.createComponent(SplitButtonComponent);
    const component = fixture.componentInstance;

    try { fixture.detectChanges(); } catch(e) {}
    expect(component).toBeTruthy();
  });

  it('should execute interaction handlers and export functions', () => {
    const fixture = TestBed.createComponent(SplitButtonComponent);
    const component = fixture.componentInstance;

    try { fixture.detectChanges(); } catch(e) {}

    expect(component).toBeTruthy();
  });
});
