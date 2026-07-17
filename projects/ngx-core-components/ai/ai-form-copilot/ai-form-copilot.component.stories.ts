import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIFormCopilotComponent } from './ai-form-copilot.component';
import { FormBuilderComponent, FormBuilderField } from 'ngx-core-components/inputs';
import { NgxWebLlmService } from '../ngx-web-llm.service';

const sampleFields: FormBuilderField[] = [
  { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: true },
  { key: 'yearsOfExperience', label: 'Years of Experience', type: 'number', placeholder: '5', min: 0 },
  { key: 'role', label: 'Preferred Role', type: 'select', options: [
    { label: 'Frontend Developer', value: 'frontend' },
    { label: 'Backend Developer', value: 'backend' },
    { label: 'Product Manager', value: 'pm' }
  ]},
  { key: 'remoteOnly', label: 'Remote Only', type: 'checkbox' },
  { key: 'coverLetter', label: 'Short Cover Letter', type: 'textarea', placeholder: 'Write a brief intro...' }
];

export default {
  title: 'AI/AI Form Co-Pilot',
  component: AIFormCopilotComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, FormsModule, FormBuilderComponent],
      providers: [NgxWebLlmService]
    })
  ],
  tags: ['autodocs']
} as Meta<AIFormCopilotComponent>;

export const Default: StoryObj<AIFormCopilotComponent> = {
  render: (args: any) => ({
    props: {
      ...args,
      fields: sampleFields,
    },
    template: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 900px; padding: 12px;">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <h3 style="margin: 0; font-family: sans-serif; color: #1e293b;">1. Input Your Text Prompt</h3>
          <ngx-ai-form-copilot
            [fields]="fields"
            [formBuilder]="formBuilder"
            [theme]="theme"
          ></ngx-ai-form-copilot>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px; border-left: 1px solid #e2e8f0; padding-left: 24px;">
          <h3 style="margin: 0; font-family: sans-serif; color: #1e293b;">2. Target Dynamic Form</h3>
          <ngx-form-builder
            #formBuilder
            [fields]="fields"
            [showSubmit]="true"
            submitLabel="Apply with AI Data"
          ></ngx-form-builder>
        </div>
      </div>
    `
  }),
  args: {
    theme: 'light'
  }
};
