import type { Meta, StoryObj } from '@storybook/angular';
import { TimelineComponent } from './timeline.component';

const sampleItems: any[] = [
  {
    id: 1,
    title: 'Project Kickoff',
    subtitle: 'Milestone',
    description: 'Initial planning session completed with stakeholders. Scope and timeline agreed upon.',
    timestamp: '2024-01-15',
    icon: '🚀',
    status: 'success',
  },
  {
    id: 2,
    title: 'Design Phase',
    subtitle: 'In Progress',
    description: 'UX wireframes and high-fidelity mockups created. User testing sessions scheduled.',
    timestamp: '2024-02-10',
    icon: '🎨',
    status: 'success',
  },
  {
    id: 3,
    title: 'Development Sprint 1',
    subtitle: 'Completed',
    description: 'Core authentication module and dashboard layout implemented.',
    timestamp: '2024-03-20',
    icon: '⚙️',
    status: 'success',
  },
  {
    id: 4,
    title: 'QA Review',
    subtitle: 'Action Required',
    description: 'Critical bugs identified in payment flow. Hotfix branch created.',
    timestamp: '2024-04-05',
    icon: '🔍',
    status: 'warning',
    active: true,
  },
  {
    id: 5,
    title: 'Beta Launch',
    subtitle: 'Upcoming',
    description: 'Planned beta release to 500 early-access users for feedback collection.',
    timestamp: '2024-05-01',
    icon: '📦',
    status: 'info',
  },
  {
    id: 6,
    title: 'Production Release',
    subtitle: 'Scheduled',
    description: 'Full production deployment targeted after beta feedback incorporation.',
    timestamp: '2024-06-15',
    icon: '🏁',
    status: 'default',
  },
];

const meta: Meta<TimelineComponent> = {
  title: 'Data Presentation/Timeline Events/Timeline',
  component: TimelineComponent,
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object', description: 'Array of TimelineItem objects' },
    orientation: { control: 'radio', options: ['vertical', 'horizontal'], description: 'Timeline layout direction' },
    alternating: { control: 'boolean', description: 'Alternate cards left/right (vertical) or top/bottom (horizontal)' },
    clickable: { control: 'boolean', description: 'Enable click interaction on timeline items' },
  },
};

export default meta;
type Story = StoryObj<TimelineComponent>;

// ── Default: Vertical project timeline ──
export const Default: Story = {
  args: {
    items: sampleItems,
    orientation: 'vertical',
    alternating: false,
    clickable: false,
  },
};

// ── Alternating: Zigzag vertical layout ──
export const Alternating: Story = {
  args: {
    items: sampleItems,
    orientation: 'vertical',
    alternating: true,
    clickable: false,
  },
};

// ── Horizontal: Horizontal scrolling timeline ──
export const Horizontal: Story = {
  args: {
    items: sampleItems,
    orientation: 'horizontal',
    alternating: false,
    clickable: false,
  },
};

// ── HorizontalAlternating: Cards alternate top and bottom ──
export const HorizontalAlternating: Story = {
  args: {
    items: sampleItems,
    orientation: 'horizontal',
    alternating: true,
    clickable: false,
  },
};

// ── Clickable: Interactive selectable items ──
export const Clickable: Story = {
  args: {
    items: sampleItems,
    orientation: 'vertical',
    alternating: false,
    clickable: true,
  },
};

// ── StatusVariants: All status colors showcased ──
export const StatusVariants: Story = {
  args: {
    items: [
      { id: 1, title: 'Success Event', description: 'This item uses the success status.', timestamp: '2024-01-01', icon: '✅', status: 'success' },
      { id: 2, title: 'Warning Event', description: 'This item uses the warning status.', timestamp: '2024-02-01', icon: '⚠️', status: 'warning' },
      { id: 3, title: 'Error Event', description: 'This item uses the error status.', timestamp: '2024-03-01', icon: '❌', status: 'error' },
      { id: 4, title: 'Info Event', description: 'This item uses the info status.', timestamp: '2024-04-01', icon: 'ℹ️', status: 'info' },
      { id: 5, title: 'Default Event', description: 'This item uses the default status.', timestamp: '2024-05-01', icon: '📌', status: 'default' },
    ],
    orientation: 'vertical',
    alternating: false,
    clickable: false,
  },
};
