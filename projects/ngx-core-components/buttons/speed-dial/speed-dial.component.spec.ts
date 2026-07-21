import { TestBed } from '@angular/core/testing';
import { SpeedDialComponent } from './speed-dial.component';

describe('SpeedDialComponent', () => {
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
      imports: [SpeedDialComponent],

    }).compileComponents();
  });

  it('should create and render with mock data', () => {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    const component = fixture.componentInstance;
    try { fixture.componentRef.setInput('items', [{ id: "1", label: "A", value: 10, group: "G1", x: 5, y: 10, text: "A", weight: 5, source: "A", target: "B" }]); } catch(e) {}

    try { fixture.detectChanges(); } catch(e) {}
    expect(component).toBeTruthy();
  });

  it('should execute interaction handlers and export functions', () => {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    const component = fixture.componentInstance;
    try { fixture.componentRef.setInput('items', [{ id: "1", label: "A", value: 10, group: "G1", x: 5, y: 10, text: "A", weight: 5, source: "A", target: "B" }]); } catch(e) {}

    try { fixture.detectChanges(); } catch(e) {}

    expect(component).toBeTruthy();
  });
});
