import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SplitterComponent } from './splitter.component';

describe('SplitterComponent', () => {
  let component: SplitterComponent;
  let fixture: ComponentFixture<SplitterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SplitterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default orientation to horizontal and initialSize to 50%', () => {
    expect(component.orientation()).toBe('horizontal');
    expect(component.initialSize()).toBe('50%');
    expect(component.firstSize()).toBe('50%');
  });

  it('should compute hostStyle based on orientation', () => {
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();
    expect(component.hostStyle()).toContain('width:100%');

    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();
    expect(component.hostStyle()).toContain('flex-direction:column');
  });

  it('should apply min limit during resizing', () => {
    fixture.componentRef.setInput('min', 80);
    fixture.detectChanges();

    // Mock closest / container measurements
    const mockContainer = document.createElement('div');
    mockContainer.className = 'ngx-splitter';
    // Define properties that SplitterComponent expects
    Object.defineProperty(mockContainer, 'offsetWidth', { value: 400 });
    Object.defineProperty(mockContainer, 'offsetHeight', { value: 400 });

    const dividerEl = fixture.nativeElement.querySelector('.split-divider');
    mockContainer.appendChild(fixture.nativeElement);

    const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, clientX: 200 });
    // Spy on closest to return our mocked container
    spyOn(dividerEl, 'closest').and.returnValue(mockContainer);

    dividerEl.dispatchEvent(mousedownEvent);
    fixture.detectChanges();

    expect(component.dragging()).toBe(true);

    // Simulate mousemove with delta that attempts to resize smaller than min limit (e.g., to 20px)
    const mousemoveEvent = new MouseEvent('mousemove', { clientX: 20 });
    document.dispatchEvent(mousemoveEvent);
    fixture.detectChanges();

    // The first size should be clamped to min (80px)
    expect(component.firstSize()).toBe('80px');

    // Simulate mouseup
    const mouseupEvent = new MouseEvent('mouseup');
    document.dispatchEvent(mouseupEvent);
    fixture.detectChanges();

    expect(component.dragging()).toBe(false);
  });
});
