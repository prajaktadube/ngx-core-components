import type { Meta, StoryObj } from '@storybook/angular';
import { SwitchComponent } from './switch.component';

const meta: Meta<SwitchComponent> = {
  title: 'Inputs/Switch',
  component: SwitchComponent,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    status: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
    },
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<SwitchComponent>;

export const Default: Story = {
  args: {
    checked: false,
    onLabel: 'On',
    offLabel: 'Off',
    size: 'md',
    disabled: false,
    status: 'default',
    error: '',
    hint: 'Toggle to enable settings',
  },
};

export const Checked: Story = {
  args: {
    ...Default.args,
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const Success: Story = {
  args: {
    ...Default.args,
    status: 'success',
    checked: true,
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    status: 'error',
    error: 'This field is required',
  },
};
