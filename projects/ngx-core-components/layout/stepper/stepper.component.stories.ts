import { StepperComponent, NgxStepContentDirective } from './stepper.component';
import { moduleMetadata } from '@storybook/angular';

const meta = {
  title: 'Layout & Overlays/Layout & Containers/Stepper',
  component: StepperComponent,
  decorators: [
    moduleMetadata({
      imports: [StepperComponent, NgxStepContentDirective]
    })
  ],
  tags: ['autodocs'],
};

export default meta;

const defaultSteps = [
  { label: 'Choose Plan', description: 'Select subscription tier', optional: false },
  { label: 'Developer Details', description: 'Configure profile data', optional: false },
  { label: 'Payment Settings', description: 'Add a credit card', optional: true },
  { label: 'Confirm Sign-up', description: 'Review summary details', optional: false }
];

export const Default = {
  render: (args: any) => ({
    props: args,
    template: `
      <div style="padding: 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <ngx-stepper 
          [steps]="steps" 
          [orientation]="orientation" 
          [showContent]="showContent" 
          [showActions]="showActions" 
          [linear]="linear"
        >
          <!-- Using template projection for step content -->
          <ng-template [ngxStepContent]="0">
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #1e293b;">Choose Your Developer Plan</h4>
              <p style="margin: 0; color: #64748b; font-size: 13px;">Please select from our Developer, Team, or Enterprise cloud hosting tiers.</p>
            </div>
          </ng-template>
          <ng-template [ngxStepContent]="1">
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #1e293b;">Provide Developer Details</h4>
              <p style="margin: 0; color: #64748b; font-size: 13px;">Enter your GitHub username, workspace name, and region preferences.</p>
            </div>
          </ng-template>
          <ng-template [ngxStepContent]="2">
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #1e293b;">Payment Credentials</h4>
              <p style="margin: 0; color: #64748b; font-size: 13px;">Add a credit card or link your PayPal credentials. You can skip this optional step.</p>
            </div>
          </ng-template>
          <ng-template [ngxStepContent]="3">
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #1e293b;">Confirm Sign-up Summary</h4>
              <p style="margin: 0; color: #64748b; font-size: 13px;">Click Finish to launch your developer cloud cluster instances.</p>
            </div>
          </ng-template>
        </ngx-stepper>
      </div>
    `
  }),
  args: {
    steps: defaultSteps,
    orientation: 'horizontal',
    showContent: true,
    showActions: true,
    linear: true
  }
};

export const VerticalStepper = {
  ...Default,
  args: {
    ...Default.args,
    orientation: 'vertical'
  }
};
