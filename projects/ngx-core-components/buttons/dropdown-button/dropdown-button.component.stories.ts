import { DropDownButtonComponent } from './dropdown-button.component';

const meta = {
  title: 'Inputs & Actions/Buttons & Chips/DropDownButton',
  component: DropDownButtonComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    variant: 'secondary',
    size: 'md',
    disabled: false,
    items: [{ id: '1', label: 'Item 1', value: '1' }, { id: '2', label: 'Item 2', value: '2' }],
  },
};
