import type { Meta, StoryObj } from '@storybook/angular';
import { AutocompleteComponent } from './autocomplete.component';
import { DropdownOption } from '../dropdown/dropdown.component';

const sampleOptions: DropdownOption[] = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
];

const meta: Meta<AutocompleteComponent> = {
  title: 'Inputs & Actions/Form Inputs/Autocomplete',
  component: AutocompleteComponent,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    minLength: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<AutocompleteComponent>;

export const Default: Story = {
  args: {
    options: sampleOptions,
    label: 'Search US States',
    placeholder: 'Type state name...',
    disabled: false,
    error: '',
    minLength: 1,
  },
};

export const MinLengthTwo: Story = {
  args: {
    ...Default.args,
    minLength: 2,
    placeholder: 'Type at least 2 characters...',
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
    error: 'This state is not supported.',
  },
};
