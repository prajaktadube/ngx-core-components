import { SegmentedControlComponent } from './segmented-control.component';

const meta = {
  title: 'Inputs & Actions/Segmented Control/SegmentedControl',
  component: SegmentedControlComponent,
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ["light","dark"],
    },
    variant: {
      control: 'select',
      options: ["default","primary","success","danger","warning","info"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    options: null,
    disabled: false,
    theme: 'light',
    variant: 'default',
    id: 'ngx-segmented-' + Math.random().toString(36).substring(2, 9),
  },
};
