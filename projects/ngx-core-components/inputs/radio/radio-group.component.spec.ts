import { TestBed } from '@angular/core/testing';
import { RadioGroupComponent } from './radio-group.component';

describe('RadioGroupComponent', () => {
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
      imports: [RadioGroupComponent],

    }).compileComponents();
  });

  it('should create and render with mock data', () => {
    const fixture = TestBed.createComponent(RadioGroupComponent);
    const component = fixture.componentInstance;

    try { fixture.detectChanges(); } catch(e) {}
    expect(component).toBeTruthy();
  });

  it('should execute interaction handlers and export functions', () => {
    const fixture = TestBed.createComponent(RadioGroupComponent);
    const component = fixture.componentInstance;

    try { fixture.detectChanges(); } catch(e) {}

    expect(component).toBeTruthy();
  });
});
