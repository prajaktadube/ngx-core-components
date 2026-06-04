import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { 
  CardComponent, 
  TabStripComponent, 
  TabComponent, 
  AccordionComponent, 
  AccordionItemComponent, 
  StepperComponent, 
  NgxStepContentDirective,
  StepperStep
} from 'ngx-core-components/layout';

// Wrapper component to test Card Component
@Component({
  standalone: true,
  imports: [CardComponent],
  template: `
    <ngx-card 
      [title]="title()" 
      [subtitle]="subtitle()" 
      [variant]="variant()" 
      [hoverable]="hoverable()" 
      [selectable]="selectable()" 
      [selected]="selected()"
      (cardClick)="onCardClick($event)"
    >
      Card body content
    </ngx-card>
  `
})
class TestCardWrapperComponent {
  title = signal('Test Title');
  subtitle = signal('Test Subtitle');
  variant = signal<'default' | 'elevated' | 'outlined' | 'filled' | 'glass'>('default');
  hoverable = signal(false);
  selectable = signal(false);
  selected = signal(false);

  clicked = false;
  onCardClick(event: MouseEvent) {
    this.clicked = true;
  }
}

// Wrapper component to test Tab Strip Component
@Component({
  standalone: true,
  imports: [TabStripComponent, TabComponent],
  template: `
    <ngx-tab-strip [position]="position()" (tabChange)="onTabChange($event)" (tabClose)="onTabClose($event)">
      @for (tab of tabs(); track tab.title) {
        <ngx-tab [title]="tab.title" [icon]="tab.icon" [closable]="tab.closable" [badge]="tab.badge">
          Tab Content for {{ tab.title }}
        </ngx-tab>
      }
    </ngx-tab-strip>
  `
})
class TestTabStripWrapperComponent {
  position = signal<'top' | 'bottom' | 'left' | 'right'>('top');
  tabs = signal([
    { title: 'Tab 1', icon: '1', closable: true, badge: '5' },
    { title: 'Tab 2', icon: '2', closable: false, badge: '' }
  ]);

  lastChangedIdx: number | null = null;
  lastClosedIdx: number | null = null;

  onTabChange(idx: number) {
    this.lastChangedIdx = idx;
  }
  onTabClose(idx: number) {
    this.lastClosedIdx = idx;
  }
}

// Wrapper component to test Accordion Component
@Component({
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent],
  template: `
    <ngx-accordion #accordion [multi]="multi()">
      <ngx-accordion-item title="Item 1" [expanded]="true">Content 1</ngx-accordion-item>
      <ngx-accordion-item title="Item 2">Content 2</ngx-accordion-item>
      <ngx-accordion-item title="Item 3">Content 3</ngx-accordion-item>
    </ngx-accordion>
  `
})
class TestAccordionWrapperComponent {
  multi = signal(false);
  accordion = viewChild.required<AccordionComponent>('accordion');
}

// Wrapper to test Stepper Component
@Component({
  standalone: true,
  imports: [StepperComponent, NgxStepContentDirective],
  template: `
    <ngx-stepper 
      [steps]="steps()" 
      [linear]="linear()" 
      [showContent]="true" 
      [showActions]="true"
      (stepChange)="onStepChange($event)"
    >
      <ng-template [ngxStepContent]="0">
        <div class="test-step-content-1">Content Step 1</div>
      </ng-template>
      <ng-template [ngxStepContent]="1">
        <div class="test-step-content-2">Content Step 2</div>
      </ng-template>
    </ngx-stepper>
  `
})
class TestStepperWrapperComponent {
  linear = signal(true);
  steps = signal<StepperStep[]>([
    { label: 'Step A', description: 'Desc A' },
    { label: 'Step B', description: 'Desc B' }
  ]);

  lastStepIdx: number | null = null;
  onStepChange(idx: number) {
    this.lastStepIdx = idx;
  }
}

