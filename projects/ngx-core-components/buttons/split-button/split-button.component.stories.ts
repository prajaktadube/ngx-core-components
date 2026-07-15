import { SplitButtonComponent } from './split-button.component';

const meta = {
  title: 'Inputs & Actions/Buttons & Chips/SplitButton',
  component: SplitButtonComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    items: [{ id: '1', label: 'Item 1', value: '1' }, { id: '2', label: 'Item 2', value: '2' }],
  },
};
