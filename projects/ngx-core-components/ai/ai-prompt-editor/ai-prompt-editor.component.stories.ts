import { AIPromptEditorComponent } from './ai-prompt-editor.component';

const meta = {
  title: 'Intelligence/AI Chat & Agent Console/AIPromptEditor',
  component: AIPromptEditorComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    initialTemplate: 'Write a greeting letter to {{user_name}} recommending dynamic integrations for {{product_name}}.',
    initialSystem: 'You are an encouraging and helpful product specialist.',
  },
};
