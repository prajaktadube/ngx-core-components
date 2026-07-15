import type { Meta, StoryObj } from '@storybook/angular';
import { DropdownComponent, DropdownOption } from './dropdown.component';

const sampleOptions: DropdownOption[] = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3 (Disabled)', value: 'opt3', disabled: true },
  { label: 'Option 4', value: 'opt4' },
];

const meta: Meta<DropdownComponent> = {
  title: 'Inputs & Actions/Form Inputs/Dropdown',
  component: DropdownComponent,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    filterable: { control: 'boolean' },
    required: { control: 'boolean' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    hint: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<DropdownComponent>;

export const Default: Story = {
  args: {
    options: sampleOptions,
    label: 'Select Option',
    placeholder: 'Choose one...',
    disabled: false,
    filterable: false,
    required: false,
    error: '',
    hint: 'Choose your preferred option from the list',
  },
};

export const Filterable: Story = {
  args: {
    ...Default.args,
    filterable: true,
    hint: 'Type in the search field to filter options',
  },
};

export const Required: Story = {
  args: {
    ...Default.args,
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const ErrorState: Story = {
  args: {
    ...Default.args,
    error: 'Please select a valid option',
  },
};
