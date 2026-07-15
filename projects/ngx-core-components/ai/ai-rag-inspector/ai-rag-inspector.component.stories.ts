import { AIRagInspectorComponent } from './ai-rag-inspector.component';

const meta = {
  title: 'Intelligence/AI Chat & Agent Console/AIRagInspector',
  component: AIRagInspectorComponent,
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
    sources: null,
    title: 'Search Citations & Sources',
    theme: 'light',
  },
};
