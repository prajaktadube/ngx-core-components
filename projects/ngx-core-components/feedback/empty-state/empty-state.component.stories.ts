import { EmptyStateComponent } from './empty-state.component';

const meta = {
  title: 'Feedback/Empty State Placeholders/EmptyState',
  component: EmptyStateComponent,
  tags: ['autodocs'],
  argTypes: {
    illustration: {
      control: 'select',
      options: ["search","data","chat","error","none"],
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
    title: 'Sample title',
    description: '',
    illustration: 'data',
    primaryActionText: '',
    secondaryActionText: '',
    theme: 'light',
    id: 'ngx-empty-state-' + Math.random().toString(36).substring(2, 9),
  },
};
