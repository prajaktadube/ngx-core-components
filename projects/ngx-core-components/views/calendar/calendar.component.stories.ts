import { CalendarComponent } from './calendar.component';

const meta = {
  title: 'Data Presentation/Interactive Calendar/Calendar',
  component: CalendarComponent,
  tags: ['autodocs'],
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ["single","range"],
    },
    min: {
      control: 'select',
      options: ["Date","string","null"],
    },
    max: {
      control: 'select',
      options: ["Date","string","null"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    events: null,
    readonly: false,
    selectionMode: 'single',
    min: null,
    max: null,
  },
};
