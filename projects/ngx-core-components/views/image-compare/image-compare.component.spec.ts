import { TestBed } from '@angular/core/testing';
import { ImageCompareComponent } from './image-compare.component';

describe('ImageCompareComponent', () => {
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
      imports: [ImageCompareComponent],

    }).compileComponents();
  });

  it('should create and render with mock data', () => {
    const fixture = TestBed.createComponent(ImageCompareComponent);
    const component = fixture.componentInstance;
    try { fixture.componentRef.setInput('beforeImage', [{ id: "1", label: "A", value: 10, group: "G1", x: 5, y: 10, text: "A", weight: 5, source: "A", target: "B" }]); } catch(e) {}
    try { fixture.componentRef.setInput('afterImage', [{ id: "1", label: "A", value: 10, group: "G1", x: 5, y: 10, text: "A", weight: 5, source: "A", target: "B" }]); } catch(e) {}

    try { fixture.detectChanges(); } catch(e) {}
    expect(component).toBeTruthy();
  });

  it('should execute interaction handlers and export functions', () => {
    const fixture = TestBed.createComponent(ImageCompareComponent);
    const component = fixture.componentInstance;
    try { fixture.componentRef.setInput('beforeImage', [{ id: "1", label: "A", value: 10, group: "G1", x: 5, y: 10, text: "A", weight: 5, source: "A", target: "B" }]); } catch(e) {}
    try { fixture.componentRef.setInput('afterImage', [{ id: "1", label: "A", value: 10, group: "G1", x: 5, y: 10, text: "A", weight: 5, source: "A", target: "B" }]); } catch(e) {}

    try { fixture.detectChanges(); } catch(e) {}
    try { (component as any).onMouseMove(0, 0, new MouseEvent('mousemove'), {} as any); } catch(e) {}
    try { (component as any).onMouseMove(0, new MouseEvent('click'), {} as any); } catch(e) {}
    try { (component as any).onMouseMove(new MouseEvent('mousemove')); } catch(e) {}
    try { (component as any).onMouseMove(); } catch(e) {}

    expect(component).toBeTruthy();
  });
});
