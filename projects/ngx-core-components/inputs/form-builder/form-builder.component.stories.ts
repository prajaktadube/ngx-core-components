import type { Meta, StoryObj } from '@storybook/angular';
import { FormBuilderComponent, type FormBuilderField } from './form-builder.component';

const contactFields: FormBuilderField[] = [
  {
    key: 'fullName',
    label: 'Full Name',
    type: 'text',
    placeholder: 'John Doe',
    required: true
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'john.doe@example.com',
    required: true
  },
  {
    key: 'messageType',
    label: 'Message Category',
    type: 'select',
    required: true,
    options: [
      { label: 'Support Request', value: 'support' },
      { label: 'Sales Inquiry', value: 'sales' },
      { label: 'General Feedback', value: 'feedback' }
    ]
  },
  {
    key: 'message',
    label: 'Your Message',
    type: 'textarea',
    placeholder: 'Type your query here...',
    required: true
  },
  {
    key: 'subscribe',
    label: 'Subscribe to our monthly developer newsletter',
    type: 'checkbox',
    value: true
  }
];

const loginFields: FormBuilderField[] = [
  {
    key: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'dev_ninja',
    required: true
  },
  {
    key: 'password',
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    required: true
  }
];

const meta: Meta<FormBuilderComponent> = {
  title: 'Inputs & Actions/Form Inputs/FormBuilder',
  component: FormBuilderComponent,
  tags: ['autodocs'],
  argTypes: {
    fields: {
      control: 'object',
      description: 'The schema defining form fields and options'
    },
    value: {
      control: 'object',
      description: 'Initial values of form controls'
    },
    showSubmit: {
      control: 'boolean',
      description: 'Controls visibility of the submit action button'
    },
    submitLabel: {
      control: 'text',
      description: 'Custom text label for the primary submit action'
    }
  }
};

export default meta;
type Story = StoryObj<FormBuilderComponent>;

export const ContactForm: Story = {
  args: {
    fields: contactFields,
    value: {},
    showSubmit: true,
    submitLabel: 'Send Message'
  }
};

export const LoginForm: Story = {
  args: {
    fields: loginFields,
    value: {},
    showSubmit: true,
    submitLabel: 'Log In'
  }
};

export const PrepopulatedForm: Story = {
  args: {
    fields: contactFields,
    value: {
      fullName: 'Antigravity AI',
      email: 'antigravity@deepmind.google',
      messageType: 'feedback',
      message: 'Pair programming session is going fantastic! The visual hierarchy of Storybook looks stellar.',
      subscribe: true
    },
    showSubmit: true,
    submitLabel: 'Save Changes'
  }
};

export const DisabledForm: Story = {
  args: {
    fields: contactFields.map(f => ({ ...f, disabled: true })),
    value: {
      fullName: 'Jane Doe',
      email: 'jane@acme.com',
      messageType: 'support',
      message: 'Form in readonly state.',
      subscribe: false
    },
    showSubmit: false
  }
};
