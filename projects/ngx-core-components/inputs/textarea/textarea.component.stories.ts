import { TextareaComponent } from './textarea.component';

const meta = {
  title: 'Inputs & Actions/Form Inputs/Textarea',
  component: TextareaComponent,
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
    placeholder: '',
    rows: 4,
    maxlength: 0,
    disabled: false,
    autoResize: false,
    hint: '',
    error: '',
    status: 'default',
  },
};
