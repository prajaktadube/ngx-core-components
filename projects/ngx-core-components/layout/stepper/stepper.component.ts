import { Component, input, output, signal, contentChildren, TemplateRef, inject, Directive } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface StepperStep {
  label: string;
  description?: string;
  icon?: string;
  optional?: boolean;
  state?: 'pending' | 'current' | 'complete' | 'error';
}

@Directive({
  selector: '[ngxStepContent]',
  standalone: true
})
export class NgxStepContentDirective {
  stepIndex = input.required<number | string>({ alias: 'ngxStepContent' });
  templateRef = inject(TemplateRef);
}

@Component({
  selector: 'ngx-stepper',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="ngx-stepper" [class.stepper-vertical]="orientation() === 'vertical'">
      @for (step of steps(); track step.label; let i = $index) {
        <div 
          class="stepper-step" 
          [class.completed]="i < currentStep()" 
          [class.active]="i === currentStep()" 
          [class.error]="step.state === 'error'"
          (click)="selectStep(i)"
        >
          <div class="step-header">
            <div class="step-indicator">
              @if (i < currentStep()) {
                <span class="step-check">✓</span>
              } @else if (step.state === 'error') {
                <span class="step-error-icon">✕</span>
              } @else {
                <span class="step-number">{{ i + 1 }}</span>
              }
            </div>
            @if (i < steps().length - 1) {
              <div class="step-connector">
                <div class="step-connector-fill" [class.filled]="i < currentStep()"></div>
              </div>
            }
          </div>
          <div class="step-content">
            <div class="step-label">{{ step.label }}</div>
            @if (step.description) { <div class="step-desc">{{ step.description }}</div> }
            @if (step.optional) { <div class="step-optional">Optional</div> }
          </div>
        </div>
      }
    </div>
    @if (showContent()) {
      <div class="stepper-content">
        @if (resolveStepTemplate(currentStep()); as activeTpl) {
          <ng-container *ngTemplateOutlet="activeTpl" />
        } @else {
          <ng-content />
        }
      </div>
      @if (showActions()) {
        <div class="stepper-actions">
          <button class="stepper-btn stepper-btn-back" [disabled]="currentStep() === 0" (click)="back()">← Back</button>
          <button class="stepper-btn stepper-btn-next" [disabled]="currentStep() === steps().length - 1" (click)="next()">
            {{ currentStep() === steps().length - 1 ? 'Finish' : 'Next →' }}
          </button>
        </div>
      }
    }
  `,
  styles: [`
    :host { display: block; }
    .ngx-stepper { display: flex; align-items: flex-start; gap: 0; }
    .ngx-stepper.stepper-vertical { flex-direction: column; }
    
    .stepper-step { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      flex: 1; 
      cursor: pointer;
      user-select: none;
    }
    .stepper-vertical .stepper-step { flex-direction: row; flex: initial; align-items: flex-start; width: 100%; }
    
    .step-header { display: flex; align-items: center; flex-direction: column; width: 100%; position: relative; }
    .stepper-vertical .step-header { flex-direction: column; align-items: center; margin-right: 14px; flex-shrink: 0; width: 32px; }
    
    .step-indicator {
      width: 32px; 
      height: 32px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      background: var(--ngx-stepper-pending-bg, var(--bg-secondary, #f8fafc)); 
      color: var(--ngx-stepper-pending-color, var(--text-secondary, #94a3b8));
      border: 2px solid var(--ngx-stepper-pending-border, var(--border-color, #e2e8f0)); 
      font-size: 13px; 
      font-weight: 700;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
      flex-shrink: 0; 
      z-index: 1;
    }
    
    .active .step-indicator { 
      background: var(--ngx-stepper-active-bg, var(--primary-color, #1a73e8)); 
      color: #fff; 
      border-color: var(--ngx-stepper-active-bg, var(--primary-color, #1a73e8)); 
      transform: scale(1.1);
      box-shadow: 0 4px 10px rgba(26, 115, 232, 0.2);
    }
    .completed .step-indicator { 
      background: var(--ngx-stepper-complete-bg, var(--success-color, #10b981)); 
      color: #fff; 
      border-color: var(--ngx-stepper-complete-bg, var(--success-color, #10b981)); 
    }
    .error .step-indicator { 
      background: var(--ngx-stepper-error-bg, var(--error-color, #ef4444)); 
      color: #fff; 
      border-color: var(--ngx-stepper-error-bg, var(--error-color, #ef4444)); 
    }
    
    .step-check, .step-error-icon {
      font-size: 14px;
      font-weight: 800;
    }

    .step-connector { 
      flex: 1; 
      height: 3px; 
      background: var(--ngx-stepper-line, var(--border-color, #e2e8f0)); 
      width: 100%; 
      margin: 16px 0 0; 
      position: absolute;
      left: calc(50% + 16px);
      right: calc(-50% + 16px);
      z-index: 0;
      overflow: hidden;
    }
    .stepper-vertical .step-connector { 
      width: 3px; 
      height: 32px; 
      margin: 0; 
      position: relative;
      left: 0;
      top: 4px;
      bottom: 4px;
    }
    
    .step-connector-fill {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 100%;
      background: var(--ngx-stepper-complete-bg, var(--success-color, #10b981));
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .stepper-vertical .step-connector-fill {
      width: 100%;
      height: 0;
      transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .step-connector-fill.filled {
      width: 100%;
    }
    .stepper-vertical .step-connector-fill.filled {
      height: 100%;
    }

    .step-content { text-align: center; padding: 8px 4px 0; }
    .stepper-vertical .step-content { text-align: left; padding: 4px 0 24px; }
    
    .step-label { 
      font-size: 13px; 
      font-weight: 600; 
      color: var(--ngx-stepper-label, var(--text-primary, #0f172a)); 
      transition: color 0.2s ease;
    }
    .active .step-label { color: var(--ngx-stepper-active-bg, var(--primary-color, #1a73e8)); }
    .step-desc { font-size: 11px; color: var(--text-secondary, #64748b); margin-top: 2px; }
    .step-optional { font-size: 10px; color: var(--text-secondary, #94a3b8); font-style: italic; margin-top: 2px; }
    
    .stepper-content { 
      padding: 24px; 
      background: var(--bg-secondary, #f8fafc);
      border-radius: 12px;
      border: 1px dashed var(--border-color, #e2e8f0); 
      margin-top: 20px; 
      min-height: 80px;
    }
    .stepper-actions { display: flex; gap: 10px; margin-top: 16px; justify-content: flex-end; }
    
    .stepper-btn { 
      padding: 8px 18px; 
      font-size: 13px; 
      font-weight: 600; 
      border-radius: 8px; 
      cursor: pointer; 
      font-family: inherit; 
      transition: all 0.2s;
    }
    .stepper-btn-back { 
      background: var(--bg-primary, #ffffff); 
      color: var(--text-secondary, #475569); 
      border: 1px solid var(--border-color, #cbd5e1); 
    }
    .stepper-btn-back:hover:not(:disabled) { 
      background: var(--bg-secondary, #f1f5f9); 
    }
    .stepper-btn-next { 
      background: var(--primary-color, #1a73e8); 
      color: #fff; 
      border: 1px solid var(--primary-color, #1a73e8); 
    }
    .stepper-btn-next:hover:not(:disabled) { 
      background: var(--ngx-btn-primary-hover, #1557b0); 
    }
    .stepper-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  `]
})
export class StepperComponent {
  steps = input<StepperStep[]>([]);
  currentStep = signal(0);
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  showContent = input(true);
  showActions = input(true);
  linear = input(true);

  stepTemplates = contentChildren(NgxStepContentDirective);
  stepChange = output<number>();

  next() { 
    if (this.currentStep() < this.steps().length - 1) { 
      this.currentStep.update(v => v + 1); 
      this.stepChange.emit(this.currentStep()); 
    } 
  }
  
  back() { 
    if (this.currentStep() > 0) { 
      this.currentStep.update(v => v - 1); 
      this.stepChange.emit(this.currentStep()); 
    } 
  }

  selectStep(index: number) {
    if (index === this.currentStep()) return;
    
    const step = this.steps()[index];
    if (!step) return;
    
    if (this.linear()) {
      const current = this.currentStep();
      // Allow moving back to any previous step, or moving forward exactly to the next step
      if (index <= current || index === current + 1) {
        this.currentStep.set(index);
        this.stepChange.emit(index);
      }
    } else {
      this.currentStep.set(index);
      this.stepChange.emit(index);
    }
  }

  resolveStepTemplate(index: number): TemplateRef<any> | null {
    const match = this.stepTemplates().find(t => Number(t.stepIndex()) === index);
    return match ? match.templateRef : null;
  }
}
