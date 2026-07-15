import { AIChatWidgetComponent } from './ai-chat-widget.component';

const meta = {
  title: 'Intelligence/AI Chat & Agent Console/AIChatWidget',
  component: AIChatWidgetComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    agentName: 'AI Assistant',
    icon: '💬',
    placeholder: 'Type a message...',
    welcomeMessage: 'Hi! How can I help you today?',
    quickReplies: null,
  },
};
