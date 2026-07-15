import { RadioGroupComponent } from './radio-group.component';

const meta = {
  title: 'Inputs & Actions/Form Inputs/RadioGroup',
  component: RadioGroupComponent,
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
    options: null,
    label: '',
    value: null,
    disabled: false,
    inline: false,
    status: 'default',
    error: '',
    hint: '',
  },
};