describe('Layout Components Unit Tests', () => {

  describe('CardComponent', () => {
    let fixture: ComponentFixture<TestCardWrapperComponent>;
    let wrapper: TestCardWrapperComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestCardWrapperComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TestCardWrapperComponent);
      wrapper = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should render card with title and subtitle', () => {
      const titleEl = fixture.debugElement.query(By.css('.card-title'));
      const subtitleEl = fixture.debugElement.query(By.css('.card-subtitle'));
      expect(titleEl.nativeElement.textContent.trim()).toBe('Test Title');
      expect(subtitleEl.nativeElement.textContent.trim()).toBe('Test Subtitle');
    });

    it('should support glassmorphic variant styling', () => {
      wrapper.variant.set('glass');
      fixture.detectChanges();
      const cardEl = fixture.debugElement.query(By.css('.ngx-card'));
      expect(cardEl.nativeElement.classList.contains('ngx-card-glass')).toBeTrue();
    });

    it('should emit click event only if hoverable or selectable', () => {
      const cardEl = fixture.debugElement.query(By.css('.ngx-card'));
      
      // Default: not clickable
      cardEl.nativeElement.click();
      fixture.detectChanges();
      expect(wrapper.clicked).toBeFalse();

      // Set hoverable
      wrapper.hoverable.set(true);
      fixture.detectChanges();
      cardEl.nativeElement.click();
      fixture.detectChanges();
      expect(wrapper.clicked).toBeTrue();
    });
  });

  describe('TabStripComponent', () => {
    let fixture: ComponentFixture<TestTabStripWrapperComponent>;
    let wrapper: TestTabStripWrapperComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestTabStripWrapperComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TestTabStripWrapperComponent);
      wrapper = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should render tabs with icons and badges', () => {
      const btns = fixture.debugElement.queryAll(By.css('.tab-btn'));
      expect(btns.length).toBe(2);

      const firstBtn = btns[0].nativeElement;
      expect(firstBtn.textContent).toContain('Tab 1');
      expect(firstBtn.textContent).toContain('1'); // icon
      
      const badge = fixture.debugElement.query(By.css('.tab-badge'));
      expect(badge.nativeElement.textContent).toBe('5');
    });

    it('should apply 4-directional flexbox layouts classes', () => {
      const container = fixture.debugElement.query(By.css('.ngx-tab-strip'));
      expect(container.nativeElement.classList.contains('tabs-top')).toBeTrue();

      wrapper.position.set('left');
      fixture.detectChanges();
      expect(container.nativeElement.classList.contains('tabs-left')).toBeTrue();
    });

    it('should trigger close button and emit close output', () => {
      const closeBtn = fixture.debugElement.query(By.css('.tab-close-btn'));
      expect(closeBtn).toBeTruthy();

      closeBtn.nativeElement.click();
      fixture.detectChanges();
      expect(wrapper.lastClosedIdx).toBe(0);
    });

    it('should select tab on click and update activeIndex', fakeAsync(() => {
      const btns = fixture.debugElement.queryAll(By.css('.tab-btn'));
      btns[1].nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(wrapper.lastChangedIdx).toBe(1);
    }));
  });

  describe('AccordionComponent', () => {
    let fixture: ComponentFixture<TestAccordionWrapperComponent>;
    let wrapper: TestAccordionWrapperComponent;
    let accordion: AccordionComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestAccordionWrapperComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TestAccordionWrapperComponent);
      wrapper = fixture.componentInstance;
      fixture.detectChanges();
      accordion = wrapper.accordion();
    });

    it('should project headers and content components', () => {
      const headers = fixture.debugElement.queryAll(By.css('.accordion-header'));
      expect(headers.length).toBe(3);
      expect(headers[0].nativeElement.textContent.trim()).toBe('Item 1');
    });

    it('should control expansion behavior programmatically', () => {
      expect(accordion.isExpanded(0)).toBeTrue();
      expect(accordion.isExpanded(1)).toBeFalse();

      accordion.expandItem(1);
      fixture.detectChanges();
      expect(accordion.isExpanded(1)).toBeTrue();
      // Since multi is false, Item 0 should be closed now
      expect(accordion.isExpanded(0)).toBeFalse();
    });

    it('should expand and collapse all items programmatically in multi mode', () => {
      wrapper.multi.set(true);
      fixture.detectChanges();

      accordion.expandAll();
      fixture.detectChanges();
      expect(accordion.isExpanded(0)).toBeTrue();
      expect(accordion.isExpanded(1)).toBeTrue();
      expect(accordion.isExpanded(2)).toBeTrue();

      accordion.collapseAll();
      fixture.detectChanges();
      expect(accordion.isExpanded(0)).toBeFalse();
      expect(accordion.isExpanded(1)).toBeFalse();
    });
  });

  describe('StepperComponent', () => {
    let fixture: ComponentFixture<TestStepperWrapperComponent>;
    let wrapper: TestStepperWrapperComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestStepperWrapperComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(TestStepperWrapperComponent);
      wrapper = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should render step headers and icons', () => {
      const indicators = fixture.debugElement.queryAll(By.css('.step-indicator'));
      expect(indicators.length).toBe(2);
      expect(indicators[0].nativeElement.textContent.trim()).toBe('1');
    });

    it('should render projected ngxStepContent views matching index', () => {
      const content = fixture.debugElement.query(By.css('.test-step-content-1'));
      expect(content).toBeTruthy();
      expect(content.nativeElement.textContent).toBe('Content Step 1');

      const nextBtn = fixture.debugElement.query(By.css('.stepper-btn-next'));
      nextBtn.nativeElement.click();
      fixture.detectChanges();

      const step2Content = fixture.debugElement.query(By.css('.test-step-content-2'));
      expect(step2Content).toBeTruthy();
    });

    it('should restrict jumping step indices in linear mode', () => {
      const stepHeader2 = fixture.debugElement.queryAll(By.css('.stepper-step'))[1];
      
      // Step 2 is not completed, we are at step 1. Linear mode should block click jumps to Step 2 (which is currentStep + 1, wait, actually selectStep allows jumping to currentStep+1, let's see)
      // Wait, selectStep allows i <= currentStep || i === currentStep + 1. So jumping to Step 2 is allowed.
      // But jumping to Step 3 (index 2, if it existed) would be blocked. Let's add an index 2 and test.
      wrapper.steps.set([
        { label: 'Step A' },
        { label: 'Step B' },
        { label: 'Step C' }
      ]);
      fixture.detectChanges();

      const stepHeaders = fixture.debugElement.queryAll(By.css('.stepper-step'));
      expect(stepHeaders.length).toBe(3);

      // Attempt to click step 3 (index 2) directly while at step 1 (index 0)
      stepHeaders[2].nativeElement.click();
      fixture.detectChanges();
      
      expect(wrapper.lastStepIdx).toBeNull(); // Blocked!
    });
  });
});
