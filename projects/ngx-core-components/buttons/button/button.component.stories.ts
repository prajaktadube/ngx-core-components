import { ButtonComponent } from './button.component';

const meta = {
  title: 'Inputs & Actions/Buttons & Chips/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ["button","submit","reset"],
    },
    badge: {
      control: 'select',
      options: ["string","number"],
    },
    badgePosition: {
      control: 'select',
      options: ["top-right","inline"],
    },
    badgeVariant: {
      control: 'select',
      options: ["danger","warning","info","success"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    variant: 'primary',
    size: 'md',
    shape: 'rectangle',
    type: 'button',
    disabled: false,
    loading: false,
    prefixIcon: '',
    suffixIcon: '',
    ariaLabel: '',
    ripple: true,
    fullWidth: false,
    selected: false,
    badge: '',
    badgePosition: 'top-right',
    badgeVariant: 'danger',
  },
};
