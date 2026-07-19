import type { Meta, StoryObj } from '@storybook/angular';
import { AgenticCognitiveTopologyComponent, type TopologyNode, type TopologyLink } from './agentic-cognitive-topology.component';

const mockNodes: TopologyNode[] = [
  {
    id: 'orch',
    label: 'Orchestrator Agent',
    status: 'success',
    type: 'orchestrator',
    prompt: 'Determine tasks for research request.',
    response: 'Research Google Deepmind team and current project status.'
  },
  {
    id: 'search',
    label: 'Google Search Tool',
    status: 'success',
    type: 'tool',
    prompt: 'Search: "Google Deepmind team Advanced Agentic Coding"',
    response: 'Found: Antigravity AI coding assistant and pair programming agent.'
  },
  {
    id: 'code',
    label: 'Code Generator',
    status: 'thinking',
    type: 'agent',
    prompt: 'Create Angular 19 chart components for AI topology.',
    response: 'Developing AgenticCognitiveTopologyComponent with SVG foreignObject...'
  },
  {
    id: 'critic',
    label: 'Reviewer Agent',
    status: 'idle',
    type: 'critic',
    prompt: 'Analyze generated components for contrast ratios & styling.'
  }
];

const mockLinks: TopologyLink[] = [
  { source: 'orch', target: 'search', active: false },
  { source: 'orch', target: 'code', active: true },
  { source: 'search', target: 'code', active: false },
  { source: 'code', target: 'critic', active: false }
];

const meta: Meta<AgenticCognitiveTopologyComponent> = {
  title: 'Visualizations/Charts & Graphs/Agentic Cognitive Topology',
  component: AgenticCognitiveTopologyComponent,
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'number' },
    height: { control: 'number' },
    showExport: { control: 'boolean' }
  }
};

export default meta;
type Story = StoryObj<AgenticCognitiveTopologyComponent>;

export const Default: Story = {
  args: {
    nodes: mockNodes,
    links: mockLinks,
    width: 650,
    height: 450,
    showExport: true
  }
};
