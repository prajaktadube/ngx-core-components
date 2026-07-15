import { TimePickerComponent } from './time-picker.component';

const meta = {
  title: 'Inputs & Actions/Form Inputs/TimePicker',
  component: TimePickerComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    label: '',
    use12h: false,
    value: '09:00',
  },
};
