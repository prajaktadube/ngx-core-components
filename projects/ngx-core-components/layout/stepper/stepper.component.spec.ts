import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperComponent, NgxStepContentDirective } from './stepper.component';
import { Component } from '@angular/core';

@Component({
  template: `
    <ngx-stepper [steps]="steps" [linear]="linear">
      <ng-template [ngxStepContent]="0">
        <p class="content-step-0">Step 0 Panel</p>
      </ng-template>
      <ng-template [ngxStepContent]="1">
        <p class="content-step-1">Step 1 Panel</p>
      </ng-template>
    </ngx-stepper>
  `,
  imports: [StepperComponent, NgxStepContentDirective]
})
class TestHostComponent {
  steps = [
    { label: 'Start', description: 'Begin process' },
    { label: 'Confirm', description: 'Confirm choices' },
    { label: 'Finished', optional: true }
  ];
  linear = true;
}

describe('StepperComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let stepperComponent: StepperComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
    
    const stepperEl = hostFixture.debugElement.query(el => el.componentInstance instanceof StepperComponent);
    stepperComponent = stepperEl.componentInstance;
  });

  it('should render correct steps count and labels', () => {
    const stepsElements = hostFixture.nativeElement.querySelectorAll('.stepper-step');
    expect(stepsElements.length).toBe(3);
    expect(stepsElements[0].textContent).toContain('Start');
    expect(stepsElements[0].textContent).toContain('Begin process');
    expect(stepsElements[2].textContent).toContain('Optional');
  });

  it('should start at step 0 and render step 0 template', () => {
    expect(stepperComponent.currentStep()).toBe(0);
    const contentEl = hostFixture.nativeElement.querySelector('.content-step-0');
    expect(contentEl).toBeTruthy();
  });

  it('should navigate forward and backward using back/next buttons', () => {
    const nextBtn = hostFixture.nativeElement.querySelector('.stepper-btn-next');
    const backBtn = hostFixture.nativeElement.querySelector('.stepper-btn-back');

    expect(backBtn.disabled).toBe(true); // Back button is disabled at start

    nextBtn.click();
    hostFixture.detectChanges();

    expect(stepperComponent.currentStep()).toBe(1);
    expect(hostFixture.nativeElement.querySelector('.content-step-1')).toBeTruthy();

    backBtn.click();
    hostFixture.detectChanges();

    expect(stepperComponent.currentStep()).toBe(0);
  });

  it('should respect linear mode constraints', () => {
    const stepsElements = hostFixture.nativeElement.querySelectorAll('.stepper-step');

    // Attempting to jump directly to step 2 in linear mode
    stepsElements[2].click();
    hostFixture.detectChanges();

    // Should NOT allow jumping to step 2 directly (remains at step 0)
    expect(stepperComponent.currentStep()).toBe(0);

    // Disable linear mode
    hostComponent.linear = false;
    hostFixture.detectChanges();

    stepsElements[2].click();
    hostFixture.detectChanges();

    expect(stepperComponent.currentStep()).toBe(2);
  });
});
