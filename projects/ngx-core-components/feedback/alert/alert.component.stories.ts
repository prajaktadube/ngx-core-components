import type { Meta, StoryObj } from '@storybook/angular';
import { AlertComponent } from './alert.component';

const meta: Meta<AlertComponent> = {
  title: 'Feedback/Feedback & Progress/Alert',
  component: AlertComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    title: { control: 'text' },
    message: { control: 'text' },
    dismissible: { control: 'boolean' },
    actionLabel: { control: 'text' },
    theme: {
      control: 'select',
      options: ['light', 'dark'],
    },
  },
};

export default meta;
type Story = StoryObj<AlertComponent>;

export const Default: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    message: 'This is an informational alert to bring something to your attention.',
    dismissible: true,
    actionLabel: '',
    theme: 'light',
  },
};

export const SuccessAlert: Story = {
  args: {
    ...Default.args,
    variant: 'success',
    title: 'Success!',
    message: 'Your changes have been saved successfully.',
  },
};

export const WarningAlert: Story = {
  args: {
    ...Default.args,
    variant: 'warning',
    title: 'Warning',
    message: 'Your session will expire in 5 minutes. Please save your work.',
  },
};

export const ErrorAlert: Story = {
  args: {
    ...Default.args,
    variant: 'error',
    title: 'Error',
    message: 'Failed to connect to the server. Please check your network connection.',
  },
};

export const WithActionButton: Story = {
  args: {
    ...Default.args,
    variant: 'warning',
    title: 'Update Available',
    message: 'A new version is available. Update now to get the latest features.',
    actionLabel: 'Update Now',
  },
};

export const NonDismissible: Story = {
  args: {
    ...Default.args,
    variant: 'error',
    title: 'Critical Error',
    message: 'This alert cannot be dismissed. Action is required to resolve the issue.',
    dismissible: false,
  },
};

export const MessageOnly: Story = {
  args: {
    ...Default.args,
    title: '',
    message: 'A simple alert message without a title.',
    variant: 'info',
  },
};

export const DarkThemeInfo: Story = {
  args: {
    ...Default.args,
    theme: 'dark',
    variant: 'info',
    title: 'Dark Mode Alert',
    message: 'This alert uses the dark theme variant.',
  },
};

export const DarkThemeError: Story = {
  args: {
    ...Default.args,
    theme: 'dark',
    variant: 'error',
    title: 'Connection Lost',
    message: 'Unable to reach the API endpoint. Retrying in 30 seconds...',
    actionLabel: 'Retry Now',
  },
};

export const DarkThemeSuccess: Story = {
  args: {
    ...Default.args,
    theme: 'dark',
    variant: 'success',
    title: 'Deployment Complete',
    message: 'Your application has been deployed to production.',
  },
};

export const WithProjectedContent: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-alert [variant]="variant" [title]="title" [dismissible]="dismissible" [theme]="theme">
        <p style="margin: 0;">Custom HTML content with <strong>bold text</strong> and a <a href="#" style="color: inherit; text-decoration: underline;">link</a>.</p>
      </ngx-alert>
    `,
  }),
  args: {
    variant: 'info',
    title: 'Rich Content',
    dismissible: true,
    theme: 'light',
  },
};
