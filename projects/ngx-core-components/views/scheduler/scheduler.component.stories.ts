import { SchedulerComponent } from './scheduler.component';

const meta = {
  title: 'Data Presentation/Scheduler Planner/Scheduler',
  component: SchedulerComponent,
  tags: ['autodocs'],
  argTypes: {
    viewMode: {
      control: 'select',
      options: ["day","week","month"],
    },
    theme: {
      control: 'select',
      options: ["light","dark"],
    },
    weekStartsOn: {
      control: 'select',
      options: ["0","1","2","3","4","5","6"],
    },
    timeZone: {
      control: 'select',
      options: ["string","undefined"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    events: null,
    currentDate: new Date(),
    viewMode: 'week',
    theme: 'light',
    businessHoursStart: 8,
    businessHoursEnd: 20,
    weekStartsOn: 0,
    timeZone: null,
    slotMinutes: 60,
    resources: null,
    enableDragToCreate: true,
    showSearch: true,
    showWorkHoursOnly: true,
  },
};
