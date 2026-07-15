import { CountdownComponent } from './countdown.component';

const meta = {
  title: 'Feedback/Countdown Timer/Countdown',
  component: CountdownComponent,
  tags: ['autodocs'],
  argTypes: {
    targetDate: {
      control: 'select',
      options: ["string","Date","null"],
    },
    duration: {
      control: 'select',
      options: ["number","null"],
    },
    theme: {
      control: 'select',
      options: ["light","dark"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    targetDate: null,
    duration: null,
    showRing: true,
    ringColor: '',
    theme: 'light',
    variant: 'default',
    autoStart: true,
    showControls: true,
    compactOnly: false,
    forceShowDays: false,
    id: 'ngx-countdown-' + Math.random().toString(36).substring(2, 9),
  },
};
