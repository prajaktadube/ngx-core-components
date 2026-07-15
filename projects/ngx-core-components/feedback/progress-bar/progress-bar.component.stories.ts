import type { Meta, StoryObj } from '@storybook/angular';
import { ProgressBarComponent } from './progress-bar.component';

const meta: Meta<ProgressBarComponent> = {
  title: 'Feedback/Feedback & Progress/ProgressBar',
  component: ProgressBarComponent,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    min: { control: 'number' },
    max: { control: 'number' },
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['primary', 'success', 'danger', 'warning', 'info'],
    },
    height: { control: { type: 'range', min: 4, max: 24, step: 1 } },
    showValue: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<ProgressBarComponent>;

export const Default: Story = {
  args: {
    value: 45,
    min: 0,
    max: 100,
    label: '',
    variant: 'primary',
    height: 8,
    showValue: false,
    indeterminate: false,
  },
};

export const WithLabel: Story = {
  args: {
    ...Default.args,
    value: 65,
    label: 'Upload Progress',
    showValue: true,
  },
};

export const SuccessComplete: Story = {
  args: {
    ...Default.args,
    value: 100,
    variant: 'success',
    label: 'Download Complete',
    showValue: true,
  },
};

export const DangerLow: Story = {
  args: {
    ...Default.args,
    value: 15,
    variant: 'danger',
    label: 'Disk Space Remaining',
    showValue: true,
  },
};

export const WarningProgress: Story = {
  args: {
    ...Default.args,
    value: 78,
    variant: 'warning',
    label: 'Memory Usage',
    showValue: true,
  },
};

export const InfoProgress: Story = {
  args: {
    ...Default.args,
    value: 50,
    variant: 'info',
    label: 'Processing',
    showValue: true,
  },
};

export const Indeterminate: Story = {
  args: {
    ...Default.args,
    indeterminate: true,
    variant: 'primary',
    label: 'Loading...',
  },
};

export const IndeterminateDanger: Story = {
  args: {
    ...Default.args,
    indeterminate: true,
    variant: 'danger',
    label: 'Retrying connection...',
  },
};

export const ThinBar: Story = {
  args: {
    ...Default.args,
    value: 70,
    height: 4,
    variant: 'primary',
  },
};

export const ThickBar: Story = {
  args: {
    ...Default.args,
    value: 55,
    height: 20,
    variant: 'success',
    label: 'Installation',
    showValue: true,
  },
};

export const CustomRange: Story = {
  args: {
    ...Default.args,
    value: 350,
    min: 0,
    max: 500,
    variant: 'info',
    label: 'Score: 350 / 500',
    showValue: true,
  },
};
