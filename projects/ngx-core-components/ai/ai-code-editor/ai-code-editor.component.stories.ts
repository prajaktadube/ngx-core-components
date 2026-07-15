import { AICodeEditorComponent } from './ai-code-editor.component';

const meta = {
  title: 'Intelligence/AI Chat & Agent Console/AICodeEditor',
  component: AICodeEditorComponent,
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
    code: '',
    suggestion: '',
    suggestions: null,
    language: 'typescript',
    theme: 'light',
    disabled: false,
    explanation: '',
  },
};
