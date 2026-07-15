import type { Meta, StoryObj } from '@storybook/angular';
import { AIChatComponent } from './ai-chat.component';
import { AIMessage, QuickReply } from './models';

const sampleQuickReplies: QuickReply[] = [
  { label: 'Analyze codebase', value: 'analyze_code', icon: '🔍' },
  { label: 'Check system health', value: 'system_health', icon: '⚡' },
  { label: 'Generate chart code', value: 'gen_chart', icon: '📊' },
];

const sampleMessages: AIMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    content: `Hello! I am your AI Development Assistant. How can I help you improve your **ngx-core-components** library today?`,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    senderName: 'Antigravity AI'
  },
  {
    id: 'm2',
    role: 'user',
    content: `Let's optimize the DataGrid bundle size. What are the main culprits?`,
    timestamp: new Date(Date.now() - 1000 * 60 * 4)
  },
  {
    id: 'm3',
    role: 'assistant',
    content: `I scanned the compiled bundles. The primary size drivers are the heavy dynamic exports (PDF, Excel, CSV) embedded directly inside the template file. 

I suggest extracting the export logic into a standalone lazy-loadable service: \`GridExportService\`.`,
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    senderName: 'Antigravity AI',
    steps: [
      {
        id: 's1',
        name: 'Parsing AST of data-grid.component.ts',
        status: 'success',
        duration: '120ms',
        input: 'find exports from "projects/ngx-core-components/grid/data-grid"',
        output: 'Found 5 exports: DataGridComponent, NgxGridCellTemplateDirective, etc.',
        collapsed: true
      },
      {
        id: 's2',
        name: 'Analyzing bundle dependencies',
        status: 'success',
        duration: '450ms',
        input: 'webpack-bundle-analyzer --json dist/ngx-core-components',
        output: 'pdfmake: 242kB (unused in main flow)\nxlsx: 180kB',
        collapsed: true
      }
    ]
  }
];

const carouselMessages: AIMessage[] = [
  {
    id: 'c1',
    role: 'assistant',
    content: 'Here are the recommended layout variants for your analytics dashboards. You can drag and dock them in real-time.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    senderName: 'Antigravity AI',
    cards: [
      {
        title: 'Executive KPI Dashboard',
        subtitle: 'Optimal for C-level metrics',
        description: 'Features 4 Stat Cards, 1 Area Chart showing monthly revenue trend, and 1 mini-DataGrid of recent invoices.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
        actions: [
          { label: 'Apply Template', value: 'apply_exec', variant: 'primary' },
          { label: 'Preview', value: 'preview_exec', variant: 'secondary' }
        ]
      },
      {
        title: 'Operations Planner',
        subtitle: 'Logistics and scheduling focus',
        description: 'Features 1 full-width Gantt Chart, 1 Interactive Calendar, and a sidebar with active Team Avatars.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
        actions: [
          { label: 'Apply Template', value: 'apply_ops', variant: 'primary' },
          { label: 'Preview', value: 'preview_ops', variant: 'secondary' }
        ]
      }
    ]
  }
];

const meta: Meta<AIChatComponent> = {
  title: 'Intelligence/AI Chat & Agent Console/AIChat',
  component: AIChatComponent,
  tags: ['autodocs'],
  argTypes: {
    messages: { control: 'object', description: 'Array of AIMessage objects rendering the conversation history' },
    agentName: { control: 'text', description: 'Name of the assistant shown in the header' },
    agentAvatarUrl: { control: 'text', description: 'Avatar image URL of the assistant' },
    isOnline: { control: 'boolean', description: 'Agent online/offline status' },
    isTyping: { control: 'boolean', description: 'Shows typing bubble status indicator' },
    isStreaming: { control: 'boolean', description: 'Shows cursor streaming pulse on latest message' },
    theme: { control: 'radio', options: ['light', 'dark'], description: 'Toggles light/dark mode color schemes' },
    placeholder: { control: 'text', description: 'Footer input field placeholder' },
    disabled: { control: 'boolean', description: 'Disables user input and actions' },
    quickReplies: { control: 'object', description: 'Array of QuickReply chips for instant options' }
  }
};

export default meta;
type Story = StoryObj<AIChatComponent>;

export const DefaultHistory: Story = {
  args: {
    messages: sampleMessages,
    agentName: 'Antigravity AI',
    isOnline: true,
    isTyping: false,
    isStreaming: false,
    quickReplies: sampleQuickReplies,
    theme: 'light'
  }
};

export const StructuredCards: Story = {
  args: {
    messages: [...sampleMessages, ...carouselMessages],
    agentName: 'Antigravity AI',
    isOnline: true,
    isTyping: false,
    isStreaming: false,
    quickReplies: [],
    theme: 'light'
  }
};

export const StreamingResponse: Story = {
  args: {
    messages: [
      ...sampleMessages,
      {
        id: 'streaming-msg',
        role: 'assistant',
        content: `Refactoring in progress. I am extracting target methods into \`projects/ngx-core-components/grid/data-grid/grid-export.service.ts\`...`,
        timestamp: new Date(),
        senderName: 'Antigravity AI'
      }
    ],
    agentName: 'Antigravity AI',
    isOnline: true,
    isTyping: false,
    isStreaming: true,
    quickReplies: [],
    theme: 'light'
  }
};

export const TypingIndicator: Story = {
  args: {
    messages: sampleMessages,
    agentName: 'Antigravity AI',
    isOnline: true,
    isTyping: true,
    isStreaming: false,
    quickReplies: [],
    theme: 'light'
  }
};

export const DarkMode: Story = {
  args: {
    messages: sampleMessages,
    agentName: 'Antigravity AI',
    isOnline: true,
    isTyping: false,
    isStreaming: false,
    quickReplies: sampleQuickReplies,
    theme: 'dark'
  }
};
