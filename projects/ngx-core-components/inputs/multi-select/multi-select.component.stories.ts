import { MultiSelectComponent } from './multi-select.component';

const meta = {
  title: 'Inputs & Actions/Form Inputs/MultiSelect',
  component: MultiSelectComponent,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'select',
      options: ["string","null"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    options: null,
    values: null,
    label: '',
    placeholder: 'Sample placeholder',
    disabled: false,
    filterable: false,
    maxTags: Infinity,
  },
};
