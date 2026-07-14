import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccordionComponent, AccordionItemComponent } from './accordion.component';
import { Component, signal } from '@angular/core';

@Component({
  template: `
    <ngx-accordion [multi]="multi()">
      <ngx-accordion-item title="Pane 1" icon="⚡">
        <p class="content-p1">Content 1</p>
      </ngx-accordion-item>
      <ngx-accordion-item title="Pane 2" [disabled]="true">
        <p class="content-p2">Content 2</p>
      </ngx-accordion-item>
      <ngx-accordion-item title="Pane 3" [expanded]="true">
        <p class="content-p3">Content 3</p>
      </ngx-accordion-item>
    </ngx-accordion>
  `,
  imports: [AccordionComponent, AccordionItemComponent]
})
class TestHostComponent {
  multi = signal(false);
}

describe('AccordionComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let accordionEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
    accordionEl = hostFixture.nativeElement.querySelector('.ngx-accordion');
  });

  it('should render items correctly', () => {
    const headers = accordionEl.querySelectorAll('.accordion-header');
    expect(headers.length).toBe(3);
    expect(headers[0].textContent).toContain('Pane 1');
    expect(headers[0].textContent).toContain('⚡');
  });

  it('should start with Pane 3 expanded based on inputs', () => {
    const items = accordionEl.querySelectorAll('.accordion-item');
    expect(items[0].classList.contains('expanded')).toBe(false);
    expect(items[2].classList.contains('expanded')).toBe(true);
  });

  it('should toggle panels on header click', () => {
    const headers = accordionEl.querySelectorAll('.accordion-header') as NodeListOf<HTMLButtonElement>;
    const items = accordionEl.querySelectorAll('.accordion-item');

    // Click Pane 1 (not multi-expand mode by default)
    headers[0].click();
    hostFixture.detectChanges();

    expect(items[0].classList.contains('expanded')).toBe(true);
    expect(items[2].classList.contains('expanded')).toBe(false); // Pane 3 collapses
  });

  it('should support multiple panels expanded when multi is true', () => {
    hostComponent.multi.set(true);
    hostFixture.detectChanges();

    const headers = accordionEl.querySelectorAll('.accordion-header') as NodeListOf<HTMLButtonElement>;
    const items = accordionEl.querySelectorAll('.accordion-item');

    headers[0].click(); // Expand Pane 1
    hostFixture.detectChanges();

    expect(items[0].classList.contains('expanded')).toBe(true);
    expect(items[2].classList.contains('expanded')).toBe(true);
  });

  it('should not expand disabled panels', () => {
    const headers = accordionEl.querySelectorAll('.accordion-header') as NodeListOf<HTMLButtonElement>;
    const items = accordionEl.querySelectorAll('.accordion-item');

    headers[1].click(); // Pane 2 (disabled)
    hostFixture.detectChanges();

    expect(items[1].classList.contains('expanded')).toBe(false);
  });

  it('should navigate headers via ArrowDown and ArrowUp key presses', () => {
    const headers = accordionEl.querySelectorAll('.accordion-header') as NodeListOf<HTMLButtonElement>;

    // Focus first header
    headers[0].focus();
    expect(document.activeElement).toBe(headers[0]);

    // Press ArrowDown -> Skip disabled Pane 2 -> Focus Pane 3
    const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    headers[0].dispatchEvent(arrowDownEvent);
    hostFixture.detectChanges();

    expect(document.activeElement).toBe(headers[2]);

    // Press ArrowUp -> Focus Pane 1 (skipping disabled Pane 2)
    const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    headers[2].dispatchEvent(arrowUpEvent);
    hostFixture.detectChanges();

    expect(document.activeElement).toBe(headers[0]);
  });
});
