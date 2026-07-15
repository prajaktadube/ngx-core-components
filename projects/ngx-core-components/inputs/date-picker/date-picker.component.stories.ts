import type { Meta, StoryObj } from '@storybook/angular';
import { DatePickerComponent } from './date-picker.component';

const meta: Meta<DatePickerComponent> = {
  title: 'Inputs & Actions/Form Inputs/DatePicker',
  component: DatePickerComponent,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    format: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<DatePickerComponent>;

export const Default: Story = {
  args: {
    label: 'Birth Date',
    placeholder: 'Select your birth date...',
    disabled: false,
    format: 'MM/dd/yyyy',
  },
};

export const SelectedDate: Story = {
  args: {
    ...Default.args,
    value: new Date(2026, 6, 14), // July 14, 2026
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const MinMaxLimits: Story = {
  args: {
    ...Default.args,
    min: new Date(2026, 6, 10),
    max: new Date(2026, 6, 25),
    value: new Date(2026, 6, 14),
  },
};
