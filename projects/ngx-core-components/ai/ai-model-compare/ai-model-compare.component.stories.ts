import { AIModelCompareComponent } from './ai-model-compare.component';

const meta = {
  title: 'Intelligence/AI Chat & Agent Console/AIModelCompare',
  component: AIModelCompareComponent,
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ["light","dark"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    models: null,
    theme: 'light',
  },
};
