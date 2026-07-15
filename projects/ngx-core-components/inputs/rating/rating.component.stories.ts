import { RatingComponent } from './rating.component';

const meta = {
  title: 'Inputs & Actions/Form Inputs/Rating',
  component: RatingComponent,
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
    max: 5,
    label: '',
    readonly: false,
    showValue: false,
    status: 'default',
    error: '',
    hint: '',
  },
};
