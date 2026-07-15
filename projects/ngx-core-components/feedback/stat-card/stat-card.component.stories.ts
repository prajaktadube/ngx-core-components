import type { Meta, StoryObj } from '@storybook/angular';
import { StatCardComponent } from './stat-card.component';

const meta: Meta<StatCardComponent> = {
  title: 'Feedback/Stat Cards & KPI/StatCard',
  component: StatCardComponent,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Uppercase metric label' },
    value: { control: 'text', description: 'Primary displayed value (string or number)' },
    subtitle: { control: 'text', description: 'Contextual subtitle text' },
    trend: { control: 'radio', options: ['up', 'down', 'neutral'], description: 'Trend direction arrow' },
    trendValue: { control: 'text', description: 'Trend percentage or delta value' },
    icon: { control: 'text', description: 'Emoji or character icon' },
    variant: { control: 'select', options: ['default', 'success', 'danger', 'warning', 'info'], description: 'Color accent variant' },
    theme: { control: 'radio', options: ['light', 'dark'], description: 'Light or dark theme' },
    loading: { control: 'boolean', description: 'Show skeleton loading state' },
  },
};

export default meta;
type Story = StoryObj<StatCardComponent>;

// ── Default: Total revenue KPI ──
export const Default: Story = {
  args: {
    label: 'Total Revenue',
    value: '$128,430',
    subtitle: 'vs last month',
    trend: 'up',
    trendValue: '+12.5%',
    icon: '💰',
    variant: 'default',
    theme: 'light',
  },
};

// ── Success: Growth metric ──
export const Success: Story = {
  args: {
    label: 'New Users',
    value: '2,847',
    subtitle: 'this week',
    trend: 'up',
    trendValue: '+23%',
    icon: '👥',
    variant: 'success',
    theme: 'light',
  },
};

// ── Danger: Declining metric ──
export const Danger: Story = {
  args: {
    label: 'Churn Rate',
    value: '4.2%',
    subtitle: 'vs 3.1% last quarter',
    trend: 'down',
    trendValue: '+1.1%',
    icon: '📉',
    variant: 'danger',
    theme: 'light',
  },
};

// ── Warning: At-risk metric ──
export const Warning: Story = {
  args: {
    label: 'Server Load',
    value: '87%',
    subtitle: 'threshold: 90%',
    trend: 'up',
    trendValue: '+5%',
    icon: '⚠️',
    variant: 'warning',
    theme: 'light',
  },
};

// ── DarkMode: Dark themed card ──
export const DarkMode: Story = {
  args: {
    label: 'Active Sessions',
    value: '1,204',
    subtitle: 'across all regions',
    trend: 'neutral',
    trendValue: '',
    icon: '🌐',
    variant: 'info',
    theme: 'dark',
  },
};

// ── Loading: Skeleton shimmer state ──
export const Loading: Story = {
  args: {
    label: '',
    value: '',
    loading: true,
    theme: 'light',
  },
};
