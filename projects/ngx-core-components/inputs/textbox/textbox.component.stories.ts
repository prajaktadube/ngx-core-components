import { TextBoxComponent } from './textbox.component';

const meta = {
  title: 'Inputs & Actions/Form Inputs/TextBox',
  component: TextBoxComponent,
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
    value: '',
    label: '',
    placeholder: '',
    type: 'text',
    disabled: false,
    readonly: false,
    error: '',
    hint: '',
    maxlength: 0,
    clearable: false,
    showCharCount: false,
    prefixIcon: '',
    suffixIcon: '',
    passwordToggle: false,
    status: 'default',
  },
};
