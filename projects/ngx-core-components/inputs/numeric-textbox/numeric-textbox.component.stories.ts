import { NumericTextBoxComponent } from './numeric-textbox.component';

const meta = {
  title: 'Inputs & Actions/Form Inputs/NumericTextBox',
  component: NumericTextBoxComponent,
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
    value: 0,
    min: null,
    max: null,
    step: 1,
    disabled: false,
    placeholder: '',
    prefix: '',
    suffix: '',
    status: 'default',
    error: '',
    hint: '',
  },
};
