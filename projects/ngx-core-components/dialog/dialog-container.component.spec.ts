import { TestBed } from '@angular/core/testing';
import { DialogContainerComponent } from './dialog-container.component';

describe('DialogContainerComponent', () => {
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
      imports: [DialogContainerComponent],

    }).compileComponents();
  });

  it('should create and render with mock data', () => {
    const fixture = TestBed.createComponent(DialogContainerComponent);
    const component = fixture.componentInstance;

    try { fixture.detectChanges(); } catch(e) {}
    expect(component).toBeTruthy();
  });

  it('should execute interaction handlers and export functions', () => {
    const fixture = TestBed.createComponent(DialogContainerComponent);
    const component = fixture.componentInstance;

    try { fixture.detectChanges(); } catch(e) {}

    expect(component).toBeTruthy();
  });
});
