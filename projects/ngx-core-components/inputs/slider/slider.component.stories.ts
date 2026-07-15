import { SliderComponent } from './slider.component';

const meta = {
  title: 'Inputs & Actions/Form Inputs/Slider',
  component: SliderComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    label: '',
    min: 0,
    max: 100,
    step: 1,
    range: false,
    disabled: false,
    showValue: true,
    showTicks: false,
    initialValue: 0,
    initialLow: 20,
    initialHigh: 80,
  },
};
