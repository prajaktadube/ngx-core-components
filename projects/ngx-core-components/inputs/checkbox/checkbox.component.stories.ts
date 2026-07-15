import { CheckboxComponent } from './checkbox.component';

const meta = {
  title: 'Inputs & Actions/Form Inputs/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ["default","success","warning","error"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    label: '',
    checked: false,
    disabled: false,
    indeterminate: false,
    status: 'default',
    error: '',
    hint: '',
  },
};
