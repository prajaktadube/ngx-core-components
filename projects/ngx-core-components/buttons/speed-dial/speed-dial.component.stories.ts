import { SpeedDialComponent } from './speed-dial.component';

const meta = {
  title: 'Inputs & Actions/Buttons & Chips/SpeedDial',
  component: SpeedDialComponent,
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ["top","bottom","left","right"],
    },
    theme: {
      control: 'select',
      options: ["primary","secondary","accent","dark"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    items: [{ id: '1', label: 'Item 1', value: '1' }, { id: '2', label: 'Item 2', value: '2' }],
    icon: '+',
    activeIcon: '✕',
    direction: 'top',
    theme: 'primary',
    showLabels: true,
    closeOnSelect: true,
    collapseOnLeaveMouse: true,
  },
};
